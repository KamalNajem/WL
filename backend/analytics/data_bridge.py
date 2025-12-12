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

    @classmethod
    def prepare_training_data(cls) -> pd.DataFrame:
        """
        Prepare a combined training dataset from historical CSV + live DB data.
        
        Returns a DataFrame ready for ML training with columns matching 
        the original merged_dataset.csv structure.
        """
        from courses.models import ContentBlock
        from comments.models import Comment
        
        print("📊 Generating Training Data...")
        
        # Load historical data
        csv_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), 
            'data', 
            'merged_dataset.csv'
        )
        
        historical_df = pd.DataFrame()
        if os.path.exists(csv_path):
            historical_df = pd.read_csv(csv_path)
            print(f"📊 Loaded {len(historical_df)} historical records from CSV")
        else:
            print(f"⚠️ No historical CSV found at {csv_path}")
        
        # Get defaults from historical data for missing values
        defaults = {}
        if not historical_df.empty:
            for col in ['Motivation', 'Internet', 'EduTech', 'StressLevel']:
                if col in historical_df.columns:
                    defaults[col] = historical_df[col].mode().iloc[0] if not historical_df[col].mode().empty else 5
            if 'Attendance' in historical_df.columns:
                defaults['Attendance'] = historical_df['Attendance'].mean()
        
        # Fallback defaults
        defaults.setdefault('Motivation', 5)
        defaults.setdefault('Internet', 1)
        defaults.setdefault('EduTech', 1)
        defaults.setdefault('StressLevel', 3)
        defaults.setdefault('Attendance', 80)
        
        # Fetch all student profiles from DB
        profiles = StudentProfile.objects.select_related('user').all()
        print(f"📊 Found {profiles.count()} student profiles in DB")
        print(f"📊 Total InteractionLog entries: {InteractionLog.objects.count()}")
        print(f"📊 Total ContentProgress entries: {ContentProgress.objects.count()}")
        
        live_data = []
        for profile in profiles:
            user = profile.user
            
            # Sync latest stats
            cls.sync_user_profile(user)
            profile.refresh_from_db()
            
            # Calculate StudyHours from InteractionLog
            total_seconds = InteractionLog.objects.filter(user=user).aggregate(
                total=Sum('time_spent_seconds')
            )['total'] or 0
            study_hours = total_seconds / 3600
            
            print(f"📊 User {user.username}: InteractionLogs total_seconds={total_seconds}, study_hours={study_hours:.2f}")
            
            # Count resources accessed (ContentProgress entries)
            resources = ContentProgress.objects.filter(user=user).count()
            
            # Calculate assignment completion rate
            total_blocks = ContentBlock.objects.count()
            completed_blocks = ContentProgress.objects.filter(
                user=user, 
                is_completed=True
            ).count()
            assignment_completion = (completed_blocks / total_blocks * 100) if total_blocks > 0 else 0
            
            # Average quiz score
            quiz_stats = QuizAttempt.objects.filter(user=user).aggregate(avg=Avg('percentage'))
            exam_score = quiz_stats['avg'] or 50  # Default 50 if no quizzes
            
            # Count discussions (comments)
            try:
                discussions = Comment.objects.filter(user=user).count()
            except Exception:
                discussions = 0
            
            # Map learning style to numeric
            style_label = user.current_style_label or 'Visual'
            style_numeric = cls.STYLE_MAPPING.get(style_label, 0)
            
            row = {
                'StudyHours': round(study_hours, 2),
                'Attendance': profile.attendance or defaults['Attendance'],
                'Resources': resources,
                'AssignmentCompletion': round(assignment_completion, 2),
                'ExamScore': round(exam_score, 2),
                'Discussions': discussions,
                'LearningStyle': style_numeric,
                # Fill in defaults for columns that may not have live data
                'Extracurricular': 1 if profile.extracurricular_activities else 0,
                'Motivation': defaults['Motivation'],
                'Internet': defaults['Internet'],
                'EduTech': defaults['EduTech'],
                'StressLevel': defaults['StressLevel'],
                'FinalGrade': exam_score,  # Use exam score as proxy
                'Gender': 1,  # Placeholder
                'Age': 20,  # Placeholder
                'source': 'live'  # Mark as live data
            }
            live_data.append(row)
        
        live_df = pd.DataFrame(live_data)
        
        # Mark historical data
        if not historical_df.empty:
            historical_df['source'] = 'historical'
        
        # Combine datasets
        if not live_df.empty and not historical_df.empty:
            # Ensure column alignment - only keep common columns for training
            common_cols = ['StudyHours', 'Attendance', 'Resources', 'Extracurricular', 
                          'Motivation', 'Internet', 'ExamScore', 'source']
            
            # Add missing columns to each dataframe with defaults
            for col in common_cols:
                if col not in historical_df.columns:
                    historical_df[col] = 0
                if col not in live_df.columns:
                    live_df[col] = 0
            
            combined_df = pd.concat([historical_df, live_df], ignore_index=True)
        elif not live_df.empty:
            combined_df = live_df
        else:
            combined_df = historical_df
        
        return combined_df

