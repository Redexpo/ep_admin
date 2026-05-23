'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search, ChevronLeft, ChevronRight, Eye,
    Folder, Video, Image as ImageIcon, Archive, Trash2, Globe, Lock,
    FolderOpen
} from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminFolderService, AdminFolder } from '@/services/admin/folderService';
import { toast } from 'sonner';

export default function FoldersPage() {
    const [isLoading,    setIsLoading]    = useState(true);
    const [folders,      setFolders]      = useState<AdminFolder[]>([]);
    const [currentPage,  setCurrentPage]  = useState(1);
    const [searchQuery,  setSearchQuery]  = useState('');
    const [debouncedQ,   setDebouncedQ]   = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [showDeleted,  setShowDeleted]  = useState(false);

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedQ(searchQuery); setCurrentPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const fetchFolders = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await adminFolderService.getFolders(
                currentPage, 20, debouncedQ || undefined, undefined, showArchived, showDeleted
            );
            setFolders(data);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to fetch folders');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedQ, showArchived, showDeleted]);

    useEffect(() => { fetchFolders(); }, [fetchFolders]);

    const counts = useMemo(() => ({
        total:    folders.length,
        public:   folders.filter(f => f.is_public).length,
        archived: folders.filter(f => f.is_archived).length,
        deleted:  folders.filter(f => f.is_deleted).length,
    }), [folders]);

    const totalVideos      = useMemo(() => folders.reduce((s, f) => s + f.video_count, 0),       [folders]);
    const totalScreenshots = useMemo(() => folders.reduce((s, f) => s + f.screen_shot_count, 0), [folders]);

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <AdminLayout>
            <div className="p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
                {/* Header */}
                <div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight">Folders</h1>
                    <p className="text-[14px] text-slate-500 mt-0.5">Browse all folders across workspaces and users.</p>
                    {!isLoading && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[12px] font-bold text-slate-600">
                                <Folder size={11} /> {counts.total} folders
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[12px] font-bold text-blue-700 border border-blue-100">
                                <Video size={11} /> {totalVideos} videos
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[12px] font-bold text-slate-600">
                                <ImageIcon size={11} /> {totalScreenshots} screenshots
                            </span>
                            {counts.public > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-[12px] font-bold text-green-700 border border-green-100">
                                    <Globe size={11} /> {counts.public} public
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
                                placeholder="Search by folder name…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/30 focus:border-[#8c00ff] transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <div
                                    onClick={() => { setShowArchived(v => !v); setCurrentPage(1); }}
                                    className={`w-9 h-5 rounded-full transition-all relative ${showArchived ? 'bg-amber-400' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${showArchived ? 'left-4' : 'left-0.5'}`} />
                                </div>
                                <span className="text-[12px] font-bold text-slate-600">Archived</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <div
                                    onClick={() => { setShowDeleted(v => !v); setCurrentPage(1); }}
                                    className={`w-9 h-5 rounded-full transition-all relative ${showDeleted ? 'bg-red-400' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${showDeleted ? 'left-4' : 'left-0.5'}`} />
                                </div>
                                <span className="text-[12px] font-bold text-slate-600">Deleted</span>
                            </label>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Folder</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Workspace</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Owner</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Contents</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Visibility</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">State</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Created</th>
                                    <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">View</th>
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
                                ) : folders.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 text-slate-300">
                                                <FolderOpen size={40} strokeWidth={1} />
                                                <p className="text-[14px] text-slate-400 font-medium">No folders found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    folders.map((folder) => {
                                        const isDeleted  = folder.is_deleted;
                                        const isArchived = !folder.is_deleted && folder.is_archived;
                                        return (
                                            <tr key={folder.id} className={`hover:bg-slate-50/60 transition-colors ${isDeleted ? 'opacity-50' : ''}`}>
                                                {/* Folder */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                                            style={{ backgroundColor: folder.color + '40', color: folder.color }}
                                                        >
                                                            <Folder size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-bold text-slate-900">{folder.name}</p>
                                                            {folder.parent_folder_id && (
                                                                <p className="text-[10px] text-slate-400">nested</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Workspace */}
                                                <td className="px-6 py-4">
                                                    <span className="text-[12px] font-bold text-slate-700 truncate max-w-[140px] block">{folder.workspace_name}</span>
                                                </td>
                                                {/* Owner */}
                                                <td className="px-6 py-4">
                                                    <span className="text-[12px] text-slate-600 truncate max-w-[160px] block">{folder.owner_email}</span>
                                                </td>
                                                {/* Contents */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1 text-slate-600">
                                                            <Video size={12} className="text-blue-400" />
                                                            <span className="text-[12px] font-bold">{folder.video_count}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-slate-600">
                                                            <ImageIcon size={12} className="text-slate-400" />
                                                            <span className="text-[12px] font-bold">{folder.screen_shot_count}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Visibility */}
                                                <td className="px-6 py-4">
                                                    {folder.is_public ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-100">
                                                            <Globe size={10} /> Public
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                            <Lock size={10} /> Private
                                                        </span>
                                                    )}
                                                </td>
                                                {/* State */}
                                                <td className="px-6 py-4">
                                                    {isDeleted ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-100">
                                                            <Trash2 size={10} /> Deleted
                                                        </span>
                                                    ) : isArchived ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                                            <Archive size={10} /> Archived
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-100">
                                                            Active
                                                        </span>
                                                    )}
                                                </td>
                                                {/* Created */}
                                                <td className="px-6 py-4">
                                                    <span className="text-[12px] text-slate-500">{fmt(folder.created_at)}</span>
                                                </td>
                                                {/* View */}
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={`/admin/folders/${folder.id}`}
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
                            Showing <span className="font-bold text-slate-900">{folders.length}</span> folders
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
                                disabled={folders.length < 20 || isLoading}
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
