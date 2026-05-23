'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/admin/authService';
import Cookies from 'js-cookie';

// Module-level cache — survives client-side navigations, resets on full page refresh
let authCache: boolean | null = null;

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    // Initialize from cache so repeated navigations never flash the loading screen
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(authCache);

    useEffect(() => {
        // Login page needs no guard
        if (pathname === '/admin/login') return;

        // Already verified this session — state is already true from useState(authCache)
        if (authCache === true) return;

        const token = Cookies.get('auth_token');
        if (!token) {
            authCache = false;
            // Keep showing loading until redirect completes — no synchronous setState needed
            router.push('/admin/login');
            return;
        }

        authService.getCurrentUser()
            .then(user => {
                if (!user.is_admin) {
                    authCache = false;
                    setIsAuthenticated(false);
                    router.push('/admin/login');
                } else {
                    authCache = true;
                    setIsAuthenticated(true);
                }
            })
            .catch(() => {
                authCache = false;
                setIsAuthenticated(false);
                router.push('/admin/login');
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Login page — render immediately, no guard
    if (pathname === '/admin/login') return <>{children}</>;

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

    if (isAuthenticated === false) return null;

    return <>{children}</>;
}
