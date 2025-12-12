from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
import traceback
from .services import LearningStyleClusterer, calculate_vark_score
from .engine import ModelRetrainer

class SubmitQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        answers = request.data.get('answers')
        if not answers:
            return Response({"error": "No answers provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            dominant_style, scores = calculate_vark_score(answers)
            
            user = request.user
            user.current_style_label = dominant_style
            user.save()
            
            # Update profile scores if needed
            if hasattr(user, 'student_profile'):
                user.student_profile.vark_scores = scores
                user.student_profile.save()
            
            return Response({
                "style": dominant_style,
                "scores": scores,
                "message": f"Your learning style is {dominant_style}!"
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResetStyleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            user.current_style_label = None
            user.save()
            
            if hasattr(user, 'student_profile'):
                user.student_profile.vark_scores = {}
                user.student_profile.save()
                
            return Response({"message": "Learning style reset successfully."})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PredictStyleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if not hasattr(user, 'student_profile'):
            return Response({"error": "User has no student profile"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            clusterer = LearningStyleClusterer()
            cluster_id = clusterer.predict_style(user.student_profile)
            
            # Update user profile
            # Assuming we map cluster IDs to labels. For now, just storing the ID or a generic label.
            # You might want to define a mapping: 0 -> "Visual", 1 -> "Auditory", etc. based on cluster analysis.
            # For this phase, we just save the cluster ID as the label.
            
            style_label = f"Cluster {cluster_id}"
            user.current_style_label = style_label
            user.save()
            
            return Response({
                "cluster_id": cluster_id,
                "style_label": style_label,
                "message": "Learning style updated successfully based on behavior."
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RetrainModelView(APIView):
    """
    API endpoint to trigger ML model retraining.
    
    POST /api/adaptation/retrain/
    
    Combines historical training data with live platform data,
    retrains the KMeans clustering model, and updates all user predictions.
    """
    permission_classes = [IsAuthenticated]  # Could be IsAdminUser for production

    def post(self, request):
        try:
            print("🔄 RetrainModelView.post() called")
            
            # Get optional parameters
            n_clusters = request.data.get('n_clusters', 3)
            
            # Initialize retrainer and run
            retrainer = ModelRetrainer()
            print(f"🔄 Starting retraining with n_clusters={n_clusters}")
            result = retrainer.retrain_model(n_clusters=n_clusters)
            print(f"🔄 Retraining result: {result}")
            
            if result['status'] == 'success':
                return Response({
                    'status': 'success',
                    'message': result['message'],
                    'details': {
                        'total_samples': result.get('total_samples', 0),
                        'live_samples': result.get('live_samples', 0),
                        'historical_samples': result.get('historical_samples', 0),
                        'students_updated': result.get('students_updated', 0),
                        'n_clusters': result.get('n_clusters', 3)
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'status': 'error',
                    'message': result['message']
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            error_traceback = traceback.format_exc()
            print(f"❌ Retraining EXCEPTION: {str(e)}")
            print(f"❌ Traceback:\n{error_traceback}")
            return Response({
                'status': 'error',
                'message': f'Retraining failed: {str(e)}',
                'traceback': error_traceback
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        """Get current model information."""
        try:
            retrainer = ModelRetrainer()
            info = retrainer.get_model_info()
            return Response(info, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
