from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, ContentBlockViewSet, UpdateProgressView,
    UserNoteViewSet, CommentViewSet
)

router = DefaultRouter()
router.register(r'content-blocks', ContentBlockViewSet)
router.register(r'notes', UserNoteViewSet, basename='notes')
router.register(r'comments', CommentViewSet, basename='comments')
router.register(r'', CourseViewSet)

urlpatterns = [
    path('progress/', UpdateProgressView.as_view(), name='update_progress'),
    path('', include(router.urls)),
]
