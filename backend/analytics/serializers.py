from rest_framework import serializers
from .models import InteractionLog

class InteractionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = InteractionLog
        fields = ['id', 'user', 'content_block', 'interaction_type', 'time_spent_seconds', 'timestamp']
        read_only_fields = ['user', 'timestamp']
