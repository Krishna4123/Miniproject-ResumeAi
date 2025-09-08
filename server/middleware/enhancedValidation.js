const validateFileUpload = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Resume file is required",
        details: "Please upload a PDF, DOC, or DOCX file"
      });
    }

    const { originalname, mimetype, size } = req.file;
    const allowedTypes = [
      "application/pdf",
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(mimetype)) {
      return res.status(400).json({
        error: "Unsupported file format",
        details: "Please upload a PDF, DOC, or DOCX file"
      });
    }

    const maxSize = 10 * 1024 * 1024;
    if (size > maxSize) {
      return res.status(413).json({
        error: "File too large",
        details: "Maximum file size is 10MB"
      });
    }

    console.log('File validation passed:', {
      filename: originalname,
      mimetype,
      size: `${(size / 1024 / 1024).toFixed(2)}MB`
    });

    next();
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({
      error: "Validation failed",
      details: "An error occurred during file validation"
    });
  }
};

const validateTextQuality = (extractionResult) => {
  const { text, metadata } = extractionResult;
  const issues = [];
  const warnings = [];

  if (!text || typeof text !== 'string') {
    issues.push('No text extracted or invalid text format');
    return { valid: false, issues, warnings };
  }

  const textLength = text.trim().length;
  
  if (textLength < 50) {
    issues.push('Text too short (less than 50 characters)');
  } else if (textLength < 200) {
    warnings.push('Text is quite short (less than 200 characters)');
  }

  const alphaNumericCount = (text.match(/[a-zA-Z0-9]/g) || []).length;
  const readabilityRatio = alphaNumericCount / textLength;
  
  if (readabilityRatio < 0.3) {
    issues.push('Text contains too many non-alphanumeric characters');
  } else if (readabilityRatio < 0.5) {
    warnings.push('Text quality may be compromised');
  }

  const confidence = metadata?.confidence || 0;
  if (confidence < 0.3) {
    issues.push('Very low extraction confidence');
  } else if (confidence < 0.6) {
    warnings.push('Low extraction confidence');
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    metrics: {
      textLength,
      readabilityRatio,
      confidence,
      extractionMethod: metadata?.extractionMethod || 'unknown'
    }
  };
};

const logExtractionMetrics = (req, res, next) => {
  const originalSend = res.json;
  
  res.json = function(data) {
    if (data.success && data.extractionMetadata) {
      console.log('Extraction Metrics:', {
        filename: req.file?.originalname,
        method: data.extractionMetadata.extractionMethod,
        confidence: data.extractionMetadata.confidence,
        textLength: data.extractionMetadata.textLength,
        quality: data.extractionMetadata.quality?.valid ? 'Good' : 'Poor',
        timestamp: new Date().toISOString()
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  validateFileUpload,
  validateTextQuality,
  logExtractionMetrics
};