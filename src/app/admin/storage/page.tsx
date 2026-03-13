'use client';

import { useState } from 'react';
import { HardDrive, TrendingUp, Users, Video, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminStoragePage() {
    const [isDarkMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const storageStats = [
        {
            label: 'Total Storage Used',
            value: '1.2 TB',
            capacity: '5 TB',
            percentage: 24,
            icon: HardDrive,
            color: '#8c00ff',
        },
        {
            label: 'Storage by Users',
            value: '856 GB',
            percentage: 71,
            icon: Users,
            color: '#3b82f6',
        },
        {
            label: 'Storage by Videos',
            value: '344 GB',
            percentage: 29,
            icon: Video,
            color: '#22c55e',
        },
        {
            label: 'Growth (7d)',
            value: '+124 GB',
            percentage: 12,
            icon: TrendingUp,
            color: '#f59e0b',
        },
    ];

    const topStorageUsers = [
        {
            id: 1,
            name: 'Alex Kim',
            email: 'alex.kim@tech.co',
            videos: 234,
            storage: '4.7 GB',
            storageBytes: 5046586573,
            percentage: 94,
            plan: 'Business',
            avatar: 'AK',
        },
        {
            id: 2,
            name: 'Sarah Chen',
            email: 'sarah.chen@company.com',
            videos: 142,
            storage: '2.4 GB',
            storageBytes: 2576980378,
            percentage: 48,
            plan: 'Pro',
            avatar: 'SC',
        },
        {
            id: 3,
            name: 'John Doe',
            email: 'john.doe@example.com',
            videos: 89,
            storage: '1.8 GB',
            storageBytes: 1932735283,
            percentage: 36,
            plan: 'Pro',
            avatar: 'JD',
        },
        {
            id: 4,
            name: 'Emily Rodriguez',
            email: 'emily.r@agency.com',
            videos: 67,
            storage: '1.2 GB',
            storageBytes: 1288490189,
            percentage: 24,
            plan: 'Pro',
            avatar: 'ER',
        },
        {
            id: 5,
            name: 'Mike Wilson',
            email: 'mike.w@startup.io',
            videos: 23,
            storage: '456 MB',
            storageBytes: 478150656,
            percentage: 9,
            plan: 'Free',
            avatar: 'MW',
        },
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
                        Storage Management
                    </h1>
                    <p
                        className="text-[14px] leading-[22px]"
                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                    >
                        Monitor storage usage and manage capacity
                    </p>
                </div>

                {/* Storage Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {storageStats.map((stat, index) => (
                        <div
                            key={index}
                            className="rounded-2xl p-6 shadow-sm border border-[#E2E8F0]"
                            style={{
                                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${stat.color}15` }}
                                >
                                    <stat.icon size={24} strokeWidth={1.5} style={{ color: stat.color }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p
                                    className="text-[12px] leading-[18px] font-medium"
                                    style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                >
                                    {stat.label}
                                </p>
                                <h3
                                    className="text-[24px] leading-[32px] font-semibold"
                                    style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                >
                                    {stat.value}
                                </h3>
                                {stat.capacity && (
                                    <div className="space-y-1">
                                        <div
                                            className="h-2 rounded-full overflow-hidden"
                                            style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#F8FAFC' }}
                                        >
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${stat.percentage}%`,
                                                    background: `linear-gradient(90deg, ${stat.color} 0%, ${stat.color}CC 100%)`,
                                                }}
                                            />
                                        </div>
                                        <p
                                            className="text-[11px] leading-[16px]"
                                            style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                        >
                                            {stat.percentage}% of {stat.capacity}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Storage Usage Chart */}
                <div
                    className="rounded-2xl p-6 shadow-sm border border-[#E2E8F0]"
                    style={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    }}
                >
                    <h3
                        className="text-[18px] leading-[26px] font-semibold mb-6"
                        style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                    >
                        Storage Distribution
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Donut Chart Representation */}
                        <div className="flex items-center justify-center">
                            <div className="relative w-64 h-64">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                                    {/* Background Circle */}
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="80"
                                        fill="none"
                                        stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : '#F8FAFC'}
                                        strokeWidth="40"
                                    />
                                    {/* Users Storage - 71% */}
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="80"
                                        fill="none"
                                        stroke="#3b82f6"
                                        strokeWidth="40"
                                        strokeDasharray={`${502 * 0.71} 502`}
                                        strokeLinecap="round"
                                    />
                                    {/* Videos Storage - 29% */}
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="80"
                                        fill="none"
                                        stroke="#22c55e"
                                        strokeWidth="40"
                                        strokeDasharray={`${502 * 0.29} 502`}
                                        strokeDashoffset={`-${502 * 0.71}`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span
                                        className="text-[32px] leading-[40px] font-semibold"
                                        style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                    >
                                        1.2 TB
                                    </span>
                                    <span
                                        className="text-[12px] leading-[18px]"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Total Used
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-col justify-center space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
                                        <span
                                            className="text-[14px] leading-[22px] font-medium"
                                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                        >
                                            User Storage
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className="text-[16px] leading-[24px] font-semibold"
                                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                        >
                                            856 GB
                                        </p>
                                        <p
                                            className="text-[12px] leading-[18px]"
                                            style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                        >
                                            71%
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                                        <span
                                            className="text-[14px] leading-[22px] font-medium"
                                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                        >
                                            Video Storage
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className="text-[16px] leading-[24px] font-semibold"
                                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                        >
                                            344 GB
                                        </p>
                                        <p
                                            className="text-[12px] leading-[18px]"
                                            style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                        >
                                            29%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="p-4 rounded-xl flex items-start gap-3"
                                style={{
                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid rgba(245, 158, 11, 0.2)',
                                }}
                            >
                                <AlertTriangle size={20} strokeWidth={1.5} style={{ color: '#f59e0b' }} />
                                <div>
                                    <p
                                        className="text-[13px] leading-[20px] font-medium"
                                        style={{ color: '#f59e0b' }}
                                    >
                                        Storage growing rapidly
                                    </p>
                                    <p
                                        className="text-[12px] leading-[18px] mt-1"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Added 124 GB in the last 7 days
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Storage Users */}
                <div
                    className="rounded-2xl overflow-hidden shadow-sm border border-[#E2E8F0]"
                    style={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    }}
                >
                    <div className="px-6 py-4" style={{ borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}` }}>
                        <h3
                            className="text-[18px] leading-[26px] font-semibold"
                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                        >
                            Top Storage Users
                        </h3>
                    </div>

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
                                        Videos
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Storage Used
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Usage
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
                                {topStorageUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
                                        style={{
                                            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC'}`,
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)',
                                                    }}
                                                >
                                                    <span className="text-white text-[12px] leading-[18px] font-semibold">
                                                        {user.avatar}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div
                                                        className="text-[14px] leading-[22px] font-medium"
                                                        style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                                    >
                                                        {user.name}
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
                                                    backgroundColor: user.plan === 'Business' ? 'rgba(59, 130, 246, 0.1)' : user.plan === 'Pro' ? 'rgba(140, 0, 255, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                                                    color: user.plan === 'Business' ? '#3b82f6' : user.plan === 'Pro' ? '#8c00ff' : '#64748B',
                                                }}
                                            >
                                                {user.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="text-[14px] leading-[22px]"
                                                style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                            >
                                                {user.videos}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="text-[14px] leading-[22px] font-medium"
                                                style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                            >
                                                {user.storage}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="flex-1 h-2 rounded-full overflow-hidden"
                                                    style={{
                                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#F8FAFC',
                                                        maxWidth: '120px',
                                                    }}
                                                >
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${user.percentage}%`,
                                                            background: user.percentage > 80 ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(90deg, #8c00ff 0%, #7c3aed 100%)',
                                                        }}
                                                    />
                                                </div>
                                                <span
                                                    className="text-[12px] leading-[18px] font-medium"
                                                    style={{ color: user.percentage > 80 ? '#ef4444' : (isDarkMode ? '#94A3B8' : '#64748B') }}
                                                >
                                                    {user.percentage}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="px-3 py-1.5 rounded-lg text-[12px] leading-[18px] font-medium transition-all hover:bg-gray-50 border border-[#E2E8F0] shadow-sm"
                                                    style={{
                                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                                        color: isDarkMode ? '#ffffff' : '#0F172A',
                                                    }}
                                                >
                                                    Limit Storage
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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
                            Showing top 5 users by storage
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-white/10"
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
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-white/10"
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
