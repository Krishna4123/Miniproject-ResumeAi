// app.js - Main entry point for the Express server

// Import required modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Initialize the Express application
const app = express();

// Establish database connection
connectDB();

// --- Middleware ---
// Enable Cross-Origin Resource Sharing (CORS) for all routes
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// --- API Routes ---
// Mount the route handlers for different parts of the API
app.use('/api/resumes', require('./routes/resumeRoutes'));
app.use('/api/enhancer', require('./routes/enhancerRoutes'));
app.use('/api/roadmap', require('./routes/roadmapRoutes'));

// Define the port for the server to listen on
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
