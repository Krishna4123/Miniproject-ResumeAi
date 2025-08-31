import os
import joblib
import tempfile
import warnings
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import pdfplumber
import docx2txt
import requests
from sklearn.exceptions import InconsistentVersionWarning

# ------------------------
# Suppress sklearn warnings
# ------------------------
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

# ------------------------
# Initialize Flask app
# ------------------------
app = Flask(__name__)

# ------------------------
# Load trained model (Pipeline + LabelEncoder dict)
# ------------------------
MODEL_PATH = os.path.join("models", "jobmatcher_model.joblib")
loaded_obj = joblib.load(MODEL_PATH)

pipeline, label_encoder = None, None

if isinstance(loaded_obj, dict):
    pipeline = loaded_obj.get("pipeline")
    label_encoder = loaded_obj.get("label_encoder")
elif hasattr(loaded_obj, "predict"):  # full pipeline (fallback)
    pipeline = loaded_obj
else:
    raise RuntimeError("❌ Unsupported model format. Expected dict or pipeline.")

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
# Prediction + Matching via Node.js API
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

        # Extract some sample metadata
        extractedData = {
            "skills": [w for w in resume_text.split() if w.istitle()][:10],
            "raw_text_preview": resume_text[:300],
        }

        # ------------------------
        # ML Prediction
        # ------------------------
        if pipeline is None:
            return jsonify({"error": "Model pipeline not loaded"}), 500

        y_pred = pipeline.predict([resume_text])[0]
        predicted_role = (
            label_encoder.inverse_transform([y_pred])[0]
            if label_encoder is not None
            else str(y_pred)
        )

        # Normalize predicted role to lowercase for API compatibility
        predicted_role = predicted_role.lower()

        return jsonify({
            "success": True,
            "extractedData": extractedData,
            "predictedRole": predicted_role,
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
