from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, StudentProfileViewSet

router = DefaultRouter()
router.register(r'profiles', StudentProfileViewSet, basename='studentprofile')
router.register(r'', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
