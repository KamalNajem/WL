import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def reset_courses():
    with connection.cursor() as cursor:
        # 1. Clear migration history for courses
        cursor.execute("DELETE FROM django_migrations WHERE app = 'courses';")
        print("Deleted migration history for 'courses'.")

        # 2. Drop tables
        # Order matters due to foreign keys: ContentBlock -> Module -> Course
        tables = ['courses_contentblock', 'courses_module', 'courses_course']
        for table in tables:
            try:
                cursor.execute(f"DROP TABLE IF EXISTS {table} CASCADE;")
                print(f"Dropped table {table}.")
            except Exception as e:
                print(f"Error dropping {table}: {e}")

if __name__ == '__main__':
    reset_courses()
