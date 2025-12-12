'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';

interface GamificationData {
    xp: number;
    level: number;
    streak_days: number;
    streak_bonus: number;
    xp_for_current_level: number;
    xp_for_next_level: number;
    new_badges?: Array<{
        id: number;
        name: string;
        description: string;
        icon: string;
    }>;
    new_achievements?: Array<{
        id: number;
        name: string;
        description: string;
    }>;
}

interface GamificationContextType {
    gamification: GamificationData | null;
    isLoading: boolean;
    pendingRewards: {
        xpGained: number;
        badges: Array<{ name: string; icon: string }>;
        levelUp: boolean;
        newLevel?: number;
    } | null;
    refreshGamification: () => Promise<void>;
    addXP: (amount: number) => void;
    showReward: (reward: GamificationContextType['pendingRewards']) => void;
    clearReward: () => void;
    updateFromResponse: (response: Partial<GamificationData>) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
    const [gamification, setGamification] = useState<GamificationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingRewards, setPendingRewards] = useState<GamificationContextType['pendingRewards']>(null);
    
    // Get auth state - only fetch gamification if authenticated
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    // Fetch gamification data from backend
    const refreshGamification = useCallback(async () => {
        // Don't fetch if not authenticated
        if (!isAuthenticated) {
            console.log("🔄 Skipping gamification fetch - not authenticated");
            setIsLoading(false);
            return;
        }
        
        console.log("🔄 Refreshing gamification status...");
        try {
            const response = await api.get('analytics/status/');
            console.log("🔄 Gamification status received:", response.data);
            setGamification(response.data);
        } catch (error) {
            console.error('Error fetching gamification data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    // Initial fetch - wait for auth to be determined first
    useEffect(() => {
        if (!authLoading) {
            refreshGamification();
        }
    }, [refreshGamification, authLoading, isAuthenticated]);

    // Optimistically add XP (for instant feedback)
    const addXP = useCallback((amount: number) => {
        setGamification((prev) => {
            if (!prev) return prev;
            
            const newXP = prev.xp + amount;
            const xpNeeded = prev.xp_for_next_level - prev.xp_for_current_level;
            const currentProgress = newXP - prev.xp_for_current_level;
            
            // Check for level up
            if (currentProgress >= xpNeeded) {
                const newLevel = prev.level + 1;
                // Level up! Show reward and update state
                setPendingRewards({
                    xpGained: amount,
                    badges: [],
                    levelUp: true,
                    newLevel,
                });
                
                return {
                    ...prev,
                    xp: newXP,
                    level: newLevel,
                    // Reset level progress (simplified - backend will have accurate values)
                    xp_for_current_level: prev.xp_for_next_level,
                    xp_for_next_level: prev.xp_for_next_level + Math.floor(xpNeeded * 1.5),
                };
            }
            
            return {
                ...prev,
                xp: newXP,
            };
        });
    }, []);

    // Update from API response (for accurate data after actions)
    const updateFromResponse = useCallback((response: Partial<GamificationData>) => {
        setGamification((prev) => {
            if (!prev) return prev;
            
            const updated = { ...prev, ...response };
            
            // Check for level up
            if (response.level && response.level > prev.level) {
                setPendingRewards((existing) => ({
                    xpGained: existing?.xpGained || 0,
                    badges: [
                        ...(existing?.badges || []),
                        ...(response.new_badges?.map(b => ({ name: b.name, icon: b.icon })) || []),
                    ],
                    levelUp: true,
                    newLevel: response.level,
                }));
            } else if (response.new_badges && response.new_badges.length > 0) {
                // New badges without level up
                setPendingRewards((existing) => ({
                    xpGained: existing?.xpGained || 0,
                    badges: [
                        ...(existing?.badges || []),
                        ...response.new_badges!.map(b => ({ name: b.name, icon: b.icon })),
                    ],
                    levelUp: existing?.levelUp || false,
                    newLevel: existing?.newLevel,
                }));
            }
            
            return updated;
        });
    }, []);

    // Show a reward notification
    const showReward = useCallback((reward: GamificationContextType['pendingRewards']) => {
        setPendingRewards(reward);
    }, []);

    // Clear pending rewards
    const clearReward = useCallback(() => {
        setPendingRewards(null);
    }, []);

    return (
        <GamificationContext.Provider
            value={{
                gamification,
                isLoading,
                pendingRewards,
                refreshGamification,
                addXP,
                showReward,
                clearReward,
                updateFromResponse,
            }}
        >
            {children}
        </GamificationContext.Provider>
    );
}

export function useGamification() {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
}
