from rest_framework import serializers
from .models import User, StudentProfile

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            'vark_scores', 'fslsm_scores', 
            'total_study_hours', 'video_watch_duration', 'text_reading_duration', 'quiz_attempts',
            'attendance', 'resources_visited', 'extracurricular_activities', 'motivation_level', 'internet_usage', 'exam_score'
        ]

class UserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_student', 'selected_framework', 'current_style_label', 'student_profile']
