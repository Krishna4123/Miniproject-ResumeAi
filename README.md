# Resume AI Analyzer (resuzo)

## Overview

**Resume AI Analyzer** is a comprehensive, full-stack application designed to parse, analyze, and enhance resumes using Artificial Intelligence. It extracts key information from uploaded resumes, predicts suitable job roles based on skills and experience, and provides AI-powered suggestions and roadmaps to help users improve their professional profiles.

## Architecture

The project is structured into three main components, following a microservices-like architecture:

1.  **`client` (Frontend)**
    *   **Tech Stack:** React (Vite), JavaScript, Tailwind CSS, Radix UI (shadcn-ui).
    *   **Purpose:** Provides a modern, responsive user interface for users to build their profiles, upload resumes, view extracted data, and see AI-driven analysis and job recommendations.

2.  **`server` (Backend Node.js API)**
    *   **Tech Stack:** Node.js, Express, MongoDB (Mongoose), Passport.js (Google Auth), `@google/generative-ai` (Gemini).
    *   **Purpose:** Acts as the main orchestration layer. It handles user authentication, connects to the database to manage user profiles and generated reports, communicates with Google's Gemini LLM for AI-powered suggestions (Enhancer, Roadmap), and routes resume files to the ML service for core processing.

3.  **`ml_service` (Machine Learning Python API)**
    *   **Tech Stack:** Python, Flask, Scikit-learn, Pandas, PDFPlumber, spaCy.
    *   **Purpose:** A dedicated service for heavy data processing. It performs advanced text extraction (from PDF/DOCX files) and runs a machine learning pipeline (`multilabel_job_predictor.joblib`) to predict targeted job roles and extract enhanced features (skills, estimated experience) based on the resume content.

## Key Features

*   **Intelligent Resume Parsing:** Extracts text and data from uploaded documents, handling various formats and layout complexities.
*   **Job Role Prediction:** Utilizes a trained Scikit-learn multi-label classification model to predict the most suitable job roles based on a user's resume text.
*   **AI-Powered Enhancements:** Leverages Google's Generative AI (Gemini) to provide tailored suggestions for improving resume sections (e.g., summary, experience).
*   **Career Roadmapping:** Generates personalized career progression roadmaps taking into account the user's current skills and desired job roles.
*   **Job Matching:** Evaluates the synergy between an uploaded resume and specific job descriptions.
*   **Secure Authentication:** Integrates Passport.js for robust user authentication, including Google OAuth support.

## Prerequisites

Before running this project, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [Python](https://www.python.org/) (3.9+ recommended)
*   [MongoDB](https://www.mongodb.com/) (Local instance or Atlas URI)

## Installation & Setup

You will need to run all three services concurrently for the application to function fully.

### 1. Client Setup
```bash
cd client
npm install
npm run dev
```

### 2. Server Setup
Navigate to the `server` directory and set up your environment variables.
```bash
cd server
npm install
```
*   Create a `.env` file in the `server` directory. You will likely need variables such as:
    *   `PORT` (usually 5000)
    *   `MONGO_URI`
    *   `GEMINI_API_KEY`
    *   `JWT_SECRET`
    *   Google OAuth credentials (if configured).
```bash
npm run dev
```

### 3. ML Service Setup
Navigate to the `ml_service` directory to set up the Python environment.
```bash
cd ml_service

# It is recommended to use a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
python app.py
```
*Note: Make sure the required pre-trained model file (`multilabel_job_predictor.joblib`) is present inside the `ml_service/models/` directory.*

## Development

*   The **Client** will typically run on `http://localhost:5173`.
*   The **Server** will typically run on `http://localhost:5000`.
*   The **ML Service** will typically run on `http://localhost:5001`.

Ensure that CORS allows the client to communicate with the server and that the server has the correct URL configured to call the Python ML Service endpoints.
