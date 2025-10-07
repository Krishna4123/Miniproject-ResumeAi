// routes/enhancerRoutes.js

const express = require('express');
const multer = require('multer');
const { enhanceResume } = require('../controllers/enhancerController');
const { validateFileUpload, logExtractionMetrics } = require('../middleware/enhancedValidation');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Multer for in-memory resume upload (10MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
  }
});

// POST /api/enhancer - Upload resume and get ATS score + suggestions
router.post(
  '/',
  authMiddleware,
  upload.single('resume'),
  validateFileUpload,
  logExtractionMetrics,
  enhanceResume
);

module.exports = router;
