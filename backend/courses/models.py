from django.db import models
from django.conf import settings


class Course(models.Model):
    class Difficulty(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Beginner'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
        ADVANCED = 'ADVANCED', 'Advanced'
    
    class Category(models.TextChoices):
        PROGRAMMING = 'PROGRAMMING', 'Programming'
        WEB_DEV = 'WEB_DEV', 'Web Development'
        DATA_SCIENCE = 'DATA_SCIENCE', 'Data Science'
        MACHINE_LEARNING = 'MACHINE_LEARNING', 'Machine Learning'
        DESIGN = 'DESIGN', 'Design'
        SECURITY = 'SECURITY', 'Cybersecurity'
        MOBILE = 'MOBILE', 'Mobile Development'
        DEVOPS = 'DEVOPS', 'DevOps'
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    instructor = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='courses_taught')
    
    # New fields for enhanced catalog
    category = models.CharField(max_length=30, choices=Category.choices, default=Category.PROGRAMMING)
    difficulty = models.CharField(max_length=20, choices=Difficulty.choices, default=Difficulty.BEGINNER)
    estimated_hours = models.PositiveIntegerField(default=10, help_text="Estimated hours to complete")
    image_url = models.URLField(blank=True, null=True, help_text="Course thumbnail image URL")
    tags = models.JSONField(default=list, blank=True, help_text="List of tags like ['Python', 'Backend', 'API']")
    is_featured = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
    @property
    def total_lessons(self):
        """Count total content blocks across all modules"""
        return sum(module.content_blocks.count() for module in self.modules.all())
    
    @property
    def enrolled_count(self):
        """Count unique users who have progress in this course"""
        from django.db.models import Count
        return ContentProgress.objects.filter(
            content_block__module__course=self
        ).values('user').distinct().count()

class Module(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

class ContentBlock(models.Model):
    class ContentType(models.TextChoices):
        VIDEO = 'VIDEO', 'Video'
        PDF = 'PDF', 'PDF'
        QUIZ = 'QUIZ', 'Quiz'
        PODCAST = 'PODCAST', 'Podcast'

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    content_type = models.CharField(max_length=20, choices=ContentType.choices)
    file = models.FileField(upload_to='course_content/', blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    
    # Adaptation Tags
    related_styles = models.JSONField(default=list, blank=True) # e.g. ["Visual", "Reflective"]
    
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='content_blocks')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class ContentProgress(models.Model):
    """Tracks user progress on individual content blocks."""
    
    class Status(models.TextChoices):
        STARTED = 'STARTED', 'Started'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='content_progress'
    )
    content_block = models.ForeignKey(
        ContentBlock, 
        on_delete=models.CASCADE, 
        related_name='user_progress'
    )
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.STARTED
    )
    last_timestamp = models.FloatField(default=0.0, help_text="Last position in video/audio (seconds)")
    progress_percent = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    
    started_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'content_block']
        verbose_name_plural = 'Content Progress'
    
    def __str__(self):
        return f"{self.user.username} - {self.content_block.title} ({self.progress_percent}%)"


class UserNote(models.Model):
    """User notes on content blocks, optionally at specific timestamps."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notes'
    )
    content_block = models.ForeignKey(
        ContentBlock, 
        on_delete=models.CASCADE, 
        related_name='notes'
    )
    text = models.TextField()
    timestamp_in_video = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Timestamp in video where note was made (seconds)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Note by {self.user.username} on {self.content_block.title}"


class Comment(models.Model):
    """Comments/discussion on content blocks with nested replies."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='comments'
    )
    content_block = models.ForeignKey(
        ContentBlock, 
        on_delete=models.CASCADE, 
        related_name='comments'
    )
    text = models.TextField()
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='replies'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.content_block.title}"
