const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getUserFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  getFeedbackStats
} = require('../controllers/feedbackController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Submit feedback (authenticated users only)
router.post('/submit', authenticateToken, submitFeedback);

// Get user's feedback history (authenticated users only)
router.get('/my-feedback', authenticateToken, getUserFeedback);

// Admin routes (you may want to add admin middleware later)
// Get all feedback
router.get('/all', getAllFeedback);

// Update feedback status
router.put('/:feedbackId/status', updateFeedbackStatus);

// Get feedback statistics
router.get('/stats', getFeedbackStats);

module.exports = router;
