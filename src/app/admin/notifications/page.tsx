'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search, ChevronLeft, ChevronRight, Bell,
    Building2, Video, User, ChevronDown, ChevronUp,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    adminNotificationService, AdminNotification,
    NOTIFICATION_TYPES, TYPE_CONFIG,
} from '@/services/admin/notificationService';
import { toast } from 'sonner';

function TypeBadge({ type }: { type: string }) {
    const cfg = TYPE_CONFIG[type] ?? { label: type, emoji: '📌', bg: 'bg-slate-100', text: 'text-slate-600' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
            <span className="text-[13px] leading-none">{cfg.emoji}</span>
            {cfg.label}
        </span>
    );
}

function MetaDataPanel({ meta }: { meta: Record<string, unknown> }) {
    const entries = Object.entries(meta).filter(([, v]) => v !== null && v !== undefined && v !== '');
    if (entries.length === 0) return <p className="text-[12px] text-slate-400 italic">No metadata</p>;
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
            {entries.map(([k, v]) => (
                <div key={k} className="flex items-start gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 w-28 mt-0.5">{k.replace(/_/g, ' ')}</span>
                    <span className="text-[11px] text-slate-600 break-all">
                        {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                    </span>
                </div>
            ))}
        </div>
    );
}

type ReadFilter = 'all' | 'unread' | 'read';

