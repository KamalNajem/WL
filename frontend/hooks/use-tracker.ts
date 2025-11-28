import { useEffect, useRef } from 'react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';

export const useContentTracker = (blockId: number) => {
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        // Start timer on mount
        startTimeRef.current = Date.now();

        const logInteraction = async () => {
            if (startTimeRef.current) {
                const endTime = Date.now();
                const duration = (endTime - startTimeRef.current) / 1000; // seconds

                try {
                    await api.post('analytics/log/', {
                        content_block: blockId,
                        time_spent_seconds: duration,
                        interaction_type: 'view'
                    });
                } catch (error) {
                    console.error('Failed to log interaction:', error);
                }
            }
        };

        // Log on unmount
        return () => {
            logInteraction();
        };
    }, [blockId]);

    const markComplete = async () => {
        if (startTimeRef.current) {
            const endTime = Date.now();
            const duration = (endTime - startTimeRef.current) / 1000;

            try {
                const response = await api.post('analytics/log/', {
                    content_block: blockId,
                    time_spent_seconds: duration,
                    interaction_type: 'complete'
                });

                // Gamification Feedback
                const { gamification } = response.data;
                if (gamification) {
                    if (gamification.points_added > 0) {
                        toast.success(`🎉 +${gamification.points_added} Points!`, {
                            duration: 3000,
                            position: 'top-right',
                        });
                    }
                    
                    if (gamification.new_badges && gamification.new_badges.length > 0) {
                        gamification.new_badges.forEach((badge: any) => {
                            toast(`🏆 New Badge Unlocked: ${badge.name}!`, {
                                icon: badge.icon,
                                duration: 5000,
                                position: 'top-center',
                                style: {
                                    borderRadius: '10px',
                                    background: '#333',
                                    color: '#fff',
                                },
                            });
                        });
                    }
                    
                    if (gamification.level_up) {
                        toast.success(`🚀 Level Up! You are now Level ${gamification.new_level}!`, {
                            duration: 5000,
                            position: 'top-center',
                            style: {
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to log completion:', error);
            }
        }
    };

    return { markComplete };
};
