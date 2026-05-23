'use client';

import { useState, useEffect, useCallback, use } from 'react';
import {
    ArrowLeft, FileText, Video, Globe, Clock,
    BookOpen, AlignLeft, ChevronDown, ChevronUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    adminTranscriptionService, AdminTranscriptionDetail,
    fmtDuration, TranscriptionChapter, TranscriptionSegment,
} from '@/services/admin/transcriptionService';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    completed:  { label: 'Completed',  bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500'  },
    pending:    { label: 'Pending',    bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400'  },
    processing: { label: 'Processing', bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
    failed:     { label: 'Failed',     bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500'    },
};

function fmtSec(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

export default function TranscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData]           = useState<AdminTranscriptionDetail | null>(null);
    const [showSegments, setShowSegments] = useState(false);

    const fetchDetail = useCallback(async () => {
        try {
            setIsLoading(true);
            setData(await adminTranscriptionService.getTranscriptionDetail(id));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to load transcription');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="p-8 space-y-4 max-w-5xl mx-auto">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-3xl" />)}
                </div>
            </AdminLayout>
        );
    }

    if (!data) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <div className="p-6 rounded-full bg-red-50 text-red-400"><FileText size={48} strokeWidth={1} /></div>
                    <h2 className="text-[22px] font-black text-slate-900">Transcription Not Found</h2>
                    <button onClick={() => router.push('/admin/transcriptions')} className="mt-2 px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold active:scale-95 transition-all">
                        Back to Transcriptions
                    </button>
                </div>
            </AdminLayout>
        );
    }

    const statusCfg = STATUS_CONFIG[data.status ?? ''] ?? { label: data.status ?? '—', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' };

    return (
        <AdminLayout>
            <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/transcriptions')}
                        className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-90"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-[24px] font-black text-slate-900 tracking-tight">
                                {data.title || data.recording_title || 'Transcription'}
                            </h1>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusCfg.bg} ${statusCfg.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} /> {statusCfg.label}
                            </span>
                        </div>
                        {data.recording_title && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Video size={12} className="text-slate-400" />
                                <p className="text-[13px] text-slate-400">{data.recording_title}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Language',  value: data.language?.toUpperCase() ?? '—', icon: <Globe    size={16} />, bg: 'bg-blue-50',   text: 'text-blue-600'  },
                        { label: 'Duration',  value: fmtDuration(data.duration),           icon: <Clock    size={16} />, bg: 'bg-slate-100', text: 'text-slate-600' },
                        { label: 'Chapters',  value: String(data.chapters_count || '—'),   icon: <BookOpen size={16} />, bg: 'bg-purple-50', text: 'text-[#8c00ff]' },
                        { label: 'Words',     value: data.word_count > 0 ? data.word_count.toLocaleString() : '—', icon: <AlignLeft size={16} />, bg: 'bg-green-50', text: 'text-green-600' },
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col gap-3 shadow-xl"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{card.label}</span>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.bg} ${card.text}`}>
                                    {card.icon}
                                </div>
                            </div>
                            <span className="text-[15px] font-black leading-snug">{card.value}</span>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Transcription text */}
                    <div className="lg:col-span-7 space-y-4">
                        <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#8c00ff] px-1">Transcript</h3>
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            {data.transcription ? (
                                <div className="p-6 max-h-[520px] overflow-y-auto">
                                    <p className="text-[13px] text-slate-700 leading-[1.85] whitespace-pre-wrap font-serif">
                                        {data.transcription}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-300">
                                    <FileText size={40} strokeWidth={1} />
                                    <p className="text-[13px] text-slate-400">
                                        {data.status === 'pending' ? 'Transcription in queue…' : 'No transcript available'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Segments collapsible */}
                        {data.transcription_segments.length > 0 && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setShowSegments(v => !v)}
                                    className="w-full flex items-center justify-between px-6 py-4 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <span>Segments <span className="text-slate-400 font-normal">({data.transcription_segments.length})</span></span>
                                    {showSegments ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                </button>
                                {showSegments && (
                                    <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                                        {data.transcription_segments.map((seg: TranscriptionSegment, i) => (
                                            <div key={i} className="flex items-start gap-4 px-6 py-3">
                                                <span className="text-[10px] font-mono font-bold text-[#8c00ff] shrink-0 w-20 mt-0.5">
                                                    {fmtSec(seg.start)} → {fmtSec(seg.end)}
                                                </span>
                                                <p className="text-[12px] text-slate-600 leading-relaxed">{seg.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Chapters + meta */}
                    <div className="lg:col-span-5 space-y-4">
                        {/* Chapters */}
                        {data.chapters.length > 0 && (
                            <>
                                <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#8c00ff] px-1">Chapters</h3>
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                                    {data.chapters.map((ch: TranscriptionChapter, i) => (
                                        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                                            <span className="text-[10px] font-mono font-bold text-[#8c00ff] shrink-0 w-12">
                                                {fmtSec(ch.start ?? 0)}
                                            </span>
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className="w-5 h-5 rounded-lg bg-[#8c00ff]/10 text-[#8c00ff] text-[10px] font-black flex items-center justify-center shrink-0">
                                                    {i + 1}
                                                </span>
                                                <p className="text-[12px] font-semibold text-slate-700 truncate">{ch.title}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Metadata */}
                        <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#8c00ff] px-1">Details</h3>
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                            {[
                                { label: 'Recording ID',  value: data.recording_encrypted_id },
                                { label: 'Language',      value: data.language ?? '—' },
                                { label: 'Direction',     value: data.direction ?? '—' },
                                { label: 'Duration',      value: fmtDuration(data.duration) },
                                { label: 'Chapters',      value: String(data.chapters_count) },
                                { label: 'Word Count',    value: data.word_count.toLocaleString() },
                                { label: 'Created',       value: new Date(data.created_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) },
                                { label: 'Updated',       value: new Date(data.updated_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) },
                            ].map((row, i) => (
                                <div key={i} className="flex items-start gap-3 px-5 py-3">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-28 shrink-0 mt-0.5">{row.label}</span>
                                    <span className="text-[12px] font-semibold text-slate-700 break-all">{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
