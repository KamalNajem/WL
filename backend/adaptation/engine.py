"""
Model Retraining Engine

Handles automated retraining of the ML model using live platform data
combined with historical training data.
"""

import os
import joblib
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from django.conf import settings
from analytics.data_bridge import DataBridge
from users.models import User, StudentProfile


class ModelRetrainer:
    """
    Handles the complete model retraining pipeline:
    1. Fetches combined historical + live data
    2. Preprocesses features
    3. Trains new KMeans model
    4. Saves model artifacts
    5. Updates all user predictions
    """
    
    def __init__(self):
        self.data_dir = os.path.join(settings.BASE_DIR, 'data')
        self.model_path = os.path.join(self.data_dir, 'kmeans_model.pkl')
        self.scaler_path = os.path.join(self.data_dir, 'scaler.pkl')
        
        # Features used for clustering (must match original training)
        self.features = [
            'StudyHours', 
            'Attendance', 
            'Resources', 
            'Extracurricular', 
            'Motivation', 
            'Internet', 
            'ExamScore'
        ]
        
        # Cluster to learning style mapping
        self.cluster_to_style = {
            0: 'Visual',
            1: 'Auditory', 
            2: 'Read/Write',
            3: 'Kinesthetic'
        }
    
    def retrain_model(self, n_clusters: int = 3) -> dict:
        """
        Complete retraining pipeline.
        
        Returns:
            dict with status, message, and statistics
        """
        try:
            # Step 1: Get combined training data
            combined_df = DataBridge.prepare_training_data()
            
            if combined_df.empty:
                return {
                    'status': 'error',
                    'message': 'No training data available.',
                    'students_updated': 0
                }
            
            # Step 2: Prepare features
            # Fill missing columns with defaults
            for col in self.features:
                if col not in combined_df.columns:
                    combined_df[col] = 0
            
            # Handle any NaN values
            combined_df[self.features] = combined_df[self.features].fillna(0)
            
            X = combined_df[self.features].values
            
            # Step 3: Preprocess with StandardScaler
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            # Step 4: Train KMeans model
            kmeans = KMeans(
                n_clusters=n_clusters, 
                random_state=42, 
                n_init=10,
                max_iter=300
            )
            kmeans.fit(X_scaled)
            
            # Step 5: Save model artifacts
            os.makedirs(self.data_dir, exist_ok=True)
            joblib.dump(kmeans, self.model_path)
            joblib.dump(scaler, self.scaler_path)
            
            # Step 6: Update all user predictions with new model
            students_updated = self._update_all_predictions(kmeans, scaler)
            
            # Calculate statistics
            live_count = len(combined_df[combined_df.get('source') == 'live']) if 'source' in combined_df.columns else 0
            historical_count = len(combined_df) - live_count
            
            return {
                'status': 'success',
                'message': f'Model retrained successfully on {len(combined_df)} samples.',
                'total_samples': len(combined_df),
                'live_samples': live_count,
                'historical_samples': historical_count,
                'students_updated': students_updated,
                'n_clusters': n_clusters,
                'cluster_centers': kmeans.cluster_centers_.tolist()
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Retraining failed: {str(e)}',
                'students_updated': 0
            }
    
    def _update_all_predictions(self, kmeans, scaler) -> int:
        """
        Update learning style predictions for all users using the new model.
        
        Returns:
            Number of students updated
        """
        updated_count = 0
        
        profiles = StudentProfile.objects.select_related('user').all()
        
        for profile in profiles:
            try:
                # Build feature vector for this student
                features = [
                    profile.total_study_hours or 0,
                    profile.attendance or 80,
                    profile.resources_visited_count or 0,
                    1 if profile.extracurricular_activities else 0,
                    5,  # Default motivation
                    profile.internet_usage or 1,
                    profile.exam_score or 50
                ]
                
                # Scale and predict
                features_scaled = scaler.transform([features])
                cluster_id = int(kmeans.predict(features_scaled)[0])
                
                # Map cluster to learning style
                new_style = self.cluster_to_style.get(cluster_id, 'Visual')
                
                # Update user's predicted style
                user = profile.user
                user.predicted_style = cluster_id
                user.current_style_label = new_style
                user.save()
                
                updated_count += 1
                
            except Exception as e:
                # Log error but continue with other users
                print(f"Error updating user {profile.user.username}: {e}")
                continue
        
        return updated_count
    
    def get_model_info(self) -> dict:
        """
        Get information about the current model.
        """
        if not os.path.exists(self.model_path):
            return {'status': 'not_trained', 'message': 'No model found.'}
        
        try:
            kmeans = joblib.load(self.model_path)
            scaler = joblib.load(self.scaler_path)
            
            return {
                'status': 'trained',
                'n_clusters': kmeans.n_clusters,
                'n_features': kmeans.cluster_centers_.shape[1],
                'inertia': kmeans.inertia_,
                'n_iter': kmeans.n_iter_
            }
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
