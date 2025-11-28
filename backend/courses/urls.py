from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, ContentBlockViewSet

router = DefaultRouter()
router.register(r'content-blocks', ContentBlockViewSet)
router.register(r'', CourseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
