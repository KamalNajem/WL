import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Backpack } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Badge {
    name: string;
    icon: string;
    description: string;
    date: string;
}

interface BadgeGridProps {
    badges: Badge[];
}

const ALL_BADGES = [
    { name: "Novice", icon: "🌱", description: "Earned 100 points" },
    { name: "Scholar", icon: "🎓", description: "Earned 500 points" },
    { name: "Master", icon: "👑", description: "Earned 1000 points" },
    { name: "Quiz Whiz", icon: "📝", description: "Completed 5 quizzes" }
];

export default function BadgeGrid({ badges }: BadgeGridProps) {
    const earnedNames = new Set((badges || []).map(b => b.name));

    return (
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Backpack className="h-5 w-5 text-primary" />
                    Inventory <span className="text-muted-foreground text-sm font-normal">(Badges)</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {ALL_BADGES.map((badge) => {
                        const isEarned = earnedNames.has(badge.name);
                        return (
                            <div 
                                key={badge.name} 
                                className={cn(
                                    "aspect-square flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 relative group",
                                    isEarned 
                                        ? "border-primary/50 bg-primary/10 shadow-[0_0_15px_rgba(124,58,237,0.2)] hover:border-primary hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]" 
                                        : "border-muted bg-muted/20 opacity-50 grayscale"
                                )}
                                title={badge.description}
                            >
                                <span className={cn("text-4xl mb-3 transition-transform duration-300", isEarned && "group-hover:scale-110")}>
                                    {badge.icon}
                                </span>
                                <span className={cn(
                                    "text-xs font-bold uppercase tracking-wide text-center",
                                    isEarned ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {badge.name}
                                </span>
                                
                                {/* Tooltip on Hover */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-3 py-1.5 rounded-md border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-md">
                                    {badge.description}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
