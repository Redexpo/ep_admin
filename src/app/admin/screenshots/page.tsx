'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search, ChevronLeft, ChevronRight, Eye,
    Archive, Trash2, Globe, Lock, Camera, Building2, User
} from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminScreenshotService, AdminScreenshot, formatBytes } from '@/services/admin/screenshotService';
import { toast } from 'sonner';

export default function ScreenshotsPage() {
    const [isLoading,    setIsLoading]    = useState(true);
    const [screenshots,  setScreenshots]  = useState<AdminScreenshot[]>([]);
    const [currentPage,  setCurrentPage]  = useState(1);
    const [searchQuery,  setSearchQuery]  = useState('');
    const [debouncedQ,   setDebouncedQ]   = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [showDeleted,  setShowDeleted]  = useState(false);

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedQ(searchQuery); setCurrentPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const fetchScreenshots = useCallback(async () => {
        try {
            setIsLoading(true);
            setScreenshots(await adminScreenshotService.getScreenshots(
                currentPage, 20, debouncedQ || undefined, showArchived, showDeleted,
            ));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to fetch screenshots');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedQ, showArchived, showDeleted]);

    useEffect(() => { fetchScreenshots(); }, [fetchScreenshots]);

    const counts = useMemo(() => ({
        total:    screenshots.length,
        archived: screenshots.filter(s => s.is_archived).length,
        deleted:  screenshots.filter(s => s.is_deleted).length,
    }), [screenshots]);

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <AdminLayout>
            <div className="p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
                {/* Header */}
                <div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight">Screenshots</h1>
                    <p className="text-[14px] text-slate-500 mt-0.5">All user screenshots across workspaces.</p>
                    {!isLoading && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[12px] font-bold text-slate-600">
                                <Camera size={11} /> {counts.total} screenshots
                            </span>
                            {counts.archived > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-[12px] font-bold text-amber-700 border border-amber-100">
                                    <Archive size={11} /> {counts.archived} archived
                                </span>
                            )}
                            {counts.deleted > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[12px] font-bold text-red-700 border border-red-100">
                                    <Trash2 size={11} /> {counts.deleted} deleted
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
                                placeholder="Search title or filename…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/30 focus:border-[#8c00ff] transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            {[
                                { label: 'Archived', active: showArchived, color: 'bg-amber-400', toggle: () => { setShowArchived(v => !v); setCurrentPage(1); } },
                                { label: 'Deleted',  active: showDeleted,  color: 'bg-red-400',   toggle: () => { setShowDeleted(v => !v);  setCurrentPage(1); } },
                            ].map(({ label, active, color, toggle }) => (
                                <label key={label} className="flex items-center gap-2 cursor-pointer select-none">
                                    <div onClick={toggle} className={`w-9 h-5 rounded-full transition-all relative ${active ? color : 'bg-slate-200'}`}>
                                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${active ? 'left-4' : 'left-0.5'}`} />
                                    </div>
                                    <span className="text-[12px] font-bold text-slate-600">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Preview</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Title / File</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Owner</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Workspace</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Size</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">State</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Created</th>
                                    <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="w-14 h-10 bg-slate-100 rounded-xl" /></td>
                                            <td colSpan={7} className="px-6 py-4"><div className="h-5 bg-slate-100 rounded-lg w-full" /></td>
                                        </tr>
                                    ))
                                ) : screenshots.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 text-slate-300">
                                                <Camera size={40} strokeWidth={1} />
                                                <p className="text-[14px] text-slate-400 font-medium">No screenshots found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    screenshots.map((ss) => {
                                        const isDeleted  = ss.is_deleted;
                                        const isArchived = !ss.is_deleted && ss.is_archived;
                                        return (
                                            <tr key={ss.id} className={`hover:bg-slate-50/60 transition-colors ${isDeleted ? 'opacity-50' : ''}`}>
                                                {/* Thumbnail */}
                                                <td className="px-6 py-3">
                                                    <div className="w-14 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={ss.url}
                                                            alt={ss.title ?? ss.file_name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                        />
                                                    </div>
                                                </td>
                                                {/* Title / File */}
                                                <td className="px-6 py-3 max-w-[220px]">
                                                    <p className="text-[13px] font-bold text-slate-900 truncate">
                                                        {ss.title || <span className="text-slate-400 font-normal italic">Untitled</span>}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 font-mono truncate">{ss.file_name}</p>
                                                </td>
                                                {/* Owner */}
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <User size={12} className="text-slate-400 shrink-0" />
                                                        <span className="text-[12px] text-slate-700 truncate max-w-[160px]">{ss.owner_email}</span>
                                                    </div>
                                                </td>
                                                {/* Workspace */}
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <Building2 size={12} className="text-slate-400 shrink-0" />
                                                        <span className="text-[12px] font-bold text-slate-700 truncate max-w-[120px]">{ss.workspace_name}</span>
                                                    </div>
                                                </td>
                                                {/* Size */}
                                                <td className="px-6 py-3">
                                                    <span className="text-[12px] font-semibold text-slate-600">{formatBytes(ss.size)}</span>
                                                </td>
                                                {/* State */}
                                                <td className="px-6 py-3">
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
                                                <td className="px-6 py-3">
                                                    <span className="text-[12px] text-slate-500">{fmt(ss.created_at)}</span>
                                                </td>
                                                {/* View */}
                                                <td className="px-6 py-3 text-right">
                                                    <Link
                                                        href={`/admin/screenshots/${ss.id}`}
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
                            Showing <span className="font-bold text-slate-900">{screenshots.length}</span> screenshots
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoading}
                                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-[13px] font-bold text-slate-700 px-2">Page {currentPage}</span>
                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={screenshots.length < 20 || isLoading}
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
