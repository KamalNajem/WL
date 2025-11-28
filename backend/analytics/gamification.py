from datetime import datetime
from users.models import StudentProfile

class GamificationEngine:
    @staticmethod
    def award_points(user, amount):
        """
        Awards points to the user and checks for level up.
        Returns a dictionary with points added and if level up occurred.
        """
        try:
            profile = user.studentprofile
        except StudentProfile.DoesNotExist:
            return {"points_added": 0, "level_up": False}

        profile.gamification_points += amount
        
        # Level Up Logic: Level = floor(points / 200) + 1
        new_level = (profile.gamification_points // 200) + 1
        level_up = False
        
        if new_level > profile.current_level:
            profile.current_level = new_level
            level_up = True
            
        profile.save()
        
        return {
            "points_added": amount,
            "level_up": level_up,
            "current_level": profile.current_level,
            "total_points": profile.gamification_points
        }

    @staticmethod
    def check_badges(user):
        """
        Checks if the user has earned any new badges based on their stats.
        Returns a list of newly earned badges.
        """
        try:
            profile = user.studentprofile
        except StudentProfile.DoesNotExist:
            return []

        new_badges = []
        existing_badge_names = {b['name'] for b in profile.badges_earned}
        
        # Badge Definitions
        badges_to_check = [
            {
                "condition": profile.gamification_points >= 100,
                "name": "Novice",
                "icon": "🌱",
                "description": "Earned 100 points"
            },
            {
                "condition": profile.gamification_points >= 500,
                "name": "Scholar",
                "icon": "🎓",
                "description": "Earned 500 points"
            },
            {
                "condition": profile.gamification_points >= 1000,
                "name": "Master",
                "icon": "👑",
                "description": "Earned 1000 points"
            },
            {
                "condition": profile.quiz_attempts >= 5,
                "name": "Quiz Whiz",
                "icon": "📝",
                "description": "Completed 5 quizzes"
            }
        ]

        for badge in badges_to_check:
            if badge["condition"] and badge["name"] not in existing_badge_names:
                new_badge = {
                    "name": badge["name"],
                    "icon": badge["icon"],
                    "description": badge["description"],
                    "date": datetime.now().isoformat()
                }
                profile.badges_earned.append(new_badge)
                new_badges.append(new_badge)

        if new_badges:
            profile.save()

        return new_badges
