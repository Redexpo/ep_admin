'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    CheckCircle2,
    XCircle,
    AlertCircle,
    User,
    Eye,
    Clock,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminSubscriptionService, AdminPaymentOrder } from '@/services/admin/subscriptionService';
import { toast } from 'sonner';

export default function PaymentsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState<AdminPaymentOrder[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [gatewayFilter, setGatewayFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await adminSubscriptionService.listPaymentOrders(
                currentPage,
                20,
                statusFilter === 'all' ? undefined : statusFilter,
                gatewayFilter === 'all' ? undefined : gatewayFilter
            );
            setOrders(data.orders);
            setTotal(data.total);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch payment orders");
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, statusFilter, gatewayFilter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle2 size={14} className="text-green-500" />;
            case 'failed': return <XCircle size={14} className="text-red-500" />;
            case 'pending':
            case 'initiated': return <Clock size={14} className="text-slate-400" />;
            default: return <AlertCircle size={14} className="text-purple-500" />;
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'success': return 'bg-green-50 text-green-600';
            case 'failed': return 'bg-red-50 text-red-600';
            case 'pending':
            case 'initiated': return 'bg-slate-50 text-slate-500';
            default: return 'bg-purple-50 text-purple-600';
        }
    };

    const filteredOrders = orders.filter(order =>
        order.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.basket_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.bill_id && order.bill_id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[32px] font-bold tracking-tight text-slate-900">Payment Orders</h1>
                        <p className="text-[16px] text-slate-500 mt-1">
                            Review checkout attempts, track transaction status, and audit gateway interactions.
                        </p>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Filters */}
                    <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search email, basket ID, or bill ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Status Filter */}
                            <div className="flex p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
                                {['All', 'Success', 'Failed', 'Initiated', 'Executing'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setStatusFilter(f.toLowerCase())}
                                        className={`px-4 py-1.5 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all ${statusFilter === f.toLowerCase()
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-900'
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>

                            {/* Gateway Filter */}
                            <select
                                value={gatewayFilter}
                                onChange={(e) => setGatewayFilter(e.target.value)}
                                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Gateways</option>
                                <option value="neemio">NeemIO</option>
                                <option value="stripe">Stripe</option>
                                <option value="paypal">PayPal</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Basket ID</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Plan / Amount</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-8 bg-slate-50/30" />
                                        </tr>
                                    ))
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <CreditCard size={48} strokeWidth={1} className="mb-4 opacity-20" />
                                                <p className="text-[16px] font-medium">No payment orders found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <Link href={`/admin/payments/${order.id}`}>
                                                <p className="text-[14px] font-bold text-purple-600 hover:underline cursor-pointer">
                                                    {order.basket_id}
                                                </p>
                                            </Link>
                                            {order.bill_id && (
                                                <p className="text-[11px] text-slate-400 font-mono">
                                                    {order.bill_id.substring(0, Math.floor(order.bill_id.length / 2))}...
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                    <User size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[14px] font-bold text-slate-900 truncate">{order.user_email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[14px] font-bold text-slate-900">{order.plan_name}</p>
                                            <p className="text-[12px] text-purple-600 font-bold">${order.amount_usd.toFixed(2)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${getStatusStyles(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[13px] font-semibold text-slate-700">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                            <p className="text-[11px] text-slate-400 font-medium">
                                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-6 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-[13px] text-slate-500">
                            Showing <span className="font-bold text-slate-900">{filteredOrders.length}</span> of <span className="font-bold text-slate-900">{total}</span> orders
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || isLoading}
                                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-all font-bold text-slate-600"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="px-4 text-[14px] font-bold text-slate-900">
                                Page {currentPage}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={(currentPage * 20) >= total || isLoading}
                                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-all font-bold text-slate-600"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
