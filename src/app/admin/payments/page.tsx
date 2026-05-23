'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search, ChevronLeft, ChevronRight, CreditCard,
    CheckCircle2, XCircle, AlertCircle, Clock, User, Eye
} from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminSubscriptionService, AdminPaymentOrder } from '@/services/admin/subscriptionService';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; chip: string }> = {
    success:   { label: 'Success',   icon: <CheckCircle2 size={12} />, chip: 'bg-green-50  text-green-700  border-green-100'  },
    failed:    { label: 'Failed',    icon: <XCircle      size={12} />, chip: 'bg-red-50    text-red-700    border-red-100'    },
    pending:   { label: 'Pending',   icon: <Clock        size={12} />, chip: 'bg-slate-100 text-slate-600  border-slate-200'  },
    initiated: { label: 'Initiated', icon: <Clock        size={12} />, chip: 'bg-slate-100 text-slate-600  border-slate-200'  },
    executing: { label: 'Executing', icon: <AlertCircle  size={12} />, chip: 'bg-purple-50 text-purple-700 border-purple-100' },
};

const STATUS_TABS = [
    { label: 'All',       value: 'all'       },
    { label: 'Success',   value: 'success'   },
    { label: 'Failed',    value: 'failed'    },
    { label: 'Initiated', value: 'initiated' },
    { label: 'Executing', value: 'executing' },
];

export default function PaymentsPage() {
    const [isLoading,     setIsLoading]     = useState(true);
    const [orders,        setOrders]        = useState<AdminPaymentOrder[]>([]);
    const [total,         setTotal]         = useState(0);
    const [currentPage,   setCurrentPage]   = useState(1);
    const [statusFilter,  setStatusFilter]  = useState('all');
    const [searchQuery,   setSearchQuery]   = useState('');

    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await adminSubscriptionService.listPaymentOrders(
                currentPage, 20,
                statusFilter === 'all' ? undefined : statusFilter,
                undefined // gateway filter removed — only Paddle
            );
            setOrders(data.orders);
            setTotal(data.total);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to fetch payment orders');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, statusFilter]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const filtered = useMemo(() =>
        orders.filter(o =>
            o.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.basket_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (o.bill_id && o.bill_id.toLowerCase().includes(searchQuery.toLowerCase()))
        ),
        [orders, searchQuery]
    );

    const totalPages = Math.max(1, Math.ceil(total / 20));

    return (
        <AdminLayout>
            <div className="p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
                {/* Header */}
                <div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight">Payment Orders</h1>
                    <p className="text-[14px] text-slate-500 mt-0.5">Audit checkout attempts, transaction status, and Paddle gateway interactions.</p>
                    {!isLoading && (
                        <div className="flex items-center gap-3 mt-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[12px] font-bold text-slate-600">
                                <CreditCard size={11} /> {total} total orders
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-[12px] font-bold text-green-700 border border-green-100">
                                <CheckCircle2 size={11} /> {orders.filter(o => o.status === 'success').length} successful
                            </span>
                            {orders.filter(o => o.status === 'failed').length > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[12px] font-bold text-red-700 border border-red-100">
                                    <XCircle size={11} /> {orders.filter(o => o.status === 'failed').length} failed
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Table card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search email, basket ID, bill ID…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/30 focus:border-[#8c00ff] transition-all"
                            />
                        </div>
                        <div className="flex p-1 bg-slate-100 rounded-xl gap-0.5 overflow-x-auto no-scrollbar">
                            {STATUS_TABS.map(tab => (
                                <button
                                    key={tab.value}
                                    onClick={() => { setStatusFilter(tab.value); setCurrentPage(1); }}
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
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Basket ID</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Plan</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={7} className="px-6 py-4">
                                                <div className="h-5 bg-slate-100 rounded-lg w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 text-slate-300">
                                                <CreditCard size={40} strokeWidth={1} />
                                                <p className="text-[14px] text-slate-400 font-medium">No payment orders found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((order) => {
                                        const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['initiated'];
                                        return (
                                            <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                                                {/* Basket */}
                                                <td className="px-6 py-4">
                                                    <p className="text-[13px] font-bold text-[#8c00ff]">{order.basket_id}</p>
                                                    {order.bill_id && (
                                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                            {order.bill_id.substring(0, 16)}…
                                                        </p>
                                                    )}
                                                </td>
                                                {/* User */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                            <User size={14} />
                                                        </div>
                                                        <span className="text-[13px] font-bold text-slate-900 truncate max-w-[180px]">{order.user_email}</span>
                                                    </div>
                                                </td>
                                                {/* Plan */}
                                                <td className="px-6 py-4">
                                                    <span className="text-[13px] font-bold text-slate-800">{order.plan_name}</span>
                                                </td>
                                                {/* Amount */}
                                                <td className="px-6 py-4">
                                                    <span className="text-[14px] font-black text-slate-900">${order.amount_usd.toFixed(2)}</span>
                                                </td>
                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${sc.chip}`}>
                                                        {sc.icon} {sc.label}
                                                    </span>
                                                </td>
                                                {/* Date */}
                                                <td className="px-6 py-4">
                                                    <p className="text-[12px] font-semibold text-slate-700">
                                                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400">
                                                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                    </p>
                                                </td>
                                                {/* View */}
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={`/admin/payments/${order.id}`}
                                                        className="w-8 h-8 inline-flex items-center justify-center rounded-xl text-slate-400 hover:bg-purple-50 hover:text-[#8c00ff] transition-all"
                                                        title="View detail"
                                                    >
                                                        <Eye size={15} />
                                                    </Link>
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
                            Page <span className="font-bold text-slate-900">{currentPage}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
                            &nbsp;·&nbsp;
                            <span className="font-bold text-slate-900">{total}</span> total
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || isLoading}
                                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage >= totalPages || isLoading}
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
