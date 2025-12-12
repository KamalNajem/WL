from django.urls import path
from .views import PredictStyleView, SubmitQuizView, ResetStyleView, RetrainModelView

urlpatterns = [
    path('predict/', PredictStyleView.as_view(), name='predict-style'),
    path('submit-quiz/', SubmitQuizView.as_view(), name='submit-quiz'),
    path('reset-style/', ResetStyleView.as_view(), name='reset-style'),
    path('retrain/', RetrainModelView.as_view(), name='retrain-model'),
]
