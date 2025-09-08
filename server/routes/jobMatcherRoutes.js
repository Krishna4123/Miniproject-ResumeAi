const express = require("express");
const multer = require("multer");
const { matchJobs } = require("../controllers/jobMatcherController");
const { validateFileUpload, logExtractionMetrics } = require("../middleware/enhancedValidation");

const router = express.Router();

// ------------------------
// Enhanced Multer setup for resume upload
// ------------------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1 // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    // Allow the enhanced validation middleware to handle detailed validation
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Only PDF, DOC, and DOCX files are allowed.`), false);
    }
  },
});

// ------------------------
// POST /api/jobmatcher - Enhanced with multiple validation layers
// ------------------------
router.post("/", 
  upload.single("resume"), 
  validateFileUpload, 
  logExtractionMetrics, 
  matchJobs
);

module.exports = router;
