// controllers/jobMatcherController.js
const axios = require("axios");

const matchJobs = async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "Resume text is required" });
    }

    // Call Flask NLP service for resume parsing & categorization
    const flaskRes = await axios.post(
      process.env.FLASK_ML_SERVICE_URL,
      { resumeText }
    );

    const { extractedData, matchedJobs } = flaskRes.data;

    res.json({
      success: true,
      extractedData,
      matchedJobs,
    });
  } catch (error) {
    console.error("JobMatcher error:", error.message);
    res.status(500).json({ error: "Failed to process resume" });
  }
};

module.exports = { matchJobs };
