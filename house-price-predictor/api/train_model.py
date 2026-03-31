import json
import os
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
import pandas as pd

def train_and_export_weights():
    print("Fetching California Housing Dataset...")
    california = fetch_california_housing()
    
    feature_names = california.feature_names
    df = pd.DataFrame(california.data, columns=feature_names)
    
    # Select the requested 4 features to match our UI
    selected_features = ['MedInc', 'HouseAge', 'AveRooms', 'AveBedrms']
    X = df[selected_features]
    y = california.target # Median house value in 100,000s
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"Training Model on features: {selected_features}...")
    
    # 1. Scale the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 2. Train Linear Regression
    model = LinearRegression()
    model.fit(X_train_scaled, y_train)
    
    # Test accuracy
    y_pred = model.predict(X_test_scaled)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print("Model trained successfully!")
    print(f"Mean Squared Error: {mse:.4f}")
    print(f"R² Score: {r2:.4f}")
    
    # 3. EXPORT WEIGHTS TO JSON
    # Rather than saving a massive joblib/pickle file, we just extract the math
    weights_data = {
        "scaler_mean": scaler.mean_.tolist(),
        "scaler_scale": scaler.scale_.tolist(),
        "model_coefficients": model.coef_.tolist(),
        "model_intercept": float(model.intercept_),
        "features": selected_features
    }
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(current_dir, 'model_weights.json')
    
    with open(json_path, 'w') as f:
        json.dump(weights_data, f, indent=4)
        
    print(f"Saved pure math weights to: {json_path}")
    print(f"File size: {os.path.getsize(json_path)} bytes (This solves Vercel limits!)")

if __name__ == "__main__":
    train_and_export_weights()
