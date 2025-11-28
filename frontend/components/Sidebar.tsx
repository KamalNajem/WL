'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface UserProfile {
    username: string;
    current_level: number;
}

export default function Sidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState<UserProfile | null>(null);

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

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: '📊' },
        { name: 'Courses', href: '/courses', icon: '📚' },
        { name: 'Quizzes', href: '/quiz', icon: '📝' },
        { name: 'Profile', href: '/profile', icon: '👤' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50">
            {/* Logo Area */}
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
                    AdaptiveLearn
                </h1>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                                isActive 
                                    ? 'bg-slate-800 text-purple-400 border border-slate-700' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                        >
                            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile Area */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                {user ? (
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-200 truncate">{user.username}</p>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                <p className="text-xs text-emerald-400 font-medium">Lvl {user.current_level || 1}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-pulse flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-slate-800 rounded w-20"></div>
                            <div className="h-2 bg-slate-800 rounded w-12"></div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
