'use client';

import { useState } from 'react';
import {
    Search,
    Filter,
    Download,
    MoreVertical,
    Eye,
    Trash2,
    Link2,
    Play,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminVideosPage() {
    const [isDarkMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFilter, setSelectedFilter] = useState('all');

    const videos = [
        {
            id: 'VID-001',
            title: 'Product Demo Tutorial',
            owner: 'Sarah Chen',
            ownerEmail: 'sarah.chen@company.com',
            duration: '12:34',
            views: 2456,
            visibility: 'public',
            createdAt: 'Mar 5, 2026',
            size: '245 MB',
            thumbnail: 'SC',
        },
        {
            id: 'VID-002',
            title: 'Team Standup - March 6',
            owner: 'Alex Kim',
            ownerEmail: 'alex.kim@tech.co',
            duration: '8:12',
            views: 89,
            visibility: 'private',
            createdAt: 'Mar 6, 2026',
            size: '156 MB',
            thumbnail: 'AK',
        },
        {
            id: 'VID-003',
            title: 'Q1 Marketing Review',
            owner: 'Emily Rodriguez',
            ownerEmail: 'emily.r@agency.com',
            duration: '24:56',
            views: 1234,
            visibility: 'public',
            createdAt: 'Mar 4, 2026',
            size: '512 MB',
            thumbnail: 'ER',
        },
        {
            id: 'VID-004',
            title: 'Bug Fix Walkthrough',
            owner: 'John Doe',
            ownerEmail: 'john.doe@example.com',
            duration: '5:43',
            views: 456,
            visibility: 'private',
            createdAt: 'Mar 3, 2026',
            size: '98 MB',
            thumbnail: 'JD',
        },
        {
            id: 'VID-005',
            title: 'Client Presentation - Acme Corp',
            owner: 'Mike Wilson',
            ownerEmail: 'mike.w@startup.io',
            duration: '18:29',
            views: 3421,
            visibility: 'public',
            createdAt: 'Mar 2, 2026',
            size: '387 MB',
            thumbnail: 'MW',
        },
    ];

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
                            Videos Management
                        </h1>
                        <p
                            className="text-[14px] leading-[22px]"
                            style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                        >
                            Manage and moderate all platform videos
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
                        Export Data
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
                            placeholder="Search by title, owner, or video ID..."
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
                    {['all', 'public', 'private', 'reported'].map((filter) => (
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

                {/* Videos Table */}
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
                                        Video
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Owner
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Duration
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Views
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Visibility
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Size
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Created
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
                                {videos.map((video) => (
                                    <tr
                                        key={video.id}
                                        className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
                                        style={{
                                            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC'}`,
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-16 h-10 rounded-lg flex items-center justify-center relative overflow-hidden shadow-inner"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    }}
                                                >
                                                    <Play size={16} strokeWidth={1.5} color="#ffffff" />
                                                </div>
                                                <div className="max-w-xs">
                                                    <div
                                                        className="text-[14px] leading-[22px] font-medium truncate"
                                                        style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                                    >
                                                        {video.title}
                                                    </div>
                                                    <div
                                                        className="text-[12px] leading-[18px]"
                                                        style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                                    >
                                                        {video.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div
                                                    className="text-[14px] leading-[22px] font-medium"
                                                    style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                                >
                                                    {video.owner}
                                                </div>
                                                <div
                                                    className="text-[12px] leading-[18px]"
                                                    style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                                >
                                                    {video.ownerEmail}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="text-[14px] leading-[22px] font-mono"
                                                style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                            >
                                                {video.duration}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="text-[14px] leading-[22px]"
                                                style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                            >
                                                {video.views.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="inline-flex px-3 py-1 rounded-full text-[12px] leading-[18px] font-medium capitalize"
                                                style={{
                                                    backgroundColor:
                                                        video.visibility === 'public'
                                                            ? 'rgba(34, 197, 94, 0.1)'
                                                            : 'rgba(100, 116, 139, 0.1)',
                                                    color: video.visibility === 'public' ? '#22c55e' : '#64748B',
                                                }}
                                            >
                                                {video.visibility}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="text-[14px] leading-[22px]"
                                                style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                            >
                                                {video.size}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="text-[14px] leading-[22px]"
                                                style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                            >
                                                {video.createdAt}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:bg-gray-100 dark:hover:bg-white/10"
                                                    style={{
                                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
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
                                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                                    }}
                                                >
                                                    <Link2
                                                        size={16}
                                                        strokeWidth={1.5}
                                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                                    />
                                                </button>
                                                <button
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:bg-gray-100 dark:hover:bg-white/10"
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
                            Showing 1-5 of 45,231 videos
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
