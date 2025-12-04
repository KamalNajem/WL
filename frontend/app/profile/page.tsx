'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import LevelProgress from '@/components/Gamification/LevelProgress';
import BadgeGrid from '@/components/Gamification/BadgeGrid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Zap, Trophy, Star, Clock, BookOpen, Activity, Calendar, Mail, Settings, BarChart3 } from 'lucide-react';

interface StudentProfileData {
    total_study_hours: number;
    video_watch_duration: number;
    text_reading_duration: number;
    quiz_attempts: number;
    attendance: number;
    resources_visited: number;
    exam_score: number;
}

interface UserProfile {
    username: string;
    email: string;
    current_style_label: string | null;
    gamification_points: number;
    current_level: number;
    badges_earned: any[];
    date_joined: string;
    student_profile: StudentProfileData;
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

    if (loading) return <div className="p-8 text-muted-foreground">Loading...</div>;
    if (!user) return <div className="p-8 text-muted-foreground">Please log in.</div>;

    const stats = user.student_profile || {
        total_study_hours: 0,
        video_watch_duration: 0,
        text_reading_duration: 0,
        quiz_attempts: 0,
        resources_visited: 0,
        exam_score: 0
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Card */}
                <Card className="overflow-hidden border-primary/20">
                    <div className="h-32 bg-gradient-to-r from-primary/20 to-purple-900/20"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex flex-col md:flex-row items-end md:items-end -mt-12 mb-6 gap-6">
                            <div className="w-32 h-32 rounded-full bg-background border-4 border-background flex items-center justify-center text-4xl font-bold text-primary shadow-lg shrink-0">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 mb-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-foreground">{user.username}</h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground mt-2">
                                    <span className="flex items-center gap-1 text-sm">
                                        <Mail className="w-4 h-4" /> {user.email}
                                    </span>
                                    <span className="flex items-center gap-1 text-sm">
                                        <Calendar className="w-4 h-4" /> Joined {new Date(user.date_joined).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 mb-1">
                                <Button variant="outline">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </Button>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <Card className="bg-muted/50 border-border">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold">Style</p>
                                        <p className="text-lg font-bold text-foreground">{user.current_style_label || 'N/A'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-muted/50 border-border">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold">Total XP</p>
                                        <p className="text-lg font-bold text-foreground">{user.gamification_points}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-muted/50 border-border">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                        <Star className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold">Level</p>
                                        <p className="text-lg font-bold text-foreground">{user.current_level}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-muted/50 border-border">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold">Study Time</p>
                                        <p className="text-lg font-bold text-foreground">{Math.round(stats.total_study_hours)}h</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </Card>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="stats">Statistics</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-primary" />
                                        Current Progress
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <LevelProgress points={user.gamification_points} level={user.current_level} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-primary" />
                                        Recent Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Logged in</p>
                                                <p className="text-xs text-muted-foreground">Just now</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Checked Profile</p>
                                                <p className="text-xs text-muted-foreground">Just now</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Achievements</CardTitle>
                                <CardDescription>Badges you've earned on your journey.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <BadgeGrid badges={user.badges_earned} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="stats" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">Resources Visited</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.resources_visited}</div>
                                    <p className="text-xs text-muted-foreground">Total learning materials accessed</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">Quiz Attempts</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.quiz_attempts}</div>
                                    <p className="text-xs text-muted-foreground">Total quizzes taken</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">Exam Score</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.exam_score}%</div>
                                    <p className="text-xs text-muted-foreground">Average performance</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Learning Breakdown</CardTitle>
                                <CardDescription>How you spend your time learning.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Reading</span>
                                            <span>{Math.round(stats.text_reading_duration)}h</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-500" 
                                                style={{ width: `${Math.min((stats.text_reading_duration / (stats.total_study_hours || 1)) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Watching Videos</span>
                                            <span>{Math.round(stats.video_watch_duration)}h</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-purple-500" 
                                                style={{ width: `${Math.min((stats.video_watch_duration / (stats.total_study_hours || 1)) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Settings</CardTitle>
                                <CardDescription>Manage your account information.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input id="username" defaultValue={user.username} disabled />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" defaultValue={user.email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input id="password" type="password" placeholder="Leave blank to keep current" />
                                </div>
                                <Button>Save Changes</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
