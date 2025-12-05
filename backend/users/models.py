from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Framework(models.TextChoices):
        VARK = 'VARK', _('VARK')
        FSLSM = 'FSLSM', _('FSLSM')

    is_student = models.BooleanField(default=False)
    selected_framework = models.CharField(
        max_length=10,
        choices=Framework.choices,
        default=Framework.VARK,
        blank=True,
        null=True
    )
    current_style_label = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.username

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    
    # Scoring Fields
    vark_scores = models.JSONField(default=dict, blank=True)
    fslsm_scores = models.JSONField(default=dict, blank=True)
    
    # Behavioral Metrics
    total_study_hours = models.FloatField(default=0.0)
    video_watch_duration = models.FloatField(default=0.0)
    text_reading_duration = models.FloatField(default=0.0)
    quiz_attempts = models.IntegerField(default=0)
    
    # Dataset Metrics (matching merged_dataset.csv for retraining)
    attendance = models.FloatField(default=0.0)
    resources_visited = models.IntegerField(default=0)
    resources_visited_count = models.IntegerField(default=0)  # Alias for ML pipeline
    extracurricular_activities = models.BooleanField(default=False)
    motivation_level = models.CharField(max_length=50, blank=True, null=True)
    internet_usage = models.FloatField(default=0.0)
    exam_score = models.FloatField(default=0.0)
    average_quiz_score = models.FloatField(default=0.0)  # For ML pipeline

    # Gamification Fields
    gamification_points = models.IntegerField(default=0)
    current_level = models.IntegerField(default=1)
    badges_earned = models.JSONField(default=list, blank=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
