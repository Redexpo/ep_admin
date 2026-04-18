'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
        page: 1,
        per_page: 10,
        total_pages: 1
    });
    const [stats, setStats] = useState<UserStats | null>(null);

    const fetchUsers = useCallback(async (page: number) => {
        try {
            setIsLoading(true);
            const response = await userService.getUsers(page, 10);
            if (response.data) {
                setUsers(response.data.results);
                setPagination(response.data.pagination);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const response = await userService.getUserStats();
            if (response.data) {
                setStats(response.data);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch stats");
        }
    }, []);

    useEffect(() => {
        fetchUsers(currentPage);
    }, [fetchUsers, currentPage]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Format numbers
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const statsCards = stats ? [
        { label: 'Total Users', value: formatNumber(stats.total_users.value), change: stats.total_users.change, trend: stats.total_users.trend, icon: Users, color: '#8c00ff' },
        { label: 'Verified Users', value: formatNumber(stats.verified_users.value), change: stats.verified_users.change, trend: stats.verified_users.trend, icon: UserCheck, color: '#22c55e' },
        { label: 'Active Users', value: formatNumber(stats.active_users.value), change: stats.active_users.change, trend: stats.active_users.trend, icon: Clock, color: '#3b82f6' },
        { label: 'New Today', value: formatNumber(stats.new_users_7d.value), change: stats.new_users_7d.change, trend: stats.new_users_7d.trend, icon: TrendingUp, color: '#f59e0b' },
    ] : [];

    return (
        <AdminLayout>
            <div className={`space-y-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[32px] font-bold tracking-tight">User Management</h1>
                        <p className={`text-[16px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            View and manage your platform's users and their permissions.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[14px] font-semibold hover:bg-slate-50 transition-all">
                            <Download size={18} />
                            Export Data
                        </button>
                        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8c00ff] text-white text-[14px] font-semibold shadow-lg shadow-purple-200 hover:bg-[#7c00e0] transition-all active:scale-95">
                            + Add New User
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {!stats ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="rounded-2xl p-4 shadow-sm border border-[#E2E8F0] animate-pulse h-[110px]" style={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' }}>
                                <div className="h-4 w-24 bg-slate-200 rounded mb-4" />
                                <div className="h-8 w-16 bg-slate-200 rounded" />
                            </div>
                        ))
                    ) : (
                        statsCards.map((stat, index) => (
                            <div
                                key={index}
                                className="rounded-2xl p-4 shadow-sm border border-[#E2E8F0] min-w-[220px]"
                                style={{
                                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                }}
                            >
                                <p
                                    className="text-[16px] leading-[24px] font-bold mb-1"
                                    style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                >
                                    {stat.label}
                                </p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-[28px] leading-[36px] font-semibold tracking-tight">
                                        {stat.value}
                                    </h3>
                                    <div className={`flex items-center gap-1 text-[12px] font-bold mb-1 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                        {stat.change}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                    {/* Table Filters */}
                    <div className="p-6 border-b border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#8c00ff] focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex p-1 bg-slate-100 rounded-xl">
                                {['All', 'Active', 'Pending'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setSelectedFilter(filter.toLowerCase())}
                                        className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${selectedFilter === filter.toLowerCase()
                                            ? 'bg-white text-[#0F172A] shadow-sm'
                                            : 'text-[#64748B] hover:text-[#0F172A]'
                                            }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                            <button className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 transition-all text-slate-600">
                                <Filter size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Auth</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Videos</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F1F5F9]">
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={7} className="px-6 py-4 h-[72px] bg-slate-50/10" />
                                        </tr>
                                    ))
                                ) : users.map((user) => {
                                    const name = `${user.first_name} ${user.last_name}`;
                                    const initials = `${user.first_name[0]}${user.last_name[0]}`;
                                    const joinedDate = new Date(user.created_at);
                                    const formattedDate = joinedDate.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    });
                                    const status = user.subscription_status || (user.is_active ? 'active' : 'inactive');
                                    const plan = user.plan_name || 'Starter';

                                    return (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3 group/link hover:opacity-80 transition-opacity">
                                                    {user.picture ? (
                                                        <img src={user.picture} alt={name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner" style={{ background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)' }}>
                                                            <span className="text-white text-[12px] font-bold">{initials}</span>
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[14px] font-bold text-[#0F172A] group-hover/link:text-[#8c00ff] transition-colors line-clamp-1">
                                                                {name}
                                                            </p>
                                                            {user.is_admin && (
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 text-[9px] font-bold uppercase border border-purple-100">
                                                                    Admin
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[12px] text-[#64748B] line-clamp-1 blur-[3.5px] group-hover:blur-0 transition-all duration-300">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-lg text-[12px] font-bold ${plan === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                                                        plan === 'Pro' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-[#0F172A]'
                                                    }`}>
                                                    {plan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 text-[12px] font-bold capitalize ${user.auth_provider === 'google' ? 'text-blue-600' : 'text-slate-500'}`}>
                                                    {user.auth_provider || 'Email'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[14px] font-bold text-[#0F172A]">{user.recordings_count || 0}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[13px] text-[#64748B]">{formattedDate}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 rounded-md text-[11px] font-bold uppercase ${status === 'active' || status === 'free' ? 'bg-green-50 text-green-600' :
                                                        status === 'past_due' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 transition-all">
                                                    <Link href={`/admin/users/${user.id}`} className="p-2 rounded-lg bg-slate-50 hover:bg-white hover:shadow-sm border border-[#E2E8F0] transition-all">
                                                        <Eye size={16} className="text-[#64748B]" />
                                                    </Link>
                                                    <button className="p-2 rounded-lg bg-slate-50 hover:bg-white hover:shadow-sm border border-[#E2E8F0] transition-all">
                                                        <MoreVertical size={16} className="text-[#64748B]" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-6 border-t border-[#F1F5F9] flex items-center justify-between">
                        <p className="text-[13px] text-[#64748B]">
                            Page <span className="font-bold text-[#0F172A]">{currentPage}</span> of {pagination.total_pages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1 || isLoading}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="flex items-center justify-center w-10 h-10 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 transition-all disabled:opacity-40"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                disabled={currentPage === pagination.total_pages || isLoading}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="flex items-center justify-center w-10 h-10 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 transition-all disabled:opacity-40"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
