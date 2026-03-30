from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import sys

app = Flask(__name__)
# Allow CORS for all domains, specifically useful when frontend calls from a different port
CORS(app)

# Load the trained model
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, 'house_price_model.pkl')

model = None
try:
    if os.path.exists(model_path):
        model = joblib.load(model_path)
    else:
        print(f"Warning: Model not found at {model_path}. Please run train_model.py first.")
except Exception as e:
    print(f"Error loading model: {e}")

@app.route('/', methods=['GET'])
@app.route('/api/', methods=['GET'])
@app.route('/api', methods=['GET'])
def health_check():
    return jsonify({"status": "API is running!", "model_loaded": model is not None})

@app.route('/predict', methods=['POST'])
@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model is not loaded on the server."}), 500
        
    try:
        # Get JSON data from frontend
        data = request.get_json()
        
        # We expect: 
        # { "medInc": float, "houseAge": float, "aveRooms": float, "aveBedrms": float }
        med_inc = float(data.get('medInc', 0))
        house_age = float(data.get('houseAge', 0))
        ave_rooms = float(data.get('aveRooms', 0))
        ave_bedrms = float(data.get('aveBedrms', 0))
        
        # Prepare feature array in the same order as training
        features = [[med_inc, house_age, ave_rooms, ave_bedrms]]
        
        # Make prediction
        prediction = model.predict(features)
        
        # The dataset targets are in hundreds of thousands of dollars ($100,000s)
        # So we multiply by 100,000 to get the estimated real dollar value.
        predicted_value = round(float(prediction[0]) * 100000, 2)
        
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
