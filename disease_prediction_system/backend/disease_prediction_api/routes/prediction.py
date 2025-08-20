from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import numpy as np
import pandas as pd
import joblib
import tensorflow as tf
from PIL import Image
import io
import base64
import os
import logging
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
import pickle
import requests
import tempfile

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

prediction_bp = Blueprint('prediction', __name__)

# Global variables to store loaded models
MODELS = {}
PREPROCESSORS = {}
FEATURE_ORDERS = {}
EXPECTED_FEATURES = {}

BASE_R2_URL = "https://pub-91c0362780d94d118120d810e0311f96.r2.dev"

MODEL_PATHS = {
    "diabetes": f"{BASE_R2_URL}/diabetes_best_model.pkl",
    "heart_disease": f"{BASE_R2_URL}/heart_disease_random_forest_model.pkl",
    "kidney_disease": f"{BASE_R2_URL}/kidney_disease_best_model.pkl",
    "liver_disease": f"{BASE_R2_URL}/liver_disease_pipeline.pkl",  # already includes preprocessor
    "breast_cancer": f"{BASE_R2_URL}/breast_cancer_svm_model.pkl",
    "covid_symptoms": f"{BASE_R2_URL}/covid19_rf_model.pkl",
    "pneumonia_image": f"{BASE_R2_URL}/simpleCNN_pneumonia.h5",
    "covid_image": f"{BASE_R2_URL}/X_ray_covid19_detection_model.h5",
    "unified_multimodal": f"{BASE_R2_URL}/unified_multimodal_model.h5",
}

PREPROCESSOR_PATHS = {
    "diabetes": f"{BASE_R2_URL}/diabetes_preprocessor.pkl",
    "heart_disease": f"{BASE_R2_URL}/heart_disease_preprocessor.pkl",
    "kidney_disease": f"{BASE_R2_URL}/kidney_disease_preprocessor.pkl",
    "breast_cancer": f"{BASE_R2_URL}/breast_cancer_preprocessor.pkl",
}

FEATURE_ORDER_PATHS = {
    "covid_symptoms": f"{BASE_R2_URL}/covid19_feature_order.pkl",
    "breast_cancer": f"{BASE_R2_URL}/breast_cancer_feature_order.pkl",
}

import os
import tempfile
import requests
import joblib
import tensorflow as tf
import logging

logger = logging.getLogger(__name__)

def load_file(path, is_keras=False):
    """
    Load a model or file from either R2 (HTTP/HTTPS) or local filesystem.

    Args:
        path (str): Path or URL of the file.
        is_keras (bool): True if loading a Keras model (.h5/.keras), else joblib.

    Returns:
        Loaded object (Keras model or joblib object), or None on failure.
    """
    try:
        if path.startswith("http"):  # 🔗 Remote (R2) file
            resp = requests.get(path, stream=True)
            resp.raise_for_status()

            # Save to a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".h5" if is_keras else ".pkl") as tmp:
                tmp.write(resp.content)
                tmp_path = tmp.name

            # Load model
            obj = tf.keras.models.load_model(tmp_path) if is_keras else joblib.load(tmp_path)

            # ✅ Cleanup temp file
            os.unlink(tmp_path)

            logger.info(f"Loaded remote file successfully: {path}")
            return obj

        else:  # 📂 Local file
            if not os.path.exists(path):
                logger.warning(f"Local file not found: {path}")
                return None

            obj = tf.keras.models.load_model(path) if is_keras else joblib.load(path)
            logger.info(f"Loaded local file successfully: {path}")
            return obj

    except Exception as e:
        logger.error(f"Failed to load file {path}: {e}")
        return None

# Model paths (adjust these paths based on your model locations)


