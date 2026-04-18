'use client';

import { useState, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User as UserType } from '@/services/admin/userService';
import {
    LayoutDashboard,
    Users,
    Video,
    AlertCircle,
    BarChart3,
    HardDrive,
    CreditCard,
    Shield,
    FileText,
    Settings,
    Search,
    Bell,
    ChevronDown,
    Menu,
    X,
    LogOut,
    User,
    Moon,
    Sun,
    Repeat,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthGuard from '@/components/auth/AuthGuard';
import { authService } from '@/services/admin/authService';
import { toast } from 'sonner';
import CommandPalette from '@/components/admin/CommandPalette';

interface AdminLayoutProps {
    children: ReactNode;
}

interface NavItem {
    name: string;
    path: string;
    icon: any;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [user, setUser] = useState<UserType | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await authService.getCurrentUser();
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user in AdminLayout:", error);
            }
        };
        fetchUser();
    }, []);

    const navItems: NavItem[] = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Videos', path: '/admin/videos', icon: Video },
        { name: 'Reports', path: '/admin/reports', icon: AlertCircle },
        { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
        { name: 'Storage', path: '/admin/storage', icon: HardDrive },
        { name: 'Plans', path: '/admin/plans', icon: CreditCard },
        { name: 'Subscriptions', path: '/admin/subscriptions', icon: Repeat },
        { name: 'Admins', path: '/admin/admins', icon: Shield },
        { name: 'IP Addresses', path: '/admin/ips', icon: FileText },
        { name: 'Logs', path: '/admin/logs', icon: FileText },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    const notifications = [
        { id: 1, text: 'New user registered: john@example.com', time: '5 min ago', unread: true },
        { id: 2, text: 'Video reported by user', time: '15 min ago', unread: true },
        { id: 3, text: 'Storage limit reached for user', time: '1 hour ago', unread: false },
    ];

    return (
        <AuthGuard>
            <div
                className="min-h-screen flex"
                style={{
                    backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                }}
            >
                {/* Sidebar */}
                <aside
                    className="fixed left-0 top-0 bottom-0 z-30 transition-all duration-300"
                    style={{
                        width: sidebarOpen ? '280px' : '80px',
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        borderRight: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                    }}
                >
                    {/* Logo */}
                    <div
                        className="h-16 flex items-center justify-between px-6"
                        style={{ borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}` }}
                    >
                        {sidebarOpen ? (
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{
                                        background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)',
                                    }}
                                >
                                    <Video size={18} strokeWidth={1.5} color="#ffffff" />
                                </div>
                                <span
                                    className="font-semibold text-[16px] leading-[24px]"
                                    style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                >
                                    EdithPro Admin
                                </span>
                            </div>
                        ) : (
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto"
                                style={{
                                    background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)',
                                }}
                            >
                                <Video size={18} strokeWidth={1.5} color="#ffffff" />
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all group"
                                    style={{
                                        backgroundColor: isActive
                                            ? (isDarkMode ? 'rgba(140,0,255,0.15)' : '#f3eefe')
                                            : 'transparent',
                                        color: isActive ? '#8c00ff' : (isDarkMode ? '#94A3B8' : '#64748B'),
                                    }}
                                >
                                    <Icon size={20} strokeWidth={1.5} />
                                    {sidebarOpen && (
                                        <span className="text-[14px] leading-[22px] font-medium">
                                            {item.name}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>


                    {/* Logout Button */}
                    <div className="absolute bottom-20 left-0 right-0 px-4">
                        <button
                            onClick={async () => {
                                try {
                                    await authService.logout();
                                    toast.success("Logged out successfully");
                                } catch (error) {
                                    toast.error("Logout failed");
                                }
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"
                        >
                            <LogOut size={20} strokeWidth={1.5} />
                            {sidebarOpen && (
                                <span className="text-[14px] leading-[22px] font-medium">Logout</span>
                            )}
                        </button>
                    </div>

                    {/* Toggle Button */}
                    <div className="absolute bottom-4 left-0 right-0 px-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all"
                            style={{
                                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                color: isDarkMode ? '#94A3B8' : '#64748B',
                            }}
                        >
                            {sidebarOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
                            {sidebarOpen && (
                                <span className="text-[14px] leading-[22px] font-medium">Collapse</span>
                            )}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div
                    className="flex-1 transition-all duration-300"
                    style={{
                        marginLeft: sidebarOpen ? '280px' : '80px',
                    }}
                >
                    {/* Header */}
                    <header
                        className="sticky top-0 z-20 h-16 flex items-center justify-between px-8"
                        style={{
                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                        }}
                    >
                        {/* Search */}
                        <div className="flex-1 max-w-xl">
                            <div
                                className="relative"
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    borderRadius: '12px',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                }}
                            >
                                <Search
                                    size={18}
                                    strokeWidth={1.5}
                                    className="absolute left-4 top-1/2 -translate-y-1/2"
                                    style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Search users, videos, reports..."
                                    className="w-full pl-12 pr-4 py-2.5 bg-transparent outline-none text-[14px] leading-[22px]"
                                    style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                />
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {/* Theme Toggle */}
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    color: isDarkMode ? '#94A3B8' : '#64748B',
                                }}
                            >
                                {isDarkMode ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
                            </button>

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setShowNotifications(!showNotifications);
                                        setShowProfileMenu(false);
                                    }}
                                    className="relative w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                                    style={{
                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                        color: isDarkMode ? '#94A3B8' : '#64748B',
                                    }}
                                >
                                    <Bell size={18} strokeWidth={1.5} />
                                    <span
                                        className="absolute top-1 right-1 w-2 h-2 rounded-full"
                                        style={{ backgroundColor: '#ef4444' }}
                                    />
                                </button>

                                {/* Notifications Dropdown */}
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl overflow-hidden"
                                            style={{
                                                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                            }}
                                        >
                                            <div
                                                className="px-4 py-3 font-semibold text-[14px] leading-[22px]"
                                                style={{
                                                    color: isDarkMode ? '#ffffff' : '#0F172A',
                                                    borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                                }}
                                            >
                                                Notifications
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        className="px-4 py-3 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5"
                                                        style={{
                                                            backgroundColor: notif.unread
                                                                ? (isDarkMode ? 'rgba(140,0,255,0.05)' : '#faf5ff')
                                                                : 'transparent',
                                                            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC'}`,
                                                        }}
                                                    >
                                                        <p
                                                            className="text-[13px] leading-[20px] mb-1"
                                                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                                        >
                                                            {notif.text}
                                                        </p>
                                                        <span
                                                            className="text-[11px] leading-[16px]"
                                                            style={{ color: '#94A3B8' }}
                                                        >
                                                            {notif.time}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Profile */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setShowProfileMenu(!showProfileMenu);
                                        setShowNotifications(false);
                                    }}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-white/5"
                                    style={{
                                        backgroundColor: showProfileMenu
                                            ? (isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC')
                                            : 'transparent',
                                    }}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                                        style={{
                                            background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)',
                                        }}
                                    >
                                        {user?.picture ? (
                                            <img src={user?.picture || ''} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white text-[12px] leading-[18px] font-semibold">
                                                {user?.first_name ? user.first_name[0].toUpperCase() : 'A'}
                                                {user?.last_name ? user.last_name[0].toUpperCase() : 'D'}
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        className="text-[14px] leading-[22px] font-medium"
                                        style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                    >
                                        {user ? `${user?.first_name} ${user?.last_name || ''}`.trim() || user?.email.split('@')[0] : 'Admin User'}
                                    </span>
                                    <ChevronDown
                                        size={16}
                                        strokeWidth={1.5}
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    />
                                </button>

                                {/* Profile Dropdown */}
                                <AnimatePresence>
                                    {showProfileMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl overflow-hidden"
                                            style={{
                                                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                            }}
                                        >
                                            <div className="py-2">
                                                <button
                                                    className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                                                >
                                                    <User size={16} strokeWidth={1.5} style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} />
                                                    <span
                                                        className="text-[13px] leading-[20px]"
                                                        style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                                    >
                                                        Profile
                                                    </span>
                                                </button>

                                                <button
                                                    className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                                                >
                                                    <Settings size={16} strokeWidth={1.5} style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} />
                                                    <span
                                                        className="text-[13px] leading-[20px]"
                                                        style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                                    >
                                                        Settings
                                                    </span>
                                                </button>

                                                <div
                                                    className="my-2 mx-4"
                                                    style={{
                                                        height: '1px',
                                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                                                    }}
                                                />

                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await authService.logout();
                                                            toast.success("Logged out successfully");
                                                        } catch (error) {
                                                            toast.error("Logout failed");
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                                                    style={{ color: '#ef4444' }}
                                                >
                                                    <LogOut size={16} strokeWidth={1.5} />
                                                    <span className="text-[13px] leading-[20px]">Logout</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="p-8">
                        {children}
                    </main>
                </div>

                {/* Command Palette */}
                <CommandPalette />

                {/* Click outside to close dropdowns */}
                {
                    (showProfileMenu || showNotifications) && (
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => {
                                setShowProfileMenu(false);
                                setShowNotifications(false);
                            }}
                        />
                    )
                }
            </div >
        </AuthGuard >
    );
}
