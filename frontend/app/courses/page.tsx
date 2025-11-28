'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';

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

    if (loading) return <div className="p-8 text-slate-400">Loading quests...</div>;

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-slate-100">Available Quests</h1>
                    <div className="text-sm text-slate-400">Select a path to begin your journey</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div 
                            key={course.id} 
                            className="group bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 flex flex-col"
                        >
                            {/* Card Header / Image Placeholder */}
                            <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex items-center justify-center group-hover:from-slate-800 group-hover:to-purple-900/20 transition-colors">
                                <span className="text-4xl">⚔️</span>
                            </div>

                            <div className="p-6 flex-grow">
                                <h2 className="text-xl font-bold mb-2 text-slate-100 group-hover:text-purple-400 transition-colors">
                                    {course.title}
                                </h2>
                                <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                                    {course.description}
                                </p>
                            </div>
                            
                            <div className="p-6 pt-0 mt-auto">
                                <Link 
                                    href={`/courses/${course.id}`}
                                    className="block w-full text-center bg-slate-800 text-slate-200 border border-slate-700 px-4 py-3 rounded-lg font-medium hover:bg-purple-600 hover:text-white hover:border-purple-500 transition-all duration-200 shadow-sm"
                                >
                                    Embark on Quest
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
