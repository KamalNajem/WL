import React from 'react';

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
    const earnedNames = new Set(badges.map(b => b.name));

    return (
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                <span>🎒</span> Inventory <span className="text-slate-500 text-sm font-normal">(Badges)</span>
            </h3>
            <div className="grid grid-cols-4 gap-3">
                {ALL_BADGES.map((badge) => {
                    const isEarned = earnedNames.has(badge.name);
                    return (
                        <div 
                            key={badge.name} 
                            className={`aspect-square flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-300 relative group ${
                                isEarned 
                                    ? 'border-purple-500/50 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                                    : 'border-slate-800 bg-slate-950 opacity-40 grayscale'
                            }`}
                            title={badge.description}
                        >
                            <span className={`text-3xl mb-2 transition-transform duration-300 ${isEarned ? 'group-hover:scale-110' : ''}`}>
                                {badge.icon}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wide text-center ${isEarned ? 'text-purple-300' : 'text-slate-600'}`}>
                                {badge.name}
                            </span>
                            
                            {/* Tooltip on Hover */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                {badge.description}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
