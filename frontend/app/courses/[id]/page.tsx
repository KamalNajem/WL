'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';
import SmartVideoPlayer from '@/components/SmartVideoPlayer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, FileText, HelpCircle, Headphones, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProgress {
    status: 'not_started' | 'in_progress' | 'completed';
    last_timestamp: number;
    progress_percent: number;
    is_completed: boolean;
}

interface ContentBlock {
    id: number;
    title: string;
    description: string;
    content_type: 'VIDEO' | 'PDF' | 'QUIZ' | 'PODCAST';
    url: string | null;
    file: string | null;
    related_styles: string[];
    is_recommended?: boolean;
    user_progress?: UserProgress | null;
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

const BlockRenderer = ({ block, onProgressUpdate }: { block: ContentBlock; onProgressUpdate: () => void }) => {

    const getIcon = (type: string) => {
        switch (type) {
            case 'VIDEO': return <PlayCircle className="w-6 h-6" />;
            case 'PDF': return <FileText className="w-6 h-6" />;
            case 'QUIZ': return <HelpCircle className="w-6 h-6" />;
            case 'PODCAST': return <Headphones className="w-6 h-6" />;
            default: return <FileText className="w-6 h-6" />;
        }
    };

    const handleVideoComplete = () => {
        onProgressUpdate();
    };

    const handleMarkComplete = async () => {
        try {
            await api.post('courses/progress/', {
                content_id: block.id,
                percent: 100,
            });
            onProgressUpdate();
        } catch (error) {
            console.error('Error marking complete:', error);
        }
    };

    const isCompleted = block.user_progress?.is_completed || false;
    const progressPercent = block.user_progress?.progress_percent || 0;

    return (
        <Card className={cn(
            "transition-all duration-200 hover:shadow-lg",
            block.is_recommended ? "border-primary/50 ring-1 ring-primary/20" : "hover:border-primary/30",
            isCompleted && "border-green-500/30 bg-green-500/5"
        )}>
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center",
                        isCompleted ? "bg-green-500/20 text-green-500" : "bg-muted text-primary"
                    )}>
                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : getIcon(block.content_type)}
                    </div>
                    
                    <div className="flex-grow space-y-3">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                    {block.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    {block.is_recommended && (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                                            <Sparkles className="w-3 h-3" /> Recommended
                                        </span>
                                    )}
                                    {progressPercent > 0 && !isCompleted && (
                                        <span className="text-xs text-muted-foreground">
                                            {progressPercent}% complete
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {block.description && (
                            <p className="text-muted-foreground text-sm leading-relaxed">{block.description}</p>
                        )}

                        <div className="pt-2">
                            {/* Smart Video Player for VIDEO content */}
                            {block.content_type === 'VIDEO' && block.url && (
                                <SmartVideoPlayer
                                    contentId={block.id}
                                    url={block.url}
                                    title={block.title}
                                    onComplete={handleVideoComplete}
                                    onProgressUpdate={onProgressUpdate}
                                />
                            )}

                            {/* Progress bar for non-video content */}
                            {block.content_type !== 'VIDEO' && progressPercent > 0 && (
                                <div className="mb-4">
                                    <Progress value={progressPercent} className="h-2" />
                                </div>
                            )}

                            <div className="flex gap-3 mt-4">
                                {block.content_type === 'PDF' && (
                                    <Button 
                                        variant={isCompleted ? "secondary" : "outline"}
                                        size="sm"
                                        asChild
                                        onClick={handleMarkComplete}
                                    >
                                        <a href={block.file || block.url || '#'} target="_blank">
                                            <FileText className="w-4 h-4 mr-2" />
                                            {isCompleted ? 'View Again' : 'Open Resource'}
                                        </a>
                                    </Button>
                                )}

                                {block.content_type === 'QUIZ' && (
                                    <Button 
                                        size="sm"
                                        variant={isCompleted ? "secondary" : "default"}
                                        onClick={handleMarkComplete}
                                    >
                                        <HelpCircle className="w-4 h-4 mr-2" />
                                        {isCompleted ? 'Retake Quiz' : 'Start Challenge'}
                                    </Button>
                                )}

                                {block.content_type === 'PODCAST' && block.url && (
                                    <>
                                        <audio controls className="w-full max-w-md">
                                            <source src={block.url} type="audio/mpeg" />
                                            Your browser does not support audio.
                                        </audio>
                                        {!isCompleted && (
                                            <Button 
                                                variant="secondary"
                                                size="sm"
                                                onClick={handleMarkComplete}
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Mark Listened
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function CourseDetail() {
    const { id } = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchCourse = useCallback(async () => {
        try {
            const response = await api.get(`courses/${id}/`);
            setCourse(response.data);
            if (response.data.modules.length > 0 && activeModuleId === null) {
                setActiveModuleId(response.data.modules[0].id);
            }
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    }, [id, activeModuleId]);

    useEffect(() => {
        if (id) fetchCourse();
    }, [id, refreshKey, fetchCourse]);

    const handleProgressUpdate = () => {
        // Refresh course data to get updated progress
        setRefreshKey(prev => prev + 1);
    };

    // Calculate overall course progress
    const calculateProgress = () => {
        if (!course) return 0;
        let totalBlocks = 0;
        let completedBlocks = 0;
        course.modules.forEach(module => {
            module.content_blocks.forEach(block => {
                totalBlocks++;
                if (block.user_progress?.is_completed) {
                    completedBlocks++;
                }
            });
        });
        return totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;
    };

    const courseProgress = calculateProgress();

    if (loading) return <div className="p-8 text-muted-foreground">Loading quest data...</div>;
    if (!course) return <div className="p-8 text-destructive">Quest not found.</div>;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <Link href="/courses" className="text-sm text-muted-foreground hover:text-primary mb-1 inline-flex items-center transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Quests
                        </Link>
                        <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Progress</div>
                            <div className="text-primary font-mono">{courseProgress}% Complete</div>
                        </div>
                        <div className="w-24">
                            <Progress value={courseProgress} className="h-2" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar: Modules */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/50">
                            <h2 className="font-bold text-foreground">Quest Modules</h2>
                        </div>
                        <div className="divide-y divide-border">
                            {course.modules.map((module) => (
                                <button
                                    key={module.id}
                                    onClick={() => setActiveModuleId(module.id)}
                                    className={cn(
                                        "w-full text-left p-4 transition-colors flex items-center justify-between group hover:bg-muted/50",
                                        activeModuleId === module.id ? "bg-primary/5 border-l-4 border-primary" : "border-l-4 border-transparent"
                                    )}
                                >
                                    <span className={cn(
                                        "text-sm font-medium",
                                        activeModuleId === module.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                    )}>
                                        {module.title}
                                    </span>
                                    {activeModuleId === module.id && <PlayCircle className="w-4 h-4 text-primary" />}
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Center: Content */}
                <div className="lg:col-span-9 space-y-8">
                    {course.modules.map((module) => (
                        <div 
                            key={module.id} 
                            className={activeModuleId === module.id ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}
                        >
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-foreground mb-2">{module.title}</h2>
                                <p className="text-muted-foreground">{module.description}</p>
                            </div>

                            <div className="space-y-6">
                                {module.content_blocks.map((block) => (
                                    <BlockRenderer 
                                        key={block.id} 
                                        block={block} 
                                        onProgressUpdate={handleProgressUpdate}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
