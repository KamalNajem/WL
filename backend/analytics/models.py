from django.db import models
from django.conf import settings
from courses.models import ContentBlock

class InteractionLog(models.Model):
    INTERACTION_TYPES = [
        ('view', 'View'),
        ('complete', 'Complete'),
        ('heartbeat', 'Heartbeat'),  # For progress tracking
        ('pause', 'Pause'),
        ('resume', 'Resume'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='interaction_logs')
    content_block = models.ForeignKey(ContentBlock, on_delete=models.CASCADE, related_name='interactions')
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    time_spent_seconds = models.FloatField(default=0.0)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Additional tracking data
    video_timestamp = models.FloatField(default=0.0, help_text="Position in video when interaction occurred")
    metadata = models.JSONField(default=dict, blank=True, help_text="Additional context data")

    def __str__(self):
        return f"{self.user.username} - {self.content_block.title} ({self.interaction_type})"


class QuizAttempt(models.Model):
    """Track individual quiz attempts for scoring analytics."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='quiz_attempts'
    )
    content_block = models.ForeignKey(
        ContentBlock, 
        on_delete=models.CASCADE, 
        related_name='quiz_attempts'
    )
    score = models.FloatField(default=0.0)
    max_score = models.FloatField(default=100.0)
    percentage = models.FloatField(default=0.0)
    time_taken_seconds = models.FloatField(default=0.0)
    answers = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if self.max_score > 0:
            self.percentage = (self.score / self.max_score) * 100
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.username} - {self.content_block.title} ({self.percentage:.1f}%)"

