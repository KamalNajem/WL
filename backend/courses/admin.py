from django.contrib import admin
from .models import Course, Module, ContentBlock

class ContentBlockInline(admin.StackedInline):
    model = ContentBlock
    extra = 1

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    inlines = [ContentBlockInline]
    search_fields = ('title', 'description')

class ModuleInline(admin.StackedInline):
    model = Module
    extra = 1

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'created_at')
    inlines = [ModuleInline]
    search_fields = ('title', 'description')

@admin.register(ContentBlock)
class ContentBlockAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'content_type', 'get_related_styles', 'created_at')
    list_filter = ('content_type', 'module__course')
    search_fields = ('title', 'description')

    def get_related_styles(self, obj):
        return ", ".join(obj.related_styles) if obj.related_styles else "-"
    get_related_styles.short_description = 'Related Styles'
