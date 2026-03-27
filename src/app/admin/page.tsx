'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Video,
    HardDrive,
    TrendingUp,
    ArrowUp,
    ArrowDown,
    MoreVertical,
    UserPlus,
    Upload,
    Trash2,
    UserCheck,
    AlertCircle,
    Activity,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { dashboardService, DashboardStats, RecentActivity, GrowthData } from '@/services/admin/dashboardService';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartConfig
} from '@/components/ui/chart';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

const chartConfig = {
    users: {
        label: "New Users",
        color: "#8c00ff",
    },
    videos: {
        label: "New Videos",
        color: "#3b82f6",
    },
} satisfies ChartConfig;

export default function AdminDashboard() {
    const [isDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activity, setActivity] = useState<RecentActivity[]>([]);
    const [growthData, setGrowthData] = useState<GrowthData | null>(null);

    const fetchDashboardData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await dashboardService.getDashboardStats();
            if (response.status === 'success') {
                setStats(response.data.stats);
                setActivity(response.data.activity);
                setGrowthData(response.data.growth_data);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch dashboard data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const statsCards = stats ? [
        {
            label: 'Total Users',
            value: stats.total_users.value.toLocaleString(),
            change: stats.total_users.change,
            trend: stats.total_users.trend,
            icon: Users,
            color: '#8c00ff',
            bgColor: 'rgba(140, 0, 255, 0.1)',
        },
        {
            label: 'Active Users (24h)',
            value: stats.active_users_24h.value.toLocaleString(),
            change: stats.active_users_24h.change,
            trend: stats.active_users_24h.trend,
            icon: UserCheck,
            color: '#22c55e',
            bgColor: 'rgba(34, 197, 94, 0.1)',
        },
        {
            label: 'Total Videos',
            value: stats.total_videos.value.toLocaleString(),
            change: stats.total_videos.change,
            trend: stats.total_videos.trend,
            icon: Video,
            color: '#3b82f6',
            bgColor: 'rgba(59, 130, 246, 0.1)',
        },
        {
            label: 'Reported Videos',
            value: stats.reported_videos.value.toLocaleString(),
            change: stats.reported_videos.change,
            trend: stats.reported_videos.trend,
            icon: AlertCircle,
            color: '#ef4444',
            bgColor: 'rgba(239, 68, 68, 0.1)',
        },
    ] : [];

    // Prepare data for Recharts
    const chartData = growthData ? growthData.labels.map((label, index) => ({
        name: label,
        users: growthData.users[index],
        videos: growthData.videos[index],
    })) : [];

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 60) return `${diffMins} mins ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;
        return date.toLocaleDateString();
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1
                            className="text-[32px] leading-[40px] font-semibold mb-2"
                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                        >
                            Dashboard
                        </h1>
                        <p
                            className="text-[14px] leading-[22px]"
                            style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                        >
                            Welcome back! Here's what's happening with your platform today.
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-2xl p-6 shadow-sm animate-pulse bg-white border border-[#E2E8F0]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-100 mb-4" />
                                <div className="h-4 w-24 bg-slate-100 rounded mb-2" />
                                <div className="h-8 w-32 bg-slate-100 rounded mb-1" />
                            </div>
                        ))
                    ) : (
                        statsCards.map((stat, index) => (
                            <div
                                key={index}
                                className="rounded-2xl p-6 shadow-sm transition-all hover:shadow-md"
                                style={{
                                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                        style={{ backgroundColor: stat.bgColor }}
                                    >
                                        <stat.icon size={24} strokeWidth={1.5} style={{ color: stat.color }} />
                                    </div>
                                    <button
                                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-slate-50"
                                    >
                                        <MoreVertical
                                            size={16}
                                            strokeWidth={1.5}
                                            style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                        />
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    <p
                                        className="text-[12px] leading-[18px] font-medium"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        {stat.label}
                                    </p>
                                    <h3
                                        className="text-[28px] leading-[36px] font-semibold"
                                        style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                    >
                                        {stat.value}
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className={stat.trend === 'up' ? "text-[#22c55e] flex items-center" : "text-[#ef4444] flex items-center"}>
                                            {stat.trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                            <span className="text-[12px] leading-[18px] font-bold ml-0.5">{stat.change}</span>
                                        </div>
                                        <span
                                            className="text-[12px] leading-[18px]"
                                            style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                        >
                                            vs last week
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Charts and Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Growth Chart */}
                    <div
                        className="lg:col-span-2 rounded-2xl p-6 shadow-sm flex flex-col"
                        style={{
                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                        }}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3
                                    className="text-[18px] leading-[26px] font-semibold mb-1"
                                    style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                >
                                    Growth Overview
                                </h3>
                                <p
                                    className="text-[12px] leading-[18px]"
                                    style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                >
                                    Platform activity over the last 7 days
                                </p>
                            </div>
                        </div>

                        {/* Shadcn/Recharts BarChart */}
                        <div className="flex-1 h-[300px]">
                            {isLoading ? (
                                <div className="w-full h-full flex items-center justify-center bg-slate-50/50 rounded-xl animate-pulse">
                                    <Activity className="text-slate-200" size={48} />
                                </div>
                            ) : (
                                <ChartContainer config={chartConfig} className="h-full w-full">
                                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E2E8F0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#64748B' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#64748B' }}
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar
                                            dataKey="users"
                                            fill="var(--color-users)"
                                            radius={[4, 4, 0, 0]}
                                            barSize={32}
                                            animationDuration={1500}
                                        />
                                        <Bar
                                            dataKey="videos"
                                            fill="var(--color-videos)"
                                            radius={[4, 4, 0, 0]}
                                            barSize={32}
                                            animationDuration={1500}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div
                        className="rounded-2xl p-6 shadow-sm flex flex-col"
                        style={{
                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                        }}
                    >
                        <h3
                            className="text-[18px] leading-[26px] font-semibold mb-6"
                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                        >
                            Recent Activity
                        </h3>

                        <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex gap-3 animate-pulse">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-32 bg-slate-100 rounded" />
                                            <div className="h-3 w-48 bg-slate-50 rounded" />
                                        </div>
                                    </div>
                                ))
                            ) : activity.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-2">
                                    <Activity size={32} />
                                    <p className="text-[13px]">No recent activity found.</p>
                                </div>
                            ) : (
                                activity.map((item) => (
                                    <div key={item.id} className="flex gap-4 group cursor-pointer">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                                            style={{
                                                backgroundColor: item.type === 'user' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                color: item.type === 'user' ? '#22c55e' : '#3b82f6'
                                            }}
                                        >
                                            {item.type === 'user' ? <UserPlus size={18} /> : <Upload size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <p
                                                    className="text-[13px] leading-[20px] font-semibold"
                                                    style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                                >
                                                    {item.text}
                                                </p>
                                                <span className="text-[11px] text-[#94A3B8]">
                                                    {formatTime(item.time)}
                                                </span>
                                            </div>
                                            <p
                                                className="text-[12px] leading-[18px] truncate"
                                                style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                            >
                                                {item.detail}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div
                    className="rounded-2xl p-8 shadow-sm"
                    style={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                        background: 'linear-gradient(to bottom right, #ffffff, #fcfaff)',
                    }}
                >
                    <h3
                        className="text-[20px] leading-[28px] font-bold mb-6 flex items-center gap-2"
                        style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                    >
                        <TrendingUp size={22} className="text-[#8c00ff]" />
                        Operational Actions
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button
                            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl transition-all hover:-translate-y-1 active:scale-[0.98] shadow-sm hover:shadow-xl border border-transparent hover:border-[#8c00ff]/20"
                            style={{
                                background: 'rgba(140, 0, 255, 0.03)',
                                color: '#8c00ff',
                            }}
                        >
                            <UserPlus size={28} strokeWidth={1.5} />
                            <span className="text-[15px] font-bold">New Admin Account</span>
                        </button>

                        <button
                            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl transition-all hover:-translate-y-1 active:scale-[0.98] bg-white border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:border-[#3b82f6]/20 hover:bg-blue-50/20"
                            style={{
                                color: '#3b82f6',
                            }}
                        >
                            <AlertCircle size={28} strokeWidth={1.5} />
                            <span className="text-[15px] font-bold">Review Reports</span>
                        </button>

                        <button
                            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl transition-all hover:-translate-y-1 active:scale-[0.98] bg-white border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:border-[#22c55e]/20 hover:bg-green-50/20"
                            style={{
                                color: '#22c55e',
                            }}
                        >
                            <HardDrive size={28} strokeWidth={1.5} />
                            <span className="text-[15px] font-bold">System Maintenance</span>
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
