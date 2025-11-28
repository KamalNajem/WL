from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from .models import InteractionLog
from .serializers import InteractionLogSerializer
from .gamification import GamificationEngine

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

