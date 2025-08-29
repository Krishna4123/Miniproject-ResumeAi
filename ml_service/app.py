import os
import joblib
import tempfile
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import pdfplumber
import docx2txt
from pymongo import MongoClient

# ------------------------
# Initialize Flask app
# ------------------------
app = Flask(__name__)

# ------------------------
# Load trained model
# ------------------------
MODEL_PATH = os.path.join("models", "jobmatcher_model.joblib")
model = joblib.load(MODEL_PATH)

# Handle both (vectorizer, classifier) tuple and single model
if isinstance(model, tuple) and len(model) == 2:
    vectorizer, classifier = model
else:
    vectorizer, classifier = None, model

# ------------------------
# MongoDB Connection
# ------------------------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/jobmatcher")
client = MongoClient(MONGO_URI)
db = client.get_database()
job_postings = db["jobpostings"]   # make sure collection name is correct

# ------------------------
# Helper: extract text from resume
# ------------------------
def extract_resume_text(filepath, mimetype):
    text = ""
    try:
        if mimetype == "application/pdf":
            with pdfplumber.open(filepath) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
        elif mimetype in [
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]:
            text = docx2txt.process(filepath)
        else:
            with open(filepath, "r", errors="ignore") as f:
                text = f.read()
    except Exception as e:
        print(f"⚠️ Extraction error: {e}")
    return text.strip()

# ------------------------
# Prediction + Matching
# ------------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "resume" not in request.files:
            return jsonify({"error": "No resume file uploaded"}), 400

        file = request.files["resume"]
        filename = secure_filename(file.filename)

        # Save temporarily
        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, filename)
        file.save(temp_path)

        # Extract text
        resume_text = extract_resume_text(temp_path, file.mimetype)
        if not resume_text:
            return jsonify({"error": "Could not extract text from resume"}), 400

        # ------------------------
        # Extract some sample metadata
        # ------------------------
        extractedData = {
            "skills": [w for w in resume_text.split() if w.istitle()][:10],
            "raw_text_preview": resume_text[:300],
        }

        # ------------------------
        # Prediction
        # ------------------------
        if vectorizer:
            features = vectorizer.transform([resume_text])
            predicted_role = classifier.predict(features)[0]
        else:
            predicted_role = classifier.predict([resume_text])[0]

        # ------------------------
        # MongoDB Job Matches
        # ------------------------
        matches = list(job_postings.find(
            {"job_role": {"$regex": predicted_role, "$options": "i"}},
            {"_id": 0}   # hide internal Mongo _id
        ))

        return jsonify({
            "success": True,
            "extractedData": extractedData,
            "predictedRole": predicted_role,
            "matches": matches
        })

    except Exception as e:
        print(f"⚠️ Error: {e}")
        return jsonify({"error": str(e)}), 500

# ------------------------
# Health check
# ------------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "message": "ML Service running"})

# ------------------------
# Main entry
# ------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
