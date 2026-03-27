'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/admin/authService';
import Cookies from 'js-cookie';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            // Skip check for login page
            if (pathname === '/admin/login') {
                setIsAuthenticated(true);
                return;
            }

            const token = Cookies.get('auth_token');
            if (!token) {
                setIsAuthenticated(false);
                router.push('/admin/login');
                return;
            }

            try {
                const user = await authService.getCurrentUser();
                if (!user.is_admin) {
                    console.error("AuthGuard: User is not an admin");
                    setIsAuthenticated(false);
                    router.push('/admin/login');
                    return;
                }
                setIsAuthenticated(true);
            } catch (error) {
                console.error("AuthGuard verification failed:", error);
                setIsAuthenticated(false);
                router.push('/admin/login');
            }
        };

        checkAuth();
    }, [pathname, router]);

    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#8c00ff] border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse text-[14px]">Verifying Session...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated === false && pathname !== '/admin/login') {
        return null;
    }

    return <>{children}</>;
}
