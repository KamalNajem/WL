import os
import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from django.conf import settings

class LearningStyleClusterer:
    def __init__(self):
        self.data_path = os.path.join(settings.BASE_DIR, 'data', 'merged_dataset.csv')
        self.model_path = os.path.join(settings.BASE_DIR, 'data', 'kmeans_model.pkl')
        self.scaler_path = os.path.join(settings.BASE_DIR, 'data', 'scaler.pkl')
        self.features = ['StudyHours', 'Attendance', 'Resources', 'Extracurricular', 'Motivation', 'Internet', 'ExamScore']

    def train_model(self, n_clusters=3):
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Dataset not found at {self.data_path}")

        df = pd.read_csv(self.data_path)
        
        # Ensure all features exist
        missing_cols = [col for col in self.features if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Missing columns in CSV: {missing_cols}")

        X = df[self.features]
        
        # Preprocessing
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Training
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        kmeans.fit(X_scaled)
        
        # Saving
        joblib.dump(kmeans, self.model_path)
        joblib.dump(scaler, self.scaler_path)
        
        return f"Model trained with {n_clusters} clusters. Saved to {self.model_path}"

    def predict_style(self, student_profile):
        if not os.path.exists(self.model_path) or not os.path.exists(self.scaler_path):
            raise FileNotFoundError("Model or Scaler not found. Please train the model first.")

        # Load model and scaler
        kmeans = joblib.load(self.model_path)
        scaler = joblib.load(self.scaler_path)

        # Map StudentProfile fields to features
        features = [
            student_profile.total_study_hours,
            student_profile.attendance,
            student_profile.resources_visited,
            1 if student_profile.extracurricular_activities else 0,
            5, # Default Motivation (needs to be mapped from string)
            student_profile.internet_usage,
            student_profile.exam_score
        ]
        
        # Reshape for single sample
        features_array = [features]
        
        # Scale
        features_scaled = scaler.transform(features_array)
        
        # Predict
        cluster_id = kmeans.predict(features_scaled)[0]
        return int(cluster_id)

def calculate_vark_score(answers):
    """
    Calculates the dominant VARK style based on quiz answers.
    answers: dict of {question_id: selected_option_key}
    e.g. {1: 'A', 2: 'B'}
    """
    
    # Key: Option -> Style
    # A=Visual, B=Aural, C=Read/Write, D=Kinesthetic
    mapping = {
        'A': 'Visual',
        'B': 'Auditory',
        'C': 'Read/Write',
        'D': 'Kinesthetic'
    }
    
    scores = {'Visual': 0, 'Auditory': 0, 'Read/Write': 0, 'Kinesthetic': 0}
    
    for question_id, option in answers.items():
        style = mapping.get(option)
        if style:
            scores[style] += 1
            
    # Find dominant style
    dominant_style = max(scores, key=scores.get)
    return dominant_style, scores

