'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminDashboard() {
    const [isDarkMode] = useState(false);

    const stats = [
        {
            label: 'Total Users',
            value: '12,458',
            change: '+12.5%',
            trend: 'up',
            icon: Users,
            color: '#8c00ff',
            bgColor: 'rgba(140, 0, 255, 0.1)',
        },
        {
            label: 'Active Users (24h)',
            value: '3,842',
            change: '+8.2%',
            trend: 'up',
            icon: UserCheck,
            color: '#22c55e',
            bgColor: 'rgba(34, 197, 94, 0.1)',
        },
        {
            label: 'Total Videos',
            value: '45,231',
            change: '+24.3%',
            trend: 'up',
            icon: Video,
            color: '#3b82f6',
            bgColor: 'rgba(59, 130, 246, 0.1)',
        },
        {
            label: 'Storage Used',
            value: '1.2 TB',
            change: '-5.1%',
            trend: 'down',
            icon: HardDrive,
            color: '#f59e0b',
            bgColor: 'rgba(245, 158, 11, 0.1)',
        },
    ];

    const recentActivity = [
        {
            id: 1,
            type: 'user',
            icon: UserPlus,
            color: '#22c55e',
            text: 'New user registered',
            detail: 'john.doe@example.com',
            time: '2 minutes ago',
        },
        {
            id: 2,
            type: 'video',
            icon: Upload,
            color: '#3b82f6',
            text: 'Video uploaded',
            detail: 'Product Demo Tutorial by Sarah Chen',
            time: '15 minutes ago',
        },
        {
            id: 3,
            type: 'video',
            icon: Trash2,
            color: '#ef4444',
            text: 'Video deleted',
            detail: 'User removed "Old Meeting Recording"',
            time: '1 hour ago',
        },
        {
            id: 4,
            type: 'user',
            icon: UserPlus,
            color: '#22c55e',
            text: 'New user registered',
            detail: 'mike.wilson@company.com',
            time: '2 hours ago',
        },
        {
            id: 5,
            type: 'video',
            icon: Upload,
            color: '#3b82f6',
            text: 'Video uploaded',
            detail: 'Team Standup - March 6 by Alex Kim',
            time: '3 hours ago',
        },
    ];

    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        users: [245, 289, 312, 298, 356, 423, 389],
        videos: [67, 89, 103, 95, 121, 156, 134],
    };

    const maxValue = Math.max(...chartData.users);

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Page Header */}
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
                        Welcome back! Here's what's happening with your platform.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="rounded-2xl p-6 shadow-sm"
                            style={{
                                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                            }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: stat.bgColor }}
                                >
                                    <stat.icon size={24} strokeWidth={1.5} style={{ color: stat.color }} />
                                </div>
                                <button
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                                    style={{
                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    }}
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
                                <div className="flex items-center gap-1">
                                    {stat.trend === 'up' ? (
                                        <ArrowUp size={14} strokeWidth={2} style={{ color: '#22c55e' }} />
                                    ) : (
                                        <ArrowDown size={14} strokeWidth={2} style={{ color: '#ef4444' }} />
                                    )}
                                    <span
                                        className="text-[12px] leading-[18px] font-medium"
                                        style={{ color: stat.trend === 'up' ? '#22c55e' : '#ef4444' }}
                                    >
                                        {stat.change}
                                    </span>
                                    <span
                                        className="text-[12px] leading-[18px]"
                                        style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                    >
                                        from last week
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts and Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Growth Chart */}
                    <div
                        className="lg:col-span-2 rounded-2xl p-6 shadow-sm"
                        style={{
                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                        }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3
                                    className="text-[18px] leading-[26px] font-semibold mb-1"
                                    style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                >
                                    User Growth
                                </h3>
                                <p
                                    className="text-[12px] leading-[18px]"
                                    style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                >
                                    New users this week
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: '#8c00ff' }}
                                    />
                                    <span
                                        className="text-[12px] leading-[18px]"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Users
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: '#3b82f6' }}
                                    />
                                    <span
                                        className="text-[12px] leading-[18px]"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Videos
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Simple Bar Chart */}
                        <div className="h-64 flex items-end gap-4">
                            {chartData.labels.map((label, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full flex flex-col gap-1 items-center">
                                        {/* Users Bar */}
                                        <div className="w-full relative">
                                            <div
                                                className="w-full rounded-t-lg transition-all"
                                                style={{
                                                    height: `${(chartData.users[index] / maxValue) * 200}px`,
                                                    background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)',
                                                }}
                                            />
                                        </div>
                                        {/* Videos Bar */}
                                        <div className="w-full">
                                            <div
                                                className="w-full rounded-t-lg transition-all"
                                                style={{
                                                    height: `${(chartData.videos[index] / maxValue) * 200}px`,
                                                    backgroundColor: '#3b82f6',
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <span
                                        className="text-[11px] leading-[16px] font-medium"
                                        style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                    >
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div
                        className="rounded-2xl p-6 shadow-sm"
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

                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: `${activity.color}15` }}
                                    >
                                        <activity.icon size={16} strokeWidth={1.5} style={{ color: activity.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="text-[13px] leading-[20px] font-medium mb-0.5"
                                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                        >
                                            {activity.text}
                                        </p>
                                        <p
                                            className="text-[12px] leading-[18px] truncate"
                                            style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                        >
                                            {activity.detail}
                                        </p>
                                        <span
                                            className="text-[11px] leading-[16px]"
                                            style={{ color: '#94A3B8' }}
                                        >
                                            {activity.time}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div
                    className="rounded-2xl p-6 shadow-sm"
                    style={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                    }}
                >
                    <h3
                        className="text-[18px] leading-[26px] font-semibold mb-4"
                        style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                    >
                        Quick Actions
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            className="flex items-center gap-3 px-6 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                            style={{
                                background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)',
                                color: '#ffffff',
                            }}
                        >
                            <UserPlus size={20} strokeWidth={1.5} />
                            <span className="text-[14px] leading-[22px] font-medium">Create Admin</span>
                        </button>

                        <button
                            className="flex items-center gap-3 px-6 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-white border border-[#E2E8F0] shadow-sm hover:border-[#8c00ff] hover:text-[#8c00ff]"
                            style={{
                                color: isDarkMode ? '#ffffff' : '#0F172A',
                            }}
                        >
                            <TrendingUp size={20} strokeWidth={1.5} />
                            <span className="text-[14px] leading-[22px] font-medium">View Reports</span>
                        </button>

                        <button
                            className="flex items-center gap-3 px-6 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-white border border-[#E2E8F0] shadow-sm hover:border-[#8c00ff] hover:text-[#8c00ff]"
                            style={{
                                color: isDarkMode ? '#ffffff' : '#0F172A',
                            }}
                        >
                            <HardDrive size={20} strokeWidth={1.5} />
                            <span className="text-[14px] leading-[22px] font-medium">System Status</span>
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
