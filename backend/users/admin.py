from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, StudentProfile

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Adaptive Learning Info', {'fields': ('is_student', 'selected_framework', 'current_style_label')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Adaptive Learning Info', {'fields': ('is_student', 'selected_framework', 'current_style_label')}),
    )
    list_display = UserAdmin.list_display + ('is_student', 'selected_framework', 'current_style_label')

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_study_hours', 'exam_score', 'motivation_level')
    search_fields = ('user__username', 'user__email')
