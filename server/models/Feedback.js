const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  usefulFeatures: [{
    type: String,
    enum: [
      'AI Resume Builder',
      'Smart Enhancer',
      'Career Roadmap',
      'Job Matcher',
      'Professional Templates',
      'ATS Optimization',
      'Real-time Suggestions',
      'Export Options'
    ]
  }],
  dislikedFeatures: [{
    type: String,
    enum: [
      'AI Resume Builder',
      'Smart Enhancer',
      'Career Roadmap',
      'Job Matcher',
      'Professional Templates',
      'ATS Optimization',
      'Real-time Suggestions',
      'Export Options'
    ]
  }],
  improvements: {
    type: String,
    maxlength: 1000
  },
  additionalComments: {
    type: String,
    maxlength: 1000
  },
  overallExperience: {
    type: String,
    enum: [
      'User Interface',
      'Feature Functionality',
      'Performance Speed',
      'Mobile Experience',
      'Customer Support',
      'Documentation',
      'Pricing',
      'Integration Options'
    ]
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'in_progress', 'resolved'],
    default: 'new'
  }
}, {
  timestamps: true,
  collection: 'resume_Ai_analyser' // Use your specific collection name
});

// Index for efficient queries
feedbackSchema.index({ userId: 1, submittedAt: -1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ rating: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
