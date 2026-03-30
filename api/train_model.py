import os
import joblib
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, r2_score
import pandas as pd

def train_and_save_model():
    print("Fetching California Housing Dataset...")
    california = fetch_california_housing()
    
    feature_names = california.feature_names
    df = pd.DataFrame(california.data, columns=feature_names)
    
    selected_features = ['MedInc', 'HouseAge', 'AveRooms', 'AveBedrms']
    X = df[selected_features]
    y = california.target # Median house value in 100,000s
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"Training Lightweight Linear Regression Pipeline on features: {selected_features}...")
    
    # We use a pipeline with StandardScaler to give LinearRegression slightly better weights/stability
    model = Pipeline([
        ('scaler', StandardScaler()),
        ('regressor', LinearRegression())
    ])
    
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Model trained successfully!")
    print(f"Mean Squared Error: {mse:.4f}")
    print(f"R² Score: {r2:.4f}")
    
    # Save the lightweight model
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, 'house_price_model.pkl')
    
    joblib.dump(model, model_path)
    print(f"Model saved to: {model_path} (File size: {os.path.getsize(model_path) / 1024:.2f} KB)")

if __name__ == "__main__":
    train_and_save_model()
