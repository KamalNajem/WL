import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from 'lucide-react';

interface LevelProgressProps {
    points: number;
    level: number;
}

export default function LevelProgress({ points, level }: LevelProgressProps) {
    const pointsForNextLevel = 200;
    const currentLevelPoints = points % pointsForNextLevel;
    const progress = (currentLevelPoints / pointsForNextLevel) * 100;
    
    let levelTitle = "Novice";
    if (level >= 2) levelTitle = "Scholar";
    if (level >= 5) levelTitle = "Master";

    return (
        <Card className="relative overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">Current Rank</span>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            Level {level} <span className="text-muted-foreground font-light">|</span> {levelTitle}
                        </CardTitle>
                    </div>
                    <Trophy className="h-8 w-8 text-yellow-500 opacity-80" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress to next level</span>
                    <div className="font-mono">
                        <span className="text-primary font-bold">{currentLevelPoints}</span>
                        <span className="text-muted-foreground"> / {pointsForNextLevel} XP</span>
                    </div>
                </div>
                
                <Progress value={progress} className="h-3" />
                
                <div className="mt-4 flex justify-between text-xs text-muted-foreground font-mono">
                    <span>Total XP: {points}</span>
                    <span>Next Reward: New Badge</span>
                </div>
            </CardContent>
        </Card>
    );
}
