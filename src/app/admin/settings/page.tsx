'use client';

import { useState } from 'react';
import { Save, Globe, Mail, HardDrive, Video } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminSettingsPage() {
    const [isDarkMode] = useState(false);

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1
                        className="text-[28px] leading-[36px] font-semibold mb-2"
                        style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                    >
                        System Settings
                    </h1>
                    <p
                        className="text-[14px] leading-[22px]"
                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                    >
                        Configure platform settings and preferences
                    </p>
                </div>

                {/* General Settings */}
                <div
                    className="rounded-2xl p-6 shadow-sm border border-[#E2E8F0]"
                    style={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(140, 0, 255, 0.1)' }}
                        >
                            <Globe size={20} strokeWidth={1.5} style={{ color: '#8c00ff' }} />
                        </div>
                        <h3
                            className="text-[18px] leading-[26px] font-semibold"
                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                        >
                            General
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label
                                className="block text-[13px] leading-[20px] font-medium mb-2"
                                style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}
                            >
                                Platform Name
                            </label>
                            <input
                                type="text"
                                defaultValue="EdithPro"
                                className="w-full px-4 py-3 rounded-xl outline-none text-[14px] leading-[22px] transition-all focus:border-[#8c00ff]"
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                    color: isDarkMode ? '#ffffff' : '#0F172A',
                                }}
                            />
                        </div>

                        <div>
                            <label
                                className="block text-[13px] leading-[20px] font-medium mb-2"
                                style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}
                            >
                                Support Email
                            </label>
                            <input
                                type="email"
                                defaultValue="support@edithpro.com"
                                className="w-full px-4 py-3 rounded-xl outline-none text-[14px] leading-[22px] transition-all focus:border-[#8c00ff]"
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                    color: isDarkMode ? '#ffffff' : '#0F172A',
                                }}
                            />
                        </div>

                        <div>
                            <label
                                className="block text-[13px] leading-[20px] font-medium mb-2"
                                style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}
                            >
                                Default Video Privacy
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-xl outline-none text-[14px] leading-[22px] transition-all focus:border-[#8c00ff]"
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                    color: isDarkMode ? '#ffffff' : '#0F172A',
                                }}
                            >
                                <option>Private</option>
                                <option>Public</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Upload Limits */}
                <div
                    className="rounded-2xl p-6 shadow-sm border border-[#E2E8F0]"
                    style={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                        >
                            <Video size={20} strokeWidth={1.5} style={{ color: '#3b82f6' }} />
                        </div>
                        <h3
                            className="text-[18px] leading-[26px] font-semibold"
                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                        >
                            Upload Limits
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label
                                className="block text-[13px] leading-[20px] font-medium mb-2"
                                style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}
                            >
                                Max File Size (MB)
                            </label>
                            <input
                                type="number"
                                defaultValue="500"
                                className="w-full px-4 py-3 rounded-xl outline-none text-[14px] leading-[22px] transition-all focus:border-[#3b82f6]"
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                    color: isDarkMode ? '#ffffff' : '#0F172A',
                                }}
                            />
                        </div>

                        <div>
                            <label
                                className="block text-[13px] leading-[20px] font-medium mb-2"
                                style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}
                            >
                                Max Recording Duration (minutes)
                            </label>
                            <input
                                type="number"
                                defaultValue="30"
                                className="w-full px-4 py-3 rounded-xl outline-none text-[14px] leading-[22px] transition-all focus:border-[#3b82f6]"
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                    color: isDarkMode ? '#ffffff' : '#0F172A',
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Storage Settings */}
                <div
                    className="rounded-2xl p-6 shadow-sm border border-[#E2E8F0]"
                    style={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
                        >
                            <HardDrive size={20} strokeWidth={1.5} style={{ color: '#f59e0b' }} />
                        </div>
                        <h3
                            className="text-[18px] leading-[26px] font-semibold"
                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                        >
                            Storage
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label
                                className="block text-[13px] leading-[20px] font-medium mb-2"
                                style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}
                            >
                                Storage Provider
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-xl outline-none text-[14px] leading-[22px] transition-all focus:border-[#f59e0b]"
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                    color: isDarkMode ? '#ffffff' : '#0F172A',
                                }}
                            >
                                <option>AWS S3</option>
                                <option>Google Cloud Storage</option>
                                <option>Azure Blob Storage</option>
                            </select>
                        </div>

                        <div>
                            <label
                                className="block text-[13px] leading-[20px] font-medium mb-2"
                                style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}
                            >
                                CDN URL
                            </label>
                            <input
                                type="text"
                                defaultValue="https://cdn.edithpro.com"
                                className="w-full px-4 py-3 rounded-xl outline-none text-[14px] leading-[22px] transition-all focus:border-[#f59e0b]"
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                    color: isDarkMode ? '#ffffff' : '#0F172A',
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Email Settings */}
                <div
                    className="rounded-2xl p-6 shadow-sm border border-[#E2E8F0]"
                    style={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                        >
                            <Mail size={20} strokeWidth={1.5} style={{ color: '#22c55e' }} />
                        </div>
                        <h3
                            className="text-[18px] leading-[26px] font-semibold"
                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                        >
                            Email (SMTP)
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label
                                className="block text-[13px] leading-[20px] font-medium mb-2"
                                style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}
                            >
                                SMTP Host
                            </label>
                            <input
                                type="text"
                                defaultValue="smtp.gmail.com"
                                className="w-full px-4 py-3 rounded-xl outline-none text-[14px] leading-[22px] transition-all focus:border-[#22c55e]"
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                    color: isDarkMode ? '#ffffff' : '#0F172A',
                                }}
                            />
                        </div>

                        <div>
                            <label
                                className="block text-[13px] leading-[20px] font-medium mb-2"
                                style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}
                            >
                                SMTP Port
                            </label>
                            <input
                                type="number"
                                defaultValue="587"
                                className="w-full px-4 py-3 rounded-xl outline-none text-[14px] leading-[22px] transition-all focus:border-[#22c55e]"
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                    color: isDarkMode ? '#ffffff' : '#0F172A',
                                }}
                            />
                        </div>

                        <div>
                            <label
                                className="block text-[13px] leading-[20px] font-medium mb-2"
                                style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}
                            >
                                SMTP Username
                            </label>
                            <input
                                type="text"
                                defaultValue="noreply@edithpro.app"
                                className="w-full px-4 py-3 rounded-xl outline-none text-[14px] leading-[22px] transition-all focus:border-[#22c55e]"
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                    color: isDarkMode ? '#ffffff' : '#0F172A',
                                }}
                            />
                        </div>

                        <div>
                            <label
                                className="block text-[13px] leading-[20px] font-medium mb-2"
                                style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}
                            >
                                SMTP Password
                            </label>
                            <input
                                type="password"
                                defaultValue="••••••••"
                                className="w-full px-4 py-3 rounded-xl outline-none text-[14px] leading-[22px] transition-all focus:border-[#22c55e]"
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                    color: isDarkMode ? '#ffffff' : '#0F172A',
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <button
                        className="flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                        style={{
                            background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)',
                            color: '#ffffff',
                            fontSize: '14px',
                            lineHeight: '22px',
                        }}
                    >
                        <Save size={18} strokeWidth={1.5} />
                        Save Settings
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}
