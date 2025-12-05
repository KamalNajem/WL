"""
Data Bridge Service

Translates live user actions into dataset features for ML pipeline.
Aggregates behavioral data and exports to training-compatible format.
"""

from django.db.models import Sum, Count, Avg
from django.utils import timezone
from users.models import User, StudentProfile
from courses.models import ContentProgress
from analytics.models import InteractionLog, QuizAttempt
import pandas as pd
from typing import Dict, Any, Optional
import os


class DataBridge:
    """
    Service to bridge live platform data with ML training datasets.
    """
    
    # Mapping of learning styles for dataset compatibility
    STYLE_MAPPING = {
        'Visual': 0,
        'Auditory': 1,
        'Read/Write': 2,
        'Kinesthetic': 3,
    }
    
    @staticmethod
    def aggregate_user_stats(user: User) -> Dict[str, Any]:
        """
        Aggregate all behavioral statistics for a user.
        Returns a dictionary of computed features.
        """
        stats = {
            'user_id': user.id,
            'username': user.username,
            'total_study_hours': 0.0,
            'resources_visited': 0,
            'average_quiz_score': 0.0,
            'video_watch_hours': 0.0,
            'text_reading_hours': 0.0,
            'quiz_attempts': 0,
            'completion_rate': 0.0,
        }
        
        # Calculate total study hours from InteractionLog
        interaction_stats = InteractionLog.objects.filter(user=user).aggregate(
            total_seconds=Sum('time_spent_seconds'),
            total_interactions=Count('id')
        )
        
        total_seconds = interaction_stats['total_seconds'] or 0
        stats['total_study_hours'] = round(total_seconds / 3600, 2)
        
        # Count unique resources visited
        resources_visited = ContentProgress.objects.filter(user=user).count()
        stats['resources_visited'] = resources_visited
        
        # Calculate average quiz score
        quiz_stats = QuizAttempt.objects.filter(user=user).aggregate(
            avg_score=Avg('percentage'),
            total_attempts=Count('id')
        )
        stats['average_quiz_score'] = round(quiz_stats['avg_score'] or 0, 2)
        stats['quiz_attempts'] = quiz_stats['total_attempts'] or 0
        
        # Calculate video watch duration
        video_logs = InteractionLog.objects.filter(
            user=user,
            content_block__content_type='VIDEO'
        ).aggregate(total_seconds=Sum('time_spent_seconds'))
        stats['video_watch_hours'] = round((video_logs['total_seconds'] or 0) / 3600, 2)
        
        # Calculate text reading duration
        text_logs = InteractionLog.objects.filter(
            user=user,
            content_block__content_type='PDF'
        ).aggregate(total_seconds=Sum('time_spent_seconds'))
        stats['text_reading_hours'] = round((text_logs['total_seconds'] or 0) / 3600, 2)
        
        # Calculate completion rate
        total_progress = ContentProgress.objects.filter(user=user).count()
        completed = ContentProgress.objects.filter(user=user, is_completed=True).count()
        if total_progress > 0:
            stats['completion_rate'] = round((completed / total_progress) * 100, 2)
        
        return stats
    
    @staticmethod
    def sync_user_profile(user: User) -> StudentProfile:
        """
        Sync computed stats back to StudentProfile for persistence.
        """
        stats = DataBridge.aggregate_user_stats(user)
        
        profile, created = StudentProfile.objects.get_or_create(user=user)
        
        profile.total_study_hours = stats['total_study_hours']
        profile.resources_visited = stats['resources_visited']
        profile.resources_visited_count = stats['resources_visited']
        profile.average_quiz_score = stats['average_quiz_score']
        profile.video_watch_duration = stats['video_watch_hours']
        profile.text_reading_duration = stats['text_reading_hours']
        profile.quiz_attempts = stats['quiz_attempts']
        
        profile.save()
        
        return profile
    
    @staticmethod
    def export_to_training_set(output_path: Optional[str] = None) -> pd.DataFrame:
        """
        Export all student profiles to a DataFrame matching the training dataset format.
        
        Columns match merged_dataset.csv structure:
        - StudentID, Age, Gender (placeholder)
        - StudyHoursPerWeek, AttendanceRate, ResourcesAccessed
        - AssignmentsCompleted, QuizScores, ExamScores
        - ParticipationScore, ExtracurricularActivities
        - InternetUsageHours, SleepHoursPerNight, MotivationLevel
        - StressLevel, PhysicalActivityHours, LearningStyle
        """
        profiles = StudentProfile.objects.select_related('user').all()
        
        data = []
        for profile in profiles:
            # Sync latest stats before export
            DataBridge.sync_user_profile(profile.user)
            profile.refresh_from_db()
            
            # Map learning style to numeric
            style_label = profile.user.current_style_label or 'Visual'
            style_numeric = DataBridge.STYLE_MAPPING.get(style_label, 0)
            
            row = {
                'StudentID': profile.user.id,
                'Age': 20,  # Placeholder - could be added to profile
                'Gender': 'Unknown',  # Placeholder
                'StudyHoursPerWeek': round(profile.total_study_hours * 7, 2),  # Weekly estimate
                'AttendanceRate': profile.attendance,
                'ResourcesAccessed': profile.resources_visited_count,
                'AssignmentsCompleted': profile.quiz_attempts,  # Using quiz as proxy
                'QuizScores': profile.average_quiz_score,
                'ExamScores': profile.exam_score,
                'ParticipationScore': min(profile.gamification_points / 10, 100),  # Normalize
                'ExtracurricularActivities': 1 if profile.extracurricular_activities else 0,
                'InternetUsageHours': profile.internet_usage,
                'SleepHoursPerNight': 7,  # Placeholder
                'MotivationLevel': profile.motivation_level or 'Medium',
                'StressLevel': 'Medium',  # Placeholder
                'PhysicalActivityHours': 0,  # Placeholder
                'LearningStyle': style_label,
                'LearningStyle_Numeric': style_numeric,
            }
            data.append(row)
        
        df = pd.DataFrame(data)
        
        if output_path:
            df.to_csv(output_path, index=False)
            print(f"Exported {len(df)} records to {output_path}")
        
        return df
    
    @staticmethod
    def get_performance_index(user: User) -> float:
        """
        Calculate a composite performance index for a user.
        Combines quiz scores, completion rate, and engagement.
        """
        stats = DataBridge.aggregate_user_stats(user)
        
        # Weighted composite score
        quiz_weight = 0.4
        completion_weight = 0.3
        engagement_weight = 0.3
        
        quiz_score = stats['average_quiz_score']
        completion_score = stats['completion_rate']
        
        # Normalize study hours (assume 20 hours is max for 100%)
        engagement_score = min((stats['total_study_hours'] / 20) * 100, 100)
        
        performance_index = (
            quiz_score * quiz_weight +
            completion_score * completion_weight +
            engagement_score * engagement_weight
        )
        
        return round(performance_index, 2)
    
    @staticmethod
    def get_learning_velocity(user: User, days: int = 7) -> Dict[str, Any]:
        """
        Calculate learning velocity metrics over a time period.
        """
        from datetime import timedelta
        
        cutoff = timezone.now() - timedelta(days=days)
        
        recent_logs = InteractionLog.objects.filter(
            user=user,
            timestamp__gte=cutoff
        )
        
        total_time = recent_logs.aggregate(
            total=Sum('time_spent_seconds')
        )['total'] or 0
        
        completions = ContentProgress.objects.filter(
            user=user,
            completed_at__gte=cutoff
        ).count()
        
        return {
            'period_days': days,
            'study_hours': round(total_time / 3600, 2),
            'daily_average_hours': round((total_time / 3600) / days, 2),
            'completions': completions,
            'completions_per_day': round(completions / days, 2),
        }
