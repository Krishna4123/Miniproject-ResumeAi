// client/src/services/api.js

import axios from "axios";

// ========================
// Axios Instance
// ========================
const api = axios.create({
  baseURL: "http://localhost:5002/api", // Your backend server URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('resuzo_auth');
    if (authData) {
      try {
        const { token } = JSON.parse(authData);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth data
      localStorage.removeItem('resuzo_auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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

export const enhanceResumeFile = (formData) =>
  api.post("/enhancer", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

// ========================
// Roadmap API
// ========================
export const generateRoadmap = (roadmapData) => 
  api.post("/roadmap", roadmapData);

export const saveRoadmap = (roadmapData) =>
  api.post("/roadmap/save", roadmapData);

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

// 2. Real backend call (backend returns: { success, extractedData, matches: [jobPosting...] })
export const matchJob = (formData) => api.post("/jobmatcher", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// ========================
// Feedback API
// ========================
export const submitFeedback = (feedbackData) => 
  api.post("/feedback/submit", feedbackData);

export const getUserFeedback = (page = 1, limit = 10) => 
  api.get(`/feedback/my-feedback?page=${page}&limit=${limit}`);