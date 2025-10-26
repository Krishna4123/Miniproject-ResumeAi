const axios = require("axios");
const FormData = require("form-data");
const TextExtractor = require("../utils/textExtractor");
const ExtractionFallbackSystem = require("../utils/extractionFallback");
const { validateTextQuality } = require("../middleware/enhancedValidation");

// Initialize text extractor and fallback system
const textExtractor = new TextExtractor();
const fallbackSystem = new ExtractionFallbackSystem();

const matchJobs = async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ 
        error: "Resume file is required",
        details: "Please upload a PDF, DOC, or DOCX file"
      });
    }

    console.log("File received:", {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    let extractionResult;

    // ------------------------
    // Extract resume text with enhanced precision
    // ------------------------
    try {
      extractionResult = await textExtractor.extractText(
        req.file.buffer, 
        req.file.mimetype, 
        req.file.originalname
      );
      
      if (!extractionResult.text || !extractionResult.text.trim()) {
        return res.status(400).json({ 
          error: "Could not extract text from the resume",
          details: "The file appears to be empty, corrupted, or contains only images",
          metadata: extractionResult.metadata
        });
      }

      // Validate text quality
      const qualityValidation = validateTextQuality(extractionResult);
      
      if (!qualityValidation.valid) {
        console.warn("Text quality issues:", qualityValidation.issues);
        return res.status(400).json({
          error: "Poor text extraction quality",
          details: "The extracted text quality is too low for reliable processing",
          issues: qualityValidation.issues,
          warnings: qualityValidation.warnings,
          metadata: extractionResult.metadata
        });
      }

      // Log warnings if any
      if (qualityValidation.warnings.length > 0) {
        console.warn("Text quality warnings:", qualityValidation.warnings);
      }

      console.log("Enhanced text extraction successful:", {
        method: extractionResult.metadata.extractionMethod,
        confidence: extractionResult.metadata.confidence,
        textLength: extractionResult.metadata.textLength,
        quality: qualityValidation.valid ? 'Good' : 'Poor',
        warnings: qualityValidation.warnings.length
      });

    } catch (extractionError) {
      console.error("Enhanced text extraction error:", extractionError);
      
      // Cleanup any temp files
      try {
        await textExtractor.cleanup();
      } catch (cleanupError) {
        console.warn("Cleanup failed:", cleanupError.message);
      }
      
      return res.status(400).json({ 
        error: "Failed to extract text from file",
        details: extractionError.message || "The file may be corrupted, password-protected, or in an unsupported format"
      });
    }

    // ------------------------
    // Send to Flask ML service with enhanced fallback handling
    // ------------------------
    let mlServiceResult;
    try {
      console.log("Processing with ML service (with fallback support)");
      mlServiceResult = await fallbackSystem.processFile(req.file, extractionResult);
      console.log("ML service processing completed:", {
        serviceUsed: mlServiceResult.serviceUsed,
        hasFallback: !!mlServiceResult.mlServiceError,
        rolesCount: mlServiceResult.predictedRoles?.length || 0
      });
    } catch (mlError) {
      console.error("All ML processing methods failed:", mlError.message);
      return res.status(503).json({ 
        error: "AI analysis service unavailable",
        details: "Unable to process resume with AI analysis. Please try again later.",
        technicalDetails: process.env.NODE_ENV === 'development' ? mlError.message : undefined
      });
    }

    const { extractedData, predictedRoles } = mlServiceResult;

    if (!predictedRoles || predictedRoles.length === 0) {
      console.warn("No predicted roles returned from ML service");
      return res.status(400).json({ 
        error: "Unable to predict job roles",
        details: "The AI analysis could not determine suitable job roles from the resume"
      });
    }

    // ------------------------
    // Query APIJobs for job matches with better error handling
    // ------------------------
    const APIJOBS_KEY = process.env.APIJOBS_KEY;
    if (!APIJOBS_KEY) {
      console.error("APIJOBS_KEY not configured");
      return res.status(500).json({ 
        error: "Job search service not configured",
        details: "API key missing"
      });
    }

    const totalJobsRequested = 10;
    const jobsPerRole = Math.floor(totalJobsRequested / predictedRoles.length) || 1;

    console.log("Predicted roles:", predictedRoles);

    // Fetch jobs for each role in parallel with error handling
    const jobsPromises = predictedRoles.map(async (role) => {
      try {
        const response = await axios.post(
          "https://api.apijobs.dev/v1/job/search",
          {
            q: role,
            size: jobsPerRole,
          },
          {
            headers: {
              "Content-Type": "application/json",
              apikey: APIJOBS_KEY,
            },
            timeout: 15000 // 15 second timeout
          }
        );
        return { role, jobs: response.data.hits || [] };
      } catch (jobError) {
        console.error(`Job search error for role ${role}:`, jobError.message);
        return { role, jobs: [] }; // Return empty array on error
      }
    });

    const results = await Promise.all(jobsPromises);
    console.log("Job search completed for all roles");

    // Build object: role -> jobs array
    const matchesByRole = {};
    let totalMatches = 0;
    results.forEach(({ role, jobs }) => {
      matchesByRole[role] = jobs;
      totalMatches += jobs.length;
    });

    console.log("Total job matches found:", totalMatches);

    // ------------------------
    // Return combined result with enhanced metadata and fallback info
    // ------------------------
    const response = {
      success: true,
      extractedData,
      predictedRoles,
      matchesByRole,
      stats: {
        resumeTextLength: extractionResult.text.length,
        totalJobMatches: totalMatches,
        rolesSearched: predictedRoles.length
      },
      extractionMetadata: extractionResult.metadata
    };

    // Add ML service information if available
    if (mlServiceResult.mlServiceError) {
      response.mlServiceInfo = {
        fallbackUsed: true,
        originalError: mlServiceResult.mlServiceError,
        serviceUsed: mlServiceResult.serviceUsed
      };
    } else {
      response.mlServiceInfo = {
        fallbackUsed: false,
        serviceUsed: mlServiceResult.serviceUsed
      };
    }

    // Cleanup temp files after successful processing
    try {
      await textExtractor.cleanup();
    } catch (cleanupError) {
      console.warn("Cleanup failed:", cleanupError.message);
    }

    res.json(response);
  } catch (error) {
    console.error("Unexpected error in jobMatcher:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : "Please try again later"
    });
  } finally {
    // Cleanup any resources if needed
    // Note: TextExtractor cleanup is handled globally, not per request
  }
};

// Cleanup function for graceful shutdown
const cleanup = async () => {
  try {
    await textExtractor.cleanup();
    console.log("Text extractor resources cleaned up");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
};

// Handle graceful shutdown
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

module.exports = { matchJobs, cleanup };
