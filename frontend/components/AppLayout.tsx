'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';

// Pages that don't need the sidebar (auth pages)
const AUTH_PAGES = ['/login', '/register'];

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();
    
    // Check if current page is an auth page
    const isAuthPage = AUTH_PAGES.includes(pathname);
    
    // Auth pages should render without sidebar
    if (isAuthPage) {
        return <>{children}</>;
    }
    
    // For protected pages, show sidebar
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />
            <main className="flex-1 ml-64">
                {children}
            </main>
        </div>
    );
}
