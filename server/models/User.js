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
    // Google OAuth ID
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values but ensures uniqueness when present
    },
    // Profile picture URL from Google
    profilePicture: {
      type: String,
    },
    // Password (optional for OAuth users)
    password: {
      type: String,
    },
    // Authentication method
    authMethod: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
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
