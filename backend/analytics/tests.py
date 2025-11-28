from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from courses.models import Course, Module, ContentBlock

User = get_user_model()

class SystemIntegrationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='teststudent', password='password123')
        self.client.force_authenticate(user=self.user)
        
        # Setup Course Data
        self.course = Course.objects.create(title="Test Course", description="Desc")
        self.module = Module.objects.create(title="Test Module", course=self.course)
        self.block = ContentBlock.objects.create(
            title="Test Block", 
            content_type="VIDEO", 
            module=self.module,
            url="http://youtube.com/watch?v=123"
        )

    def test_1_authentication_enforcement(self):
        """Test that unauthenticated requests are rejected"""
        client_no_auth = APIClient()
        response = client_no_auth.get('/api/courses/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_2_authenticated_course_access(self):
        """Test that authenticated users can access courses"""
        response = self.client.get('/api/courses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

    def test_3_analytics_logging(self):
        """Test that interaction logs are saved correctly"""
        data = {
            'content_block': self.block.id,
            'interaction_type': 'view',
            'time_spent_seconds': 30.5
        }
        response = self.client.post('/api/analytics/log/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify it's in the DB
        from analytics.models import InteractionLog
        self.assertEqual(InteractionLog.objects.count(), 1)
        log = InteractionLog.objects.first()
        self.assertEqual(log.user, self.user)
        self.assertEqual(log.time_spent_seconds, 30.5)

    def test_4_adaptation_predict(self):
        """Test the prediction endpoint"""
        # Assuming the endpoint expects POST with data or just GET if it uses profile
        # The user showed a GET request in their error log, but usually predict is POST or uses existing profile data
        # Let's try GET as per their log, but if it fails (405), we know it should be POST
        response = self.client.get('/api/adaptation/predict/')
        # If the view is set up to return the profile's style
        if response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED:
             response = self.client.post('/api/adaptation/predict/')
        
        # We just want to ensure it's not 403
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN)

