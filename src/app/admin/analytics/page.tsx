'use client';

import { useState } from 'react';
import { TrendingUp, Users, Eye, Clock } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminAnalyticsPage() {
    const [isDarkMode] = useState(false);

    const stats = [
        { label: 'Daily Active Users', value: '3,842', change: '+8.2%', trend: 'up', icon: Users, color: '#8c00ff' },
        { label: 'Total Watch Time', value: '12,456 hrs', change: '+15.4%', trend: 'up', icon: Clock, color: '#3b82f6' },
        { label: 'Video Views', value: '89,234', change: '+22.1%', trend: 'up', icon: Eye, color: '#22c55e' },
        { label: 'Engagement Rate', value: '64%', change: '+3.2%', trend: 'up', icon: TrendingUp, color: '#f59e0b' },
    ];

    const topCreators = [
        { name: 'Alex Kim', videos: 234, views: 45231, watchTime: '1,234 hrs', avatar: 'AK' },
        { name: 'Sarah Chen', videos: 142, views: 38429, watchTime: '987 hrs', avatar: 'SC' },
        { name: 'John Doe', videos: 89, views: 29183, watchTime: '756 hrs', avatar: 'JD' },
        { name: 'Emily Rodriguez', videos: 67, views: 21456, watchTime: '542 hrs', avatar: 'ER' },
    ];

    const topVideos = [
        { title: 'Product Demo Tutorial', creator: 'Sarah Chen', views: 12456, duration: '12:34' },
        { title: 'Q1 Marketing Review', creator: 'Emily Rodriguez', views: 9834, duration: '24:56' },
        { title: 'Client Presentation - Acme Corp', creator: 'Mike Wilson', views: 8721, duration: '18:29' },
        { title: 'Team Standup - March 6', creator: 'Alex Kim', views: 6543, duration: '8:12' },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1
                        className="text-[28px] leading-[36px] font-semibold mb-2"
                        style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                    >
                        Analytics
                    </h1>
                    <p
                        className="text-[14px] leading-[22px]"
                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                    >
                        Platform insights and performance metrics
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
                                {stat.value}
                            </h3>
                            <span className="text-[12px] leading-[18px] font-medium" style={{ color: '#22c55e' }}>
                                {stat.change} from last week
                            </span>
                        </div>
                    ))}
                </div>

                {/* Top Creators & Top Videos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Creators */}
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
                            Top Creators
                        </h3>
                        <div className="space-y-4">
                            {topCreators.map((creator, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 p-4 rounded-xl shadow-sm border border-transparent hover:border-[#8c00ff] transition-all"
                                    style={{
                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                                    }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-inner"
                                        style={{ background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)' }}
                                    >
                                        <span className="text-white text-[14px] leading-[22px] font-semibold">
                                            {creator.avatar}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div
                                            className="text-[14px] leading-[22px] font-medium mb-1"
                                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                        >
                                            {creator.name}
                                        </div>
                                        <div className="flex gap-4">
                                            <span
                                                className="text-[12px] leading-[18px]"
                                                style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                            >
                                                {creator.videos} videos
                                            </span>
                                            <span
                                                className="text-[12px] leading-[18px]"
                                                style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                            >
                                                {creator.views.toLocaleString()} views
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div
                                            className="text-[14px] leading-[22px] font-semibold"
                                            style={{ color: '#8c00ff' }}
                                        >
                                            {creator.watchTime}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Videos */}
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
                            Most Viewed Videos
                        </h3>
                        <div className="space-y-4">
                            {topVideos.map((video, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-xl shadow-sm border border-transparent hover:border-[#8c00ff] transition-all"
                                    style={{
                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                                    }}
                                >
                                    <div
                                        className="text-[14px] leading-[22px] font-medium mb-2"
                                        style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                    >
                                        {video.title}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="text-[12px] leading-[18px]"
                                            style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                        >
                                            by {video.creator}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="text-[12px] leading-[18px] font-medium"
                                                style={{ color: '#8c00ff' }}
                                            >
                                                {video.views.toLocaleString()} views
                                            </span>
                                            <span
                                                className="text-[11px] leading-[16px] font-mono"
                                                style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                            >
                                                {video.duration}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
