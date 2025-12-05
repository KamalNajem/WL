from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import Course, ContentBlock, ContentProgress, UserNote, Comment
from .serializers import (
    CourseSerializer, ContentBlockSerializer, ContentProgressSerializer,
    UserNoteSerializer, CommentSerializer
)
from analytics.gamification import GamificationEngine


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Get user's progress for all content blocks in this course
        user_progress = {}
        content_ids = []
        for module in data['modules']:
            for block in module['content_blocks']:
                content_ids.append(block['id'])
        
        progress_qs = ContentProgress.objects.filter(
            user=request.user,
            content_block_id__in=content_ids
        )
        for progress in progress_qs:
            user_progress[progress.content_block_id] = {
                'status': progress.status,
                'last_timestamp': progress.last_timestamp,
                'progress_percent': progress.progress_percent,
                'is_completed': progress.is_completed,
            }
        
        # Adaptive Sorting Logic
        user_style = getattr(request.user, 'current_style_label', None)
        preferences = {
            'Visual': ['VIDEO', 'Visual'],
            'Auditory': ['PODCAST', 'Auditory'],
            'Read/Write': ['PDF', 'Text'],
            'Kinesthetic': ['QUIZ', 'Kinesthetic'],
            'Cluster 0': ['VIDEO', 'Visual'], 
            'Cluster 1': ['PDF', 'Text'],
            'Cluster 2': ['QUIZ', 'Kinesthetic']
        }
        
        preferred_tags = []
        if user_style:
            for key, tags in preferences.items():
                if key in user_style:
                    preferred_tags = tags
                    break
        
        # Process each module
        for module in data['modules']:
            blocks = module['content_blocks']
            
            def sort_key(block):
                score = 0
                if block['content_type'] in preferred_tags:
                    score += 2
                if any(tag in block.get('related_styles', []) for tag in preferred_tags):
                    score += 1
                return score
            
            # Sort and annotate blocks
            if preferred_tags:
                blocks.sort(key=sort_key, reverse=True)
            
            for block in blocks:
                block['is_recommended'] = sort_key(block) > 0 if preferred_tags else False
                block['user_progress'] = user_progress.get(block['id'], None)

        return Response(data)


class ContentBlockViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ContentBlock.objects.all()
    serializer_class = ContentBlockSerializer
    permission_classes = [permissions.IsAuthenticated]


class UpdateProgressView(APIView):
    """
    Update user progress on a content block.
    Handles video timestamps, progress percentage, and completion logic.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        content_id = request.data.get('content_id')
        timestamp = request.data.get('timestamp', 0)
        percent = request.data.get('percent', 0)
        
        if not content_id:
            return Response(
                {'error': 'content_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        content_block = get_object_or_404(ContentBlock, id=content_id)
        
        # Get or create progress record
        progress, created = ContentProgress.objects.get_or_create(
            user=request.user,
            content_block=content_block,
            defaults={
                'status': ContentProgress.Status.STARTED,
                'last_timestamp': timestamp,
                'progress_percent': percent,
            }
        )
        
        # Update progress
        progress.last_timestamp = timestamp
        progress.progress_percent = percent
        
        if percent > 0:
            progress.status = ContentProgress.Status.IN_PROGRESS
        
        response_data = {
            'status': 'updated',
            'progress_percent': percent,
            'last_timestamp': timestamp,
            'gamification': None
        }
        
        # Check for completion (>90% and not already completed)
        if percent >= 90 and not progress.is_completed:
            progress.status = ContentProgress.Status.COMPLETED
            progress.is_completed = True
            progress.completed_at = timezone.now()
            
            # Trigger gamification
            points_result = GamificationEngine.award_points(request.user, 50)
            new_badges = GamificationEngine.check_badges(request.user)
            
            response_data['gamification'] = {
                'points_added': points_result['points_added'],
                'new_points': points_result['current_points'],
                'level_up': points_result['level_up'],
                'new_level': points_result.get('current_level'),
                'new_badges': new_badges
            }
        
        progress.save()
        
        return Response(response_data)
    
    def get(self, request):
        """Get progress for a specific content block."""
        content_id = request.query_params.get('content_id')
        
        if not content_id:
            return Response(
                {'error': 'content_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            progress = ContentProgress.objects.get(
                user=request.user,
                content_block_id=content_id
            )
            return Response({
                'last_timestamp': progress.last_timestamp,
                'progress_percent': progress.progress_percent,
                'status': progress.status,
                'is_completed': progress.is_completed,
            })
        except ContentProgress.DoesNotExist:
            return Response({
                'last_timestamp': 0,
                'progress_percent': 0,
                'status': 'NOT_STARTED',
                'is_completed': False,
            })


class UserNoteViewSet(viewsets.ModelViewSet):
    """CRUD for user notes on content."""
    serializer_class = UserNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = UserNote.objects.filter(user=self.request.user)
        content_id = self.request.query_params.get('content_id')
        if content_id:
            queryset = queryset.filter(content_block_id=content_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CommentViewSet(viewsets.ModelViewSet):
    """CRUD for comments/discussion on content."""
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Comment.objects.filter(parent__isnull=True)  # Top-level only
        content_id = self.request.query_params.get('content_id')
        if content_id:
            queryset = queryset.filter(content_block_id=content_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
