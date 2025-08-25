// client/src/services/api.js

import axios from 'axios';

// Create an axios instance for API calls
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend server URL
  headers: {
    'Content-Type': 'application/json',
    'x-auth-user': '123', // Mock user ID for authMiddleware
  },
});

// Resume APIs
export const createResume = (resumeData) => api.post('/resumes', resumeData);
export const getUserResumes = (userId) => api.get(`/resumes/${userId}`);
export const analyzeResume = (resumeText) => api.post('/resumes/analyze', { text: resumeText });

// Enhancer API
export const enhanceResume = (resumeText) => api.post('/enhancer', { text: resumeText });

// Roadmap API
export const generateRoadmap = (goal) => api.post('/roadmap', { goal });

/**
 * Dummy function to fix rendering issue.
 * In a real scenario, this would make an API call.
 * @param {*} payload 
 * @returns 
 */
export const matchJob = async (payload) => {
  console.log("Dummy matchJob called with:", payload);
  // Return a promise that resolves with mock data
  return Promise.resolve({
    data: {
      jobs: ["Mock Job 1", "Mock Job 2"],
      matchScore: 75,
    }
  });
};
