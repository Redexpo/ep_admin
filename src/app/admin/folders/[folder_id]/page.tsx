'use client';

import { useState, useEffect, useCallback, use } from 'react';
import {
    ArrowLeft, Folder, Video, Image as ImageIcon, Globe, Lock,
    Archive, Trash2, Calendar, User, Building2, Key, GitBranch
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminFolderService, AdminFolder } from '@/services/admin/folderService';
import { toast } from 'sonner';

export default function FolderDetailPage({ params }: { params: Promise<{ folder_id: string }> }) {
    const { folder_id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<AdminFolder | null>(null);

    const fetchDetail = useCallback(async () => {
        try {
            setIsLoading(true);
            setData(await adminFolderService.getFolderDetail(folder_id));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to fetch folder');
        } finally {
            setIsLoading(false);
        }
    }, [folder_id]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    const fmt = (d?: string | null) => d
        ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : '—';

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="p-8 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-full h-24 bg-slate-100 animate-pulse rounded-3xl" />
                    ))}
                </div>
            </AdminLayout>
        );
    }

    if (!data) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <div className="p-6 rounded-full bg-red-50 text-red-400"><Folder size={48} strokeWidth={1} /></div>
                    <h2 className="text-[22px] font-black text-slate-900">Folder Not Found</h2>
                    <button onClick={() => router.push('/admin/folders')} className="mt-2 px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold active:scale-95 transition-all">
                        Back to Folders
                    </button>
                </div>
            </AdminLayout>
        );
    }

    const isDeleted  = data.is_deleted;
    const isArchived = !data.is_deleted && data.is_archived;

    return (
        <AdminLayout>
            <div className="p-8 max-w-4xl mx-auto space-y-8 pb-20">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/folders')}
                        className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-90"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: data.color }}
                        >
                            <Folder size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-[26px] font-black text-slate-900 tracking-tight">{data.name}</h1>
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
                            <p className="text-[13px] text-slate-400 mt-0.5">{data.workspace_name}</p>
                        </div>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Videos',       value: data.video_count,       icon: <Video size={16} />, bg: 'bg-blue-50',   text: 'text-blue-600'  },
                        { label: 'Screenshots',  value: data.screen_shot_count, icon: <ImageIcon size={16} />, bg: 'bg-slate-100', text: 'text-slate-600' },
                        { label: 'Visibility',   value: data.is_public ? 'Public' : 'Private', icon: data.is_public ? <Globe size={16} /> : <Lock size={16} />, bg: data.is_public ? 'bg-green-50' : 'bg-slate-100', text: data.is_public ? 'text-green-600' : 'text-slate-500' },
                        { label: 'Type',         value: data.parent_folder_id ? 'Nested' : 'Root', icon: <GitBranch size={16} />, bg: 'bg-purple-50', text: 'text-[#8c00ff]' },
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
                            <span className="text-[22px] font-black">{card.value}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Info table */}
                <div className="space-y-4">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#8c00ff] px-1">Folder Details</h3>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                        {[
                            { icon: <Folder    size={15} />, label: 'Name',        value: data.name },
                            { icon: <Key       size={15} />, label: 'Encrypted ID', value: data.folder_encrypted_id },
                            { icon: <Building2 size={15} />, label: 'Workspace',   value: data.workspace_name },
                            { icon: <User      size={15} />, label: 'Owner',       value: data.owner_email },
                            {
                                icon: <Globe size={15} />,
                                label: 'Visibility',
                                value: data.is_public ? 'Public' : 'Private',
                            },
                            {
                                icon: <GitBranch size={15} />,
                                label: 'Parent Folder',
                                value: data.parent_folder_id ? data.parent_folder_id : 'Root (no parent)',
                            },
                            { icon: <Calendar  size={15} />, label: 'Created',     value: fmt(data.created_at) },
                            { icon: <Calendar  size={15} />, label: 'Updated',     value: fmt(data.updated_at) },
                        ].map((row, i) => (
                            <div key={i} className="flex items-center gap-4 px-6 py-4">
                                <div className="text-slate-400 shrink-0">{row.icon}</div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider w-28 shrink-0">{row.label}</span>
                                <span className="text-[13px] font-semibold text-slate-800 break-all">{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
