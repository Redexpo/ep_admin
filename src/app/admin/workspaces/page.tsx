'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search, ChevronLeft, ChevronRight, Eye,
    Users, Layers, Archive, Trash2, Globe, Lock, Star
} from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminWorkspaceService, AdminWorkspace } from '@/services/admin/workspaceService';
import { toast } from 'sonner';

const VISIBILITY_CONFIG: Record<string, { label: string; cls: string }> = {
    public:    { label: 'Public',    cls: 'bg-green-50  text-green-700  border-green-100'  },
    private:   { label: 'Private',   cls: 'bg-slate-100 text-slate-600  border-slate-200'  },
    workspace: { label: 'Workspace', cls: 'bg-blue-50   text-blue-700   border-blue-100'   },
    password:  { label: 'Password',  cls: 'bg-amber-50  text-amber-700  border-amber-100'  },
    invite:    { label: 'Invite',    cls: 'bg-purple-50 text-purple-700 border-purple-100' },
};

export default function WorkspacesPage() {
    const [isLoading,    setIsLoading]    = useState(true);
    const [workspaces,   setWorkspaces]   = useState<AdminWorkspace[]>([]);
    const [currentPage,  setCurrentPage]  = useState(1);
    const [searchQuery,  setSearchQuery]  = useState('');
    const [debouncedQ,   setDebouncedQ]   = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [showDeleted,  setShowDeleted]  = useState(false);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => { setDebouncedQ(searchQuery); setCurrentPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const fetchWorkspaces = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await adminWorkspaceService.getWorkspaces(
                currentPage, 20, debouncedQ || undefined, showArchived, showDeleted
            );
            setWorkspaces(data);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to fetch workspaces');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedQ, showArchived, showDeleted]);

    useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

    const counts = useMemo(() => ({
        total:    workspaces.length,
        default:  workspaces.filter(w => w.is_default).length,
        archived: workspaces.filter(w => w.is_archived).length,
        deleted:  workspaces.filter(w => w.is_deleted).length,
    }), [workspaces]);

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <AdminLayout>
            <div className="p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
                {/* Header */}
                <div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight">Workspaces</h1>
                    <p className="text-[14px] text-slate-500 mt-0.5">Monitor all user workspaces, membership, and sharing settings.</p>
                    {!isLoading && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[12px] font-bold text-slate-600">
                                <Layers size={11} /> {counts.total} workspaces
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[12px] font-bold text-[#8c00ff] border border-purple-100">
                                <Star size={11} /> {counts.default} default
                            </span>
                            {counts.archived > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-[12px] font-bold text-amber-700 border border-amber-100">
                                    <Archive size={11} /> {counts.archived} archived
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
                                placeholder="Search by workspace name…"
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
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Workspace</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Owner</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Members</th>
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
                                            <td colSpan={7} className="px-6 py-4">
                                                <div className="h-5 bg-slate-100 rounded-lg w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : workspaces.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 text-slate-300">
                                                <Layers size={40} strokeWidth={1} />
                                                <p className="text-[14px] text-slate-400 font-medium">No workspaces found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    workspaces.map((ws) => {
                                        const vc = VISIBILITY_CONFIG[ws.default_visibility] ?? VISIBILITY_CONFIG['private'];
                                        const isDeleted  = ws.is_deleted;
                                        const isArchived = !ws.is_deleted && ws.is_archived;

                                        return (
                                            <tr key={ws.id} className={`hover:bg-slate-50/60 transition-colors ${isDeleted ? 'opacity-50' : ''}`}>
                                                {/* Workspace */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {ws.logo ? (
                                                            /* eslint-disable-next-line @next/next/no-img-element */
                                                            <img src={ws.logo} alt={ws.name} className="w-8 h-8 rounded-xl object-cover shrink-0" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-[#8c00ff] font-black text-[13px] shrink-0">
                                                                {ws.name?.[0]?.toUpperCase() ?? 'W'}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <p className="text-[13px] font-bold text-slate-900">{ws.name}</p>
                                                                {ws.is_default && (
                                                                    <Star size={11} className="text-[#8c00ff] fill-purple-100" />
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 font-mono">/{ws.slug}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Owner */}
                                                <td className="px-6 py-4">
                                                    <span className="text-[13px] font-medium text-slate-700 truncate max-w-[180px] block">{ws.owner_email}</span>
                                                </td>
                                                {/* Members */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-slate-700">
                                                        <Users size={13} className="text-slate-400" />
                                                        <span className="text-[13px] font-bold">{ws.member_count}</span>
                                                    </div>
                                                </td>
                                                {/* Visibility */}
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border w-fit ${vc.cls}`}>
                                                            {ws.lock_visibility ? <Lock size={9} /> : <Globe size={9} />}
                                                            {vc.label}
                                                        </span>
                                                        {ws.lock_visibility && (
                                                            <span className="text-[10px] text-slate-400 font-medium">locked</span>
                                                        )}
                                                    </div>
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
                                                    <span className="text-[12px] text-slate-500">{fmt(ws.created_at)}</span>
                                                </td>
                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={`/admin/workspaces/${ws.id}`}
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
                            Showing <span className="font-bold text-slate-900">{workspaces.length}</span> workspaces
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
                                disabled={workspaces.length < 20 || isLoading}
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
