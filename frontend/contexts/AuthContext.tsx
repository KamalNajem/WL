'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api from '@/lib/axios';

interface StudentProfile {
    vark_scores: Record<string, number>;
    fslsm_scores: Record<string, number>;
    total_study_hours: number;
    video_watch_duration: number;
    text_reading_duration: number;
    quiz_attempts: number;
    attendance: number;
    resources_visited: number;
    extracurricular_activities: boolean;
    motivation_level: string | null;
    internet_usage: number;
    exam_score: number;
    gamification_points: number;
    current_level: number;
    badges_earned: string[];
}

interface User {
    id: number;
    username: string;
    email: string;
    is_student: boolean;
    selected_framework: string | null;
    current_style_label: string | null;
    student_profile: StudentProfile | null;
    gamification_points: number;
    current_level: number;
    badges_earned: string[];
    date_joined: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check authentication status on mount
    const checkAuth = useCallback(async () => {
        try {
            // First, get CSRF token
            await api.get('auth/csrf/');
            
            // Then check if user is logged in
            const response = await api.get('auth/me/');
            if (response.data.authenticated) {
                setUser(response.data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await api.post('auth/login/', { username, password });
            setUser(response.data.user);
            return { success: true };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
            return { success: false, error: errorMessage };
        }
    };

    const register = async (username: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await api.post('auth/register/', { username, email, password });
            setUser(response.data.user);
            return { success: true };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
            return { success: false, error: errorMessage };
        }
    };

    const logout = async (): Promise<void> => {
        try {
            // Ensure we have a CSRF token before making the POST request
            await api.get('auth/csrf/');
            await api.post('auth/logout/');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            // Redirect to login page
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
    };

    const refreshUser = async (): Promise<void> => {
        try {
            const response = await api.get('auth/me/');
            if (response.data.authenticated) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    return (
        <AuthContext.Provider 
            value={{ 
                user, 
                isLoading, 
                isAuthenticated: !!user,
                login, 
                register, 
                logout,
                refreshUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
