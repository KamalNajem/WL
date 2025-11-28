'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';
import { useContentTracker } from '@/hooks/use-tracker';

interface ContentBlock {
    id: number;
    title: string;
    description: string;
    content_type: 'VIDEO' | 'PDF' | 'QUIZ' | 'PODCAST';
    url: string | null;
    file: string | null;
    related_styles: string[];
    is_recommended?: boolean;
}

interface Module {
    id: number;
    title: string;
    description: string;
    content_blocks: ContentBlock[];
}

interface Course {
    id: number;
    title: string;
    description: string;
    modules: Module[];
}

const BlockRenderer = ({ block }: { block: ContentBlock }) => {
    const { markComplete } = useContentTracker(block.id);

    const getIcon = (type: string) => {
        switch (type) {
            case 'VIDEO': return '🎥';
            case 'PDF': return '📄';
            case 'QUIZ': return '❓';
            case 'PODCAST': return '🎧';
            default: return '📄';
        }
    };

    return (
        <div className={`group relative bg-slate-900 p-5 rounded-xl border transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10 ${block.is_recommended ? 'border-purple-500 ring-1 ring-purple-500/50' : 'border-slate-800 hover:border-slate-700'}`}>
            {block.is_recommended && (
                <div className="absolute -top-3 -right-3 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-purple-500/30 flex items-center gap-1 border border-purple-400">
                    <span>✨ Recommended</span>
                </div>
            )}
            
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center text-xl shadow-inner">
                    {getIcon(block.content_type)}
                </div>
                
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-slate-200 group-hover:text-purple-400 transition-colors">
                        {block.title}
                    </h3>
                    {block.description && (
                        <p className="text-slate-400 text-sm mt-1 mb-3 leading-relaxed">{block.description}</p>
                    )}

                    <div className="mt-4">
                        {block.content_type === 'VIDEO' && block.url && (
                            <div className="rounded-lg overflow-hidden shadow-lg border border-slate-800 bg-black">
                                <div className="aspect-w-16 aspect-h-9">
                                    <iframe 
                                        src={block.url.replace('watch?v=', 'embed/')} 
                                        className="w-full h-64" 
                                        allowFullScreen
                                        title={block.title}
                                    />
                                </div>
                            </div>
                        )}

                        {block.content_type === 'PDF' && (
                            <a 
                                href={block.file || block.url || '#'} 
                                target="_blank"
                                onClick={() => markComplete()}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white hover:border-slate-600 transition-all font-medium text-sm"
                            >
                                <span>📄 Open Resource</span>
                            </a>
                        )}

                        {block.content_type === 'QUIZ' && (
                            <button 
                                onClick={() => markComplete()}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all font-medium text-sm shadow-lg shadow-purple-500/20 border border-purple-500"
                            >
                                <span>📝 Start Challenge</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function CourseDetail() {
    const { id } = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeModuleId, setActiveModuleId] = useState<number | null>(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await api.get(`courses/${id}/`);
                setCourse(response.data);
                if (response.data.modules.length > 0) {
                    setActiveModuleId(response.data.modules[0].id);
                }
            } catch (error) {
                console.error('Error fetching course:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCourse();
    }, [id]);

    if (loading) return <div className="p-8 text-slate-400">Loading quest data...</div>;
    if (!course) return <div className="p-8 text-red-400">Quest not found.</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <Link href="/courses" className="text-sm text-slate-500 hover:text-purple-400 mb-1 inline-block transition-colors">← Back to Quests</Link>
                        <h1 className="text-2xl font-bold text-slate-100">{course.title}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Progress</div>
                            <div className="text-emerald-400 font-mono">0% Complete</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar: Modules */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                            <h2 className="font-bold text-slate-200">Quest Modules</h2>
                        </div>
                        <div className="divide-y divide-slate-800">
                            {course.modules.map((module) => (
                                <button
                                    key={module.id}
                                    onClick={() => setActiveModuleId(module.id)}
                                    className={`w-full text-left p-4 hover:bg-slate-800/50 transition-colors flex items-center justify-between group ${
                                        activeModuleId === module.id ? 'bg-purple-500/10 border-l-4 border-purple-500' : 'border-l-4 border-transparent'
                                    }`}
                                >
                                    <span className={`text-sm font-medium ${activeModuleId === module.id ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                        {module.title}
                                    </span>
                                    {activeModuleId === module.id && <span className="text-purple-400">▶</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center: Content */}
                <div className="lg:col-span-9 space-y-8">
                    {course.modules.map((module) => (
                        <div 
                            key={module.id} 
                            className={activeModuleId === module.id ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}
                        >
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-slate-100 mb-2">{module.title}</h2>
                                <p className="text-slate-400">{module.description}</p>
                            </div>

                            <div className="space-y-6">
                                {module.content_blocks.map((block) => (
                                    <BlockRenderer key={block.id} block={block} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