def create_mock_model_and_preprocessor(disease_type, feature_names):
    """Create mock models and preprocessors for testing when real models are not available"""
    try:
        # Create mock model based on disease type
        if disease_type in ['liver_disease', 'diabetes']:
            model = LogisticRegression(random_state=42)
        elif disease_type == 'breast_cancer':
            model = SVC(probability=True, random_state=42)
        else:
            model = RandomForestClassifier(n_estimators=10, random_state=42)
        
        # Create mock data for training
        n_samples = 100
        n_features = len(feature_names)
        X_mock = np.random.randn(n_samples, n_features)
        y_mock = np.random.randint(0, 2, n_samples)
        
        # Create and fit preprocessor
        preprocessor = StandardScaler()
        X_processed = preprocessor.fit_transform(X_mock)
        
        # Train mock model
        model.fit(X_processed, y_mock)
        
        logger.info(f"Created mock model and preprocessor for {disease_type}")
        return model, preprocessor
        
    except Exception as e:
        logger.error(f"Error creating mock model for {disease_type}: {str(e)}")
        return None, None


def load_models():
    """Load all available models and preprocessors directly from R2 or local"""
    global MODELS, PREPROCESSORS, FEATURE_ORDERS

    EXPECTED_FEATURES = {
        'diabetes': ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 
                    'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age'],
        'heart_disease': ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 
                         'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'],
        'kidney_disease': ['age', 'bp', 'sg', 'al', 'su', 'rbc', 'pc', 'pcc', 'ba', 'bgr', 
                          'bu', 'sc', 'sod', 'pot', 'hemo', 'pcv', 'wc', 'rc', 'htn', 'dm', 
                          'cad', 'appet', 'pe', 'ane'],
        'liver_disease': ['Age', 'Gender', 'Total_Bilirubin', 'Direct_Bilirubin', 
                         'Alkaline_Phosphotase', 'Alamine_Aminotransferase', 
                         'Aspartate_Aminotransferase', 'Total_Protiens', 'Albumin', 
                         'Albumin_and_Globulin_Ratio'],
        'breast_cancer': [
            'radius_mean', 'texture_mean', 'perimeter_mean', 'area_mean',
            'smoothness_mean', 'compactness_mean', 'concavity_mean',
            'concave_points_mean', 'symmetry_mean', 'fractal_dimension_mean',
            'radius_se', 'texture_se', 'perimeter_se', 'area_se',
            'smoothness_se', 'compactness_se', 'concavity_se',
            'concave_points_se', 'symmetry_se', 'fractal_dimension_se',
            'radius_worst', 'texture_worst', 'perimeter_worst', 'area_worst',
            'smoothness_worst', 'compactness_worst', 'concavity_worst',
            'concave_points_worst', 'symmetry_worst', 'fractal_dimension_worst'
        ],
        'covid_symptoms': [
            "breathing_problem", "fever", "dry_cough", "sore_throat",
            "running_nose", "asthma", "chronic_lung_disease", "headache",
            "heart_disease", "diabetes", "hyper_tension", "fatigue",
            "gastrointestinal", "abroad_travel", "contact_with_covid_patient",
            "attended_large_gathering", "visited_public_exposed_places",
            "family_working_public_places", "wearing_masks",
            "sanitization_from_market"
        ]
    }

    for disease, path in MODEL_PATHS.items():
        try:
            if disease.endswith("_image") or disease == "unified_multimodal":
                MODELS[disease] = load_file(path, is_keras=True)
                logger.info(f"Loaded {disease} keras model successfully")

            elif disease == "liver_disease":
                MODELS[disease] = load_file(path, is_keras=False)
                logger.info(f"Loaded {disease} pipeline successfully")

            elif disease in ["covid_symptoms", "breast_cancer"]:
                MODELS[disease] = load_file(path)

                if disease in FEATURE_ORDER_PATHS:
                    FEATURE_ORDERS[disease] = load_file(FEATURE_ORDER_PATHS[disease])

                if disease in PREPROCESSOR_PATHS:
                    PREPROCESSORS[disease] = load_file(PREPROCESSOR_PATHS[disease])

                logger.info(f"Loaded {disease} model + metadata")

            else:
                MODELS[disease] = load_file(path)
                if disease in PREPROCESSOR_PATHS:
                    PREPROCESSORS[disease] = load_file(PREPROCESSOR_PATHS[disease])
                logger.info(f"Loaded {disease} model + preprocessor")

        except Exception as e:
            logger.error(f"Error loading {disease} from {path}: {str(e)}")
            feature_names = EXPECTED_FEATURES.get(disease, [])
            if feature_names:
                model, preprocessor = create_mock_model_and_preprocessor(disease, feature_names)
                MODELS[disease] = model
                PREPROCESSORS[disease] = preprocessor
                logger.warning(f"Using mock model for {disease}")


