from django.db import models

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    instructor = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='courses_taught')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

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
