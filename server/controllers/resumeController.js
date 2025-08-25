// controllers/resumeController.js

const Resume = require('../models/Resume');
const User = require('../models/User');
const axios = require('axios');
require('dotenv').config();

/**
 * Creates a new resume and associates it with the authenticated user.
 */
exports.createResume = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;

    // Create a new resume instance
    const newResume = new Resume({
      user: userId,
      content,
    });

    // Save the resume to the database
    await newResume.save();

    // Add the resume's ID to the user's list of resumes
    await User.findByIdAndUpdate(userId, { $push: { resumes: newResume._id } });

    res.status(201).json({ message: 'Resume created successfully.', resume: newResume });
  } catch (error) {
    res.status(500).json({ message: 'Error creating resume.', error: error.message });
  }
};

/**
 * Fetches all resumes for a given user.
 */
exports.getUserResumes = async (req, res) => {
  try {
    const { userId } = req.params;
    const resumes = await Resume.find({ user: userId });
    res.status(200).json(resumes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resumes.', error: error.message });
  }
};

/**
 * Forwards resume text to an external ML service for analysis.
 */
exports.analyzeResume = async (req, res) => {
  try {
    const { text } = req.body;
    const flaskApiUrl = process.env.FLASK_ML_SERVICE_URL;

    // Forward the resume text to the Flask service
    const response = await axios.post(flaskApiUrl, { text });

    // Return the analysis from the ML service
    res.status(200).json({
      message: 'Resume analysis complete.',
      analysis: response.data,
    });
  } catch (error) {
    // Handle errors, including those from the external service
    res.status(500).json({
      message: 'Error analyzing resume.',
      error: error.response ? error.response.data : error.message,
    });
  }
};
