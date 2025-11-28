'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import LevelProgress from '@/components/Gamification/LevelProgress';
import BadgeGrid from '@/components/Gamification/BadgeGrid';

interface UserProfile {
    username: string;
    email: string;
    current_style_label: string | null;
    gamification_points: number;
    current_level: number;
    badges_earned: any[];
    date_joined: string;
}

export default function Profile() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('users/me/');
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (loading) return <div className="p-8 text-slate-200">Loading...</div>;
    if (!user) return <div className="p-8 text-slate-200">Please log in.</div>;

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-indigo-900 to-purple-900"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex items-end -mt-12 mb-6">
                            <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-900 flex items-center justify-center text-3xl font-bold text-indigo-400 shadow-lg">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-6 mb-1">
                                <h1 className="text-3xl font-bold text-slate-100">{user.username}</h1>
                                <p className="text-slate-400">Joined {new Date(user.date_joined).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                                <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Learning Style</div>
                                <div className="text-xl font-bold text-indigo-400 mt-1">{user.current_style_label || 'Not Set'}</div>
                            </div>
                            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                                <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Total XP</div>
                                <div className="text-xl font-bold text-emerald-400 mt-1">{user.gamification_points} XP</div>
                            </div>
                            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                                <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Level</div>
                                <div className="text-xl font-bold text-purple-400 mt-1">{user.current_level}</div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-slate-200 mb-4">Current Progress</h2>
                            <LevelProgress points={user.gamification_points} level={user.current_level} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-200 mb-4">Achievements</h2>
                            <BadgeGrid badges={user.badges_earned} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
