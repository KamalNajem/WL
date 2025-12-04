'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import LevelProgress from '@/components/Gamification/LevelProgress';
import BadgeGrid from '@/components/Gamification/BadgeGrid';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, RefreshCw, BookOpen, Trophy, Sparkles } from 'lucide-react';

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

    if (loading) return <div className="p-8 text-muted-foreground">Loading...</div>;
    if (!user) return <div className="p-8 text-muted-foreground">Please log in.</div>;

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-3xl font-bold text-foreground">
                        Welcome, <span className="text-primary">{user.username}</span>
                    </h1>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/profile">View Profile</Link>
                        </Button>
                    </div>
                </div>

                {/* Gamification Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                         <LevelProgress points={user.gamification_points || 0} level={user.current_level || 1} />
                    </div>
                    <div className="lg:col-span-1">
                        <Card className="h-full flex flex-col justify-center items-center text-center p-6 bg-gradient-to-br from-primary/10 to-background border-primary/20">
                            <Trophy className="w-12 h-12 text-primary mb-2" />
                            <h3 className="text-lg font-bold text-foreground">Keep it up!</h3>
                            <p className="text-sm text-muted-foreground">You're doing great on your learning journey.</p>
                        </Card>
                    </div>
                </div>
                
                <div>
                    <BadgeGrid badges={user.badges_earned || []} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vibe Check Card */}
                    <Card className="border-primary/20 shadow-lg shadow-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-primary" />
                                Your Learning Vibe
                            </CardTitle>
                            <CardDescription>We've adapted the content for you.</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center py-6">
                            {user.current_style_label ? (
                                <>
                                    <span className="text-4xl font-bold text-primary block mb-2">
                                        {user.current_style_label}
                                    </span>
                                    <p className="text-muted-foreground mb-6">Optimized for your success.</p>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={resetStyle}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Reset & Retake Quiz
                                    </Button>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-muted-foreground">We don't know your style yet!</p>
                                    <Button asChild className="w-full">
                                        <Link href="/quiz">
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Take the Vibe Quiz
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary" />
                                Jump Back In
                            </CardTitle>
                            <CardDescription>Continue where you left off.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button asChild className="w-full" size="lg">
                                <Link href="/courses">
                                    Browse Courses
                                </Link>
                            </Button>
                            <Button variant="secondary" asChild className="w-full">
                                <Link href="/profile">
                                    Check Achievements
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
