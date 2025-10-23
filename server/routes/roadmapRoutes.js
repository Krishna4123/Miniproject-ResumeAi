// routes/roadmapRoutes.js

const express = require('express');
const router = express.Router();
const { generateRoadmap, saveRoadmap } = require('../controllers/roadmapController');
const { authenticateToken } = require('../middleware/authMiddleware');

// POST /api/roadmap - Generate a career roadmap based on user input
router.post('/', authenticateToken, generateRoadmap);

// POST /api/roadmap/save - Save user's roadmap
router.post('/save', authenticateToken, saveRoadmap);

module.exports = router;