const express = require("express");
const multer = require("multer");
const { matchJobs } = require("../controllers/jobMatcherController");

const router = express.Router();

// ------------------------
// Multer setup for resume upload
// ------------------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed"), false);
    }
  },
});

// ------------------------
// POST /api/jobmatcher
// ------------------------
router.post("/", upload.single("resume"), matchJobs);

module.exports = router;
