'use client';

import { useState, useEffect, useCallback } from 'react';
import { Gift, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight, RotateCcw, RefreshCw, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminSubscriptionService, AssignmentRecord } from '@/services/admin/subscriptionService';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [revokingId, setRevokingId] = useState<string | null>(null);

    const fetchAssignments = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await adminSubscriptionService.listAssignments(page, PAGE_SIZE, statusFilter || undefined);
            setAssignments(res.assignments);
            setTotal(res.total);
        } catch {
            toast.error('Failed to load assignments');
        } finally {
            setIsLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

    const handleRevoke = async (assignment: AssignmentRecord) => {
        if (!confirm(`Revoke assignment for user ${assignment.user_id}? They will be downgraded to the free plan immediately.`)) return;
        try {
            setRevokingId(assignment.id);
            await adminSubscriptionService.revokeAssignment(assignment.id, { notes: 'Revoked from admin panel' });
            toast.success('Assignment revoked');
            fetchAssignments();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to revoke assignment';
            toast.error(msg);
        } finally {
            setRevokingId(null);
        }
    };

    const statusConfig: Record<string, { label: string; classes: string; icon: React.ReactNode }> = {
        active:   { label: 'Active',   classes: 'bg-green-50 text-green-700 border-green-200',     icon: <CheckCircle2 size={11} /> },
        expired:  { label: 'Expired',  classes: 'bg-slate-100 text-slate-500 border-slate-200',    icon: <Clock size={11} /> },
        revoked:  { label: 'Revoked',  classes: 'bg-red-50 text-red-600 border-red-200',           icon: <XCircle size={11} /> },
        replaced: { label: 'Replaced', classes: 'bg-amber-50 text-amber-700 border-amber-200',     icon: <RefreshCw size={11} /> },
    };

    const fmt = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const daysLeft = (endDate: string) => {
        const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
        return diff;
    };

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
        <AdminLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg,#8c00ff,#7c3aed)' }}>
                            <Gift size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Plan Assignments</h1>
                            <p className="text-[14px] text-slate-500 mt-0.5">Admin-assigned complimentary subscriptions — {total.toLocaleString()} total</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                        <Filter size={13} /> Filter
                    </div>
                    {['', 'active', 'expired', 'revoked', 'replaced'].map(s => (
                        <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setPage(1); }}
                            className={`px-4 py-1.5 rounded-lg text-[12px] font-bold border transition-all ${
                                statusFilter === s
                                    ? 'border-[#8c00ff] text-[#8c00ff] bg-[#f3eefe]'
                                    : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300'
                            }`}
                        >
                            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-[1fr_1fr_100px_120px_120px_100px_100px_120px] gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50">
                        {['User', 'Plan', 'Seats', 'Start', 'End', 'Days Left', 'Status', 'Actions'].map(h => (
                            <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</span>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="divide-y divide-slate-50">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="h-14 px-6 flex items-center gap-4">
                                    <div className="h-3 w-40 bg-slate-100 animate-pulse rounded-full" />
                                    <div className="h-3 w-24 bg-slate-100 animate-pulse rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : assignments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                            <Gift size={40} strokeWidth={1.5} />
                            <p className="text-[14px] font-medium">No assignments found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {assignments.map((a, i) => {
                                const sc = statusConfig[a.status] ?? statusConfig['expired'];
                                const dl = daysLeft(a.end_date);
                                return (
                                    <motion.div
                                        key={a.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="grid grid-cols-[1fr_1fr_100px_120px_120px_100px_100px_120px] gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors"
                                    >
                                        {/* User */}
                                        <Link href={`/admin/subscriptions/assignments/${a.id}`} className="text-[13px] font-semibold text-[#8c00ff] hover:underline truncate">
                                            {a.user_id.slice(-8)}
                                        </Link>

                                        {/* Plan */}
                                        <span className="text-[13px] font-medium text-slate-700 truncate">{a.plan_name || '—'}</span>

                                        {/* Seats */}
                                        <span className="text-[13px] font-bold text-slate-800">{a.seats}</span>

                                        {/* Start */}
                                        <span className="text-[12px] text-slate-500">{fmt(a.start_date)}</span>

                                        {/* End */}
                                        <span className="text-[12px] text-slate-500">{fmt(a.end_date)}</span>

                                        {/* Days Left */}
                                        <span className={`text-[13px] font-bold ${a.status === 'active' ? dl <= 7 ? 'text-red-600' : dl <= 30 ? 'text-amber-600' : 'text-slate-800' : 'text-slate-400'}`}>
                                            {a.status === 'active' ? dl : '—'}
                                        </span>

                                        {/* Status */}
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border w-fit ${sc.classes}`}>
                                            {sc.icon} {sc.label}
                                        </span>

                                        {/* Actions */}
                                        <div>
                                            {a.status === 'active' ? (
                                                <button
                                                    onClick={() => handleRevoke(a)}
                                                    disabled={revokingId === a.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-50"
                                                >
                                                    <RotateCcw size={11} />
                                                    {revokingId === a.id ? '…' : 'Revoke'}
                                                </button>
                                            ) : (
                                                <span className="text-[11px] text-slate-300 font-medium">—</span>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-[13px] text-slate-500">
                            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-[13px] font-bold text-slate-700 px-2">{page} / {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
