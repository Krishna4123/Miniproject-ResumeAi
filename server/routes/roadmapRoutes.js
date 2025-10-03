// routes/roadmapRoutes.js

const express = require('express');
const router = express.Router();
const { generateRoadmap, saveRoadmap } = require('../controllers/roadmapController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/roadmap - Generate a career roadmap based on user input
router.post('/', authMiddleware, generateRoadmap);

// POST /api/roadmap/save - Save user's roadmap
router.post('/save', authMiddleware, saveRoadmap);

module.exports = router;