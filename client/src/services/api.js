// client/src/services/api.js

import axios from "axios";

// ========================
// Axios Instance
// ========================
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Your backend server URL
  headers: {
    "Content-Type": "application/json",
    "x-auth-user": "123", // Mock user ID for authMiddleware
  },
});

// ========================
// Resume APIs
// ========================
export const createResume = (resumeData) => api.post("/resumes", resumeData);
export const getUserResumes = (userId) => api.get(`/resumes/${userId}`);
export const analyzeResume = (resumeText) =>
  api.post("/resumes/analyze", { text: resumeText });

// ========================
// Enhancer API
// ========================
export const enhanceResume = (resumeText) =>
  api.post("/enhancer", { text: resumeText });

// ========================
// Roadmap API
// ========================
export const generateRoadmap = (goal) => api.post("/roadmap", { goal });

// ========================
// Job Matcher
// ========================

// 1. Dummy function (useful when backend isn’t ready)
export const mockMatchJob = async (payload) => {
  console.log("Dummy matchJob called with:", payload);
  return Promise.resolve({
    data: {
      jobs: ["Mock Job 1", "Mock Job 2"],
      matchScore: 75,
    },
  });
};

// 2. Real backend call (use this once backend endpoint is active)
export const matchJob = (formData) =>
  api.post("/jobmatcher", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
