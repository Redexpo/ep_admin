'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Repeat,
    Edit2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    User,
    CreditCard
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminSubscriptionService, AdminSubscription } from '@/services/admin/subscriptionService';
import SubscriptionModal from '@/components/admin/subscriptions/SubscriptionModal';
import { toast } from 'sonner';

export default function SubscriptionsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const fetchSubscriptions = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await adminSubscriptionService.getSubscriptions(
                currentPage,
                20,
                statusFilter === 'all' ? undefined : statusFilter
            );
            setSubscriptions(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch subscriptions");
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, statusFilter]);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    const handleEdit = (userId: string) => {
        setSelectedUserId(userId);
        setIsModalOpen(true);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle2 size={14} className="text-green-500" />;
            case 'past_due': return <AlertCircle size={14} className="text-amber-500" />;
            case 'cancelled': return <XCircle size={14} className="text-red-500" />;
            default: return <AlertCircle size={14} className="text-slate-400" />;
        }
    };

    const filteredSubscriptions = subscriptions.filter(sub =>
        sub.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.plan_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[32px] font-bold tracking-tight text-slate-900">User Subscriptions</h1>
                        <p className="text-[16px] text-slate-500 mt-1">
                            Monitor and manage user subscription plans and billing status.
                        </p>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Filters */}
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search email or plan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex p-1 bg-slate-100 rounded-xl">
                                {['All', 'Active', 'Cancelled', 'Past_Due'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setStatusFilter(f.toLowerCase())}
                                        className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${statusFilter === f.toLowerCase()
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-900'
                                            }`}
                                    >
                                        {f.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Current Plan</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Billing</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Seats</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={7} className="px-6 py-8 bg-slate-50/30" />
                                        </tr>
                                    ))
                                ) : filteredSubscriptions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <Repeat size={48} strokeWidth={1} className="mb-4 opacity-20" />
                                                <p className="text-[16px] font-medium">No subscriptions found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredSubscriptions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <User size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[14px] font-bold text-slate-900 line-clamp-1">{sub.user_email}</p>
                                                    <p className="text-[11px] text-slate-400 font-mono">ID: {sub.user_id.substring(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <CreditCard size={14} className="text-purple-500" />
                                                <span className="text-[14px] font-semibold text-slate-700">{sub.plan_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${sub.status === 'active' ? 'bg-green-50 text-green-600' :
                                                    sub.status === 'past_due' ? 'bg-amber-50 text-amber-600' :
                                                        sub.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {getStatusIcon(sub.status)}
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[13px] font-medium text-slate-600 capitalize">{sub.billing_cycle}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[14px] font-bold text-slate-900">{sub.seats}</span>
                                        </td>
                                        <td className="px-6 py-4 text-[13px] text-slate-500">
                                            {new Date(sub.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEdit(sub.user_id)}
                                                className="p-2 rounded-xl bg-slate-50 hover:bg-white hover:shadow-sm border border-slate-200 transition-all text-slate-600"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-6 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-[13px] text-slate-500">
                            Showing <span className="font-bold text-slate-900">{filteredSubscriptions.length}</span> subscriptions
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || isLoading}
                                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={subscriptions.length < 20 || isLoading}
                                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <SubscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchSubscriptions}
                userId={selectedUserId}
            />
        </AdminLayout>
    );
}
