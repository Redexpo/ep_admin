'use client';

import { useState } from 'react';
import { Plus, Shield, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminAdminsPage() {
    const [isDarkMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const admins = [
        {
            id: 1,
            name: 'Admin User',
            email: 'admin@vidflow.com',
            role: 'Super Admin',
            createdAt: 'Jan 1, 2026',
            lastActive: '2 hours ago',
            avatar: 'AD',
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@vidflow.com',
            role: 'Moderator',
            createdAt: 'Feb 10, 2026',
            lastActive: '5 hours ago',
            avatar: 'JS',
        },
        {
            id: 3,
            name: 'Tom Johnson',
            email: 'tom.j@vidflow.com',
            role: 'Support',
            createdAt: 'Mar 1, 2026',
            lastActive: '1 day ago',
            avatar: 'TJ',
        },
    ];

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Super Admin':
                return { color: '#8c00ff', bg: 'rgba(140, 0, 255, 0.1)' };
            case 'Moderator':
                return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
            case 'Support':
                return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' };
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
                            Admin Management
                        </h1>
                        <p
                            className="text-[14px] leading-[22px]"
                            style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                        >
                            Manage admin users and their roles
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
                        <Plus size={18} strokeWidth={1.5} />
                        Add Admin
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Total Admins', value: '3', icon: Shield, color: '#8c00ff' },
                        { label: 'Active Today', value: '2', icon: Shield, color: '#22c55e' },
                        { label: 'Pending Invites', value: '0', icon: Shield, color: '#f59e0b' },
                    ].map((stat, index) => (
                        <div
                            key={index}
                            className="rounded-2xl p-6 shadow-sm border border-[#E2E8F0]"
                            style={{
                                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            }}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${stat.color}15` }}
                                >
                                    <stat.icon size={24} strokeWidth={1.5} style={{ color: stat.color }} />
                                </div>
                                <div>
                                    <p
                                        className="text-[12px] leading-[18px] font-medium mb-1"
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
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Admins Table */}
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
                                        Admin
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Role
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
                                        Last Active
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
                                {admins.map((admin) => {
                                    const roleStyle = getRoleColor(admin.role);
                                    return (
                                        <tr
                                            key={admin.id}
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
                                                            {admin.avatar}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div
                                                            className="text-[14px] leading-[22px] font-medium"
                                                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                                        >
                                                            {admin.name}
                                                        </div>
                                                        <div
                                                            className="text-[12px] leading-[18px]"
                                                            style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                                        >
                                                            {admin.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="inline-flex px-3 py-1 rounded-full text-[12px] leading-[18px] font-medium"
                                                    style={{
                                                        backgroundColor: roleStyle.bg,
                                                        color: roleStyle.color,
                                                    }}
                                                >
                                                    {admin.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="text-[14px] leading-[22px]"
                                                    style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                                >
                                                    {admin.createdAt}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="text-[14px] leading-[22px]"
                                                    style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                                >
                                                    {admin.lastActive}
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
                                                        <Edit
                                                            size={16}
                                                            strokeWidth={1.5}
                                                            style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                                        />
                                                    </button>
                                                    {admin.role !== 'Super Admin' && (
                                                        <button
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:bg-red-50"
                                                            style={{
                                                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                            }}
                                                        >
                                                            <Trash2 size={16} strokeWidth={1.5} style={{ color: '#ef4444' }} />
                                                        </button>
                                                    )}
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
                            Showing 1-3 of 3 admins
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
