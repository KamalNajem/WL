'use client';

import { useEffect, useState, useCallback } from 'react';
import { useGamification } from '@/contexts/GamificationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Trophy, ArrowUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RewardNotification() {
    const { pendingRewards, clearReward } = useGamification();
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClose = useCallback(() => {
        setIsAnimating(false);
        setTimeout(() => {
            setIsVisible(false);
            clearReward();
        }, 300);
    }, [clearReward]);

    useEffect(() => {
        if (pendingRewards) {
            // Delay to allow for animation setup
            const timer = setTimeout(() => {
                setIsVisible(true);
                setIsAnimating(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [pendingRewards]);

    // Auto-dismiss after 5 seconds
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                handleClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, handleClose]);

    if (!pendingRewards || !isVisible) return null;

    const { xpGained, badges, levelUp, newLevel } = pendingRewards;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div 
                className={cn(
                    "absolute inset-0 bg-black/50 transition-opacity duration-300 pointer-events-auto",
                    isAnimating ? "opacity-100" : "opacity-0"
                )}
                onClick={handleClose}
            />

            {/* Reward Card */}
            <Card 
                className={cn(
                    "relative z-10 w-full max-w-md mx-4 overflow-hidden pointer-events-auto transition-all duration-300 transform",
                    isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95",
                    levelUp && "border-yellow-500 border-2"
                )}
            >
                {/* Confetti/Sparkle Background */}
                {levelUp && (
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="absolute top-4 right-1/4 w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        <div className="absolute top-8 left-1/3 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                        <div className="absolute top-2 right-1/3 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.7s' }} />
                    </div>
                )}

                {/* Close Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-20"
                    onClick={handleClose}
                >
                    <X className="w-4 h-4" />
                </Button>

                <CardContent className="p-6 text-center relative">
                    {/* Level Up Display */}
                    {levelUp ? (
                        <div className="mb-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4 animate-pulse">
                                <ArrowUp className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-1">
                                Level Up! 🎉
                            </h2>
                            <p className="text-4xl font-bold text-primary mb-2">
                                Level {newLevel}
                            </p>
                            <p className="text-muted-foreground">
                                You&apos;ve reached a new milestone!
                            </p>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 mb-4">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-1">
                                Great Work! ⭐
                            </h2>
                        </div>
                    )}

                    {/* XP Gained */}
                    {xpGained > 0 && (
                        <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-primary/10 rounded-lg">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <span className="text-lg font-semibold text-primary">
                                +{xpGained} XP
                            </span>
                        </div>
                    )}

                    {/* New Badges */}
                    {badges && badges.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">New Badge{badges.length > 1 ? 's' : ''} Unlocked!</p>
                            <div className="flex justify-center gap-3">
                                {badges.map((badge, index) => (
                                    <div 
                                        key={index}
                                        className="flex flex-col items-center gap-1 p-3 bg-muted rounded-lg"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                            <Trophy className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-sm font-medium">{badge.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Continue Button */}
                    <Button 
                        className="mt-6 w-full"
                        onClick={handleClose}
                    >
                        Continue Learning
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
