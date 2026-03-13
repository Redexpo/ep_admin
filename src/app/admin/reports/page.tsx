'use client';

import { useState } from 'react';
import { Search, Filter, Eye, Trash2, X, Ban, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminReportsPage() {
    const [isDarkMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFilter, setSelectedFilter] = useState('all');

    const reports = [
        {
            id: 'RPT-001',
            videoId: 'VID-234',
            videoTitle: 'Inappropriate Content Example',
            reportedBy: 'John Doe',
            reporterEmail: 'john.doe@example.com',
            reason: 'Inappropriate content',
            description: 'Contains offensive language',
            date: 'Mar 6, 2026',
            status: 'pending',
        },
        {
            id: 'RPT-002',
            videoId: 'VID-567',
            videoTitle: 'Spam Video Promotion',
            reportedBy: 'Sarah Chen',
            reporterEmail: 'sarah.chen@company.com',
            reason: 'Spam',
            description: 'Promoting external services',
            date: 'Mar 5, 2026',
            status: 'pending',
        },
        {
            id: 'RPT-003',
            videoId: 'VID-891',
            videoTitle: 'Copyright Violation',
            reportedBy: 'Mike Wilson',
            reporterEmail: 'mike.w@startup.io',
            reason: 'Copyright violation',
            description: 'Using copyrighted material without permission',
            date: 'Mar 4, 2026',
            status: 'resolved',
        },
        {
            id: 'RPT-004',
            videoId: 'VID-123',
            videoTitle: 'Misleading Thumbnail',
            reportedBy: 'Emily Rodriguez',
            reporterEmail: 'emily.r@agency.com',
            reason: 'Misleading content',
            description: 'Clickbait thumbnail',
            date: 'Mar 3, 2026',
            status: 'pending',
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
                        Reports & Moderation
                    </h1>
                    <p
                        className="text-[14px] leading-[22px]"
                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                    >
                        Review and moderate reported content
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Pending Reports', value: '24', color: '#f59e0b' },
                        { label: 'Resolved Today', value: '12', color: '#22c55e' },
                        { label: 'Total Reports', value: '156', color: '#8c00ff' },
                    ].map((stat, index) => (
                        <div
                            key={index}
                            className="rounded-2xl p-6 shadow-sm"
                            style={{
                                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                            }}
                        >
                            <p
                                className="text-[12px] leading-[18px] font-medium mb-2"
                                style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                            >
                                {stat.label}
                            </p>
                            <h3
                                className="text-[32px] leading-[40px] font-semibold"
                                style={{ color: stat.color }}
                            >
                                {stat.value}
                            </h3>
                        </div>
                    ))}
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
                            placeholder="Search reports..."
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
                    {['all', 'pending', 'resolved', 'dismissed'].map((filter) => (
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

                {/* Reports Table */}
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
                                        Report ID
                                    </th>
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
                                        Reported By
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Reason
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Date
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
                                {reports.map((report) => (
                                    <tr
                                        key={report.id}
                                        className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
                                        style={{
                                            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC'}`,
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <span
                                                className="text-[14px] leading-[22px] font-mono"
                                                style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                            >
                                                {report.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div
                                                    className="text-[14px] leading-[22px] font-medium"
                                                    style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                                >
                                                    {report.videoTitle}
                                                </div>
                                                <div
                                                    className="text-[12px] leading-[18px]"
                                                    style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                                >
                                                    {report.videoId}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div
                                                    className="text-[14px] leading-[22px]"
                                                    style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                                >
                                                    {report.reportedBy}
                                                </div>
                                                <div
                                                    className="text-[12px] leading-[18px]"
                                                    style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                                >
                                                    {report.reporterEmail}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="inline-flex px-3 py-1 rounded-full text-[12px] leading-[18px] font-medium"
                                                style={{
                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                    color: '#ef4444',
                                                }}
                                            >
                                                {report.reason}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="text-[14px] leading-[22px]"
                                                style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                            >
                                                {report.date}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="inline-flex px-3 py-1 rounded-full text-[12px] leading-[18px] font-medium capitalize"
                                                style={{
                                                    backgroundColor:
                                                        report.status === 'pending'
                                                            ? 'rgba(245, 158, 11, 0.1)'
                                                            : 'rgba(34, 197, 94, 0.1)',
                                                    color: report.status === 'pending' ? '#f59e0b' : '#22c55e',
                                                }}
                                            >
                                                {report.status}
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
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:bg-red-500/10"
                                                    style={{
                                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                    }}
                                                >
                                                    <Trash2 size={16} strokeWidth={1.5} style={{ color: '#ef4444' }} />
                                                </button>
                                                <button
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:bg-gray-200 dark:hover:bg-white/20"
                                                    style={{
                                                        backgroundColor: 'rgba(100, 116, 139, 0.1)',
                                                    }}
                                                >
                                                    <X size={16} strokeWidth={1.5} style={{ color: '#64748B' }} />
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
                            Showing 1-4 of 24 reports
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
