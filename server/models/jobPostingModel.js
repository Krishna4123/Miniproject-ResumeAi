// models/jobPostingModel.js
const mongoose = require("mongoose");

const jobPostingSchema = new mongoose.Schema(
  {
    job_id: { type: Number, required: true, unique: true },
    job_role: { type: String, required: true },
    company_name: { type: String, required: true },
    experience_needed: { type: String },
    place_of_work: { type: String },
    description: { type: String },
    mode_of_work: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobPosting", jobPostingSchema);
