'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Users, Video, AlertCircle, UserCheck,
    ArrowUp, ArrowDown, UserPlus, Upload, Activity,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { dashboardService, DashboardStats, RecentActivity, GrowthData, DurationStats } from '@/services/admin/dashboardService';
import { EngagementChart } from '@/components/admin/charts/EngagementChart';
import { DurationDonutChart } from '@/components/admin/charts/DurationDonutChart';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { toast } from 'sonner';

const chartConfig = {
    users:  { label: 'New Users',  color: '#8c00ff' },
    videos: { label: 'New Videos', color: '#3b82f6' },
} satisfies ChartConfig;

const KPI_META = [
    { key: 'total_users',      label: 'Total Users',      icon: Users,     color: '#8c00ff', bg: 'bg-purple-50',  text: 'text-[#8c00ff]' },
    { key: 'active_users_24h', label: 'Active (24 h)',    icon: UserCheck, color: '#22c55e', bg: 'bg-green-50',   text: 'text-green-600' },
    { key: 'total_videos',     label: 'Total Recordings', icon: Video,     color: '#3b82f6', bg: 'bg-blue-50',    text: 'text-blue-600'  },
    { key: 'reported_videos',  label: 'Reported Videos',  icon: AlertCircle, color: '#ef4444', bg: 'bg-red-50', text: 'text-red-500'  },
] as const;

export default function AdminDashboard() {
    const [isStatsLoading,    setIsStatsLoading]    = useState(true);
    const [isChartLoading,    setIsChartLoading]    = useState(true);
    const [isActivityLoading, setIsActivityLoading] = useState(true);
    const [isDurationLoading, setIsDurationLoading] = useState(true);

    const [stats,        setStats]        = useState<DashboardStats | null>(null);
    const [activity,     setActivity]     = useState<RecentActivity[]>([]);
    const [growthData,   setGrowthData]   = useState<GrowthData | null>(null);
    const [durationData, setDurationData] = useState<DurationStats[]>([]);
    const [timeRange,    setTimeRange]    = useState(30);

    const fetchSummaryAndActivity = useCallback(async () => {
        try {
            setIsStatsLoading(true);
            setIsActivityLoading(true);
            const [statsRes, activityRes] = await Promise.all([
                dashboardService.getDashboardSummary(),
                dashboardService.getRecentActivity(5),
            ]);
            if (statsRes.status    === 'success') setStats(statsRes.data);
            if (activityRes.status === 'success') setActivity(activityRes.data);
        } catch {
            toast.error('Failed to fetch dashboard summary');
        } finally {
            setIsStatsLoading(false);
            setIsActivityLoading(false);
        }
    }, []);

    const fetchGrowthData = useCallback(async () => {
        try {
            setIsChartLoading(true);
            const response = await dashboardService.getGrowthData(timeRange);
            if (response.status === 'success') setGrowthData(response.data);
        } catch {
            toast.error('Failed to update growth chart');
        } finally {
            setIsChartLoading(false);
        }
    }, [timeRange]);

    const fetchDurationData = useCallback(async () => {
        try {
            setIsDurationLoading(true);
            const response = await dashboardService.getDurationStats();
            if (response.status === 'success') setDurationData(response.data);
        } catch {
            // non-critical
        } finally {
            setIsDurationLoading(false);
        }
    }, []);

    useEffect(() => { fetchSummaryAndActivity(); }, [fetchSummaryAndActivity]);
    useEffect(() => { fetchGrowthData();         }, [fetchGrowthData]);
    useEffect(() => { fetchDurationData();        }, [fetchDurationData]);

    const chartData = growthData
        ? growthData.labels.map((label, i) => ({ name: label, users: growthData.users[i], videos: growthData.videos[i] }))
        : [];

    const formatTime = (iso: string) => {
        const diffMins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
        if (diffMins < 60)  return `${diffMins}m ago`;
        const h = Math.floor(diffMins / 60);
        if (h < 24)         return `${h}h ago`;
        return new Date(iso).toLocaleDateString();
    };

    return (
        <AdminLayout>
            <div className="p-8 space-y-8 max-w-[1400px] mx-auto pb-20">
                {/* Page header */}
                <div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight">Overview</h1>
                    <p className="text-[14px] text-slate-500 mt-0.5">Platform health at a glance.</p>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {isStatsLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-[110px] rounded-3xl bg-white border border-slate-100 animate-pulse" />
                        ))
                        : KPI_META.map(({ key, label, icon: Icon, bg, text }) => {
                            const stat = stats?.[key as keyof DashboardStats] as { value: number; change: string; trend: string } | undefined;
                            return (
                                <div key={key} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bg} ${text}`}>
                                            <Icon size={16} />
                                        </div>
                                    </div>
                                    <span className="text-[28px] font-black text-slate-900 leading-none">
                                        {stat?.value.toLocaleString() ?? '—'}
                                    </span>
                                    {stat && (
                                        <div className={`flex items-center gap-1 text-[12px] font-bold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                                            {stat.trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                            {stat.change}
                                            <span className="text-slate-400 font-normal">vs last week</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    }
                </div>

                {/* Growth chart */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-[16px] font-black text-slate-900">Growth Overview</h3>
                            <p className="text-[12px] text-slate-400">New users & recordings over the last {timeRange} days</p>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-xl gap-0.5">
                            {[7, 30, 90].map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setTimeRange(d)}
                                    className={`px-3 py-1.5 rounded-lg text-[12px] font-black transition-all ${timeRange === d ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    {d}D
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[260px] w-full">
                        {isChartLoading ? (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-2xl animate-pulse">
                                <Activity className="text-slate-200" size={40} />
                            </div>
                        ) : (
                            <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gUsers"  x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#8c00ff" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#8c00ff" stopOpacity={0}    />
                                        </linearGradient>
                                        <linearGradient id="gVideos" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F1F5F9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                                    <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                                    <Area type="monotone" dataKey="users"  stroke="#8c00ff" strokeWidth={2} fillOpacity={1} fill="url(#gUsers)"  />
                                    <Area type="monotone" dataKey="videos" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#gVideos)" />
                                </AreaChart>
                            </ChartContainer>
                        )}
                    </div>
                </div>

                {/* Engagement + Duration */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <EngagementChart isDarkMode={false} />
                    </div>
                    <div className="lg:col-span-1">
                        <DurationDonutChart isDarkMode={false} data={durationData} isLoading={isDurationLoading} />
                    </div>
                </div>

                {/* Recent activity */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-[16px] font-black text-slate-900 mb-6">Recent Activity</h3>
                    <div className="space-y-1">
                        {isActivityLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex gap-3 p-3 animate-pulse">
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
                                    <div className="flex-1 space-y-2 py-1">
                                        <div className="h-3 w-40 bg-slate-100 rounded" />
                                        <div className="h-2.5 w-56 bg-slate-50 rounded" />
                                    </div>
                                </div>
                            ))
                        ) : activity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-300 gap-2">
                                <Activity size={36} strokeWidth={1} />
                                <p className="text-[13px] text-slate-400">No recent activity</p>
                            </div>
                        ) : (
                            activity.map((item) => (
                                <div key={item.id} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'user' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {item.type === 'user' ? <UserPlus size={16} /> : <Upload size={16} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[13px] font-bold text-slate-900">{item.text}</p>
                                            <span className="text-[11px] text-slate-400 shrink-0 ml-4">{formatTime(item.time)}</span>
                                        </div>
                                        <p className="text-[12px] text-slate-400 truncate mt-0.5">{item.detail}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
