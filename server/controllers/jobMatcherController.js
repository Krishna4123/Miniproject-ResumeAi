const axios = require("axios");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const FormData = require("form-data");

function toArrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

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

    let resumeText = "";

    // ------------------------
    // Extract resume text with better error handling
    // ------------------------
    try {
      if (req.file.mimetype === "application/pdf") {
        const pdfData = await pdfParse(req.file.buffer);
        resumeText = pdfData.text;
      } else if (
        req.file.mimetype === "application/msword" ||
        req.file.mimetype ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({ arrayBuffer: toArrayBuffer(req.file.buffer) });
        resumeText = result.value;
      } else {
        console.error("Unsupported file format:", req.file.mimetype);
        return res.status(400).json({ 
          error: "Unsupported file format",
          details: "Please upload a PDF, DOC, or DOCX file",
          received: req.file.mimetype
        });
      }
    } catch (extractionError) {
      console.error("Text extraction error:", extractionError);
      return res.status(400).json({ 
        error: "Failed to extract text from file",
        details: "The file may be corrupted or password-protected"
      });
    }

    if (!resumeText.trim()) {
      console.error("No text extracted from resume");
      return res.status(400).json({ 
        error: "Could not extract text from the resume",
        details: "The file appears to be empty or contains only images"
      });
    }

    console.log("Resume text extracted successfully, length:", resumeText.length);

    // ------------------------
    // Send to Flask ML service with better error handling
    // ------------------------
    let flaskRes;
    try {
      const formData = new FormData();
      formData.append("resume", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const flaskUrl = process.env.FLASK_ML_SERVICE_URL || "http://localhost:5001/predict";
      console.log("Sending to ML service:", flaskUrl);

      flaskRes = await axios.post(flaskUrl, formData, { 
        headers: formData.getHeaders(),
        timeout: 30000 // 30 second timeout
      });

      console.log("ML service response received");
    } catch (mlError) {
      console.error("ML Service error:", mlError.message);
      if (mlError.code === 'ECONNREFUSED') {
        return res.status(503).json({ 
          error: "ML service is unavailable",
          details: "Please ensure the ML service is running on port 5001"
        });
      }
      return res.status(500).json({ 
        error: "Failed to analyze resume",
        details: "ML service error: " + mlError.message
      });
    }

    const { predictedRoles, extractedData } = flaskRes.data;

    if (!predictedRoles || predictedRoles.length === 0) {
      return res.status(400).json({ error: "No predicted roles returned from ML service" });
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
    // Return combined result
    // ------------------------
    res.json({
      success: true,
      extractedData,
      predictedRoles,
      matchesByRole,
      stats: {
        resumeTextLength: resumeText.length,
        totalJobMatches: totalMatches,
        rolesSearched: predictedRoles.length
      }
    });
  } catch (error) {
    console.error("Unexpected error in jobMatcher:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : "Please try again later"
    });
  }
};

module.exports = { matchJobs };
