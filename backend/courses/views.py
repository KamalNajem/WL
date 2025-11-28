from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Course, ContentBlock
from .serializers import CourseSerializer, ContentBlockSerializer

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Adaptive Sorting Logic
        user_style = getattr(request.user, 'current_style_label', None)
        if user_style:
            # Define preferences based on style
            # Mapping Cluster IDs or Labels to Content Types
            # For this demo, we assume simple string matching or heuristics
            preferences = {
                'Visual': ['VIDEO', 'Visual'],
                'Auditory': ['PODCAST', 'Auditory'],
                'Read/Write': ['PDF', 'Text'],
                'Kinesthetic': ['QUIZ', 'Kinesthetic'],
                # Fallback for Cluster IDs if they are just "Cluster 0" etc.
                'Cluster 0': ['VIDEO', 'Visual'], 
                'Cluster 1': ['PDF', 'Text'],
                'Cluster 2': ['QUIZ', 'Kinesthetic']
            }
            
            # Find matching keys in user_style
            preferred_tags = []
            for key, tags in preferences.items():
                if key in user_style:
                    preferred_tags = tags
                    break
            
            if preferred_tags:
                # Sort content blocks within each module
                for module in data['modules']:
                    blocks = module['content_blocks']
                    
                    def sort_key(block):
                        score = 0
                        # Check Content Type
                        if block['content_type'] in preferred_tags:
                            score += 2
                        # Check Related Styles
                        if any(tag in block['related_styles'] for tag in preferred_tags):
                            score += 1
                        return score

                    # Sort descending by score
                    blocks.sort(key=sort_key, reverse=True)
                    
                    # Add a flag for frontend to show "Recommended"
                    for block in blocks:
                        block['is_recommended'] = sort_key(block) > 0

        return Response(data)

class ContentBlockViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ContentBlock.objects.all()
    serializer_class = ContentBlockSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ContentBlock.objects.all()
        
        # If accessed directly, we can also sort, but usually we access via Course
        # This logic is duplicated in CourseViewSet for the nested structure
        
        return queryset
