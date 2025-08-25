// config/db.js

const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * The connection string is retrieved from the .env file.
 */
const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB cluster
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');
  } catch (error) {
    // Log any errors that occur during connection
    console.error('MongoDB connection failed:', error.message);
    // Exit the process with failure code
    process.exit(1);
  }
};

module.exports = connectDB;
