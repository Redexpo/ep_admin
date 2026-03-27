'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    Download,
    MoreVertical,
    Eye,
    Ban,
    Trash2,
    Key,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Users,
    Clock,
    UserCheck,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { userService, User, UserStats } from '@/services/admin/userService';
import { toast } from 'sonner';

export default function AdminUsersPage() {
    const [isDarkMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        perPage: 10
    });
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isStatsLoading, setIsStatsLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        try {
            setIsStatsLoading(true);
            const response = await userService.getUserStats();
            setStats(response.data);
        } catch (error: any) {
            console.error("Failed to fetch user stats:", error);
        } finally {
            setIsStatsLoading(false);
        }
    }, []);

    const fetchUsers = useCallback(async (page: number) => {
        try {
            setIsLoading(true);
            const response = await userService.getUsers(page, 10);
            if (response.status === 'success') {
                setUsers(response.data.results);
                setPagination({
                    total: response.data.pagination.total,
                    totalPages: response.data.pagination.total_pages,
                    perPage: response.data.pagination.per_page
                });
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(currentPage);
        fetchStats();
    }, [currentPage, fetchUsers, fetchStats]);

    const getPlanColor = (plan: string) => {
        switch (plan) {
            case 'Free':
                return { color: '#64748B', bg: 'rgba(100, 116, 139, 0.1)' };
            case 'Pro':
                return { color: '#8c00ff', bg: 'rgba(140, 0, 255, 0.1)' };
            case 'Business':
                return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
            default:
                return { color: '#64748B', bg: 'rgba(100, 116, 139, 0.1)' };
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1
                            className="text-[28px] leading-[36px] font-semibold mb-2"
                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                        >
                            Users Management
                        </h1>
                        <p
                            className="text-[14px] leading-[22px]"
                            style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                        >
                            Manage and monitor all platform users
                        </p>
                    </div>

                    <button
                        className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                        style={{
                            background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)',
                            color: '#ffffff',
                            fontSize: '14px',
                            lineHeight: '22px',
                        }}
                    >
                        <Download size={18} strokeWidth={1.5} />
                        Export Users
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
                    {isStatsLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="min-w-[260px] flex-shrink-0 lg:min-w-0 rounded-2xl p-6 shadow-sm animate-pulse"
                                style={{
                                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-100 mb-4" />
                                <div className="h-4 w-24 bg-slate-100 rounded mb-2" />
                                <div className="h-8 w-32 bg-slate-100 rounded mb-1" />
                                <div className="h-3 w-40 bg-slate-50 rounded" />
                            </div>
                        ))
                    ) : stats ? (
                        <>
                            {[
                                { label: 'Total Users', value: stats.total_users.value, change: stats.total_users.change, trend: stats.total_users.trend, icon: Users, color: '#8c00ff' },
                                { label: 'Active Users', value: stats.active_users.value, change: stats.active_users.change, trend: stats.active_users.trend, icon: UserCheck, color: '#22c55e' },
                                { label: 'New Users (7d)', value: stats.new_users_7d.value, change: stats.new_users_7d.change, trend: stats.new_users_7d.trend, icon: Clock, color: '#3b82f6' },
                                { label: 'Verified Users', value: stats.verified_users.value, change: stats.verified_users.change, trend: stats.verified_users.trend, icon: TrendingUp, color: '#f59e0b' },
                            ].map((stat, index) => (
                                <div
                                    key={index}
                                    className="min-w-[260px] flex-shrink-0 lg:min-w-0 rounded-2xl p-6 shadow-sm"
                                    style={{
                                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                    }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                        style={{ backgroundColor: `${stat.color}15` }}
                                    >
                                        <stat.icon size={24} strokeWidth={1.5} style={{ color: stat.color }} />
                                    </div>
                                    <p
                                        className="text-[12px] leading-[18px] font-medium mb-2"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        {stat.label}
                                    </p>
                                    <h3
                                        className="text-[28px] leading-[36px] font-semibold mb-1"
                                        style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                    >
                                        {stat.value.toLocaleString()}
                                    </h3>
                                    <span className="text-[12px] leading-[18px] font-medium" style={{ color: '#22c55e' }}>
                                        {stat.change} from last week
                                    </span>
                                </div>
                            ))}
                        </>
                    ) : null}
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <div
                        className="flex-1 relative"
                        style={{
                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
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
                            placeholder="Search by name, email, or user ID..."
                            className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-[14px] leading-[22px]"
                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                        />
                    </div>

                    <button
                        className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all hover:bg-gray-50 border border-[#E2E8F0] shadow-sm"
                        style={{
                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            color: isDarkMode ? '#ffffff' : '#0F172A',
                            fontSize: '14px',
                            lineHeight: '22px',
                        }}
                    >
                        <Filter size={18} strokeWidth={1.5} />
                        Filters
                    </button>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2">
                    {['all', 'free', 'pro', 'business', 'suspended'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setSelectedFilter(filter)}
                            className="px-4 py-2 rounded-lg text-[13px] leading-[20px] font-medium capitalize transition-all"
                            style={{
                                backgroundColor:
                                    selectedFilter === filter
                                        ? (isDarkMode ? 'rgba(140,0,255,0.15)' : '#f3eefe')
                                        : (isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC'),
                                color: selectedFilter === filter ? '#8c00ff' : (isDarkMode ? '#94A3B8' : '#64748B'),
                                border: selectedFilter === filter ? '1.5px solid #8c00ff' : 'none',
                            }}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Users Table */}
                <div
                    className="rounded-2xl overflow-hidden shadow-sm"
                    style={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                    }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr
                                    style={{
                                        borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                    }}
                                >
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        User
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Plan
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Auth
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Videos
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Storage
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Created
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Status
                                    </th>
                                    <th
                                        className="text-right px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                                                    <div className="space-y-2">
                                                        <div className="h-4 w-24 bg-slate-200 rounded" />
                                                        <div className="h-3 w-32 bg-slate-200 rounded" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td colSpan={7} className="px-6 py-4">
                                                <div className="h-4 w-full bg-slate-100 rounded" />
                                            </td>
                                        </tr>
                                    ))
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user: User) => {
                                        // Mock plan for now as it's not in the base user object
                                        const plan = 'Free';
                                        const planStyle = getPlanColor(plan);
                                        const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Anonymous';
                                        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                                        const status = user.is_active ? 'active' : 'inactive';
                                        const formattedDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        }) : 'N/A';

                                        return (
                                            <tr
                                                key={user.id}
                                                className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
                                                style={{
                                                    borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC'}`,
                                                }}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {user.picture ? (
                                                            <img
                                                                src={user.picture}
                                                                alt={name}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div
                                                                className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner"
                                                                style={{
                                                                    background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)',
                                                                }}
                                                            >
                                                                <span className="text-white text-[12px] leading-[18px] font-semibold">
                                                                    {initials}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div
                                                                className="text-[14px] leading-[22px] font-medium flex items-center gap-2"
                                                                style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                                            >
                                                                {name}
                                                                {user.is_admin && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-[#8c00ff] to-[#7c3aed] text-white shadow-sm ring-1 ring-purple-200">
                                                                        ADMIN
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div
                                                                className="text-[12px] leading-[18px]"
                                                                style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                                            >
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className="inline-flex px-3 py-1 rounded-full text-[12px] leading-[18px] font-medium"
                                                        style={{
                                                            backgroundColor: planStyle.bg,
                                                            color: planStyle.color,
                                                        }}
                                                    >
                                                        {plan}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] leading-[18px] font-medium capitalize"
                                                        style={{
                                                            backgroundColor: user.auth_provider === 'google' ? 'rgba(66, 133, 244, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                                                            color: user.auth_provider === 'google' ? '#4285F4' : '#64748B',
                                                        }}
                                                    >
                                                        {user.auth_provider || 'Email'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className="text-[14px] leading-[22px]"
                                                        style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                                    >
                                                        0
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className="text-[14px] leading-[22px]"
                                                        style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                                    >
                                                        0 MB
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className="text-[14px] leading-[22px]"
                                                        style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                                    >
                                                        {formattedDate}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className="inline-flex px-3 py-1 rounded-full text-[12px] leading-[18px] font-medium capitalize"
                                                        style={{
                                                            backgroundColor:
                                                                status === 'active'
                                                                    ? 'rgba(34, 197, 94, 0.1)'
                                                                    : 'rgba(239, 68, 68, 0.1)',
                                                            color: status === 'active' ? '#22c55e' : '#ef4444',
                                                        }}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:bg-gray-100 dark:hover:bg-white/10"
                                                            style={{
                                                                backgroundColor: isDarkMode
                                                                    ? 'rgba(255,255,255,0.05)'
                                                                    : '#F8FAFC',
                                                            }}
                                                        >
                                                            <Eye
                                                                size={16}
                                                                strokeWidth={1.5}
                                                                style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                                            />
                                                        </button>
                                                        <button
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:bg-gray-100 dark:hover:bg-white/10"
                                                            style={{
                                                                backgroundColor: isDarkMode
                                                                    ? 'rgba(255,255,255,0.05)'
                                                                    : '#F8FAFC',
                                                            }}
                                                        >
                                                            <MoreVertical
                                                                size={16}
                                                                strokeWidth={1.5}
                                                                style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div
                        className="flex items-center justify-between px-6 py-4"
                        style={{
                            borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                        }}
                    >
                        <span
                            className="text-[13px] leading-[20px]"
                            style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                        >
                            Showing {((currentPage - 1) * pagination.perPage) + 1}-{Math.min(currentPage * pagination.perPage, pagination.total)} of {pagination.total} users
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1 || isLoading}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                }}
                            >
                                <ChevronLeft
                                    size={16}
                                    strokeWidth={1.5}
                                    style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                />
                            </button>
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage >= pagination.totalPages || isLoading}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                }}
                            >
                                <ChevronRight
                                    size={16}
                                    strokeWidth={1.5}
                                    style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
