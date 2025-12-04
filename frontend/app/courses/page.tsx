'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sword, Map } from 'lucide-react';

interface Course {
    id: number;
    title: string;
    description: string;
    instructor: number;
}

export default function Courses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('courses/');
                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) return <div className="p-8 text-muted-foreground">Loading quests...</div>;

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Available Quests</h1>
                        <p className="text-muted-foreground mt-2">Select a path to begin your journey</p>
                    </div>
                    <Map className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Card 
                            key={course.id} 
                            className="group overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 flex flex-col"
                        >
                            {/* Card Header / Image Placeholder */}
                            <div className="h-32 bg-gradient-to-br from-muted/50 to-muted p-6 flex items-center justify-center group-hover:from-muted/50 group-hover:to-primary/20 transition-colors">
                                <Sword className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>

                            <CardHeader>
                                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                    {course.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-3">
                                    {course.description}
                                </CardDescription>
                            </CardHeader>
                            
                            <CardFooter className="mt-auto">
                                <Button asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                    <Link href={`/courses/${course.id}`}>
                                        Embark on Quest
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
