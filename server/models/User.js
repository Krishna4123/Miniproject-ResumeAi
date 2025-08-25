// models/User.js

const mongoose = require('mongoose');

// Define the schema for the User model
const userSchema = new mongoose.Schema(
  {
    // User's name
    name: {
      type: String,
      required: true,
    },
    // User's email, must be unique
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // Array of resume IDs associated with the user
    resumes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume', // Reference to the Resume model
      },
    ],
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Create and export the User model
module.exports = mongoose.model('User', userSchema);
