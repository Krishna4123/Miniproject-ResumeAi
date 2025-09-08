import os
import joblib
import tempfile
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from enhanced_text_extractor import text_extractor
from sklearn.exceptions import InconsistentVersionWarning

# ------------------------
# Suppress sklearn warnings
# ------------------------
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

# ------------------------
# Initialize Flask app with CORS
# ------------------------
app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://localhost:5173'])  # Allow frontend origins

# ------------------------
# Load trained model (Pipeline + MultilabelBinarizer)
# ------------------------
MODEL_PATH = os.path.join("models", "multilabel_job_predictor.joblib")

try:
    loaded_obj = joblib.load(MODEL_PATH)
    
    if isinstance(loaded_obj, dict):
        pipeline = loaded_obj.get("pipeline")
        mlb = loaded_obj.get("multilabel_binarizer")
        # Fallback for different naming conventions
        if not mlb:
            mlb = loaded_obj.get("label_encoder")
    elif hasattr(loaded_obj, "predict"):  # full pipeline (fallback)
        pipeline = loaded_obj
        mlb = None
        print("⚠️ Warning: Model loaded as single pipeline, multilabel binarizer may be missing")
    else:
        raise RuntimeError("❌ Unsupported model format. Expected dict or pipeline.")
        
    if not pipeline:
        raise RuntimeError("❌ Pipeline not found in model file")
        
    print("✅ Model loaded successfully")
    
except FileNotFoundError:
    print("❌ Model file not found. Please ensure the model is trained and saved.")
    pipeline = None
    mlb = None
except Exception as e:
    print(f"❌ Error loading model: {e}")
    pipeline = None
    mlb = None



# ------------------------
# Enhanced Prediction Endpoint
# ------------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Validate request
        if "resume" not in request.files:
            return jsonify({"error": "No resume file uploaded"}), 400

        file = request.files["resume"]
        if not file.filename:
            return jsonify({"error": "No file selected"}), 400
            
        filename = secure_filename(file.filename)
        print(f"📄 Processing file: {filename} ({file.mimetype})")

        # Save file temporarily
        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, filename)
        file.save(temp_path)

        # Enhanced text extraction
        extraction_result = text_extractor.extract_text_with_fallback(temp_path, file.mimetype)
        resume_text = extraction_result['text']
        extraction_metadata = extraction_result['metadata']
        
        print(f"🔍 Extraction completed: {extraction_metadata.get('method', 'unknown')} "
              f"(confidence: {extraction_metadata.get('confidence', 0):.2f}, "
              f"length: {len(resume_text)})")

        if not resume_text or len(resume_text.strip()) < 20:
            return jsonify({
                "error": "Could not extract meaningful text from resume",
                "details": "The file may be corrupted, password-protected, or contain only images",
                "extraction_metadata": extraction_metadata
            }), 400

        # Extract enhanced features
        enhanced_features = text_extractor.extract_enhanced_features(resume_text)
        
        # Prepare extracted data for frontend
        extractedData = {
            "skills": enhanced_features.get('skills', []),
            "sections_found": enhanced_features.get('sections_found', {}),
            "estimated_experience": enhanced_features.get('estimated_experience_years', 0),
            "text_statistics": enhanced_features.get('text_statistics', {}),
            "raw_text_preview": enhanced_features.get('raw_text_preview', ''),
            "extraction_quality": extraction_metadata.get('quality', {})
        }

        # ML Prediction
        if not pipeline:
            return jsonify({
                "error": "ML model not available",
                "details": "The prediction model is not loaded. Please check model files."
            }), 500

        try:
            # Make prediction
            y_pred = pipeline.predict([resume_text])  # shape (1, n_classes)
            
            if mlb:
                # Use multilabel binarizer to get role names
                predicted_roles = mlb.inverse_transform(y_pred)
                predicted_roles_list = list(predicted_roles[0]) if predicted_roles else []
            else:
                # Fallback: assume binary classification or single label
                predicted_roles_list = ["software engineer"]  # Default fallback
                print("⚠️ Warning: Using fallback prediction due to missing multilabel binarizer")
            
            # Normalize to lowercase and remove duplicates
            predicted_roles_list = list(set([role.lower().strip() for role in predicted_roles_list if role]))
            
            if not predicted_roles_list:
                predicted_roles_list = ["general"]
                
            print(f"🎯 Predicted roles: {predicted_roles_list}")
            
        except Exception as prediction_error:
            print(f"❌ Prediction error: {prediction_error}")
            return jsonify({
                "error": "Prediction failed",
                "details": str(prediction_error)
            }), 500

        # Cleanup temporary file
        try:
            os.remove(temp_path)
            os.rmdir(temp_dir)
        except:
            pass  # Ignore cleanup errors

        return jsonify({
            "success": True,
            "extractedData": extractedData,
            "predictedRoles": predicted_roles_list,
            "extraction_metadata": extraction_metadata,
            "model_info": {
                "model_available": pipeline is not None,
                "multilabel_binarizer_available": mlb is not None
            }
        })

    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500


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
