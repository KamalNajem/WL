'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { LayoutDashboard, BookOpen, FileQuestion, User, GraduationCap, BarChart3, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/ModeToggle';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
    username: string;
    current_level: number;
}

export default function Sidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState<UserProfile | null>(null);
    const { logout, user: authUser } = useAuth();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('users/me/');
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user for sidebar:', error);
            }
        };
        fetchUser();
    }, []);

    // Filter nav items based on user role
    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Courses', href: '/courses', icon: BookOpen },
        { name: 'Quizzes', href: '/quiz', icon: FileQuestion },
        { name: 'Profile', href: '/profile', icon: User },
        // Only show Instructor link if user is NOT a student
        ...(!authUser?.is_student ? [{ name: 'Instructor', href: '/instructor', icon: BarChart3 }] : []),
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50">
            {/* Logo Area */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-2">
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                        AdaptiveLearn
                    </h1>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                                isActive 
                                    ? "bg-primary/10 text-primary border border-primary/20" 
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile Area */}
            <div className="p-4 border-t border-border bg-card/50">
                {user ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm border border-primary/20 group-hover:border-primary/50 transition-colors">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{user.username}</p>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <p className="text-xs text-emerald-500 font-medium">Lvl {user.current_level || 1}</p>
                                </div>
                            </div>
                            <ModeToggle />
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                ) : (
                    <div className="animate-pulse flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-muted rounded w-20"></div>
                            <div className="h-2 bg-muted rounded w-12"></div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
