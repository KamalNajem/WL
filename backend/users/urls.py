from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, 
    StudentProfileViewSet, 
    LoginView, 
    LogoutView, 
    RegisterView, 
    MeView,
    get_csrf_token
)

router = DefaultRouter()
router.register(r'profiles', StudentProfileViewSet, basename='studentprofile')
router.register(r'', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

# Auth URLs - will be included at /api/auth/
auth_urlpatterns = [
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('csrf/', get_csrf_token, name='auth-csrf'),
]
