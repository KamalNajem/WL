import os
import django

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from courses.models import Course, Module, ContentBlock
from users.models import User

def create_rich_content():
    print("🌱 Seeding Rich Content with Local Videos...")
    
    # Clear existing content blocks to update URLs
    ContentBlock.objects.all().delete()
    Module.objects.all().delete()
    Course.objects.all().delete()
    print("🗑️ Cleared existing courses, modules, and content blocks.")

    # Ensure we have an instructor
    instructor, _ = User.objects.get_or_create(username='admin')

    # --- Course 1: Python Mastery ---
    python_course = Course.objects.create(
        title="Python Mastery: From Zero to Hero",
        description="A comprehensive guide to Python programming, covering basics, data structures, and web development.",
        instructor=instructor
    )

    # Module 1: Python Basics
    mod_basics = Module.objects.create(course=python_course, title="Python Fundamentals", order=1)
    
    # Local video files served from frontend/public/videos/
    ContentBlock.objects.create(
        module=mod_basics, 
        title="Why Python?", 
        content_type="VIDEO", 
        url="/videos/demo1.mp4", 
        description="Introduction to Python's popularity.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_basics, 
        title="Variables & Data Types", 
        content_type="PDF", 
        url="https://docs.python.org/3/tutorial/introduction.html", 
        description="Read about strings, numbers, and lists.",
        related_styles=["Read/Write"]
    )
    ContentBlock.objects.create(
        module=mod_basics, 
        title="Basic Syntax Quiz", 
        content_type="QUIZ", 
        description="Test your knowledge of indentation and comments.",
        related_styles=["Kinesthetic"]
    )

    # Module 2: Data Structures
    mod_ds = Module.objects.create(course=python_course, title="Data Structures", order=2)
    
    ContentBlock.objects.create(
        module=mod_ds, 
        title="Lists and Dictionaries Visualized", 
        content_type="VIDEO", 
        url="/videos/demo2.mp4",
        description="Learn about Python lists and dictionaries.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_ds, 
        title="Deep Dive into Sets", 
        content_type="PDF", 
        description="Advanced set operations.",
        related_styles=["Read/Write"]
    )

    # --- Course 2: Web Development with Django ---
    django_course = Course.objects.create(
        title="Web Development with Django",
        description="Build robust web applications using the Django framework.",
        instructor=instructor
    )

    # Module 1: MVC Architecture
    mod_mvc = Module.objects.create(course=django_course, title="Understanding MVC/MVT", order=1)
    
    ContentBlock.objects.create(
        module=mod_mvc, 
        title="MVT Diagram Explanation", 
        content_type="VIDEO", 
        url="/videos/demo1.mp4",
        description="Quick overview of Django's MVT pattern.",
        related_styles=["Visual"]
    )

    # Module 2: Models & ORM
    mod_orm = Module.objects.create(course=django_course, title="Models & ORM", order=2)
    
    ContentBlock.objects.create(
        module=mod_orm, 
        title="Database Design Workshop", 
        content_type="QUIZ", 
        description="Practice creating models.",
        related_styles=["Kinesthetic"]
    )

    # --- Course 3: Machine Learning 101 ---
    ml_course = Course.objects.create(
        title="Machine Learning 101",
        description="Introduction to ML concepts, algorithms, and real-world applications.",
        instructor=instructor
    )

    mod_ml_intro = Module.objects.create(course=ml_course, title="What is ML?", order=1)
    ContentBlock.objects.create(
        module=mod_ml_intro, 
        title="ML vs Traditional Programming", 
        content_type="VIDEO", 
        url="/videos/demo2.mp4",
        description="Understanding the difference between ML and traditional programming.",
        related_styles=["Visual", "Aural"]
    )

    # --- Course 4: UI/UX Design Fundamentals ---
    design_course = Course.objects.create(
        title="UI/UX Design Fundamentals",
        description="Learn the principles of user interface and user experience design.",
        instructor=instructor
    )
    
    mod_design_principles = Module.objects.create(course=design_course, title="Design Principles", order=1)
    ContentBlock.objects.create(
        module=mod_design_principles,
        title="Color Theory",
        content_type="PDF", 
        description="Understanding color psychology.", 
        related_styles=["Visual", "Read/Write"]
    )
    ContentBlock.objects.create(
        module=mod_design_principles,
        title="Typography Basics",
        content_type="VIDEO", 
        url="/videos/demo1.mp4",
        description="Learn the fundamentals of typography.",
        related_styles=["Visual"]
    )

    mod_prototyping = Module.objects.create(course=design_course, title="Prototyping", order=2)
    ContentBlock.objects.create(
        module=mod_prototyping,
        title="Figma Crash Course",
        content_type="VIDEO", 
        url="/videos/demo2.mp4",
        description="Learn Figma basics in this crash course.",
        related_styles=["Visual", "Kinesthetic"]
    )
    ContentBlock.objects.create(
        module=mod_prototyping,
        title="Build a Wireframe",
        content_type="QUIZ", 
        description="Interactive wireframing challenge.", 
        related_styles=["Kinesthetic"]
    )

    print("✅ Successfully seeded 4 Courses with LOCAL video URLs (/videos/demo1.mp4, /videos/demo2.mp4).")

if __name__ == '__main__':
    create_rich_content()
