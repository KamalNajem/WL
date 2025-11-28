import os
import django
import random

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from courses.models import Course, Module, ContentBlock
from users.models import User

def create_rich_content():
    print("🌱 Seeding Rich Content...")
    
    # Optional: Clear existing courses to avoid duplicates if running multiple times
    # Course.objects.all().delete() 

    # Ensure we have an instructor
    instructor, _ = User.objects.get_or_create(username='admin')

    # --- Course 1: Python Mastery ---
    python_course, _ = Course.objects.get_or_create(
        title="Python Mastery: From Zero to Hero",
        defaults={
            "description": "A comprehensive guide to Python programming, covering basics, data structures, and web development.",
            "instructor": instructor
        }
    )

    # Module 1: Python Basics
    mod_basics, _ = Module.objects.get_or_create(course=python_course, title="Python Fundamentals", order=1)
    
    ContentBlock.objects.get_or_create(
        module=mod_basics, 
        title="Why Python?", 
        defaults={
            "content_type": "VIDEO", 
            "url": "https://www.youtube.com/embed/Y8Tko2YC5hA", 
            "description": "Introduction to Python's popularity.",
            "related_styles": ["Visual", "Aural"]
        }
    )
    ContentBlock.objects.get_or_create(
        module=mod_basics, 
        title="Variables & Data Types", 
        defaults={
            "content_type": "PDF", 
            "url": "https://docs.python.org/3/tutorial/introduction.html", 
            "description": "Read about strings, numbers, and lists.",
            "related_styles": ["Read/Write"]
        }
    )
    ContentBlock.objects.get_or_create(
        module=mod_basics, 
        title="Basic Syntax Quiz", 
        defaults={
            "content_type": "QUIZ", 
            "description": "Test your knowledge of indentation and comments.",
            "related_styles": ["Kinesthetic"]
        }
    )

    # Module 2: Data Structures
    mod_ds, _ = Module.objects.get_or_create(course=python_course, title="Data Structures", order=2)
    
    ContentBlock.objects.get_or_create(
        module=mod_ds, 
        title="Lists and Dictionaries Visualized", 
        defaults={
            "content_type": "VIDEO", 
            "url": "https://www.youtube.com/embed/kQDxmjfkIKY", 
            "related_styles": ["Visual"]
        }
    )
    ContentBlock.objects.get_or_create(
        module=mod_ds, 
        title="Deep Dive into Sets", 
        defaults={
            "content_type": "PDF", 
            "description": "Advanced set operations.",
            "related_styles": ["Read/Write"]
        }
    )

    # --- Course 2: Web Development with Django ---
    django_course, _ = Course.objects.get_or_create(
        title="Web Development with Django",
        defaults={
            "description": "Build robust web applications using the Django framework.",
            "instructor": instructor
        }
    )

    # Module 1: MVC Architecture
    mod_mvc, _ = Module.objects.get_or_create(course=django_course, title="Understanding MVC/MVT", order=1)
    
    ContentBlock.objects.get_or_create(
        module=mod_mvc, 
        title="MVT Diagram Explanation", 
        defaults={
            "content_type": "VIDEO", 
            "url": "https://www.youtube.com/embed/F5mRW0jo-U4", 
            "related_styles": ["Visual"]
        }
    )

    # Module 2: Models & ORM
    mod_orm, _ = Module.objects.get_or_create(course=django_course, title="Models & ORM", order=2)
    
    ContentBlock.objects.get_or_create(
        module=mod_orm, 
        title="Database Design Workshop", 
        defaults={
            "content_type": "QUIZ", 
            "description": "Practice creating models.",
            "related_styles": ["Kinesthetic"]
        }
    )

    # --- Course 3: Machine Learning 101 ---
    ml_course, _ = Course.objects.get_or_create(
        title="Machine Learning 101",
        defaults={
            "description": "Introduction to ML concepts, algorithms, and real-world applications.",
            "instructor": instructor
        }
    )

    mod_ml_intro, _ = Module.objects.get_or_create(course=ml_course, title="What is ML?", order=1)
    ContentBlock.objects.get_or_create(
        module=mod_ml_intro, 
        title="ML vs Traditional Programming", 
        defaults={"content_type": "VIDEO", "url": "https://www.youtube.com/embed/HcqpanDadyQ", "related_styles": ["Visual", "Aural"]}
    )

    # --- Course 4: UI/UX Design Fundamentals ---
    design_course, _ = Course.objects.get_or_create(
        title="UI/UX Design Fundamentals",
        defaults={
            "description": "Learn the principles of user interface and user experience design.",
            "instructor": instructor
        }
    )
    
    mod_design_principles, _ = Module.objects.get_or_create(course=design_course, title="Design Principles", order=1)
    ContentBlock.objects.get_or_create(
        module=mod_design_principles,
        title="Color Theory",
        defaults={"content_type": "PDF", "description": "Understanding color psychology.", "related_styles": ["Visual", "Read/Write"]}
    )
    ContentBlock.objects.get_or_create(
        module=mod_design_principles,
        title="Typography Basics",
        defaults={"content_type": "VIDEO", "url": "https://www.youtube.com/embed/sByzHoiYUD0", "related_styles": ["Visual"]}
    )

    mod_prototyping, _ = Module.objects.get_or_create(course=design_course, title="Prototyping", order=2)
    ContentBlock.objects.get_or_create(
        module=mod_prototyping,
        title="Figma Crash Course",
        defaults={"content_type": "VIDEO", "url": "https://www.youtube.com/embed/FTFbQOnq-a0", "related_styles": ["Visual", "Kinesthetic"]}
    )
    ContentBlock.objects.get_or_create(
        module=mod_prototyping,
        title="Build a Wireframe",
        defaults={"content_type": "QUIZ", "description": "Interactive wireframing challenge.", "related_styles": ["Kinesthetic"]}
    )

    print("✅ Successfully seeded 4 Courses, 9 Modules, and 12 Content Blocks.")

if __name__ == '__main__':
    create_rich_content()
