import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from courses.models import Course, Module, ContentBlock
from users.models import StudentProfile

User = get_user_model()

def seed():
    # Create Admin User if not exists
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser('admin', 'admin@example.com', 'admin')
        print("Superuser 'admin' created.")
    else:
        admin = User.objects.get(username='admin')
        print("Superuser 'admin' already exists.")

    # Create a Student User
    student, created = User.objects.get_or_create(username='student1', email='student1@example.com')
    if created:
        student.set_password('password123')
        student.is_student = True
        student.save()
        # Profile is created via signal usually, but we haven't set up signals yet.
        # Let's check if profile exists or create it manually for now.
        if not hasattr(student, 'student_profile'):
            StudentProfile.objects.create(user=student)
        print("Student 'student1' created.")
    else:
        print("Student 'student1' already exists.")

    # Create Content
    course, created = Course.objects.get_or_create(
        title="Python Basics",
        defaults={'description': "Learn the fundamentals of Python.", 'instructor': admin}
    )
    
    module, created = Module.objects.get_or_create(
        title="Intro to Variables",
        course=course,
        defaults={'order': 1}
    )
    
    content, created = ContentBlock.objects.get_or_create(
        title="Variables Video",
        module=module,
        defaults={
            'content_type': 'VIDEO',
            'url': 'https://www.youtube.com/watch?v=xyz',
            'related_styles': ["Visual"]
        }
    )
    
    print("Sample Course, Module, and ContentBlock created.")

if __name__ == '__main__':
    seed()
