'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Search, ChevronLeft, ChevronRight, Edit2, Eye,
    CheckCircle2, XCircle, AlertCircle, Clock, User, Users, RefreshCw, Gift
} from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminSubscriptionService, AdminSubscription } from '@/services/admin/subscriptionService';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; chip: string; filter: string }> = {
    active:    { label: 'Active',    icon: <CheckCircle2 size={12} />, chip: 'bg-green-50  text-green-700  border-green-100',   filter: 'active'    },
    cancelled: { label: 'Cancelled', icon: <XCircle      size={12} />, chip: 'bg-red-50    text-red-700    border-red-100',     filter: 'cancelled' },
    past_due:  { label: 'Past Due',  icon: <AlertCircle  size={12} />, chip: 'bg-amber-50  text-amber-700  border-amber-100',   filter: 'past_due'  },
    trialing:  { label: 'Trialing',  icon: <Clock        size={12} />, chip: 'bg-blue-50   text-blue-700   border-blue-100',    filter: 'trialing'  },
    free:      { label: 'Free',      icon: <CheckCircle2 size={12} />, chip: 'bg-slate-100 text-slate-600  border-slate-200',   filter: 'free'      },
    expired:   { label: 'Expired',   icon: <Clock        size={12} />, chip: 'bg-slate-100 text-slate-500  border-slate-200',   filter: 'expired'   },
    replaced:  { label: 'Replaced',  icon: <RefreshCw    size={12} />, chip: 'bg-purple-50 text-purple-600 border-purple-100',  filter: 'replaced'  },
};

export default function SubscriptionsPage() {
    const [isLoading,      setIsLoading]      = useState(true);
    const [subscriptions,  setSubscriptions]  = useState<AdminSubscription[]>([]);
    const [currentPage,    setCurrentPage]    = useState(1);
    const [statusFilter,   setStatusFilter]   = useState('all');
    const [searchQuery,    setSearchQuery]    = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input — 500ms after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchSubscriptions = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await adminSubscriptionService.getSubscriptions(
                currentPage, 20,
                statusFilter === 'all' ? undefined : statusFilter,
                undefined,
                debouncedSearch || undefined,
            );
            setSubscriptions(data);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to fetch subscriptions');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, statusFilter, debouncedSearch]);

    useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

    // Summary counts from current page
    const counts = {
        active:    subscriptions.filter(s => s.status === 'active').length,
        free:      subscriptions.filter(s => s.status === 'free').length,
        past_due:  subscriptions.filter(s => s.status === 'past_due').length,
        cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
    };

    const FILTER_TABS = [
        { label: 'All',       value: 'all'       },
        { label: 'Active',    value: 'active'    },
        { label: 'Free',      value: 'free'      },
        { label: 'Past Due',  value: 'past_due'  },
        { label: 'Cancelled', value: 'cancelled' },
    ];

    return (
        <AdminLayout>
            <div className="p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
                {/* Header */}
                <div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight">User Subscriptions</h1>
                    <p className="text-[14px] text-slate-500 mt-0.5">Monitor and manage subscription plans, usage, and entitlements.</p>

                    {/* Stat chips */}
                    {!isLoading && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-[12px] font-bold text-green-700 border border-green-100">
                                <CheckCircle2 size={11} /> {counts.active} active
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[12px] font-bold text-slate-600">
                                <Users size={11} /> {counts.free} free
                            </span>
                            {counts.past_due > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-[12px] font-bold text-amber-700 border border-amber-100">
                                    <AlertCircle size={11} /> {counts.past_due} past due
                                </span>
                            )}
                            {counts.cancelled > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[12px] font-bold text-red-700 border border-red-100">
                                    <XCircle size={11} /> {counts.cancelled} cancelled
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Table card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search email, user ID, subscription ID…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/30 focus:border-[#8c00ff] transition-all"
                            />
                            {searchQuery !== debouncedSearch && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-[#8c00ff] border-t-transparent animate-spin" />
                            )}
                        </div>
                        <div className="flex p-1 bg-slate-100 rounded-xl gap-0.5 overflow-x-auto no-scrollbar">
                            {FILTER_TABS.map(tab => (
                                <button
                                    key={tab.value}
                                    onClick={() => { setStatusFilter(tab.value); setCurrentPage(1); setSearchQuery(''); setDebouncedSearch(''); }}
                                    className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold whitespace-nowrap transition-all ${
                                        statusFilter === tab.value
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Plan</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Billing</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Seats</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Next Billing</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Created</th>
                                    <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={8} className="px-6 py-4">
                                                <div className="h-5 bg-slate-100 rounded-lg w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : subscriptions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 text-slate-300">
                                                <User size={40} strokeWidth={1} />
                                                <p className="text-[14px] text-slate-400 font-medium">No subscriptions found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    subscriptions.map((sub) => {
                                        const sc = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG['free'];
                                        return (
                                            <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                                                {/* User */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-[#8c00ff] shrink-0">
                                                            <User size={15} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[13px] font-bold text-slate-900 truncate max-w-[200px]">{sub.user_email}</p>
                                                            <p className="text-[10px] text-slate-400 font-mono">{sub.user_id.substring(0, 12)}…</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Plan */}
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                                                        {sub.plan_name}
                                                    </span>
                                                </td>
                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${sc.chip}`}>
                                                        {sc.icon} {sc.label}
                                                    </span>
                                                </td>
                                                {/* Billing */}
                                                <td className="px-6 py-4">
                                                    {sub.subscription_source === 'admin_assigned' ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-100">
                                                            <Gift size={10} /> Assigned
                                                        </span>
                                                    ) : sub.billing_cycle === 'none' ? (
                                                        <span className="text-[13px] text-slate-400 font-medium">—</span>
                                                    ) : (
                                                        <span className="text-[13px] text-slate-600 capitalize font-medium">{sub.billing_cycle}</span>
                                                    )}
                                                </td>
                                                {/* Seats */}
                                                <td className="px-6 py-4">
                                                    <span className="text-[13px] font-bold text-slate-900">{sub.seats}</span>
                                                </td>
                                                {/* Next Billing */}
                                                <td className="px-6 py-4">
                                                    {sub.current_period_end ? (
                                                        <span className="text-[12px] text-slate-600 font-medium">
                                                            {new Date(sub.current_period_end).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[12px] text-slate-400">—</span>
                                                    )}
                                                </td>
                                                {/* Created */}
                                                <td className="px-6 py-4">
                                                    <span className="text-[12px] text-slate-500">{new Date(sub.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                </td>
                                                {/* Actions */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={`/admin/subscriptions/${sub.id}`}
                                                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-purple-50 hover:text-[#8c00ff] transition-all"
                                                            title="View details"
                                                        >
                                                            <Eye size={15} />
                                                        </Link>
                                                        <Link
                                                            href={`/admin/subscriptions/${sub.id}/edit`}
                                                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
                                                            title="Edit usage & entitlements"
                                                        >
                                                            <Edit2 size={15} />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[12px] text-slate-500">
                            Showing <span className="font-bold text-slate-900">{subscriptions.length}</span> subscriptions
                            {debouncedSearch && <span className="ml-1">for <span className="font-bold text-slate-700">&ldquo;{debouncedSearch}&rdquo;</span></span>}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || isLoading}
                                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-[13px] font-bold text-slate-700 px-2">Page {currentPage}</span>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={subscriptions.length < 20 || isLoading}
                                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
