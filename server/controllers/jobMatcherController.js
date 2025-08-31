const axios = require("axios");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const FormData = require("form-data");

function toArrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

const matchJobs = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Resume file is required" });
    }

    let resumeText = "";

    // ------------------------
    // Extract resume text
    // ------------------------
    if (req.file.mimetype === "application/pdf") {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    } else if (
      req.file.mimetype === "application/msword" ||
      req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ arrayBuffer: toArrayBuffer(req.file.buffer) });
      resumeText = result.value;
    } else {
      return res.status(400).json({ error: "Unsupported file format" });
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ error: "Could not extract text from the resume" });
    }

    // ------------------------
    // Send to Flask ML service
    // ------------------------
    const formData = new FormData();
    formData.append("resume", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const flaskRes = await axios.post(
      process.env.FLASK_ML_SERVICE_URL || "http://localhost:5001/predict",
      formData,
      { headers: formData.getHeaders() }
    );

    const { predictedRole, extractedData } = flaskRes.data;

    // ------------------------
    // Query APIJobs for job matches
    // ------------------------
    const APIJOBS_KEY = process.env.APIJOBS_KEY; // your APIJobs API key
    const APIJOBS_URL = "https://api.apijobs.dev/v1/job/search";

    const apiJobsRes = await axios.post(
      "https://api.apijobs.dev/v1/job/search",
      {
        q: predictedRole,
        size: 10
      },
      {
        headers: {
          "Content-Type": "application/json",
          apikey: APIJOBS_KEY,
        },
      }
    );

    console.log("APIJobs response:", apiJobsRes.data);
    const matches = apiJobsRes.data.hits || []; // APIJobs returns jobs in 'hits' property

    // ------------------------
    // Return combined result
    // ------------------------
    res.json({
      success: true,
      extractedData,
      predictedRole,
      matches,
    });
  } catch (error) {
    console.error("JobMatcher error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to process resume or fetch jobs" });
  }
};

module.exports = { matchJobs };
