'use client';

import { useState, useEffect, useCallback, use } from 'react';
import {
    ArrowLeft, Camera, Archive, Trash2, User,
    Building2, Folder, Calendar, HardDrive, FileType, Key, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminScreenshotService, AdminScreenshot, formatBytes } from '@/services/admin/screenshotService';
import { toast } from 'sonner';

export default function ScreenshotDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<AdminScreenshot | null>(null);
    const [imgError, setImgError] = useState(false);

    const fetchDetail = useCallback(async () => {
        try {
            setIsLoading(true);
            setData(await adminScreenshotService.getScreenshotDetail(id));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to load screenshot');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const fmtShort = (d: string) => new Date(d).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });

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
                    <div className="p-6 rounded-full bg-red-50 text-red-400"><Camera size={48} strokeWidth={1} /></div>
                    <h2 className="text-[22px] font-black text-slate-900">Screenshot Not Found</h2>
                    <button onClick={() => router.push('/admin/screenshots')} className="mt-2 px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold active:scale-95 transition-all">
                        Back to Screenshots
                    </button>
                </div>
            </AdminLayout>
        );
    }

    const isDeleted  = data.is_deleted;
    const isArchived = !data.is_deleted && data.is_archived;

    return (
        <AdminLayout>
            <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/screenshots')}
                        className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-90"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-[24px] font-black text-slate-900 tracking-tight">
                                {data.title || data.file_name}
                            </h1>
                            {isDeleted && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-100">
                                    <Trash2 size={10} /> Deleted
                                </span>
                            )}
                            {isArchived && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                    <Archive size={10} /> Archived
                                </span>
                            )}
                            {!isDeleted && !isArchived && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-100">
                                    Active
                                </span>
                            )}
                        </div>
                        <p className="text-[13px] text-slate-400 font-mono mt-0.5">{data.file_name}</p>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'File Size',  value: formatBytes(data.size),          icon: <HardDrive size={16} />, bg: 'bg-blue-50',   text: 'text-blue-600'  },
                        { label: 'Type',       value: data.mime_type ?? '—',            icon: <FileType  size={16} />, bg: 'bg-slate-100', text: 'text-slate-600' },
                        { label: 'Workspace',  value: data.workspace_name,              icon: <Building2 size={16} />, bg: 'bg-purple-50', text: 'text-[#8c00ff]' },
                        { label: 'Captured',   value: fmtShort(data.created_at),        icon: <Calendar  size={16} />, bg: 'bg-green-50',  text: 'text-green-600' },
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
                    {/* Image preview */}
                    <div className="lg:col-span-7 space-y-4">
                        <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#8c00ff] px-1">Preview</h3>
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            {!imgError ? (
                                <div className="relative group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={data.url}
                                        alt={data.title ?? data.file_name}
                                        className="w-full object-contain max-h-[480px] bg-slate-50"
                                        onError={() => setImgError(true)}
                                    />
                                    <a
                                        href={data.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-sm text-[12px] font-bold text-slate-700 border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#8c00ff]"
                                    >
                                        <ExternalLink size={12} /> Open original
                                    </a>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-300">
                                    <Camera size={40} strokeWidth={1} />
                                    <p className="text-[13px] text-slate-400">Preview unavailable</p>
                                    <a
                                        href={data.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[12px] font-bold text-[#8c00ff] hover:underline flex items-center gap-1"
                                    >
                                        <ExternalLink size={12} /> Open URL directly
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="lg:col-span-5 space-y-4">
                        <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#8c00ff] px-1">Details</h3>
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                            {[
                                { icon: <Camera    size={14} />, label: 'Title',      value: data.title || <span className="text-slate-400 italic">Untitled</span> },
                                { icon: <FileType  size={14} />, label: 'File Name',  value: data.file_name },
                                { icon: <FileType  size={14} />, label: 'MIME Type',  value: data.mime_type ?? '—' },
                                { icon: <HardDrive size={14} />, label: 'Size',       value: formatBytes(data.size) },
                                { icon: <Key       size={14} />, label: 'Enc. ID',    value: data.screenshot_encrypted_id },
                                { icon: <User      size={14} />, label: 'Owner',      value: data.owner_email },
                                { icon: <Building2 size={14} />, label: 'Workspace',  value: data.workspace_name },
                                { icon: <Folder    size={14} />, label: 'Folder',     value: data.folder_id ?? 'Root' },
                                { icon: <Calendar  size={14} />, label: 'Captured',   value: fmt(data.created_at) },
                                { icon: <Calendar  size={14} />, label: 'Updated',    value: fmt(data.updated_at) },
                            ].map((row, i) => (
                                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                                    <div className="text-slate-400 shrink-0 mt-0.5">{row.icon}</div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-24 shrink-0 mt-0.5">{row.label}</span>
                                    <span className="text-[12px] font-semibold text-slate-800 break-all">{row.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Direct link */}
                        <a
                            href={data.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-[#8c00ff] hover:border-[#8c00ff]/30 transition-all"
                        >
                            <ExternalLink size={14} /> Open Full Image
                        </a>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
