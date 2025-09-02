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
MODEL_PATH = os.path.join("models", "multilabel_job_predictor.joblib")
loaded_obj = joblib.load(MODEL_PATH)
pipeline = loaded_obj.get("pipeline")
mlb = loaded_obj.get("multilabel_binarizer")


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
# Prediction 
# ------------------------


@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "resume" not in request.files:
            return jsonify({"error": "No resume file uploaded"}), 400

        file = request.files["resume"]
        filename = secure_filename(file.filename)

        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, filename)
        file.save(temp_path)

        resume_text = extract_resume_text(temp_path, file.mimetype)
        if not resume_text:
            return jsonify({"error": "Could not extract text from resume"}), 400

        extractedData = {
            "skills": [w for w in resume_text.split() if w.istitle()][:10],
            "raw_text_preview": resume_text[:300],
        }

        if pipeline is None or mlb is None:
            return jsonify({"error": "Model or multilabel binarizer not loaded"}), 500

        y_pred = pipeline.predict([resume_text])  # shape (1, n_classes)
        predicted_roles = mlb.inverse_transform(y_pred)  # returns list of tuples

        # predicted_roles is a list with one tuple of labels
        predicted_roles_list = list(predicted_roles[0]) if predicted_roles else []

        # Normalize to lowercase
        predicted_roles_list = [role.lower() for role in predicted_roles_list]

        return jsonify({
            "success": True,
            "extractedData": extractedData,
            "predictedRoles": predicted_roles_list,
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
