// routes/roadmapRoutes.js

const express = require('express');
const router = express.Router();
const { generateRoadmap } = require('../controllers/roadmapController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/roadmap - Generate a career roadmap based on user input
router.post('/', authMiddleware, generateRoadmap);

module.exports = router;