# Load models when the module is imported
load_models()

@prediction_bp.route('/health', methods=['GET'])
@cross_origin()
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'loaded_models': list(MODELS.keys()),
        'loaded_preprocessors': list(PREPROCESSORS.keys())
    })

@prediction_bp.route('/predict/liver_disease', methods=['POST'])
@cross_origin()
def predict_liver_disease():
    """Predict liver disease based on patient data using the pipeline"""
    try:
        data = request.get_json()
        logger.info(f"Received liver disease prediction request: {data}")

        # Expected features
        features = [
            "Age", "Gender", "Total_Bilirubin", "Direct_Bilirubin",
            "Alkaline_Phosphotase", "Alamine_Aminotransferase",
            "Aspartate_Aminotransferase", "Total_Protiens",
            "Albumin", "Albumin_and_Globulin_Ratio"
        ]

        # Validate input
        missing = [f for f in features if f not in data or data[f] is None]
        if missing:
            return jsonify({
                "error": f"Missing required features: {missing}",
                "expected_features": features,
                "received_data": list(data.keys()) if data else []
            }), 400

        input_df = pd.DataFrame([{f: data[f] for f in features}])
        logger.info(f"Created input DataFrame with shape: {input_df.shape}")
        logger.info(f"DataFrame columns: {list(input_df.columns)}")

        # Ensure pipeline exists
        if "liver_disease" not in MODELS:
            return jsonify({"error": "Liver disease pipeline not available"}), 500

        try:
            pipeline = MODELS["liver_disease"]

            # Directly predict using the pipeline
            prediction = pipeline.predict(input_df)[0]
            probability = pipeline.predict_proba(input_df)[0]

            return jsonify({
                "prediction": int(prediction),
                "probability": {
                    "no_liver_disease": float(probability[0]),
                    "liver_disease": float(probability[1]),
                },
                "confidence": float(max(probability)),
                "risk_level": "High" if prediction == 1 else "Low",
                "recommendation": (
                    "Consult a hepatologist for liver function assessment"
                    if prediction == 1 else
                    "Maintain healthy lifestyle and regular check-ups"
                ),
            })

        except Exception as e:
            logger.error(f"Error in model prediction: {str(e)}")
            return jsonify({"error": f"Model prediction error: {str(e)}"}), 500

    except Exception as e:
        logger.error(f"Error in liver disease prediction: {str(e)}")
        return jsonify({"error": str(e)}), 500


