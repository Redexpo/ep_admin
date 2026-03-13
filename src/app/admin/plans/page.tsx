'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Check } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminPlansPage() {
    const [isDarkMode] = useState(false);

    const plans = [
        {
            id: 1,
            name: 'Free',
            price: '$0',
            interval: 'month',
            storage: '5 GB',
            videoLimit: '25 videos',
            duration: '5 min',
            members: '1 member',
            features: ['Basic features', 'Limited support'],
            subscribers: 8234,
            status: 'active',
        },
        {
            id: 2,
            name: 'Pro',
            price: '$12',
            interval: 'month',
            storage: '100 GB',
            videoLimit: 'Unlimited',
            duration: '30 min',
            members: '5 members',
            features: ['All features', 'Priority support', 'Custom branding'],
            subscribers: 3421,
            status: 'active',
        },
        {
            id: 3,
            name: 'Business',
            price: '$49',
            interval: 'month',
            storage: '1 TB',
            videoLimit: 'Unlimited',
            duration: 'Unlimited',
            members: 'Unlimited',
            features: ['All Pro features', 'Advanced analytics', 'API access', 'Dedicated support'],
            subscribers: 892,
            status: 'active',
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
                            Plans & Subscriptions
                        </h1>
                        <p
                            className="text-[14px] leading-[22px]"
                            style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                        >
                            Manage pricing plans and subscription tiers
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
                        Create Plan
                    </button>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className="rounded-2xl p-6 shadow-sm border border-[#E2E8F0]"
                            style={{
                                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            }}
                        >
                            {/* Plan Header */}
                            <div className="mb-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3
                                            className="text-[24px] leading-[32px] font-semibold mb-1"
                                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                        >
                                            {plan.name}
                                        </h3>
                                        <div className="flex items-baseline gap-1">
                                            <span
                                                className="text-[36px] leading-[44px] font-bold"
                                                style={{ color: '#8c00ff' }}
                                            >
                                                {plan.price}
                                            </span>
                                            <span
                                                className="text-[14px] leading-[22px]"
                                                style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                            >
                                                /{plan.interval}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
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
                                        <button
                                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:bg-red-50"
                                            style={{
                                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                            }}
                                        >
                                            <Trash2 size={16} strokeWidth={1.5} style={{ color: '#ef4444' }} />
                                        </button>
                                    </div>
                                </div>

                                {/* Subscribers */}
                                <div
                                    className="flex items-center justify-between px-4 py-3 rounded-xl shadow-inner"
                                    style={{
                                        backgroundColor: isDarkMode ? 'rgba(140,0,255,0.1)' : '#f3eefe',
                                    }}
                                >
                                    <span
                                        className="text-[12px] leading-[18px] font-medium"
                                        style={{ color: '#8c00ff' }}
                                    >
                                        Active Subscribers
                                    </span>
                                    <span
                                        className="text-[16px] leading-[24px] font-semibold"
                                        style={{ color: '#8c00ff' }}
                                    >
                                        {plan.subscribers.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Limits */}
                            <div className="space-y-3 mb-6">
                                {[
                                    { label: 'Storage', value: plan.storage },
                                    { label: 'Videos', value: plan.videoLimit },
                                    { label: 'Max Duration', value: plan.duration },
                                    { label: 'Team Members', value: plan.members },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between text-[13px] leading-[20px]"
                                    >
                                        <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                                            {item.label}
                                        </span>
                                        <span
                                            className="font-medium"
                                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                        >
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Features */}
                            <div
                                className="pt-6 space-y-2 border-t border-[#E2E8F0]"
                                style={{
                                    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                                }}
                            >
                                {plan.features.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <Check size={16} strokeWidth={2} style={{ color: '#22c55e', marginTop: '2px' }} />
                                        <span
                                            className="text-[13px] leading-[20px]"
                                            style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}
                                        >
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
