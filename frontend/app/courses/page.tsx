'use client';

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    Search, Map, Clock, Users, BookOpen, Sparkles,
    Code, Globe, Database, Brain, Palette, Shield, Smartphone, Server,
    GraduationCap, Filter, X
} from 'lucide-react';

interface Course {
    id: number;
    title: string;
    description: string;
    instructor: number;
    instructor_name: string;
    category: string;
    difficulty: string;
    estimated_hours: number;
    image_url: string | null;
    tags: string[];
    is_featured: boolean;
    total_lessons: number;
    enrolled_count: number;
    modules_count: number;
    created_at: string;
    updated_at: string;
}

// Category configuration with icons and colors
const categoryConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
    PROGRAMMING: { icon: Code, label: 'Programming', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    WEB_DEV: { icon: Globe, label: 'Web Dev', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    DATA_SCIENCE: { icon: Database, label: 'Data Science', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    MACHINE_LEARNING: { icon: Brain, label: 'ML / AI', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
    DESIGN: { icon: Palette, label: 'Design', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    SECURITY: { icon: Shield, label: 'Security', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    MOBILE: { icon: Smartphone, label: 'Mobile', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    DEVOPS: { icon: Server, label: 'DevOps', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
};

const difficultyConfig: Record<string, { label: string; color: string }> = {
    BEGINNER: { label: 'Beginner', color: 'bg-emerald-500/20 text-emerald-400' },
    INTERMEDIATE: { label: 'Intermediate', color: 'bg-amber-500/20 text-amber-400' },
    ADVANCED: { label: 'Advanced', color: 'bg-rose-500/20 text-rose-400' },
};

export default function Courses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

    // Filter courses based on search and filters
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch = 
                    course.title.toLowerCase().includes(query) ||
                    course.description.toLowerCase().includes(query) ||
                    course.tags.some(tag => tag.toLowerCase().includes(query));
                if (!matchesSearch) return false;
            }

            // Category filter
            if (selectedCategory && course.category !== selectedCategory) {
                return false;
            }

            // Difficulty filter
            if (selectedDifficulty && course.difficulty !== selectedDifficulty) {
                return false;
            }

            // Tags filter
            if (selectedTags.length > 0) {
                const hasMatchingTag = selectedTags.some(tag => 
                    course.tags.includes(tag)
                );
                if (!hasMatchingTag) return false;
            }

            return true;
        });
    }, [courses, searchQuery, selectedCategory, selectedDifficulty, selectedTags]);

    // Get available tags from current courses
    const availableTags = useMemo(() => {
        const tagSet = new Set<string>();
        courses.forEach(course => {
            course.tags.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }, [courses]);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) 
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory(null);
        setSelectedDifficulty(null);
        setSelectedTags([]);
    };

    const hasActiveFilters = searchQuery || selectedCategory || selectedDifficulty || selectedTags.length > 0;

    if (loading) {
        return (
            <div className="min-h-screen p-8 flex items-center justify-center">
                <div className="text-muted-foreground animate-pulse">Loading courses...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 bg-gradient-to-b from-background to-background/95">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <GraduationCap className="h-10 w-10 text-primary" />
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                            Course Catalog
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Every course and project that AdaptiveLearn offers
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-4 py-6 text-lg bg-card/50 border-primary/20 focus:border-primary rounded-xl"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Filter Section */}
                <div className="space-y-4">
                    {/* Category Filters */}
                    <div className="flex flex-wrap items-center gap-2 justify-center">
                        <span className="text-sm text-muted-foreground mr-2">
                            <Filter className="h-4 w-4 inline mr-1" />
                            Category:
                        </span>
                        {Object.entries(categoryConfig).map(([key, { icon: Icon, label, color }]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                                className={`
                                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                                    border transition-all duration-200
                                    ${selectedCategory === key 
                                        ? `${color} border-current` 
                                        : 'bg-card/50 border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                                    }
                                `}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Difficulty Filters */}
                    <div className="flex flex-wrap items-center gap-2 justify-center">
                        <span className="text-sm text-muted-foreground mr-2">Level:</span>
                        {Object.entries(difficultyConfig).map(([key, { label, color }]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedDifficulty(selectedDifficulty === key ? null : key)}
                                className={`
                                    px-3 py-1.5 rounded-full text-sm font-medium
                                    border transition-all duration-200
                                    ${selectedDifficulty === key 
                                        ? `${color} border-current` 
                                        : 'bg-card/50 border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                                    }
                                `}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Tag Filters */}
                    <div className="flex flex-wrap items-center gap-2 justify-center">
                        <span className="text-sm text-muted-foreground mr-2">Tags:</span>
                        {availableTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`
                                    px-2.5 py-1 rounded-md text-xs font-medium
                                    border transition-all duration-200
                                    ${selectedTags.includes(tag)
                                        ? 'bg-primary/20 text-primary border-primary/50'
                                        : 'bg-card/30 border-border hover:border-primary/30 text-muted-foreground hover:text-foreground'
                                    }
                                `}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <div className="flex justify-center">
                            <button
                                onClick={clearFilters}
                                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                            >
                                <X className="h-4 w-4" />
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                    <p className="text-muted-foreground">
                        Showing <span className="text-foreground font-medium">{filteredCourses.length}</span> of {courses.length} courses
                    </p>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => {
                        const catConfig = categoryConfig[course.category] || categoryConfig.PROGRAMMING;
                        const diffConfig = difficultyConfig[course.difficulty] || difficultyConfig.BEGINNER;
                        const CategoryIcon = catConfig.icon;
                        
                        return (
                            <Card 
                                key={course.id} 
                                className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col"
                            >
                                {/* Course Image */}
                                <div className="relative h-44 bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
                                    {course.image_url ? (
                                        <img
                                            src={course.image_url}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-purple-500/10">
                                            <CategoryIcon className="h-16 w-16 text-primary/50" />
                                        </div>
                                    )}
                                    
                                    {/* Featured Badge */}
                                    {course.is_featured && (
                                        <div className="absolute top-3 right-3">
                                            <Badge className="bg-amber-500/90 text-white border-0 gap-1">
                                                <Sparkles className="h-3 w-3" />
                                                Featured
                                            </Badge>
                                        </div>
                                    )}
                                    
                                    {/* Category Badge */}
                                    <div className="absolute top-3 left-3">
                                        <Badge className={`${catConfig.color} border gap-1`}>
                                            <CategoryIcon className="h-3 w-3" />
                                            {catConfig.label}
                                        </Badge>
                                    </div>

                                    {/* Difficulty Badge */}
                                    <div className="absolute bottom-3 left-3">
                                        <Badge className={`${diffConfig.color} border-0`}>
                                            {diffConfig.label}
                                        </Badge>
                                    </div>
                                </div>

                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                                        {course.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 text-sm">
                                        {course.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pb-2 flex-grow">
                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {course.tags.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 bg-muted/50 rounded text-xs text-muted-foreground"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {course.tags.length > 3 && (
                                            <span className="px-2 py-0.5 text-xs text-muted-foreground">
                                                +{course.tags.length - 3}
                                            </span>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <BookOpen className="h-4 w-4" />
                                            <span>{course.total_lessons} lessons</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>{course.estimated_hours}h</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span>{course.enrolled_count}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                
                                <CardFooter className="pt-2 border-t border-border/30">
                                    <Button 
                                        asChild 
                                        className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                                    >
                                        <Link href={`/courses/${course.id}`}>
                                            Start Learning
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredCourses.length === 0 && (
                    <div className="text-center py-16">
                        <Map className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-foreground mb-2">No courses found</h3>
                        <p className="text-muted-foreground mb-4">
                            Try adjusting your search or filters
                        </p>
                        <Button variant="outline" onClick={clearFilters}>
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
