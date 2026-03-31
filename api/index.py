from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
# Allow CORS for all domains, specifically useful when frontend calls from a different port
CORS(app)

# Load the purely mathematical weights
current_dir = os.path.dirname(os.path.abspath(__file__))
weights_path = os.path.join(current_dir, 'model_weights.json')

weights = None
try:
    if os.path.exists(weights_path):
        with open(weights_path, 'r') as f:
            weights = json.load(f)
    else:
        print(f"Warning: Model weights not found at {weights_path}. Please run train_model.py first.")
except Exception as e:
    print(f"Error loading model weights: {e}")

@app.route('/', methods=['GET'])
@app.route('/api/', methods=['GET'])
@app.route('/api', methods=['GET'])
def health_check():
    return jsonify({"status": "Painless Pure Python API is running!", "weights_loaded": weights is not None})

@app.route('/predict', methods=['POST'])
@app.route('/api/predict', methods=['POST'])
def predict():
    if weights is None:
        return jsonify({"error": "Model weights are not loaded on the server."}), 500
        
    try:
        data = request.get_json()
        
        # We expect: { "medInc": float, "houseAge": float, "aveRooms": float, "aveBedrms": float }
        med_inc = float(data.get('medInc', 0))
        house_age = float(data.get('houseAge', 0))
        ave_rooms = float(data.get('aveRooms', 0))
        ave_bedrms = float(data.get('aveBedrms', 0))
        
        input_features = [med_inc, house_age, ave_rooms, ave_bedrms]
        
        # Pure Python Math Prediction (No Scikit-Learn Needed!)
        scaler_mean = weights['scaler_mean']
        scaler_scale = weights['scaler_scale']
        coef = weights['model_coefficients']
        intercept = weights['model_intercept']
        
        # 1. Scale inputs: (X - mean) / scale
        scaled_inputs = [(input_features[i] - scaler_mean[i]) / scaler_scale[i] for i in range(4)]
        
        # 2. Linear Regression Formula: (X1*c1 + X2*c2 + X3*c3 + X4*c4) + intercept
        prediction = sum(scaled_inputs[i] * coef[i] for i in range(4)) + intercept
        
        # The dataset targets are in hundreds of thousands of dollars ($100,000s)
        predicted_value = round(float(prediction) * 100000, 2)
        
        # Make sure predicted value is positive
        if predicted_value < 0: predicted_value = 10000.00
        
        return jsonify({
            "success": True,
            "predicted_price": predicted_value,
            "formatted_price": f"${predicted_value:,.2f}"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# For local testing
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
