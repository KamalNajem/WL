from django.urls import path
from .views import PredictStyleView, SubmitQuizView, ResetStyleView

urlpatterns = [
    path('predict/', PredictStyleView.as_view(), name='predict-style'),
    path('submit-quiz/', SubmitQuizView.as_view(), name='submit-quiz'),
    path('reset-style/', ResetStyleView.as_view(), name='reset-style'),
]
