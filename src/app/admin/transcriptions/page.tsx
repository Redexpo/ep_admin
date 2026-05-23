'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search, ChevronLeft, ChevronRight, FileText, Eye,
    Video, Globe, Clock, BookOpen, AlignLeft,
} from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminTranscriptionService, AdminTranscription, fmtDuration } from '@/services/admin/transcriptionService';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    completed:  { label: 'Completed',  bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500'  },
    pending:    { label: 'Pending',    bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400'  },
    processing: { label: 'Processing', bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
    failed:     { label: 'Failed',     bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500'    },
};

function StatusBadge({ status }: { status: string | null }) {
    const cfg = STATUS_CONFIG[status ?? ''] ?? { label: status ?? '—', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

const STATUS_FILTERS = ['all', 'completed', 'pending', 'processing', 'failed'];

export default function TranscriptionsPage() {
    const [isLoading,      setIsLoading]      = useState(true);
    const [transcriptions, setTranscriptions] = useState<AdminTranscription[]>([]);
    const [currentPage,    setCurrentPage]    = useState(1);
    const [searchQuery,    setSearchQuery]    = useState('');
    const [debouncedQ,     setDebouncedQ]     = useState('');
    const [statusFilter,   setStatusFilter]   = useState('all');

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedQ(searchQuery); setCurrentPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const fetchTranscriptions = useCallback(async () => {
        try {
            setIsLoading(true);
            setTranscriptions(await adminTranscriptionService.getTranscriptions(
                currentPage, 20,
                debouncedQ || undefined,
                statusFilter !== 'all' ? statusFilter : undefined,
            ));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to load transcriptions');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedQ, statusFilter]);

    useEffect(() => { fetchTranscriptions(); }, [fetchTranscriptions]);

    const counts = useMemo(() => ({
        total:      transcriptions.length,
        completed:  transcriptions.filter(t => t.status === 'completed').length,
        pending:    transcriptions.filter(t => t.status === 'pending').length,
        failed:     transcriptions.filter(t => t.status === 'failed').length,
    }), [transcriptions]);

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });

    return (
        <AdminLayout>
            <div className="p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
                {/* Header */}
                <div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight">Transcriptions</h1>
                    <p className="text-[14px] text-slate-500 mt-0.5">AI-generated transcriptions for all recordings.</p>
                    {!isLoading && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[12px] font-bold text-slate-600">
                                <FileText size={11} /> {counts.total} transcriptions
                            </span>
                            {counts.completed > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-[12px] font-bold text-green-700 border border-green-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {counts.completed} completed
                                </span>
                            )}
                            {counts.pending > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-[12px] font-bold text-amber-700 border border-amber-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {counts.pending} pending
                                </span>
                            )}
                            {counts.failed > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[12px] font-bold text-red-700 border border-red-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {counts.failed} failed
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search title or transcript text…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/30 focus:border-[#8c00ff] transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-1.5">
                            {STATUS_FILTERS.map(s => (
                                <button
                                    key={s}
                                    onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                                    className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold capitalize transition-all ${
                                        statusFilter === s
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                                >
                                    {s === 'all' ? 'All' : s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Video</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Title</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Language</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Duration</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Chapters</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Words</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Created</th>
                                    <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-5 w-40 bg-slate-100 rounded-lg" /></td>
                                            <td colSpan={8} className="px-6 py-4"><div className="h-5 bg-slate-100 rounded-lg w-full" /></td>
                                        </tr>
                                    ))
                                ) : transcriptions.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 text-slate-300">
                                                <FileText size={40} strokeWidth={1} />
                                                <p className="text-[14px] text-slate-400 font-medium">No transcriptions found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transcriptions.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-3.5 max-w-[200px]">
                                                <div className="flex items-center gap-1.5">
                                                    <Video size={12} className="text-slate-400 shrink-0" />
                                                    <span className="text-[12px] font-semibold text-slate-800 truncate">
                                                        {t.recording_title ?? <span className="text-slate-400 italic font-normal">Untitled</span>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5 max-w-[180px]">
                                                <span className="text-[12px] text-slate-600 truncate block">
                                                    {t.title ?? <span className="text-slate-300 italic">—</span>}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                {t.language ? (
                                                    <div className="flex items-center gap-1">
                                                        <Globe size={11} className="text-slate-400" />
                                                        <span className="text-[12px] font-semibold text-slate-700 uppercase">{t.language}</span>
                                                    </div>
                                                ) : <span className="text-slate-300">—</span>}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={11} className="text-slate-400" />
                                                    <span className="text-[12px] font-mono text-slate-600">{fmtDuration(t.duration)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                {t.chapters_count > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-[#8c00ff]/10 text-[#8c00ff]">
                                                        <BookOpen size={9} /> {t.chapters_count}
                                                    </span>
                                                ) : <span className="text-slate-300 text-[12px]">—</span>}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                {t.word_count > 0 ? (
                                                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-600">
                                                        <AlignLeft size={11} className="text-slate-400" />
                                                        {t.word_count.toLocaleString()}
                                                    </span>
                                                ) : <span className="text-slate-300 text-[12px]">—</span>}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <StatusBadge status={t.status} />
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className="text-[12px] text-slate-500">{fmt(t.created_at)}</span>
                                            </td>
                                            <td className="px-6 py-3.5 text-right">
                                                <Link
                                                    href={`/admin/transcriptions/${t.id}`}
                                                    className="w-8 h-8 inline-flex items-center justify-center rounded-xl text-slate-400 hover:bg-purple-50 hover:text-[#8c00ff] transition-all"
                                                    title="View detail"
                                                >
                                                    <Eye size={15} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[12px] text-slate-500">
                            Showing <span className="font-bold text-slate-900">{transcriptions.length}</span> transcriptions
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoading}
                                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-[13px] font-bold text-slate-700 px-2">Page {currentPage}</span>
                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={transcriptions.length < 20 || isLoading}
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
