'use client';

import { useState } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminLogsPage() {
    const [isDarkMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFilter, setSelectedFilter] = useState('all');

    const logs = [
        {
            id: 1,
            action: 'User Created',
            admin: 'Admin User',
            resource: 'john.doe@example.com',
            timestamp: 'Mar 6, 2026 10:45 AM',
            ip: '192.168.1.1',
            type: 'create',
        },
        {
            id: 2,
            action: 'Video Deleted',
            admin: 'Jane Smith',
            resource: 'VID-234',
            timestamp: 'Mar 6, 2026 10:30 AM',
            ip: '192.168.1.2',
            type: 'delete',
        },
        {
            id: 3,
            action: 'User Suspended',
            admin: 'Admin User',
            resource: 'spam-user@test.com',
            timestamp: 'Mar 6, 2026 10:15 AM',
            ip: '192.168.1.1',
            type: 'update',
        },
        {
            id: 4,
            action: 'Plan Updated',
            admin: 'Tom Johnson',
            resource: 'Pro Plan',
            timestamp: 'Mar 6, 2026 10:00 AM',
            ip: '192.168.1.3',
            type: 'update',
        },
        {
            id: 5,
            action: 'Report Reviewed',
            admin: 'Jane Smith',
            resource: 'RPT-001',
            timestamp: 'Mar 6, 2026 09:45 AM',
            ip: '192.168.1.2',
            type: 'read',
        },
    ];

    const getActionColor = (type: string) => {
        switch (type) {
            case 'create':
                return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' };
            case 'delete':
                return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
            case 'update':
                return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
            case 'read':
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
                            Activity Logs
                        </h1>
                        <p
                            className="text-[14px] leading-[22px]"
                            style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                        >
                            Track all admin actions and system events
                        </p>
                    </div>

                    <button
                        className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
                        style={{
                            background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)',
                            color: '#ffffff',
                            fontSize: '14px',
                            lineHeight: '22px',
                        }}
                    >
                        <Download size={18} strokeWidth={1.5} />
                        Export Logs
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <div
                        className="flex-1 relative shadow-sm"
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
                            placeholder="Search logs by action, admin, or resource..."
                            className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-[14px] leading-[22px]"
                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                        />
                    </div>

                    <button
                        className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all hover:bg-gray-50 dark:hover:bg-white/5 border border-[#E2E8F0] shadow-sm"
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
                    {['all', 'create', 'update', 'delete', 'read'].map((filter) => (
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

                {/* Logs Table */}
                <div
                    className="rounded-2xl overflow-hidden shadow-sm border border-[#E2E8F0]"
                    style={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
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
                                        Action
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Admin
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Resource
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Timestamp
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        IP Address
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => {
                                    const actionStyle = getActionColor(log.type);
                                    return (
                                        <tr
                                            key={log.id}
                                            className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
                                            style={{
                                                borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC'}`,
                                            }}
                                        >
                                            <td className="px-6 py-4">
                                                <span
                                                    className="inline-flex px-3 py-1 rounded-full text-[12px] leading-[18px] font-medium"
                                                    style={{
                                                        backgroundColor: actionStyle.bg,
                                                        color: actionStyle.color,
                                                    }}
                                                >
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="text-[14px] leading-[22px] font-medium"
                                                    style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                                >
                                                    {log.admin}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="text-[14px] leading-[22px] font-mono"
                                                    style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                                >
                                                    {log.resource}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="text-[14px] leading-[22px]"
                                                    style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                                >
                                                    {log.timestamp}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="text-[13px] leading-[20px] font-mono"
                                                    style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                                >
                                                    {log.ip}
                                                </span>
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
                            Showing 1-5 of 1,234 logs
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
