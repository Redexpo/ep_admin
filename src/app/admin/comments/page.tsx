'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search, ChevronLeft, ChevronRight, MessageCircle, Video,
    Camera, User, ThumbsUp, Reply, Filter,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminCommentService, AdminComment, AdminReaction } from '@/services/admin/commentService';
import { toast } from 'sonner';

type Tab = 'comments' | 'reactions';
type DocFilter = 'all' | 'recording' | 'screenshot';

const DOC_TYPE_LABELS: Record<string, { label: string; icon: React.ReactElement; bg: string; text: string }> = {
    recording:  { label: 'Video',      icon: <Video  size={10} />, bg: 'bg-blue-50',   text: 'text-blue-700'   },
    screenshot: { label: 'Screenshot', icon: <Camera size={10} />, bg: 'bg-purple-50', text: 'text-purple-700' },
    unknown:    { label: 'Unknown',    icon: <MessageCircle size={10} />, bg: 'bg-slate-100', text: 'text-slate-500' },
};

function DocTypeBadge({ type }: { type: string }) {
    const cfg = DOC_TYPE_LABELS[type] ?? DOC_TYPE_LABELS.unknown;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.text} border-current/20`}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

const REACTION_LABELS: Record<string, string> = {
    heart:     '❤️',  thumbs_up: '👍', thumbs_down: '👎',
    fire:      '🔥',  clap:      '👏', surprised:  '😮',
    laughing:  '😂',  sad:       '😢', mindblown:  '🤯',
};

function reactionEmoji(r: string): string {
    return REACTION_LABELS[r] ?? r;
}

export default function CommentsPage() {
    const [tab, setTab] = useState<Tab>('comments');

    // ── Comments state ──
    const [comments,     setComments]     = useState<AdminComment[]>([]);
    const [commentsPage, setCommentsPage] = useState(1);
    const [commentQ,     setCommentQ]     = useState('');
    const [debouncedCQ,  setDebouncedCQ]  = useState('');
    const [docFilter,    setDocFilter]    = useState<DocFilter>('all');
    const [loadingC,     setLoadingC]     = useState(true);

    // ── Reactions state ──
    const [reactions,     setReactions]     = useState<AdminReaction[]>([]);
    const [reactionsPage, setReactionsPage] = useState(1);
    const [reactionQ,     setReactionQ]     = useState('');
    const [debouncedRQ,   setDebouncedRQ]   = useState('');
    const [reactionFilter, setReactionFilter] = useState('');
    const [loadingR,      setLoadingR]      = useState(true);

    // Debounce
    useEffect(() => {
        const t = setTimeout(() => { setDebouncedCQ(commentQ); setCommentsPage(1); }, 400);
        return () => clearTimeout(t);
    }, [commentQ]);

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedRQ(reactionQ); setReactionsPage(1); }, 400);
        return () => clearTimeout(t);
    }, [reactionQ]);

    const fetchComments = useCallback(async () => {
        try {
            setLoadingC(true);
            setComments(await adminCommentService.getComments(
                commentsPage, 20,
                debouncedCQ || undefined,
                docFilter !== 'all' ? docFilter : undefined,
            ));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to load comments');
        } finally {
            setLoadingC(false);
        }
    }, [commentsPage, debouncedCQ, docFilter]);

    const fetchReactions = useCallback(async () => {
        try {
            setLoadingR(true);
            setReactions(await adminCommentService.getReactions(
                reactionsPage, 20,
                reactionFilter || undefined,
                debouncedRQ || undefined,
            ));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to load reactions');
        } finally {
            setLoadingR(false);
        }
    }, [reactionsPage, reactionFilter, debouncedRQ]);

    useEffect(() => { fetchComments(); }, [fetchComments]);
    useEffect(() => { fetchReactions(); }, [fetchReactions]);

    const commentCounts = useMemo(() => ({
        total:       comments.length,
        replies:     comments.filter(c => c.is_reply).length,
        withLikes:   comments.filter(c => c.likes_count > 0).length,
    }), [comments]);

    const reactionBreakdown = useMemo(() => {
        const map: Record<string, number> = {};
        reactions.forEach(r => { map[r.reaction] = (map[r.reaction] ?? 0) + 1; });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [reactions]);

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });

    const TABS: { id: Tab; label: string; count?: number }[] = [
        { id: 'comments',  label: 'Comments',  count: commentCounts.total  },
        { id: 'reactions', label: 'Reactions', count: reactions.length },
    ];

    return (
        <AdminLayout>
            <div className="p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
                {/* Header */}
                <div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight">Engagement</h1>
                    <p className="text-[14px] text-slate-500 mt-0.5">User comments and reactions across all content.</p>
                </div>

                {/* Tab bar */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-bold transition-all ${
                                tab === t.id
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {t.label}
                            {t.count !== undefined && (
                                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                                    tab === t.id ? 'bg-[#8c00ff]/10 text-[#8c00ff]' : 'bg-slate-200 text-slate-500'
                                }`}>{t.count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Comments Tab ── */}
                {tab === 'comments' && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        {/* Toolbar */}
                        <div className="px-6 py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search comment or username…"
                                    value={commentQ}
                                    onChange={e => setCommentQ(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/30 focus:border-[#8c00ff] transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter size={13} className="text-slate-400" />
                                {(['all', 'recording', 'screenshot'] as DocFilter[]).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => { setDocFilter(f); setCommentsPage(1); }}
                                        className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                                            docFilter === f
                                                ? 'bg-[#8c00ff] text-white'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                    >
                                        {f === 'all' ? 'All' : f === 'recording' ? 'Videos' : 'Screenshots'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stats row */}
                        {!loadingC && (
                            <div className="px-6 py-3 border-b border-slate-50 flex items-center gap-4">
                                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-slate-500">
                                    <MessageCircle size={12} /> {commentCounts.total} comments
                                </span>
                                {commentCounts.replies > 0 && (
                                    <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-slate-400">
                                        <Reply size={12} /> {commentCounts.replies} replies
                                    </span>
                                )}
                                {commentCounts.withLikes > 0 && (
                                    <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-slate-400">
                                        <ThumbsUp size={12} /> {commentCounts.withLikes} liked
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/60 border-b border-slate-100">
                                        <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                                        <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Content</th>
                                        <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                                        <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Comment</th>
                                        <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Likes</th>
                                        <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loadingC ? (
                                        Array(6).fill(0).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-6 py-4"><div className="h-5 w-20 bg-slate-100 rounded-lg" /></td>
                                                <td colSpan={5} className="px-6 py-4"><div className="h-5 bg-slate-100 rounded-lg w-full" /></td>
                                            </tr>
                                        ))
                                    ) : comments.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-24 text-center">
                                                <div className="flex flex-col items-center gap-3 text-slate-300">
                                                    <MessageCircle size={40} strokeWidth={1} />
                                                    <p className="text-[14px] text-slate-400 font-medium">No comments found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        comments.map(c => (
                                            <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-6 py-3.5">
                                                    <DocTypeBadge type={c.document_type} />
                                                </td>
                                                <td className="px-6 py-3.5 max-w-[180px]">
                                                    <p className="text-[12px] font-semibold text-slate-800 truncate">
                                                        {c.document_title ?? <span className="text-slate-400 italic font-normal">Untitled</span>}
                                                    </p>
                                                    {c.timestamp && (
                                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">@ {c.timestamp}</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <User size={12} className="text-slate-400 shrink-0" />
                                                        <div>
                                                            <p className="text-[12px] font-semibold text-slate-700 truncate max-w-[140px]">{c.user_name || '—'}</p>
                                                            <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{c.user_email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 max-w-[280px]">
                                                    <div className="flex items-start gap-2">
                                                        {c.is_reply && (
                                                            <Reply size={11} className="text-slate-400 shrink-0 mt-0.5" />
                                                        )}
                                                        <p className="text-[12px] text-slate-700 line-clamp-2 leading-relaxed">
                                                            {c.comment}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    {c.likes_count > 0 ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                                            <ThumbsUp size={9} /> {c.likes_count}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[12px] text-slate-300">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <span className="text-[12px] text-slate-500">{fmt(c.created_at)}</span>
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
                                Showing <span className="font-bold text-slate-900">{comments.length}</span> comments
                            </p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCommentsPage(p => Math.max(1, p - 1))} disabled={commentsPage === 1 || loadingC}
                                    className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-[13px] font-bold text-slate-700 px-2">Page {commentsPage}</span>
                                <button onClick={() => setCommentsPage(p => p + 1)} disabled={comments.length < 20 || loadingC}
                                    className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Reactions Tab ── */}
                {tab === 'reactions' && (
                    <div className="space-y-6">
                        {/* Emoji breakdown chips */}
                        {!loadingR && reactionBreakdown.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => { setReactionFilter(''); setReactionsPage(1); }}
                                    className={`px-4 py-2 rounded-2xl text-[13px] font-bold transition-all border ${
                                        reactionFilter === ''
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    All
                                </button>
                                {reactionBreakdown.map(([r, count]) => (
                                    <button
                                        key={r}
                                        onClick={() => { setReactionFilter(r === reactionFilter ? '' : r); setReactionsPage(1); }}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[13px] font-bold transition-all border ${
                                            reactionFilter === r
                                                ? 'bg-[#8c00ff] text-white border-[#8c00ff]'
                                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <span className="text-[16px] leading-none">{reactionEmoji(r)}</span>
                                        <span className="text-[11px]">{count}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            {/* Toolbar */}
                            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search by username…"
                                        value={reactionQ}
                                        onChange={e => setReactionQ(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/30 focus:border-[#8c00ff] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/60 border-b border-slate-100">
                                            <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Reaction</th>
                                            <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Video</th>
                                            <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                                            <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loadingR ? (
                                            Array(6).fill(0).map((_, i) => (
                                                <tr key={i} className="animate-pulse">
                                                    <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-100 rounded-xl" /></td>
                                                    <td colSpan={3} className="px-6 py-4"><div className="h-5 bg-slate-100 rounded-lg w-full" /></td>
                                                </tr>
                                            ))
                                        ) : reactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-24 text-center">
                                                    <div className="flex flex-col items-center gap-3 text-slate-300">
                                                        <span className="text-5xl">🎭</span>
                                                        <p className="text-[14px] text-slate-400 font-medium">No reactions found</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            reactions.map(r => (
                                                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-6 py-3.5">
                                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[20px]">
                                                            {reactionEmoji(r.reaction)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3.5 max-w-[220px]">
                                                        <div className="flex items-center gap-1.5">
                                                            <Video size={12} className="text-slate-400 shrink-0" />
                                                            <p className="text-[12px] font-semibold text-slate-700 truncate">
                                                                {r.recording_title ?? <span className="text-slate-400 italic font-normal">Untitled</span>}
                                                            </p>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5 pl-4">{r.recording_encrypted_id}</p>
                                                    </td>
                                                    <td className="px-6 py-3.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <User size={12} className="text-slate-400 shrink-0" />
                                                            <div>
                                                                <p className="text-[12px] font-semibold text-slate-700">{r.user_name || '—'}</p>
                                                                <p className="text-[10px] text-slate-400">{r.user_email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3.5">
                                                        <span className="text-[12px] text-slate-500">{fmt(r.created_at)}</span>
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
                                    Showing <span className="font-bold text-slate-900">{reactions.length}</span> reactions
                                </p>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setReactionsPage(p => Math.max(1, p - 1))} disabled={reactionsPage === 1 || loadingR}
                                        className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-[13px] font-bold text-slate-700 px-2">Page {reactionsPage}</span>
                                    <button onClick={() => setReactionsPage(p => p + 1)} disabled={reactions.length < 20 || loadingR}
                                        className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
