// routes/jobMatcherRoutes.js
const express = require("express");
const { matchJobs } = require("../controllers/jobMatcherController");

const router = express.Router();

// POST /api/jobmatcher
router.post("/", matchJobs);

module.exports = router;
