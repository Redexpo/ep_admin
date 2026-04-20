'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft,
    CreditCard,
    CheckCircle2,
    XCircle,
    AlertCircle,
    User,
    Clock,
    Globe,
    Code,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Hash,
    ShieldCheck,
    DollarSign,
    Box
} from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminSubscriptionService, AdminPaymentOrderDetail } from '@/services/admin/subscriptionService';
import { toast } from 'sonner';

export default function PaymentOrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [detail, setDetail] = useState<AdminPaymentOrderDetail | null>(null);
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await adminSubscriptionService.getPaymentOrderDetail(id as string);
            setDetail(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch payment detail");
            router.push('/admin/payments');
        } finally {
            setIsLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        if (id) fetchDetail();
    }, [id, fetchDetail]);

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </AdminLayout>
        );
    }

    if (!detail) return null;

    const { order, transactions, logs } = detail;

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'success': return 'bg-green-50 text-green-600';
            case 'failed': return 'bg-red-50 text-red-600';
            case 'pending':
            case 'initiated': return 'bg-slate-50 text-slate-500';
            default: return 'bg-purple-50 text-purple-600';
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Back Link & Header */}
                <div className="flex flex-col gap-4">
                    <Link
                        href="/admin/payments"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-600 transition-colors w-fit text-[14px] font-bold"
                    >
                        <ChevronLeft size={16} />
                        Back to Payments
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-[32px] font-bold tracking-tight text-slate-900">Payment Order</h1>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold uppercase ${getStatusStyles(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-[14px] text-slate-400 font-mono mt-1">ID: {order.id}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Summary & Transactions */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Order Summary Card */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <Box className="text-purple-600" size={20} />
                                <h2 className="text-[18px] font-bold text-slate-900">Order Summary</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <SummaryItem icon={<User size={16} />} label="Customer" value={order.user_name} subValue={order.user_email} />
                                    <SummaryItem icon={<CreditCard size={16} />} label="Plan" value={order.plan_name} subValue={`${order.billing_cycle} • ${order.seats} seats`} />
                                </div>
                                <div className="space-y-4">
                                    <SummaryItem icon={<DollarSign size={16} />} label="Amount" value={`$${order.amount_usd.toFixed(2)}`} subValue="USD" />
                                    <SummaryItem icon={<Globe size={16} />} label="Gateway" value={order.gateway.toUpperCase()} subValue={`Basket: ${order.basket_id}`} />
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Created At</p>
                                    <p className="text-[14px] font-semibold text-slate-700">
                                        {new Date(order.created_at).toLocaleString()}
                                    </p>
                                </div>
                                {order.bill_id && (
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gateway Bill ID</p>
                                        <p className="text-[14px] font-mono text-slate-700">{order.bill_id}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Transaction Timeline */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <ShieldCheck className="text-purple-600" size={20} />
                                <h2 className="text-[18px] font-bold text-slate-900">Transaction History</h2>
                            </div>

                            <div className="space-y-6">
                                {transactions.length === 0 ? (
                                    <p className="text-slate-400 text-[14px] italic">No transaction records found.</p>
                                ) : (
                                    transactions.map((tx, idx) => (
                                        <div key={tx.id} className="relative pl-8 pb-6 last:pb-0">
                                            {/* Vertical Line */}
                                            {idx !== transactions.length - 1 && (
                                                <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-slate-100" />
                                            )}
                                            {/* Dot */}
                                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${tx.status === 'success' ? 'bg-green-500' : tx.status === 'failed' ? 'bg-red-500' : 'bg-slate-300'}`}>
                                                {tx.status === 'success' ? <CheckCircle2 size={10} className="text-white" /> : <Clock size={10} className="text-white" />}
                                            </div>

                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                <div>
                                                    <p className="text-[14px] font-bold text-slate-900 uppercase">
                                                        {tx.step} <span className="ml-2 font-mono text-[11px] text-slate-400">TX: {tx.transaction_id || 'N/A'}</span>
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 font-medium">{new Date(tx.created_at).toLocaleString()}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${tx.status === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                        {tx.status}
                                                    </span>
                                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">
                                                        {tx.scheme}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Raw Response Preview */}
                                            {tx.gateway_response && (
                                                <div className="mt-3 p-4 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                                                    <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-tight">Gateway Response Preview</p>
                                                    <pre className="text-[11px] font-mono whitespace-pre-wrap text-slate-600 max-h-40 overflow-y-auto">
                                                        {JSON.stringify(tx.gateway_response, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Audit Logs (Detailed interactions) */}
                    <div className="space-y-6 lg:max-h-[1200px] overflow-y-auto pr-2 no-scrollbar">
                        <div className="flex items-center gap-2 px-2">
                            <Code className="text-purple-600" size={18} />
                            <h2 className="text-[16px] font-bold text-slate-900">Interaction Audit Trail</h2>
                        </div>

                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-purple-200"
                            >
                                <div
                                    className="p-4 cursor-pointer flex items-center justify-between"
                                    onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${log.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {log.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[13px] font-bold text-slate-900 uppercase truncate">{log.step}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{new Date(log.created_at).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    {expandedLogId === log.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                </div>

                                {expandedLogId === log.id && (
                                    <div className="p-4 pt-0 border-t border-slate-50 space-y-4">
                                        <div className="pt-4">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Target URL</p>
                                            <code className="text-[10px] bg-slate-100 p-1.5 rounded block whitespace-nowrap overflow-x-auto text-slate-600">
                                                {log.url}
                                            </code>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Request Payload</p>
                                            <pre className="text-[10px] bg-slate-900 text-purple-200 p-4 rounded-xl overflow-x-auto">
                                                {JSON.stringify(log.request_payload, null, 2)}
                                            </pre>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Response Payload <span className="ml-2 font-mono text-purple-600">HTTP {log.status_code}</span></p>
                                            <pre className="text-[10px] bg-slate-50 text-slate-700 p-4 rounded-xl overflow-x-auto border border-slate-100">
                                                {JSON.stringify(log.response_payload, null, 2)}
                                            </pre>
                                        </div>

                                        {!log.success && log.error_message && (
                                            <div className="bg-red-50 border border-red-100 p-3 rounded-xl">
                                                <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Error Message</p>
                                                <p className="text-[12px] text-red-700 font-medium">{log.error_message}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {logs.length === 0 && (
                            <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <Code size={32} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-[13px] text-slate-400">No interaction logs captured for this order.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function SummaryItem({ icon, label, value, subValue }: { icon: any, label: string, value: string, subValue: string }) {
    return (
        <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-[15px] font-bold text-slate-900 truncate">{value}</p>
                <p className="text-[12px] text-slate-500 truncate">{subValue}</p>
            </div>
        </div>
    );
}
