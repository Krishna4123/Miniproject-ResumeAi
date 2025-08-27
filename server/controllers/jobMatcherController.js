// controllers/jobMatcherController.js
const axios = require("axios");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const FormData = require("form-data"); // <-- important

// Helper to convert Buffer → ArrayBuffer (for mammoth)
function toArrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

const matchJobs = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Resume file is required" });
    }

    let resumeText = "";

    // Extract text
    if (req.file.mimetype === "application/pdf") {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    } else if (
      req.file.mimetype === "application/msword" ||
      req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ arrayBuffer: toArrayBuffer(req.file.buffer) });
      resumeText = result.value;
    } else {
      return res.status(400).json({ error: "Unsupported file format" });
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ error: "Could not extract text from the resume" });
    }

    // Send to Flask ML service
    const formData = new FormData();
    formData.append("resume", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const flaskRes = await axios.post(
      process.env.FLASK_ML_SERVICE_URL || "http://localhost:5001/predict",
      formData,
      { headers: formData.getHeaders() } // <-- important fix
    );

    const { extractedData, matches } = flaskRes.data;

    res.json({
      success: true,
      extractedData,
      matches: matches || [],
    });
  } catch (error) {
    console.error("JobMatcher error:", error); // log full error
    res.status(500).json({ error: "Failed to process resume" });
  }
};

module.exports = { matchJobs };
