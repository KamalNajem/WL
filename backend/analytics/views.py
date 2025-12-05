from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.db.models import Count, Avg, Sum
from .models import InteractionLog
from .serializers import InteractionLogSerializer
from .gamification import GamificationEngine
from users.models import User, StudentProfile
from courses.models import Course, ContentBlock


class LogInteractionView(generics.CreateAPIView):
    queryset = InteractionLog.objects.all()
    serializer_class = InteractionLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Gamification Logic
        response_data = {
            "status": "logged",
            "data": serializer.data,
            "gamification": {}
        }
        
        interaction_type = request.data.get('interaction_type')
        
        if interaction_type == 'complete':
            # Award points for completion
            points_result = GamificationEngine.award_points(request.user, 50)
            
            # Check for new badges
            new_badges = GamificationEngine.check_badges(request.user)
            
            response_data["gamification"] = {
                "points_added": points_result["points_added"],
                "level_up": points_result["level_up"],
                "new_level": points_result.get("current_level"),
                "new_badges": new_badges
            }
            
        headers = self.get_success_headers(serializer.data)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)


class InstructorAnalyticsView(APIView):
    """
    Instructor dashboard analytics endpoint.
    Returns learning style distribution, course popularity, and engagement metrics.
    """
    # Open for demo purposes; restrict with permissions.IsAdminUser for production
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # 1. Learning Style Distribution
        style_counts = (
            User.objects
            .filter(is_student=True, current_style_label__isnull=False)
            .exclude(current_style_label='')
            .values('current_style_label')
            .annotate(count=Count('id'))
        )
        learning_style_distribution = {
            item['current_style_label']: item['count'] 
            for item in style_counts
        }

        # 2. Course Popularity (completions per course)
        course_completions = (
            InteractionLog.objects
            .filter(interaction_type='complete')
            .values('content_block__module__course__title')
            .annotate(completions=Count('id'))
        )
        course_popularity = [
            {
                'course': item['content_block__module__course__title'] or 'Unknown',
                'completions': item['completions']
            }
            for item in course_completions
        ]

        # 3. Average Engagement per Content Type
        engagement_by_type = (
            InteractionLog.objects
            .values('content_block__content_type')
            .annotate(
                avg_time=Avg('time_spent_seconds'),
                total_interactions=Count('id')
            )
        )
        average_engagement = [
            {
                'content_type': item['content_block__content_type'] or 'Unknown',
                'avg_time_seconds': round(item['avg_time'] or 0, 2),
                'total_interactions': item['total_interactions']
            }
            for item in engagement_by_type
        ]

        # 4. At-Risk Students (low engagement or low scores)
        at_risk_students = []
        profiles = StudentProfile.objects.select_related('user').all()
        for profile in profiles:
            # Consider at-risk if total study < 2 hours OR exam_score < 50
            if profile.total_study_hours < 2 or profile.exam_score < 50:
                at_risk_students.append({
                    'username': profile.user.username,
                    'email': profile.user.email,
                    'study_hours': round(profile.total_study_hours, 2),
                    'exam_score': round(profile.exam_score, 2),
                    'level': profile.current_level,
                })

        # 5. Study Hours vs Exam Scores (for scatter/bar chart)
        engagement_vs_performance = []
        for profile in profiles:
            engagement_vs_performance.append({
                'username': profile.user.username,
                'study_hours': round(profile.total_study_hours, 2),
                'exam_score': round(profile.exam_score, 2),
            })

        return Response({
            'learning_style_distribution': learning_style_distribution,
            'course_popularity': course_popularity,
            'average_engagement': average_engagement,
            'at_risk_students': at_risk_students,
            'engagement_vs_performance': engagement_vs_performance,
        })

