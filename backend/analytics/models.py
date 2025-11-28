from django.db import models
from django.conf import settings
from courses.models import ContentBlock

class InteractionLog(models.Model):
    INTERACTION_TYPES = [
        ('view', 'View'),
        ('complete', 'Complete'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='interaction_logs')
    content_block = models.ForeignKey(ContentBlock, on_delete=models.CASCADE, related_name='interactions')
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    time_spent_seconds = models.FloatField(default=0.0)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.content_block.title} ({self.interaction_type})"

