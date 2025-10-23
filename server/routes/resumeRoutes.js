// routes/resumeRoutes.js

const express = require('express');
const router = express.Router();
const {
  createResume,
  getUserResumes,
  analyzeResume,
} = require('../controllers/resumeController');
const { authenticateToken } = require('../middleware/authMiddleware');

// POST /api/resumes - Create a new resume for the authenticated user
router.post('/', authenticateToken, createResume);

// GET /api/resumes/:userId - Fetch all resumes for a specific user
router.get('/:userId', authenticateToken, getUserResumes);

// POST /api/resumes/analyze - Analyze a resume by sending it to an ML service
router.post('/analyze', authenticateToken, analyzeResume);

module.exports = router;
