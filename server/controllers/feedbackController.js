const Feedback = require('../models/Feedback');
const User = require('../models/User');
const mongoose = require('mongoose');

// Submit feedback
const submitFeedback = async (req, res) => {
  try {
    console.log('=== FEEDBACK SUBMISSION DEBUG ===');
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log('Request body:', req.body);
    console.log('User from auth:', req.user);
    
    const { rating, usefulFeatures, dislikedFeatures, improvements, additionalComments, overallExperience } = req.body;
    const userId = req.user.id;

    console.log('Extracted data:', {
      rating,
      usefulFeatures,
      dislikedFeatures,
      improvements,
      additionalComments,
      overallExperience,
      userId
    });

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      console.log('Validation failed: Invalid rating');
      return res.status(400).json({
        success: false,
        message: 'Rating is required and must be between 1 and 5'
      });
    }

    // Create feedback document with specific structure for resume_Ai_analyser collection
    const feedbackData = {
      userId,
      rating,
      usefulFeatures: usefulFeatures || [],
      dislikedFeatures: dislikedFeatures || [],
      improvements: improvements || '',
      additionalComments: additionalComments || '',
      overallExperience: overallExperience || '',
      submittedAt: new Date(),
      status: 'new'
    };

    console.log('Feedback data prepared:', feedbackData);
    console.log('Attempting to save to resume_Ai_analyser collection...');

    // Store in the specific collection structure
    const savedFeedback = await Feedback.create(feedbackData);
    console.log('Feedback saved successfully:', savedFeedback);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        feedbackId: savedFeedback._id,
        submittedAt: savedFeedback.submittedAt
      }
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's feedback history
const getUserFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedback = await Feedback.find({ userId })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Feedback.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: {
        feedback,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all feedback (admin only)
const getAllFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const rating = req.query.rating;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (rating) filter.rating = parseInt(rating);

    const feedback = await Feedback.find(filter)
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Feedback.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        feedback,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching all feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update feedback status (admin only)
const updateFeedbackStatus = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { status } = req.body;

    if (!status || !['new', 'reviewed', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (new, reviewed, in_progress, resolved)'
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { status },
      { new: true }
    ).populate('userId', 'name email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback status updated successfully',
      data: feedback
    });

  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get feedback statistics (admin only)
const getFeedbackStats = async (req, res) => {
  try {
    const totalFeedback = await Feedback.countDocuments();
    const averageRating = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const ratingDistribution = await Feedback.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const statusDistribution = await Feedback.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const recentFeedback = await Feedback.countDocuments({
      submittedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.status(200).json({
      success: true,
      data: {
        totalFeedback,
        averageRating: averageRating[0]?.avgRating || 0,
        ratingDistribution,
        statusDistribution,
        recentFeedback
      }
    });

  } catch (error) {
    console.error('Error fetching feedback statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  submitFeedback,
  getUserFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  getFeedbackStats
};