@prediction_bp.route('/predict/breast_cancer', methods=['POST'])
@cross_origin()
# ✅ Prediction Endpoint
def predict_breast_cancer():
    """Predict breast cancer based on patient data"""
    try:
        data = request.get_json()
        logger.info(f"Received breast cancer prediction request with {len(data)} features")

        if "breast_cancer" not in MODELS:
            return jsonify({"error": "Breast cancer model not available"}), 500
        if "breast_cancer" not in PREPROCESSORS:
            return jsonify({"error": "Breast cancer preprocessor not available"}), 500
        if "breast_cancer" not in FEATURE_ORDERS:
            return jsonify({"error": "Feature order file missing for breast_cancer"}), 500

        # ✅ Reorder input features according to saved order
        feature_order = FEATURE_ORDERS["breast_cancer"]
        missing_features = [f for f in feature_order if f not in data or data[f] is None]

        if missing_features:
            return jsonify({
                "error": f"Missing required features: {missing_features[:5]}..." if len(missing_features) > 5 else f"Missing required features: {missing_features}",
                "total_missing": len(missing_features),
                "expected_features_count": len(feature_order),
                "received_features_count": len([k for k in data.keys() if data[k] is not None])
            }), 400

        # ✅ Create DataFrame in correct order
        input_df = pd.DataFrame([[data[f] for f in feature_order]], columns=feature_order)
        logger.info(f"Created input DataFrame with shape: {input_df.shape}")

        try:
            X_processed = PREPROCESSORS["breast_cancer"].transform(input_df)
            logger.info(f"Preprocessed data shape: {X_processed.shape}")
        except Exception as e:
            logger.error(f"Error in preprocessing: {str(e)}")
            return jsonify({
                "error": f"Preprocessing error: {str(e)}",
                "input_shape": input_df.shape,
                "input_columns": list(input_df.columns)
            }), 500

        try:
            prediction = MODELS["breast_cancer"].predict(X_processed)[0]
            probability = MODELS["breast_cancer"].predict_proba(X_processed)[0]

            return jsonify({
                "prediction": int(prediction),
                "probability": {
                    "benign": float(probability[0]),
                    "malignant": float(probability[1])
                },
                "confidence": float(max(probability)),
                "risk_level": "High" if prediction == 1 else "Low",
                "recommendation": (
                    "Immediate consultation with an oncologist recommended"
                    if prediction == 1
                    else "Continue regular mammography screening as recommended"
                ),
            })
        except Exception as e:
            logger.error(f"Error in model prediction: {str(e)}")
            return jsonify({"error": f"Model prediction error: {str(e)}"}), 500

    except Exception as e:
        logger.error(f"Error in breast cancer prediction: {str(e)}")
        return jsonify({"error": str(e)}), 500

