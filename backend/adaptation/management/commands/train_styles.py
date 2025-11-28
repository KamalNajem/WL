from django.core.management.base import BaseCommand
from adaptation.services import LearningStyleClusterer

class Command(BaseCommand):
    help = 'Trains the K-Means clustering model for learning style prediction'

    def handle(self, *args, **options):
        self.stdout.write("Starting model training...")
        try:
            clusterer = LearningStyleClusterer()
            result = clusterer.train_model()
            self.stdout.write(self.style.SUCCESS(result))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error training model: {str(e)}"))
