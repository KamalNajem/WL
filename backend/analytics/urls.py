from django.urls import path
from .views import LogInteractionView, InstructorAnalyticsView, GamificationStatusView

urlpatterns = [
    path('log/', LogInteractionView.as_view(), name='log_interaction'),
    path('instructor/', InstructorAnalyticsView.as_view(), name='instructor_analytics'),
    path('status/', GamificationStatusView.as_view(), name='gamification_status'),
]
