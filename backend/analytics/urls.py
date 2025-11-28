from django.urls import path
from .views import LogInteractionView

urlpatterns = [
    path('log/', LogInteractionView.as_view(), name='log_interaction'),
]
