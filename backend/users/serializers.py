from rest_framework import serializers
from .models import User, StudentProfile

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            'vark_scores', 'fslsm_scores', 
            'total_study_hours', 'video_watch_duration', 'text_reading_duration', 'quiz_attempts',
            'attendance', 'resources_visited', 'extracurricular_activities', 'motivation_level', 'internet_usage', 'exam_score',
            'gamification_points', 'current_level', 'badges_earned'
        ]

class UserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(read_only=True)
    
    # Flattened fields for convenience if needed, or just rely on student_profile
    gamification_points = serializers.IntegerField(source='student_profile.gamification_points', read_only=True)
    current_level = serializers.IntegerField(source='student_profile.current_level', read_only=True)
    badges_earned = serializers.JSONField(source='student_profile.badges_earned', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_student', 'selected_framework', 'current_style_label', 'student_profile', 'gamification_points', 'current_level', 'badges_earned', 'date_joined']
