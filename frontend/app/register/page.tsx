'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { register, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    // Redirect if already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsSubmitting(true);

        const result = await register(username, email, password);

        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.error || 'Registration failed');
            setIsSubmitting(false);
        }
    };

    // Password strength indicators
    const passwordStrength = {
        hasLength: password.length >= 6,
        hasLetter: /[a-zA-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
    };

    // Show loading if checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 pointer-events-none" />
            
            <Card className="w-full max-w-md relative z-10 border-border bg-card/95 backdrop-blur-sm shadow-2xl">
                <CardHeader className="text-center space-y-4">
                    {/* Logo */}
                    <div className="flex justify-center">
                        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                            <GraduationCap className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    
                    <div>
                        <CardTitle className="text-2xl font-bold text-foreground">
                            Join the Academy
                        </CardTitle>
                        <CardDescription className="text-muted-foreground mt-2">
                            Create your account and start your learning adventure
                        </CardDescription>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Username Field */}
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-foreground">
                                Username
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-background border-border focus:border-primary"
                                required
                                autoComplete="username"
                            />
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-background border-border focus:border-primary"
                                required
                                autoComplete="email"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-background border-border focus:border-primary pr-10"
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            
                            {/* Password Strength Indicators */}
                            {password && (
                                <div className="space-y-1 mt-2">
                                    <div className="flex items-center gap-2 text-xs">
                                        <CheckCircle2 className={`w-3 h-3 ${passwordStrength.hasLength ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                                        <span className={passwordStrength.hasLength ? 'text-emerald-500' : 'text-muted-foreground'}>
                                            At least 6 characters
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <CheckCircle2 className={`w-3 h-3 ${passwordStrength.hasLetter ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                                        <span className={passwordStrength.hasLetter ? 'text-emerald-500' : 'text-muted-foreground'}>
                                            Contains a letter
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <CheckCircle2 className={`w-3 h-3 ${passwordStrength.hasNumber ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                                        <span className={passwordStrength.hasNumber ? 'text-emerald-500' : 'text-muted-foreground'}>
                                            Contains a number
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-foreground">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-background border-border focus:border-primary"
                                required
                                autoComplete="new-password"
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-destructive">Passwords do not match</p>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={isSubmitting || password !== confirmPassword}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                    Creating account...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" />
                                    Create Account
                                </div>
                            )}
                        </Button>

                        {/* Login Link */}
                        <p className="text-sm text-muted-foreground text-center">
                            Already have an account?{' '}
                            <Link 
                                href="/login" 
                                className="text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                                Sign In
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
