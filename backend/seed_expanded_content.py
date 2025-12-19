"""
Expanded Content Seeder
Creates 8 courses with multiple modules and diverse content blocks.
Uses demo1.mp4 and demo2.mp4 for video content.
"""

import os
import django

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from courses.models import Course, Module, ContentBlock
from users.models import User


def create_expanded_content():
    print("🌱 Seeding Expanded Content with 8 Courses...")
    
    # Clear existing content
    ContentBlock.objects.all().delete()
    Module.objects.all().delete()
    Course.objects.all().delete()
    print("🗑️ Cleared existing courses, modules, and content blocks.")

    # Ensure we have an instructor
    instructor, _ = User.objects.get_or_create(username='admin')

    # =====================================================
    # COURSE 1: Python Mastery: From Zero to Hero
    # =====================================================
    python_course = Course.objects.create(
        title="Python Mastery: From Zero to Hero",
        description="A comprehensive guide to Python programming, covering basics, data structures, OOP, and web development.",
        instructor=instructor,
        category="PROGRAMMING",
        difficulty="BEGINNER",
        estimated_hours=40,
        image_url="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400",
        tags=["Python", "Backend", "Beginner"],
        is_featured=True
    )

    # Module 1: Python Fundamentals
    mod_py_basics = Module.objects.create(course=python_course, title="Python Fundamentals", order=1)
    ContentBlock.objects.create(
        module=mod_py_basics, title="Why Python?", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Introduction to Python's popularity and use cases.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_py_basics, title="Variables & Data Types", content_type="PDF", 
        url="https://docs.python.org/3/tutorial/introduction.html", 
        description="Learn about strings, numbers, lists, and type conversion.",
        related_styles=["Read/Write"]
    )
    ContentBlock.objects.create(
        module=mod_py_basics, title="Basic Syntax Quiz", content_type="QUIZ", 
        description="Test your knowledge of Python syntax, indentation, and comments.",
        related_styles=["Kinesthetic"]
    )
    ContentBlock.objects.create(
        module=mod_py_basics, title="Your First Python Program", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Write and run your first Python script.",
        related_styles=["Visual", "Kinesthetic"]
    )

    # Module 2: Data Structures
    mod_py_ds = Module.objects.create(course=python_course, title="Data Structures", order=2)
    ContentBlock.objects.create(
        module=mod_py_ds, title="Lists and Tuples", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Understanding Python sequences.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_py_ds, title="Dictionaries Explained", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Key-value pairs and dictionary operations.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_py_ds, title="Sets and Frozen Sets", content_type="PDF", 
        description="Advanced set operations and use cases.",
        related_styles=["Read/Write"]
    )
    ContentBlock.objects.create(
        module=mod_py_ds, title="Data Structures Challenge", content_type="QUIZ", 
        description="Practice with lists, dicts, and sets.",
        related_styles=["Kinesthetic"]
    )

    # Module 3: Object-Oriented Programming
    mod_py_oop = Module.objects.create(course=python_course, title="Object-Oriented Programming", order=3)
    ContentBlock.objects.create(
        module=mod_py_oop, title="Classes and Objects", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Introduction to OOP concepts.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_py_oop, title="Inheritance & Polymorphism", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Advanced OOP patterns.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_py_oop, title="OOP Design Patterns", content_type="PDF", 
        description="Common design patterns in Python.",
        related_styles=["Read/Write"]
    )

    # =====================================================
    # COURSE 2: Web Development with Django
    # =====================================================
    django_course = Course.objects.create(
        title="Web Development with Django",
        description="Build robust, scalable web applications using the Django framework.",
        instructor=instructor,
        category="WEB_DEV",
        difficulty="INTERMEDIATE",
        estimated_hours=35,
        image_url="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
        tags=["Python", "Django", "Backend", "API"],
        is_featured=True
    )

    # Module 1: Django Basics
    mod_dj_basics = Module.objects.create(course=django_course, title="Django Fundamentals", order=1)
    ContentBlock.objects.create(
        module=mod_dj_basics, title="What is Django?", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Introduction to Django framework.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_dj_basics, title="MVT Architecture", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Understanding Model-View-Template pattern.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_dj_basics, title="Django Project Structure", content_type="PDF", 
        description="Files and folders in a Django project.",
        related_styles=["Read/Write"]
    )

    # Module 2: Models & Database
    mod_dj_models = Module.objects.create(course=django_course, title="Models & Database", order=2)
    ContentBlock.objects.create(
        module=mod_dj_models, title="Creating Models", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Define your data models.",
        related_styles=["Visual", "Kinesthetic"]
    )
    ContentBlock.objects.create(
        module=mod_dj_models, title="Django ORM Deep Dive", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="QuerySets, filters, and aggregations.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_dj_models, title="Database Migrations", content_type="PDF", 
        description="Managing schema changes.",
        related_styles=["Read/Write"]
    )
    ContentBlock.objects.create(
        module=mod_dj_models, title="ORM Practice Quiz", content_type="QUIZ", 
        description="Test your ORM knowledge.",
        related_styles=["Kinesthetic"]
    )

    # Module 3: Views & Templates
    mod_dj_views = Module.objects.create(course=django_course, title="Views & Templates", order=3)
    ContentBlock.objects.create(
        module=mod_dj_views, title="Function-Based Views", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Creating views with functions.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_dj_views, title="Class-Based Views", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Reusable views with classes.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_dj_views, title="Template Language", content_type="PDF", 
        description="Django template syntax and filters.",
        related_styles=["Read/Write"]
    )

    # Module 4: REST API with DRF
    mod_dj_api = Module.objects.create(course=django_course, title="REST API with DRF", order=4)
    ContentBlock.objects.create(
        module=mod_dj_api, title="Django REST Framework Intro", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Building APIs with DRF.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_dj_api, title="Serializers & ViewSets", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Creating powerful API endpoints.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_dj_api, title="API Authentication", content_type="PDF", 
        description="JWT, Session, and Token authentication.",
        related_styles=["Read/Write"]
    )

    # =====================================================
    # COURSE 3: Machine Learning 101
    # =====================================================
    ml_course = Course.objects.create(
        title="Machine Learning 101",
        description="Introduction to ML concepts, algorithms, and real-world applications.",
        instructor=instructor,
        category="MACHINE_LEARNING",
        difficulty="INTERMEDIATE",
        estimated_hours=30,
        image_url="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
        tags=["Python", "ML", "AI", "Data Science"],
        is_featured=True
    )

    # Module 1: ML Foundations
    mod_ml_intro = Module.objects.create(course=ml_course, title="ML Foundations", order=1)
    ContentBlock.objects.create(
        module=mod_ml_intro, title="What is Machine Learning?", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Understanding ML basics.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_ml_intro, title="ML vs Traditional Programming", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Key differences explained.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_ml_intro, title="Types of Learning", content_type="PDF", 
        description="Supervised, unsupervised, reinforcement learning.",
        related_styles=["Read/Write"]
    )

    # Module 2: Supervised Learning
    mod_ml_supervised = Module.objects.create(course=ml_course, title="Supervised Learning", order=2)
    ContentBlock.objects.create(
        module=mod_ml_supervised, title="Linear Regression", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Predicting continuous values.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_ml_supervised, title="Classification Algorithms", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Logistic regression, decision trees, SVM.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_ml_supervised, title="Model Evaluation", content_type="PDF", 
        description="Accuracy, precision, recall, F1-score.",
        related_styles=["Read/Write"]
    )
    ContentBlock.objects.create(
        module=mod_ml_supervised, title="Supervised Learning Quiz", content_type="QUIZ", 
        description="Test your understanding of supervised algorithms.",
        related_styles=["Kinesthetic"]
    )

    # Module 3: Unsupervised Learning
    mod_ml_unsupervised = Module.objects.create(course=ml_course, title="Unsupervised Learning", order=3)
    ContentBlock.objects.create(
        module=mod_ml_unsupervised, title="Clustering with K-Means", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Grouping data points.",
        related_styles=["Visual", "Kinesthetic"]
    )
    ContentBlock.objects.create(
        module=mod_ml_unsupervised, title="Dimensionality Reduction", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="PCA and t-SNE explained.",
        related_styles=["Visual", "Aural"]
    )

    # =====================================================
    # COURSE 4: UI/UX Design Fundamentals
    # =====================================================
    design_course = Course.objects.create(
        title="UI/UX Design Fundamentals",
        description="Learn the principles of user interface and user experience design.",
        instructor=instructor,
        category="DESIGN",
        difficulty="BEGINNER",
        estimated_hours=20,
        image_url="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
        tags=["Design", "UI", "UX", "Figma"],
        is_featured=False
    )

    # Module 1: Design Principles
    mod_design_principles = Module.objects.create(course=design_course, title="Design Principles", order=1)
    ContentBlock.objects.create(
        module=mod_design_principles, title="Visual Hierarchy", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Guiding user attention.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_design_principles, title="Color Theory", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Psychology of colors in design.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_design_principles, title="Typography Basics", content_type="PDF", 
        description="Choosing and pairing fonts.",
        related_styles=["Read/Write"]
    )
    ContentBlock.objects.create(
        module=mod_design_principles, title="Design Principles Quiz", content_type="QUIZ", 
        description="Test your design knowledge.",
        related_styles=["Kinesthetic"]
    )

    # Module 2: UX Research
    mod_ux_research = Module.objects.create(course=design_course, title="UX Research", order=2)
    ContentBlock.objects.create(
        module=mod_ux_research, title="User Personas", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Creating effective user personas.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_ux_research, title="User Journey Mapping", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Mapping the user experience.",
        related_styles=["Visual", "Kinesthetic"]
    )
    ContentBlock.objects.create(
        module=mod_ux_research, title="Usability Testing", content_type="PDF", 
        description="How to conduct user tests.",
        related_styles=["Read/Write"]
    )

    # Module 3: Prototyping
    mod_prototyping = Module.objects.create(course=design_course, title="Prototyping", order=3)
    ContentBlock.objects.create(
        module=mod_prototyping, title="Wireframing Basics", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Low-fidelity wireframes.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_prototyping, title="Figma Crash Course", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Learn Figma in 20 minutes.",
        related_styles=["Visual", "Kinesthetic"]
    )
    ContentBlock.objects.create(
        module=mod_prototyping, title="Prototyping Challenge", content_type="QUIZ", 
        description="Build an interactive prototype.",
        related_styles=["Kinesthetic"]
    )

    # =====================================================
    # COURSE 5: JavaScript Modern Development
    # =====================================================
    js_course = Course.objects.create(
        title="JavaScript Modern Development",
        description="Master modern JavaScript from ES6+ to React and Node.js.",
        instructor=instructor,
        category="WEB_DEV",
        difficulty="INTERMEDIATE",
        estimated_hours=45,
        image_url="https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400",
        tags=["JavaScript", "React", "Node.js", "Frontend"],
        is_featured=True
    )

    # Module 1: JavaScript Essentials
    mod_js_basics = Module.objects.create(course=js_course, title="JavaScript Essentials", order=1)
    ContentBlock.objects.create(
        module=mod_js_basics, title="JavaScript Overview", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Introduction to modern JavaScript.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_js_basics, title="ES6+ Features", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Arrow functions, destructuring, modules.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_js_basics, title="JavaScript Cheat Sheet", content_type="PDF", 
        description="Quick reference for JS syntax.",
        related_styles=["Read/Write"]
    )
    ContentBlock.objects.create(
        module=mod_js_basics, title="JS Basics Quiz", content_type="QUIZ", 
        description="Test your JavaScript fundamentals.",
        related_styles=["Kinesthetic"]
    )

    # Module 2: Asynchronous JavaScript
    mod_js_async = Module.objects.create(course=js_course, title="Asynchronous JavaScript", order=2)
    ContentBlock.objects.create(
        module=mod_js_async, title="Callbacks & Promises", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Understanding async patterns.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_js_async, title="Async/Await Deep Dive", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Modern async syntax.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_js_async, title="Error Handling", content_type="PDF", 
        description="Try-catch with async code.",
        related_styles=["Read/Write"]
    )

    # Module 3: React Fundamentals
    mod_js_react = Module.objects.create(course=js_course, title="React Fundamentals", order=3)
    ContentBlock.objects.create(
        module=mod_js_react, title="React Components", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Building UI with components.",
        related_styles=["Visual", "Kinesthetic"]
    )
    ContentBlock.objects.create(
        module=mod_js_react, title="State & Props", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Managing component data.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_js_react, title="React Hooks", content_type="PDF", 
        description="useState, useEffect, and custom hooks.",
        related_styles=["Read/Write"]
    )
    ContentBlock.objects.create(
        module=mod_js_react, title="React Quiz", content_type="QUIZ", 
        description="Test your React knowledge.",
        related_styles=["Kinesthetic"]
    )

    # =====================================================
    # COURSE 6: Data Science with Python
    # =====================================================
    ds_course = Course.objects.create(
        title="Data Science with Python",
        description="Learn data analysis, visualization, and statistical modeling with Python.",
        instructor=instructor,
        category="DATA_SCIENCE",
        difficulty="INTERMEDIATE",
        estimated_hours=35,
        image_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
        tags=["Python", "Data Science", "Pandas", "Visualization"],
        is_featured=False
    )

    # Module 1: Data Analysis Basics
    mod_ds_basics = Module.objects.create(course=ds_course, title="Data Analysis Basics", order=1)
    ContentBlock.objects.create(
        module=mod_ds_basics, title="Introduction to Pandas", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="DataFrames and Series.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_ds_basics, title="NumPy Essentials", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Numerical computing with NumPy.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_ds_basics, title="Data Cleaning Guide", content_type="PDF", 
        description="Handling missing values and outliers.",
        related_styles=["Read/Write"]
    )
    ContentBlock.objects.create(
        module=mod_ds_basics, title="Pandas Practice Quiz", content_type="QUIZ", 
        description="Test your data manipulation skills.",
        related_styles=["Kinesthetic"]
    )

    # Module 2: Data Visualization
    mod_ds_viz = Module.objects.create(course=ds_course, title="Data Visualization", order=2)
    ContentBlock.objects.create(
        module=mod_ds_viz, title="Matplotlib Basics", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Creating plots and charts.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_ds_viz, title="Seaborn for Statistics", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Statistical visualizations.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_ds_viz, title="Interactive Plots with Plotly", content_type="PDF", 
        description="Building interactive dashboards.",
        related_styles=["Read/Write"]
    )

    # Module 3: Statistical Analysis
    mod_ds_stats = Module.objects.create(course=ds_course, title="Statistical Analysis", order=3)
    ContentBlock.objects.create(
        module=mod_ds_stats, title="Descriptive Statistics", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Mean, median, mode, variance.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_ds_stats, title="Hypothesis Testing", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="T-tests and p-values.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_ds_stats, title="Statistics Reference", content_type="PDF", 
        description="Statistical formulas cheat sheet.",
        related_styles=["Read/Write"]
    )

    # =====================================================
    # COURSE 7: Cybersecurity Essentials
    # =====================================================
    security_course = Course.objects.create(
        title="Cybersecurity Essentials",
        description="Learn to protect systems, networks, and data from cyber threats.",
        instructor=instructor,
        category="SECURITY",
        difficulty="ADVANCED",
        estimated_hours=40,
        image_url="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400",
        tags=["Security", "Networking", "Ethical Hacking"],
        is_featured=False
    )

    # Module 1: Security Fundamentals
    mod_sec_basics = Module.objects.create(course=security_course, title="Security Fundamentals", order=1)
    ContentBlock.objects.create(
        module=mod_sec_basics, title="Introduction to Cybersecurity", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Understanding the threat landscape.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_sec_basics, title="CIA Triad", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Confidentiality, Integrity, Availability.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_sec_basics, title="Security Policies", content_type="PDF", 
        description="Creating effective security policies.",
        related_styles=["Read/Write"]
    )

    # Module 2: Network Security
    mod_sec_network = Module.objects.create(course=security_course, title="Network Security", order=2)
    ContentBlock.objects.create(
        module=mod_sec_network, title="Firewalls & IDS", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Network defense mechanisms.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_sec_network, title="VPNs and Encryption", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Securing network communications.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_sec_network, title="Network Security Quiz", content_type="QUIZ", 
        description="Test your network security knowledge.",
        related_styles=["Kinesthetic"]
    )

    # Module 3: Ethical Hacking
    mod_sec_hacking = Module.objects.create(course=security_course, title="Ethical Hacking", order=3)
    ContentBlock.objects.create(
        module=mod_sec_hacking, title="Penetration Testing Basics", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Introduction to pen testing.",
        related_styles=["Visual", "Kinesthetic"]
    )
    ContentBlock.objects.create(
        module=mod_sec_hacking, title="Common Vulnerabilities", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="OWASP Top 10 explained.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_sec_hacking, title="Hacking Tools Overview", content_type="PDF", 
        description="Nmap, Burp Suite, Metasploit.",
        related_styles=["Read/Write"]
    )

    # =====================================================
    # COURSE 8: Mobile App Development
    # =====================================================
    mobile_course = Course.objects.create(
        title="Mobile App Development",
        description="Build cross-platform mobile apps with React Native and Flutter.",
        instructor=instructor,
        category="MOBILE",
        difficulty="INTERMEDIATE",
        estimated_hours=50,
        image_url="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400",
        tags=["Mobile", "React Native", "Flutter", "Dart"],
        is_featured=False
    )

    # Module 1: Mobile Development Intro
    mod_mobile_intro = Module.objects.create(course=mobile_course, title="Mobile Development Intro", order=1)
    ContentBlock.objects.create(
        module=mod_mobile_intro, title="Native vs Cross-Platform", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Choosing the right approach.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_mobile_intro, title="Mobile UI/UX Patterns", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Designing for mobile devices.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_mobile_intro, title="Mobile Design Guidelines", content_type="PDF", 
        description="iOS and Android design systems.",
        related_styles=["Read/Write"]
    )

    # Module 2: React Native
    mod_mobile_rn = Module.objects.create(course=mobile_course, title="React Native", order=2)
    ContentBlock.objects.create(
        module=mod_mobile_rn, title="React Native Setup", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Setting up your development environment.",
        related_styles=["Visual", "Kinesthetic"]
    )
    ContentBlock.objects.create(
        module=mod_mobile_rn, title="Building Your First App", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Create a simple mobile app.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_mobile_rn, title="React Native Components", content_type="PDF", 
        description="Core components reference.",
        related_styles=["Read/Write"]
    )
    ContentBlock.objects.create(
        module=mod_mobile_rn, title="React Native Quiz", content_type="QUIZ", 
        description="Test your React Native knowledge.",
        related_styles=["Kinesthetic"]
    )

    # Module 3: Flutter Basics
    mod_mobile_flutter = Module.objects.create(course=mobile_course, title="Flutter Basics", order=3)
    ContentBlock.objects.create(
        module=mod_mobile_flutter, title="Introduction to Flutter", content_type="VIDEO", 
        url="/videos/demo1.mp4", description="Google's UI toolkit.",
        related_styles=["Visual", "Aural"]
    )
    ContentBlock.objects.create(
        module=mod_mobile_flutter, title="Dart Language Basics", content_type="VIDEO", 
        url="/videos/demo2.mp4", description="Programming with Dart.",
        related_styles=["Visual"]
    )
    ContentBlock.objects.create(
        module=mod_mobile_flutter, title="Flutter Widgets", content_type="PDF", 
        description="Building UIs with widgets.",
        related_styles=["Read/Write"]
    )
    ContentBlock.objects.create(
        module=mod_mobile_flutter, title="Flutter Challenge", content_type="QUIZ", 
        description="Build a Flutter widget.",
        related_styles=["Kinesthetic"]
    )

    # =====================================================
    # SUMMARY
    # =====================================================
    total_courses = Course.objects.count()
    total_modules = Module.objects.count()
    total_blocks = ContentBlock.objects.count()
    
    print(f"\n✅ Successfully seeded:")
    print(f"   📚 {total_courses} Courses")
    print(f"   📁 {total_modules} Modules")
    print(f"   📄 {total_blocks} Content Blocks")
    print(f"\n   Videos use: /videos/demo1.mp4 and /videos/demo2.mp4")


if __name__ == '__main__':
    create_expanded_content()
