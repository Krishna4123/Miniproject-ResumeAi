// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Google OAuth authentication
router.post('/google', authController.googleAuth);

// Local authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Get user profile (protected route)
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
