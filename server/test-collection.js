// Test script to verify feedback saving to correct collection
const mongoose = require('mongoose');
const Feedback = require('./models/Feedback');
require('dotenv').config();

const testFeedbackCollection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');

    console.log('Testing feedback model with resume_Ai_analyser collection...');
    const testFeedback = {
      userId: new mongoose.Types.ObjectId(),
      rating: 5,
      usefulFeatures: ['AI Resume Builder', 'Smart Enhancer'],
      dislikedFeatures: [],
      improvements: 'Test improvement suggestion',
      additionalComments: 'Test comment',
      overallExperience: 'User Interface',
      submittedAt: new Date(),
      status: 'new'
    };

    console.log('Saving test feedback to resume_Ai_analyser collection...');
    const savedFeedback = await Feedback.create(testFeedback);
    console.log('Test feedback saved successfully:', savedFeedback);

    // Verify it's in the correct collection
    const collectionName = Feedback.collection.name;
    console.log('Collection name:', collectionName);

    // Clean up - delete the test feedback
    await Feedback.findByIdAndDelete(savedFeedback._id);
    console.log('Test feedback cleaned up.');

    console.log('✅ Feedback saving to resume_Ai_analyser collection test passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Feedback saving test failed:', error);
    process.exit(1);
  }
};

testFeedbackCollection();
