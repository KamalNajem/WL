'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import LevelProgress from '@/components/Gamification/LevelProgress';
import BadgeGrid from '@/components/Gamification/BadgeGrid';

interface UserProfile {
    username: string;
    current_style_label: string | null;
    gamification_points: number;
    current_level: number;
    badges_earned: any[];
}

export default function Dashboard() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        fetchUser();
    }, []);

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

    const analyzeStyle = async () => {
        setAnalyzing(true);
        try {
            const response = await api.post('adaptation/predict/');
            // Refresh user data to show new style
            await fetchUser();
            alert(response.data.message);
        } catch (error) {
            console.error('Error analyzing style:', error);
            alert('Failed to analyze style.');
        } finally {
            setAnalyzing(false);
        }
    };

    const resetStyle = async () => {
        if (!confirm('Are you sure you want to reset your learning style? You will need to retake the quiz.')) return;
        
        try {
            await api.post('adaptation/reset-style/');
            await fetchUser();
        } catch (error) {
            console.error('Error resetting style:', error);
            alert('Failed to reset style.');
        }
    };

    if (loading) return <div className="p-8 text-slate-200">Loading...</div>;
    if (!user) return <div className="p-8 text-slate-200">Please log in.</div>;

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-slate-100">Welcome, <span className="text-indigo-400">{user.username}</span></h1>

                {/* Gamification Section */}
                <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                         <LevelProgress points={user.gamification_points || 0} level={user.current_level || 1} />
                    </div>
                    <div className="lg:col-span-1">
                        {/* Mini Stats or something could go here, but for now just the badges below */}
                    </div>
                </div>
                
                <div className="mb-8">
                    <BadgeGrid badges={user.badges_earned || []} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vibe Check Card */}
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-slate-200">Your Learning Vibe</h2>
                        {user.current_style_label ? (
                            <div className="text-center py-8">
                                <span className="text-4xl font-bold text-indigo-400 block mb-2">
                                    {user.current_style_label}
                                </span>
                                <p className="text-slate-400 mb-6">We've adapted the content for you.</p>
                                <button
                                    onClick={resetStyle}
                                    className="text-sm text-red-400 hover:text-red-300 underline transition-colors"
                                >
                                    Reset & Retake Quiz
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-400 mb-6">We don't know your style yet.</p>
                                <div className="flex flex-col gap-4 items-center">
                                    <Link
                                        href="/quiz"
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 font-medium w-full max-w-xs"
                                    >
                                        Take Learning Style Quiz
                                    </Link>
                                    <button
                                        onClick={analyzeStyle}
                                        disabled={analyzing}
                                        className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors"
                                    >
                                        {analyzing ? 'Analyzing...' : 'Or analyze based on behavior'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-slate-200">Quick Actions</h2>
                        <div className="space-y-4">
                            <Link 
                                href="/courses"
                                className="block w-full text-center border border-indigo-500/30 text-indigo-400 px-4 py-3 rounded-lg hover:bg-indigo-500/10 transition-all font-medium"
                            >
                                Browse Courses
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
