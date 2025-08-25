// client/src/pages/JobMatcher.jsx
// Page where users can upload or paste a resume,
// then get suggested job roles based on skills extracted.

import React, { useState } from "react";
import { matchJob } from "../services/api"; // make sure api.js has this function

function JobMatcher() {
  const [resumeText, setResumeText] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMatch = async () => {
    if (!resumeText.trim()) {
      setError("Please paste your resume text first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await matchJob({ text: resumeText });
      setResults(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Job Matcher</h1>
      <p className="mb-4 text-gray-600">
        Paste your resume text below and we’ll analyze your skills to suggest
        potential job roles.
      </p>

      <textarea
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        placeholder="Paste your resume text here..."
        className="w-full border rounded p-3 h-40"
      />

      <button
        onClick={handleMatch}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Analyzing..." : "Find Matching Jobs"}
      </button>

      {error && <p className="mt-3 text-red-500">{error}</p>}

      {results && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-lg font-semibold">Suggested Jobs</h2>
          <ul className="list-disc ml-6 mt-2">
            {results.jobs?.map((job, idx) => (
              <li key={idx}>{job}</li>
            ))}
          </ul>
          <p className="mt-2 text-gray-600">
            Match Score: <strong>{results.matchScore}%</strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default JobMatcher;
