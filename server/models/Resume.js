// models/Resume.js

const mongoose = require('mongoose');

// Define the schema for the Resume model
const resumeSchema = new mongoose.Schema(
  {
    // Reference to the user who owns this resume
  user: {
  	type: String, // store simple user identifier from x-auth-user
  	required: true,
  },
    // The full content or text of the resume
  content: {
  	type: mongoose.Schema.Types.Mixed, // resume JSON content
  	required: true,
  },
    // A numerical score for the resume, likely from an analysis
    score: {
      type: Number,
      default: 0,
    },
    // Feedback or analysis results for the resume
    feedback: {
      type: String,
      default: '',
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Create and export the Resume model
module.exports = mongoose.model('Resume', resumeSchema);
