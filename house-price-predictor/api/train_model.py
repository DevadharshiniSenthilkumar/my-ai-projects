import os
import joblib
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import pandas as pd

def train_and_save_model():
    print("Fetching California Housing Dataset...")
    # Load dataset
    california = fetch_california_housing()
    
    # We will use exactly 4 easy to understand features for the demo to "take realworld input":
    # 1. MedInc: Median income in block group
    # 2. HouseAge: Median house age in block group
    # 3. AveRooms: Average number of rooms per household
    # 4. AveBedrms: Average number of bedrooms per household
    # To keep the UI clean, let's train a model on just these 4 features.
    
    feature_names = california.feature_names
    df = pd.DataFrame(california.data, columns=feature_names)
    
    selected_features = ['MedInc', 'HouseAge', 'AveRooms', 'AveBedrms']
    X = df[selected_features]
    y = california.target # Median house value in 100,000s
    
    # Split the dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"Training RandomForestRegressor on features: {selected_features}...")
    # Initialize and train model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Predict and evaluate
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Model trained successfully!")
    print(f"Mean Squared Error: {mse:.4f}")
    print(f"R² Score: {r2:.4f}")
    
    # Save the model relative to this script's location
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, 'house_price_model.pkl')
    
    joblib.dump(model, model_path)
    print(f"Model saved to: {model_path}")

if __name__ == "__main__":
    train_and_save_model()
