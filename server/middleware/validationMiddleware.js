// middleware/validationMiddleware.js

// File upload validation
const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'File is required',
      details: 'Please upload a PDF, DOC, or DOCX file'
    });
  }

  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      error: 'Invalid file type',
      details: 'Please upload a PDF, DOC, or DOCX file',
      received: req.file.mimetype
    });
  }

  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (req.file.size > maxSize) {
    return res.status(400).json({
      error: 'File too large',
      details: `File size must be less than ${maxSize / 1024 / 1024}MB`,
      received: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`
    });
  }

  // Check filename
  if (!req.file.originalname) {
    return res.status(400).json({
      error: 'Invalid file',
      details: 'File must have a valid name'
    });
  }

  next();
};

module.exports = {
  validateFileUpload
};