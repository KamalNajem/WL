'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    PieChart, Pie, Cell, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer 
} from 'recharts';
import { Users, BookOpen, AlertTriangle, TrendingUp, Brain, BarChart3, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface AnalyticsData {
    learning_style_distribution: Record<string, number>;
    course_popularity: { course: string; completions: number }[];
    average_engagement: { content_type: string; avg_time_seconds: number; total_interactions: number }[];
    at_risk_students: { username: string; email: string; study_hours: number; exam_score: number; level: number }[];
    engagement_vs_performance: { username: string; study_hours: number; exam_score: number }[];
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function InstructorDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRetraining, setIsRetraining] = useState(false);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('analytics/instructor/');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching instructor analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const handleRetrainModel = async () => {
        setIsRetraining(true);
        toast.loading('Training AI model...', { id: 'retrain' });
        
        try {
            const response = await api.post('adaptation/retrain/');
            
            if (response.data.status === 'success') {
                toast.success(
                    `AI Brain Updated Successfully! 🧠\n${response.data.details.students_updated} students updated.`,
                    { id: 'retrain', duration: 5000 }
                );
            } else {
                toast.error(response.data.message || 'Retraining failed', { id: 'retrain' });
            }
        } catch (error) {
            console.error('Error retraining model:', error);
            toast.error('Failed to retrain model. Please try again.', { id: 'retrain' });
        } finally {
            setIsRetraining(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-8 flex items-center justify-center">
                <div className="text-muted-foreground">Loading analytics...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-background p-8 flex items-center justify-center">
                <div className="text-destructive">Failed to load analytics data.</div>
            </div>
        );
    }

    // Transform learning style distribution for pie chart
    const pieData = Object.entries(data.learning_style_distribution).map(([name, value]) => ({
        name,
        value,
    }));

    // Transform engagement data for bar chart
    const engagementData = data.engagement_vs_performance.slice(0, 10); // Top 10 students

    const totalStudents = Object.values(data.learning_style_distribution).reduce((a, b) => a + b, 0);
    const totalCompletions = data.course_popularity.reduce((a, b) => a + b.completions, 0);

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-primary" />
                            Instructor Analytics Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-2">Monitor class performance and student engagement.</p>
                    </div>
                    <Button 
                        onClick={handleRetrainModel}
                        disabled={isRetraining}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRetraining ? 'animate-spin' : ''}`} />
                        {isRetraining ? 'Training...' : 'Retrain AI Model'}
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/20">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-primary/20 rounded-lg">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Students</p>
                                <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-500/10 to-background border-emerald-500/20">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/20 rounded-lg">
                                <BookOpen className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Completions</p>
                                <p className="text-2xl font-bold text-foreground">{totalCompletions}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-500/10 to-background border-amber-500/20">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-amber-500/20 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">At-Risk Students</p>
                                <p className="text-2xl font-bold text-foreground">{data.at_risk_students.length}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-cyan-500/10 to-background border-cyan-500/20">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-cyan-500/20 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-cyan-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Active Courses</p>
                                <p className="text-2xl font-bold text-foreground">{data.course_popularity.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Learning Style Distribution - Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-primary" />
                                Learning Style Distribution
                            </CardTitle>
                            <CardDescription>Distribution of VARK learning styles across all students.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'hsl(var(--card))', 
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                    No learning style data available yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Study Hours vs Exam Score - Bar Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Engagement vs Performance
                            </CardTitle>
                            <CardDescription>Comparing study hours and exam scores per student.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {engagementData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={engagementData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis 
                                            dataKey="username" 
                                            stroke="hsl(var(--muted-foreground))"
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'hsl(var(--card))', 
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="study_hours" name="Study Hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="exam_score" name="Exam Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                    No engagement data available yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Course Popularity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            Course Popularity
                        </CardTitle>
                        <CardDescription>Number of content completions per course.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.course_popularity.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={data.course_popularity} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                                    <YAxis 
                                        dataKey="course" 
                                        type="category" 
                                        stroke="hsl(var(--muted-foreground))" 
                                        width={150}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'hsl(var(--card))', 
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="completions" name="Completions" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                                No course completion data available yet.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* At-Risk Students Table */}
                <Card className="border-amber-500/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-500">
                            <AlertTriangle className="w-5 h-5" />
                            At-Risk Students
                        </CardTitle>
                        <CardDescription>Students with low engagement (&lt;2 hours) or low exam scores (&lt;50%).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.at_risk_students.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Username</th>
                                            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Email</th>
                                            <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Study Hours</th>
                                            <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Exam Score</th>
                                            <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Level</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.at_risk_students.map((student, index) => (
                                            <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                                <td className="py-3 px-4 font-medium text-foreground">{student.username}</td>
                                                <td className="py-3 px-4 text-muted-foreground">{student.email}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className={student.study_hours < 2 ? 'text-red-400' : 'text-foreground'}>
                                                        {student.study_hours}h
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className={student.exam_score < 50 ? 'text-red-400' : 'text-foreground'}>
                                                        {student.exam_score}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right text-muted-foreground">{student.level}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-muted-foreground">
                                🎉 No at-risk students! All students are performing well.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