export default function NotificationsPage() {
    const [isLoading,      setIsLoading]      = useState(true);
    const [notifications,  setNotifications]  = useState<AdminNotification[]>([]);
    const [currentPage,    setCurrentPage]    = useState(1);
    const [searchQuery,    setSearchQuery]    = useState('');
    const [debouncedQ,     setDebouncedQ]     = useState('');
    const [typeFilter,     setTypeFilter]     = useState('');
    const [readFilter,     setReadFilter]     = useState<ReadFilter>('all');
    const [expandedId,     setExpandedId]     = useState<string | null>(null);

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedQ(searchQuery); setCurrentPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const fetchNotifications = useCallback(async () => {
        try {
            setIsLoading(true);
            const isRead = readFilter === 'all' ? undefined : readFilter === 'read';
            setNotifications(await adminNotificationService.getNotifications(
                currentPage, 20,
                typeFilter || undefined,
                isRead,
                debouncedQ || undefined,
            ));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to load notifications');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, typeFilter, readFilter, debouncedQ]);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const counts = useMemo(() => ({
        total:  notifications.length,
        unread: notifications.filter(n => !n.is_read).length,
        read:   notifications.filter(n => n.is_read).length,
    }), [notifications]);

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    const READ_TABS: { id: ReadFilter; label: string }[] = [
        { id: 'all',    label: 'All'    },
        { id: 'unread', label: 'Unread' },
        { id: 'read',   label: 'Read'   },
    ];

    return (
        <AdminLayout>
            <div className="p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
                {/* Header */}
                <div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight">Notifications</h1>
                    <p className="text-[14px] text-slate-500 mt-0.5">All user notifications across workspaces.</p>
                    {!isLoading && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[12px] font-bold text-slate-600">
                                <Bell size={11} /> {counts.total} notifications
                            </span>
                            {counts.unread > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8c00ff]/10 text-[12px] font-bold text-[#8c00ff] border border-[#8c00ff]/20">
                                    {counts.unread} unread
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-slate-50 flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* Search */}
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search message, user or email…"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/30 focus:border-[#8c00ff] transition-all"
                                />
                            </div>

                            {/* Read/Unread tabs */}
                            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                                {READ_TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setReadFilter(tab.id); setCurrentPage(1); }}
                                        className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                                            readFilter === tab.id
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Type filter chips */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <button
                                onClick={() => { setTypeFilter(''); setCurrentPage(1); }}
                                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                                    typeFilter === ''
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                            >
                                All types
                            </button>
                            {NOTIFICATION_TYPES.map(t => {
                                const cfg = TYPE_CONFIG[t];
                                return (
                                    <button
                                        key={t}
                                        onClick={() => { setTypeFilter(typeFilter === t ? '' : t); setCurrentPage(1); }}
                                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                                            typeFilter === t
                                                ? `${cfg.bg} ${cfg.text}`
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                    >
                                        <span className="text-[13px] leading-none">{cfg.emoji}</span>
                                        {cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Message</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">From</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Workspace</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Meta</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded-full" /></td>
                                            <td colSpan={6} className="px-6 py-4"><div className="h-5 bg-slate-100 rounded-lg w-full" /></td>
                                        </tr>
                                    ))
                                ) : notifications.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 text-slate-300">
                                                <Bell size={40} strokeWidth={1} />
                                                <p className="text-[14px] text-slate-400 font-medium">No notifications found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    notifications.map(n => {
                                        const expanded = expandedId === n.id;
                                        return (
                                            <>
                                                <tr
                                                    key={n.id}
                                                    className={`transition-colors ${!n.is_read ? 'bg-[#8c00ff]/[0.02]' : ''} hover:bg-slate-50/60`}
                                                >
                                                    <td className="px-6 py-3.5">
                                                        <TypeBadge type={n.notification_type} />
                                                    </td>
                                                    <td className="px-6 py-3.5 max-w-[260px]">
                                                        <div className="flex items-center gap-2">
                                                            {!n.is_read && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#8c00ff] shrink-0" />
                                                            )}
                                                            <p className="text-[12px] text-slate-700 line-clamp-2 leading-relaxed">
                                                                {n.message ?? <span className="text-slate-400 italic">No message</span>}
                                                            </p>
                                                        </div>
                                                        {n.recording_encrypted_id && (
                                                            <div className="flex items-center gap-1 mt-1 pl-3.5">
                                                                <Video size={10} className="text-slate-300" />
                                                                <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">{n.recording_encrypted_id}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-3.5">
                                                        {n.from_user_name ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <User size={12} className="text-slate-400 shrink-0" />
                                                                <div>
                                                                    <p className="text-[12px] font-semibold text-slate-700 truncate max-w-[130px]">{n.from_user_name}</p>
                                                                    {n.from_user_email && (
                                                                        <p className="text-[10px] text-slate-400 truncate max-w-[130px]">{n.from_user_email}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300 text-[12px]">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-3.5">
                                                        {n.workspace_name ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <Building2 size={12} className="text-slate-400 shrink-0" />
                                                                <span className="text-[12px] font-semibold text-slate-700 truncate max-w-[120px]">{n.workspace_name}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[100px] block">{n.workspace_id}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-3.5">
                                                        {n.is_read ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-400">
                                                                Read
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#8c00ff]/10 text-[#8c00ff]">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#8c00ff]" /> Unread
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-3.5">
                                                        <span className="text-[11px] text-slate-500 whitespace-nowrap">{fmt(n.created_at)}</span>
                                                    </td>
                                                    <td className="px-6 py-3.5 text-right">
                                                        {Object.keys(n.meta_data).length > 0 && (
                                                            <button
                                                                onClick={() => setExpandedId(expanded ? null : n.id)}
                                                                className="w-8 h-8 inline-flex items-center justify-center rounded-xl text-slate-400 hover:bg-purple-50 hover:text-[#8c00ff] transition-all"
                                                                title="View metadata"
                                                            >
                                                                {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                                {expanded && (
                                                    <tr key={`${n.id}-meta`} className="bg-slate-50/80">
                                                        <td colSpan={7} className="px-8 py-4">
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Metadata</p>
                                                            <MetaDataPanel meta={n.meta_data} />
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[12px] text-slate-500">
                            Showing <span className="font-bold text-slate-900">{notifications.length}</span> notifications
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoading}
                                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-[13px] font-bold text-slate-700 px-2">Page {currentPage}</span>
                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={notifications.length < 20 || isLoading}
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
