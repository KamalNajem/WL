import React from 'react';

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
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm mb-6 relative overflow-hidden">
            {/* Glow Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

            <div className="flex justify-between items-end mb-3">
                <div>
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1 block">Current Rank</span>
                    <span className="font-bold text-2xl text-slate-100">Level {level} <span className="text-slate-500 mx-2">|</span> {levelTitle}</span>
                </div>
                <div className="text-right">
                    <span className="text-emerald-400 font-mono font-bold">{currentLevelPoints}</span>
                    <span className="text-slate-500 text-sm"> / {pointsForNextLevel} XP</span>
                </div>
            </div>
            
            <div className="w-full bg-slate-800 rounded-full h-3 border border-slate-700 p-[1px]">
                <div 
                    className="bg-gradient-to-r from-purple-600 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.4)] relative" 
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 rounded-full"></div>
                </div>
            </div>
            
            <div className="mt-3 flex justify-between text-xs text-slate-500 font-mono">
                <span>Total XP: {points}</span>
                <span>Next Reward: New Badge</span>
            </div>
        </div>
    );
}
