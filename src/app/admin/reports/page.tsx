'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminReportService, AdminReport, REPORT_REASONS } from '@/services/admin/reportService';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactElement }> = {
    pending:   { label: 'Pending',   color: 'text-amber-700', bg: 'bg-amber-50',  icon: <Clock size={10} /> },
    resolved:  { label: 'Resolved',  color: 'text-green-700', bg: 'bg-green-50',  icon: <CheckCircle2 size={10} /> },
    dismissed: { label: 'Dismissed', color: 'text-slate-500', bg: 'bg-slate-100', icon: <XCircle size={10} /> },
};

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

type StatusFilter = 'all' | 'pending' | 'resolved' | 'dismissed';

export default function ReportsPage() {
    const [data,     setData]     = useState<AdminReport[]>([]);
    const [loading,  setLoading]  = useState(true);
    const [page,     setPage]     = useState(1);
    const [status,   setStatus]   = useState<StatusFilter>('all');
    const [reason,   setReason]   = useState('');
    const [updating, setUpdating] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setData(await adminReportService.getReports(
                page,
                status === 'all' ? undefined : status,
                reason || undefined,
            ));
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to load reports');
        } finally {
            setLoading(false);
        }
    }, [page, status, reason]);

    useEffect(() => { load(); }, [load]);

    const pendingCount = useMemo(() => data.filter(r => r.status === 'pending').length, [data]);

    async function handleStatus(report: AdminReport, newStatus: string) {
        if (newStatus === report.status) return;
        setUpdating(report.id);
        try {
            await adminReportService.updateStatus(report.id, newStatus);
            toast.success(`Report marked as ${newStatus}`);
            setData(prev => prev.map(r =>
                r.id === report.id ? { ...r, status: newStatus as AdminReport['status'] } : r,
            ));
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to update report');
        } finally {
            setUpdating(null);
        }
    }

    return (
        <AdminLayout>
            <div className="p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
                <div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight">Reports</h1>
                    <p className="text-[14px] text-slate-500 mt-0.5">User-submitted content reports requiring review.</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Filters */}
                    <div className="px-6 py-4 border-b border-slate-50 flex flex-wrap items-center gap-2">
                        {(['all', 'pending', 'resolved', 'dismissed'] as StatusFilter[]).map(s => (
                            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold capitalize transition-all ${
                                    status === s
                                        ? s === 'pending'   ? 'bg-amber-500 text-white'
                                        : s === 'resolved'  ? 'bg-green-600 text-white'
                                        : s === 'dismissed' ? 'bg-slate-500 text-white'
                                        : 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}>
                                {s === 'all' ? 'All statuses' : STATUS_CONFIG[s]?.label ?? s}
                            </button>
                        ))}
                        <div className="w-px h-5 bg-slate-200 mx-1" />
                        <button onClick={() => { setReason(''); setPage(1); }}
                            className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                                !reason ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}>
                            All reasons
                        </button>
                        {REPORT_REASONS.map(r => (
                            <button key={r} onClick={() => { setReason(r); setPage(1); }}
                                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold capitalize transition-all ${
                                    reason === r ? 'bg-[#8c00ff] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}>
                                {r.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>

                    {/* Pending alert */}
                    {!loading && pendingCount > 0 && status === 'all' && (
                        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl text-[12px] font-semibold text-amber-700">
                            <Clock size={14} /> {pendingCount} pending report{pendingCount > 1 ? 's' : ''} on this page
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto mt-2">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Reporter</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Recording</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Reason</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Details</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Reported</th>
                                    <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-100 rounded-full" /></td>
                                            <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-lg" /></td>
                                        </tr>
                                    ))
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center text-[13px] text-slate-400">
                                            No reports found
                                        </td>
                                    </tr>
                                ) : data.map(report => {
                                    const cfg        = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.pending;
                                    const isPending  = report.status === 'pending';
                                    const isUpdating = updating === report.id;
                                    return (
                                        <tr key={report.id}
                                            className={`hover:bg-slate-50/60 transition-colors ${isPending ? 'bg-amber-50/30' : ''}`}>
                                            <td className="px-6 py-4">
                                                <p className="text-[13px] font-semibold text-slate-800 leading-tight">{report.user_name}</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">{report.user_email}</p>
                                            </td>
                                            <td className="px-6 py-4 max-w-[200px]">
                                                {report.recording_title ? (
                                                    <p className="text-[12px] font-medium text-slate-700 truncate">{report.recording_title}</p>
                                                ) : (
                                                    <span className="text-[11px] font-mono text-slate-400 select-all">{report.recording_encrypted_id}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 capitalize">
                                                    {report.reason.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 max-w-[220px]">
                                                {report.details
                                                    ? <p className="text-[11px] text-slate-500 line-clamp-2">{report.details}</p>
                                                    : <span className="text-slate-300 text-[11px]">—</span>
                                                }
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.color}`}>
                                                    {cfg.icon} {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[11px] text-slate-500 whitespace-nowrap">{fmtDate(report.created_at)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    {report.status !== 'resolved' && (
                                                        <button disabled={isUpdating}
                                                            onClick={() => handleStatus(report, 'resolved')}
                                                            className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-green-50 text-green-700 hover:bg-green-100 transition-all disabled:opacity-40">
                                                            Resolve
                                                        </button>
                                                    )}
                                                    {report.status !== 'dismissed' && (
                                                        <button disabled={isUpdating}
                                                            onClick={() => handleStatus(report, 'dismissed')}
                                                            className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all disabled:opacity-40">
                                                            Dismiss
                                                        </button>
                                                    )}
                                                    {report.status !== 'pending' && (
                                                        <button disabled={isUpdating}
                                                            onClick={() => handleStatus(report, 'pending')}
                                                            className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all disabled:opacity-40">
                                                            Reopen
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
                    <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[12px] text-slate-500">
                            Showing <span className="font-bold text-slate-900">{data.length}</span> reports
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}
                                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-[13px] font-bold text-slate-700 px-2">Page {page}</span>
                            <button onClick={() => setPage(p => p + 1)} disabled={data.length < 20 || loading}
                                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
