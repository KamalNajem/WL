from django.contrib import admin
from .models import InteractionLog

@admin.register(InteractionLog)
class InteractionLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_block', 'interaction_type', 'time_spent_seconds', 'timestamp')
    list_filter = ('interaction_type', 'timestamp')
    search_fields = ('user__username', 'content_block__title')

