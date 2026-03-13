'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminUsersPage() {
    const [isDarkMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFilter, setSelectedFilter] = useState('all');

    const users = [
        {
            id: 'USR-001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            plan: 'Pro',
            videos: 142,
            storage: '2.4 GB',
            createdAt: 'Jan 15, 2026',
            status: 'active',
            avatar: 'JD',
        },
        {
            id: 'USR-002',
            name: 'Sarah Chen',
            email: 'sarah.chen@company.com',
            plan: 'Business',
            videos: 89,
            storage: '1.8 GB',
            createdAt: 'Feb 3, 2026',
            status: 'active',
            avatar: 'SC',
        },
        {
            id: 'USR-003',
            name: 'Mike Wilson',
            email: 'mike.w@startup.io',
            plan: 'Free',
            videos: 23,
            storage: '456 MB',
            createdAt: 'Feb 20, 2026',
            status: 'active',
            avatar: 'MW',
        },
        {
            id: 'USR-004',
            name: 'Emily Rodriguez',
            email: 'emily.r@agency.com',
            plan: 'Pro',
            videos: 67,
            storage: '1.2 GB',
            createdAt: 'Mar 1, 2026',
            status: 'suspended',
            avatar: 'ER',
        },
        {
            id: 'USR-005',
            name: 'Alex Kim',
            email: 'alex.kim@tech.co',
            plan: 'Business',
            videos: 234,
            storage: '4.7 GB',
            createdAt: 'Jan 8, 2026',
            status: 'active',
            avatar: 'AK',
        },
    ];

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
                                {users.map((user) => {
                                    const planStyle = getPlanColor(user.plan);
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
                                                        backgroundColor: planStyle.bg,
                                                        color: planStyle.color,
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
                                                    className="text-[14px] leading-[22px]"
                                                    style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                                >
                                                    {user.storage}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="text-[14px] leading-[22px]"
                                                    style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                                >
                                                    {user.createdAt}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="inline-flex px-3 py-1 rounded-full text-[12px] leading-[18px] font-medium capitalize"
                                                    style={{
                                                        backgroundColor:
                                                            user.status === 'active'
                                                                ? 'rgba(34, 197, 94, 0.1)'
                                                                : 'rgba(239, 68, 68, 0.1)',
                                                        color: user.status === 'active' ? '#22c55e' : '#ef4444',
                                                    }}
                                                >
                                                    {user.status}
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
                                })}
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
                            Showing 1-5 of 12,458 users
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
