// routes/enhancerRoutes.js

const express = require('express');
const router = express.Router();
const { enhanceResume } = require('../controllers/enhancerController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/enhancer - Enhance a given resume text
router.post('/', authMiddleware, enhanceResume);

module.exports = router;