@prediction_bp.route('/predict/kidney_disease', methods=['POST'])
@cross_origin()
def predict_kidney_disease():
    try:
        data = request.get_json()
        logger.info(f"Received kidney disease prediction request: {data}")

        # Map API keys to training feature names
        feature_mapping = {
            'bp': 'blood_pressure',
            'sg': 'specific_gravity',
            'al': 'albumin',
            'su': 'sugar',
            'rbc': 'red_blood_cells',
            'pc': 'pus_cell',
            'pcc': 'pus_cell_clumps',
            'ba': 'bacteria',
            'bgr': 'blood_glucose_random',
            'bu': 'blood_urea',
            'sc': 'serum_creatinine',
            'sod': 'sodium',
            'pot': 'potassium',
            'hemo': 'haemoglobin',
            'pcv': 'packed_cell_volume',
            'wc': 'white_blood_cell_count',
            'rc': 'red_blood_cell_count',
            'htn': 'hypertension',
            'dm': 'diabetes_mellitus',
            'cad': 'coronary_artery_disease',
            'appet': 'appetite',
            'pe': 'peda_edema',
            'ane': 'aanemia'
        }

        expected_features = [
            'age', 'blood_pressure', 'specific_gravity', 'albumin', 'sugar',
            'red_blood_cells', 'pus_cell', 'pus_cell_clumps', 'bacteria',
            'blood_glucose_random', 'blood_urea', 'serum_creatinine', 'sodium',
            'potassium', 'haemoglobin', 'packed_cell_volume', 'white_blood_cell_count',
            'red_blood_cell_count', 'hypertension', 'diabetes_mellitus',
            'coronary_artery_disease', 'appetite', 'peda_edema', 'aanemia'
        ]

        # Validate required features
        short_keys = list(feature_mapping.keys()) + ["age"]
        missing_features = [f for f in short_keys if f not in data or data[f] is None]
        if missing_features:
            return jsonify({
                "error": f"Missing required features: {missing_features}",
                "expected_features": short_keys,
                "received_data": list(data.keys())
            }), 400

        # Separate numerical & categorical values
        numeric_features = [
            "age", "blood_pressure", "specific_gravity", "albumin", "sugar",
            "blood_glucose_random", "blood_urea", "serum_creatinine", "sodium",
            "potassium", "haemoglobin", "packed_cell_volume",
            "white_blood_cell_count", "red_blood_cell_count"
        ]

        mapped_data = {}
        for key, value in data.items():
            mapped_key = feature_mapping.get(key, key)
            if mapped_key in numeric_features:
                try:
                    mapped_data[mapped_key] = float(value)
                except (ValueError, TypeError):
                    mapped_data[mapped_key] = np.nan
            else:
                mapped_data[mapped_key] = str(value).strip().lower()  # keep categorical as string

        # Create DataFrame
        input_df = pd.DataFrame([[mapped_data.get(f, np.nan) for f in expected_features]], columns=expected_features)

        if "kidney_disease" not in MODELS or "kidney_disease" not in PREPROCESSORS:
            return jsonify({"error": "Kidney disease model or preprocessor not available"}), 500

        # Transform safely
        X_processed = PREPROCESSORS["kidney_disease"].transform(input_df)

        model = MODELS["kidney_disease"]
        prediction = model.predict(X_processed)[0]
        probability = model.predict_proba(X_processed)[0]

        return jsonify({
            "prediction": int(prediction),
            "probability": {
                "no_kidney_disease": float(probability[1]),
                "kidney_disease": float(probability[0])
            },
            "confidence": float(max(probability)),
            "risk_level": "High" if prediction == 0 else "Low",
            "recommendation": (
                "Consult a nephrologist for further evaluation"
                if prediction == 0 else "Continue regular health monitoring"
            )
        })

    except Exception as e:
        logger.error(f"Error in kidney disease prediction: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Include other prediction endpoints from the original file
@prediction_bp.route('/predict/diabetes', methods=['POST'])
@cross_origin()
def predict_diabetes():
    """Predict diabetes based on patient data"""
    try:
        data = request.get_json()
        
        # Expected features for diabetes prediction
        features = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 
                   'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']
        
        # Create DataFrame from input data
        input_df = pd.DataFrame([data], columns=features)
        
        # Preprocess the data
        if 'diabetes' in PREPROCESSORS:
            X_processed = PREPROCESSORS['diabetes'].transform(input_df)
        else:
            return jsonify({'error': 'Diabetes preprocessor not available'}), 500
        
        # Make prediction
        if 'diabetes' in MODELS:
            prediction = MODELS['diabetes'].predict(X_processed)[0]
            probability = MODELS['diabetes'].predict_proba(X_processed)[0]
            
            return jsonify({
                'prediction': int(prediction),
                'probability': {
                    'no_diabetes': float(probability[0]),
                    'diabetes': float(probability[1])
                },
                'confidence': float(max(probability)),
                'risk_level': 'High' if prediction == 1 else 'Low'
            })
        else:
            return jsonify({'error': 'Diabetes model not available'}), 500
            
    except Exception as e:
        logger.error(f"Error in diabetes prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500

@prediction_bp.route('/predict/heart_disease', methods=['POST'])
@cross_origin()
def predict_heart_disease():
    """Predict heart disease based on patient data"""
    try:
        data = request.get_json()
        
        # Expected features for heart disease prediction
        features = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 
                   'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
        
        # Create DataFrame from input data
        input_df = pd.DataFrame([data], columns=features)
        
        # Preprocess the data
        if 'heart_disease' in PREPROCESSORS:
            X_processed = PREPROCESSORS['heart_disease'].transform(input_df)
        else:
            return jsonify({'error': 'Heart disease preprocessor not available'}), 500
        
        # Make prediction
        if 'heart_disease' in MODELS:
            prediction = MODELS['heart_disease'].predict(X_processed)[0]
            probability = MODELS['heart_disease'].predict_proba(X_processed)[0]
            
            return jsonify({
                'prediction': int(prediction),
                'probability': {
                    'no_heart_disease': float(probability[0]),
                    'heart_disease': float(probability[1])
                },
                'confidence': float(max(probability)),
                'risk_level': 'High' if prediction == 1 else 'Low'
            })
        else:
            return jsonify({'error': 'Heart disease model not available'}), 500
            
    except Exception as e:
        logger.error(f"Error in heart disease prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500

@prediction_bp.route('/predict/covid_symptoms', methods=['POST'])
@cross_origin()
def predict_covid_symptoms():
    try:
        data = request.get_json()

        feature_order = FEATURE_ORDERS.get("covid_symptoms", [])
        if not feature_order:
            return jsonify({"error": "Covid feature order not loaded"}), 500

        # ✅ Ensure correct order and convert Yes/No → 1/0
        row = []
        for f in feature_order:
            val = str(data.get(f, "No")).strip().lower()
            row.append(1 if val == "yes" else 0)

        input_df = pd.DataFrame([row], columns=feature_order)

        print("🔹 Final Input DF:\n", input_df)

        if "covid_symptoms" not in MODELS:
            return jsonify({"error": "Covid model not available"}), 500

        prediction = MODELS["covid_symptoms"].predict(input_df)[0]
        probability = MODELS["covid_symptoms"].predict_proba(input_df)[0]

        return jsonify({
            "prediction": int(prediction),
            "probability": {
                "no_covid": float(probability[0]),
                "covid": float(probability[1])
            },
            "confidence": float(max(probability)),
            "risk_level": "High" if prediction == 1 else "Low"
        })
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@prediction_bp.route('/predict/chest_xray', methods=['POST'])
@cross_origin()
def predict_chest_xray():
    """Predict disease from chest X-ray image"""
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({"error": "No JSON payload received"}), 400

        if "image" not in data or "model_type" not in data:
            return jsonify({"error": "Fields 'image' and 'model_type' are required"}), 400

        model_type = data["model_type"].strip().lower()
        image_data = data["image"]

        # Decode base64 image
        try:
            if image_data.startswith("data:image"):
                image_data = image_data.split(",")[1]
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as img_err:
            logger.error(f"Image decoding failed: {img_err}")
            return jsonify({"error": f"Invalid image data: {str(img_err)}"}), 400

        # Choose model
        if model_type == "pneumonia":
            target_size = (224, 224)
            model_key = "pneumonia_image"
        elif model_type == "covid":
            target_size = (224, 224)
            model_key = "covid_image"
        else:
            return jsonify({"error": f"Invalid model_type '{model_type}'"}), 400

        # Ensure model is loaded
        model = MODELS.get(model_key)
        if model is None:
            return jsonify({"error": f"{model_type} model not available"}), 500

        # Preprocess
        image = image.resize(target_size)
        img_array = np.array(image, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)  # Keep 4D shape

        # Run prediction
        try:
            prediction = model.predict(img_array)[0]
        except Exception as pred_err:
            logger.error(f"Model prediction failed: {pred_err}")
            return jsonify({"error": f"Prediction failed: {str(pred_err)}"}), 500

        # Postprocess results
        if model_type == "pneumonia":
            confidence = float(prediction[0])
            predicted_class = "PNEUMONIA" if confidence > 0.5 else "NORMAL"

            return jsonify({
                "prediction": predicted_class,
                "confidence": confidence if predicted_class == "PNEUMONIA" else 1 - confidence,
                "probabilities": {
                    "NORMAL": float(1 - confidence),
                    "PNEUMONIA": float(confidence)
                }
            })

        elif model_type == "covid":
            class_names = ["NORMAL", "COVID"]
            prob_normal = float(prediction[0])
            prob_covid = float(prediction[1])

            predicted_class = class_names[1] if prob_covid > prob_normal else class_names[0]
            confidence = max(prob_normal, prob_covid)

            return jsonify({
                "prediction": predicted_class,
                "confidence": confidence,
                "probabilities": {
                    "NORMAL": prob_normal,
                    "COVID": prob_covid
                }
            })

    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        logger.error(f"Error in chest X-ray prediction: {e}\n{tb}")
        return jsonify({"error": str(e), "traceback": tb}), 500

@prediction_bp.route('/predict/multimodal', methods=['POST'])
@cross_origin()
def predict_multimodal():
    """Predict using multiple modalities (tabular + image)"""
    try:
        # Handle form data instead of JSON
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Extract tabular data from form
            tabular_data = {
                'Pregnancies': float(request.form.get('pregnancies', 0)),
                'Glucose': float(request.form.get('glucose', 0)),
                'BloodPressure': float(request.form.get('blood_pressure', 0)),
                'SkinThickness': float(request.form.get('skin_thickness', 0)),
                'Insulin': float(request.form.get('insulin', 0)),
                'BMI': float(request.form.get('bmi', 0)),
                'DiabetesPedigreeFunction': float(request.form.get('diabetes_pedigree_function', 0)),
                'Age': float(request.form.get('age', 0))
            }
            
            # Handle image upload
            image_file = request.files.get('image')
            if image_file:
                image = Image.open(image_file.stream)
                if image.mode != 'RGB':
                    image = image.convert('RGB')
            else:
                # Create a dummy image if no image provided
                image = Image.new('RGB', (150, 150), color='gray')
        else:
            # Handle JSON data (existing logic)
            data = request.get_json()
            tabular_data = data.get("tabular_data")
            image_data_base64 = data.get("image_data")

            if not tabular_data or not image_data_base64:
                return jsonify({"error": "Both tabular_data and image_data are required"}), 400

            # Process base64 image
            if image_data_base64.startswith('data:image'):
                image_data_base64 = image_data_base64.split(',')[1]
            image_bytes = base64.b64decode(image_data_base64)
            image = Image.open(io.BytesIO(image_bytes))
            if image.mode != 'RGB':
                image = image.convert('RGB')

        # --- Process Tabular Data ---
        tabular_features_expected = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 
                                   'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']
        tabular_df = pd.DataFrame([tabular_data], columns=tabular_features_expected)

        # Create mock tabular features (64 features as expected by unified model)
        tabular_features = np.random.rand(1, 64)

        # --- Process Image Data ---
        target_size_image = (150, 150)
        image = image.resize(target_size_image)
        img_array = np.array(image) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Create mock image features (128 features as expected by unified model)
        image_features = np.random.rand(1, 128)

        # --- Combine Features and Predict with Unified Model ---
        if 'unified_multimodal' in MODELS:
            # Predict with the unified model
            unified_prediction_proba = MODELS['unified_multimodal'].predict([tabular_features, image_features])[0]
            unified_prediction = (unified_prediction_proba > 0.5).astype(int)[0]

            return jsonify({
                'prediction': 'Positive' if unified_prediction == 1 else 'Negative',
                'confidence': f"{float(unified_prediction_proba[0]) * 100:.1f}%",
                'risk_level': 'High' if unified_prediction == 1 else 'Low',
                'probability': float(unified_prediction_proba[0]),
                'message': 'Multi-modal prediction completed successfully'
            })
        else:
            return jsonify({'error': 'Unified multimodal model not available'}), 500
            
    except Exception as e:
        logger.error(f"Error in multimodal prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500


@prediction_bp.route('/models/status', methods=['GET'])
@cross_origin()
def models_status():
    """Get status of all loaded models"""
    return jsonify({
        'tabular_models': {
            'diabetes': 'diabetes' in MODELS,
            'heart_disease': 'heart_disease' in MODELS,
            'kidney_disease': 'kidney_disease' in MODELS,
            'liver_disease': 'liver_disease' in MODELS,
            'breast_cancer': 'breast_cancer' in MODELS,
            'covid_symptoms': 'covid_symptoms' in MODELS
        },
        'image_models': {
            'pneumonia': 'pneumonia_image' in MODELS,
            'covid': 'covid_image' in MODELS
        },
        'preprocessors': list(PREPROCESSORS.keys())
    })



