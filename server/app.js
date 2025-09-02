// app.js - Main entry point for the Express server

// Import required modules
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'APIJOBS_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file');
  process.exit(1);
}

// Initialize the Express application
const app = express();

// Establish database connection
connectDB();

// --- Middleware ---

// Dynamic CORS config
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow requests with no origin (Postman, mobile apps)
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:3000", // Add common React dev port
      ];
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Parse incoming JSON requests (limit 10mb for resume files if text extraction is needed)
app.use(express.json({ limit: "10mb" }));

// HTTP request logging
app.use(morgan("dev"));

// --- API Routes ---
app.use("/api/resumes", require("./routes/resumeRoutes"));
app.use("/api/enhancer", require("./routes/enhancerRoutes"));
app.use("/api/roadmap", require("./routes/roadmapRoutes"));
app.use("/api/jobmatcher", require("./routes/jobMatcherRoutes")); // ✅ JobMatcher

// Health check route
app.get("/api/health", (_req, res) => {
  res.json({ 
    ok: true, 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({ 
    error: err.message || "Server error",
    timestamp: new Date().toISOString()
  });
});

// Define the port for the server to listen on
const PORT = process.env.PORT || 5002;

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
