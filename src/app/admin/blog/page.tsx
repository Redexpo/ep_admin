'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Plus, Search, Eye, Edit, Trash2, MoreVertical, ChevronLeft, ChevronRight,
    Newspaper, CheckCircle2, FileEdit, Eye as EyeIcon, Star, Clock, Calendar,
    Share2, X, Copy, Check,
} from 'lucide-react';
import { MAIN_APP_URL } from '@/lib/constants';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import DeleteBlogModal from '@/components/admin/blog/DeleteBlogModal';
import {
    adminBlogService,
    type BlogPostListItem,
    type BlogPostStatus,
    type BlogStats,
} from '@/services/admin/blogService';

const STATUS_TABS: { key: BlogPostStatus | 'all'; label: string }[] = [
    { key: 'all',       label: 'All'       },
    { key: 'published', label: 'Published' },
    { key: 'draft',     label: 'Drafts'    },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'archived',  label: 'Archived'  },
];

function statusBadge(status: BlogPostStatus) {
    const map: Record<BlogPostStatus, { label: string; cls: string }> = {
        published: { label: 'Published', cls: 'bg-green-50 text-green-700 border-green-100' },
        draft:     { label: 'Draft',     cls: 'bg-slate-100 text-slate-600 border-slate-200' },
        scheduled: { label: 'Scheduled', cls: 'bg-blue-50 text-blue-700 border-blue-100' },
        archived:  { label: 'Archived',  cls: 'bg-amber-50 text-amber-700 border-amber-100' },
    };
    const m = map[status];
    return (
        <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-[11px] font-bold ${m.cls}`}>
            {m.label}
        </span>
    );
}

function formatDate(iso?: string | null) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatNumber(n: number) {
    return new Intl.NumberFormat('en-US').format(n);
}

const PLATFORMS = [
    {
        key: 'linkedin', label: 'LinkedIn', color: '#0077B5',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V9h4v2a6 6 0 0 1 2-3zM2 9h4v12H2zm2-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
            </svg>
        ),
    },
    {
        key: 'twitter', label: 'Twitter / X', color: '#000000',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
        ),
    },
    {
        key: 'facebook', label: 'Facebook', color: '#1877F2',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
        ),
    },
    {
        key: 'instagram', label: 'Instagram', color: '#E4405F',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
        ),
    },
    {
        key: 'reddit', label: 'Reddit', color: '#FF4500',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <circle cx="12" cy="12" r="10"/>
                <path fill="white" d="M21 12a1.5 1.5 0 0 0-2.55-1.06c-1.28-.86-3.02-1.42-4.95-1.5l.84-3.96 2.74.58a1.07 1.07 0 1 0 1.1-1.06 1.06 1.06 0 0 0-.98.65L14.5 5.1l-.97 4.54c-1.98.07-3.76.63-5.06 1.5A1.5 1.5 0 1 0 7.1 13.6a2.8 2.8 0 0 0-.04.4c0 2.2 2.64 3.99 5.94 3.99s5.94-1.79 5.94-4a3 3 0 0 0-.04-.39A1.5 1.5 0 0 0 21 12zm-13 1.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm5.5 2.65c-.73.73-2.27.73-3 0a.25.25 0 0 1 .35-.35c.5.5 1.8.5 2.3 0a.25.25 0 0 1 .35.35zm-.23-1.65a1 1 0 1 1 2 0 1 1 0 0 1-2 0z"/>
            </svg>
        ),
    },
    {
        key: 'tiktok', label: 'TikTok', color: '#010101',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.07a8.16 8.16 0 0 0 4.77 1.52V7.15a4.85 4.85 0 0 1-1-.46z"/>
            </svg>
        ),
    },
];

function ShareModal({ post, onClose }: { post: BlogPostListItem; onClose: () => void }) {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = async (platformKey: string) => {
        const url = `${MAIN_APP_URL}/blog/${post.slug}?SOURCE=${platformKey}`;
        await navigator.clipboard.writeText(url);
        setCopied(platformKey);
        toast.success(`Link copied for ${PLATFORMS.find(p => p.key === platformKey)?.label}`);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div
                className="relative w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
                >
                    <X size={16} />
                </button>

                <div className="mb-6">
                    <h2 className="text-[20px] font-black text-slate-900">Share Post</h2>
                    <p className="mt-1 line-clamp-1 text-[13px] text-slate-500">{post.title}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {PLATFORMS.map((p) => (
                        <button
                            key={p.key}
                            onClick={() => handleCopy(p.key)}
                            className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-4 transition-all hover:border-slate-200 hover:bg-white hover:shadow-md active:scale-95"
                        >
                            <div
                                className="flex h-11 w-11 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-110"
                                style={{ backgroundColor: p.color }}
                            >
                                {copied === p.key ? <Check size={20} /> : p.icon}
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600">{p.label}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-6 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
                    <span className="flex-1 truncate font-mono text-[11px] text-slate-500">
                        {MAIN_APP_URL}/blog/{post.slug}
                    </span>
                    <button
                        onClick={() => handleCopy('direct')}
                        className="shrink-0 flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm hover:bg-slate-100"
                    >
                        <Copy size={12} /> Copy
                    </button>
                </div>
            </div>
        </div>
    );
}

function RowMenu({ post, onEdit, onView, onDelete, onShare }: {
    post: BlogPostListItem;
    onEdit: () => void;
    onView: () => void;
    onDelete: () => void;
    onShare: () => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label={`Actions for ${post.title}`}
            >
                <MoreVertical size={16} />
            </button>
            {open ? (
                <div className="absolute right-0 top-10 z-30 w-44 overflow-hidden rounded-2xl border border-slate-100 bg-white py-1.5 shadow-xl">
                    <button
                        onClick={() => { onEdit(); setOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <Edit size={14} className="text-slate-500" /> Edit post
                    </button>
                    <button
                        onClick={() => { onView(); setOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <Eye size={14} className="text-slate-500" /> View on site
                    </button>
                    <button
                        onClick={() => { onShare(); setOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <Share2 size={14} className="text-slate-500" /> Share
                    </button>
                    <div className="my-1 h-px bg-slate-100" />
                    <button
                        onClick={() => { onDelete(); setOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-50"
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            ) : null}
        </div>
    );
}

export default function AdminBlogPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<BlogPostListItem[]>([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, per_page: 10, total_pages: 1 });
    const [stats, setStats] = useState<BlogStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [tab, setTab] = useState<BlogPostStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState<BlogPostListItem | null>(null);
    const [shareTarget, setShareTarget] = useState<BlogPostListItem | null>(null);

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const fetchPosts = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await adminBlogService.list({
                page: currentPage,
                per_page: 10,
                search: debouncedSearch || undefined,
                status: tab === 'all' ? undefined : tab,
            });
            setPosts(res.results);
            setPagination(res.pagination);
        } catch (err) {
            setPosts([]);
            toast.error(err instanceof Error ? err.message : 'Failed to fetch posts');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedSearch, tab]);

    const fetchStats = useCallback(async () => {
        try {
            setStats(await adminBlogService.stats());
        } catch {
            setStats(null);
        }
    }, []);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);
    useEffect(() => { fetchStats(); }, [fetchStats]);

    const tiles = useMemo(() => [
        { label: 'Total posts',   value: stats?.total     ?? 0, icon: Newspaper,     color: '#8c00ff' },
        { label: 'Published',     value: stats?.published ?? 0, icon: CheckCircle2,  color: '#22c55e' },
        { label: 'Drafts',        value: stats?.drafts    ?? 0, icon: FileEdit,      color: '#f59e0b' },
        { label: 'Total views',   value: stats?.total_views ?? 0, icon: EyeIcon,     color: '#3b82f6' },
    ], [stats]);

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1400px] space-y-6 pb-20">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                        <h1 className="text-[28px] font-black tracking-tight text-slate-900">Blog</h1>
                        <p className="mt-0.5 text-[14px] text-slate-500">
                            Write, publish, and manage articles for the marketing blog.
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[12px] font-bold text-slate-600">
                                <Newspaper size={12} /> {formatNumber(stats?.total ?? 0)} posts
                            </span>
                            {stats && stats.scheduled > 0 ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[12px] font-bold text-blue-700">
                                    <Calendar size={12} /> {stats.scheduled} scheduled
                                </span>
                            ) : null}
                        </div>
                    </div>
                    <Link
                        href="/admin/blog/new"
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-bold text-white shadow-lg shadow-purple-200 transition-all hover:scale-[1.02] active:scale-95"
                        style={{ background: 'linear-gradient(135deg,#8c00ff,#7c3aed)' }}
                    >
                        <Plus size={18} strokeWidth={2.5} /> New post
                    </Link>
                </div>

                {/* Stats tiles */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {tiles.map((t) => (
                        <div key={t.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-[13px] font-semibold text-slate-500">{t.label}</p>
                                <div
                                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                                    style={{ background: `${t.color}15`, color: t.color }}
                                >
                                    <t.icon size={16} />
                                </div>
                            </div>
                            <p className="mt-2 text-[26px] font-bold tracking-tight text-slate-900 tabular-nums">
                                {stats ? formatNumber(t.value) : '—'}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Table card */}
                <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full max-w-sm">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search posts by title, slug, or tag…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-[13px] focus:border-[#8c00ff] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/20"
                            />
                            {searchQuery !== debouncedSearch ? (
                                <span className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-[#8c00ff] border-t-transparent" />
                            ) : null}
                        </div>

                        <div className="flex overflow-x-auto rounded-xl bg-slate-100 p-1">
                            {STATUS_TABS.map((s) => (
                                <button
                                    key={s.key}
                                    onClick={() => { setTab(s.key); setCurrentPage(1); }}
                                    className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[12px] font-bold transition-all ${
                                        tab === s.key
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    {s.label}
                                    {stats && s.key !== 'all' ? (
                                        <span className="ml-1 text-slate-400 tabular-nums">
                                            {formatNumber(
                                                s.key === 'published' ? stats.published :
                                                s.key === 'draft'     ? stats.drafts :
                                                s.key === 'scheduled' ? stats.scheduled :
                                                s.key === 'archived'  ? stats.archived : 0,
                                            )}
                                        </span>
                                    ) : null}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/60">
                                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Post</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Category</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Author</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Published</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Views</th>
                                    <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={7} className="px-6 py-4">
                                                <div className="h-10 w-full rounded-lg bg-slate-100" />
                                            </td>
                                        </tr>
                                    ))
                                ) : posts.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-24">
                                            <div className="flex flex-col items-center gap-3 text-center text-slate-300">
                                                <Newspaper size={40} strokeWidth={1} />
                                                <div>
                                                    <p className="text-[14px] font-medium text-slate-400">No posts found</p>
                                                    <p className="mt-0.5 text-[12px] text-slate-400">
                                                        {debouncedSearch
                                                            ? 'Try a different search term.'
                                                            : 'Get started by creating your first post.'}
                                                    </p>
                                                </div>
                                                {!debouncedSearch ? (
                                                    <Link
                                                        href="/admin/blog/new"
                                                        className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                                                    >
                                                        <Plus size={13} /> New post
                                                    </Link>
                                                ) : null}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    posts.map((post) => (
                                        <tr key={post.id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="h-11 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                                                        {post.cover_image_url ? (
                                                            /* eslint-disable-next-line @next/next/no-img-element */
                                                            <img src={post.cover_image_url} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#8c00ff] to-[#7c3aed] text-white">
                                                                <Newspaper size={14} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <button
                                                            onClick={() => router.push(`/admin/blog/${post.id}/analytics`)}
                                                            className="text-left"
                                                        >
                                                            <p className="line-clamp-1 text-[14px] font-bold text-slate-900 hover:text-[#8c00ff]">
                                                                {post.title || <span className="text-slate-400 italic">Untitled</span>}
                                                                {post.is_featured ? (
                                                                    <Star size={12} className="ml-1 inline-block fill-amber-400 text-amber-500" />
                                                                ) : null}
                                                            </p>
                                                        </button>
                                                        <p className="mt-0.5 line-clamp-1 font-mono text-[11px] uppercase text-slate-400">
                                                            /{post.slug || '…'}
                                                        </p>
                                                        <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-400">
                                                            <Clock size={10} /> {post.reading_minutes ?? 0} min read
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{statusBadge(post.status)}</td>
                                            <td className="px-6 py-4">
                                                {post.category ? (
                                                    <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                                        {post.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-[12px] text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {post.author ? (
                                                    <div className="flex items-center gap-2">
                                                        {post.author.avatar_url ? (
                                                            /* eslint-disable-next-line @next/next/no-img-element */
                                                            <img src={post.author.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                                                        ) : (
                                                            <div
                                                                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                                                style={{ background: 'linear-gradient(135deg,#8c00ff,#7c3aed)' }}
                                                            >
                                                                {(post.author.name || '?').charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span className="text-[13px] text-slate-700">{post.author.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[12px] text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[13px] text-slate-600">{formatDate(post.published_at)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[13px] font-semibold text-slate-800 tabular-nums">{formatNumber(post.view_count ?? 0)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => router.push(`/admin/blog/${post.id}`)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                                                        title="Edit"
                                                    >
                                                        <Edit size={15} />
                                                    </button>
                                                    <RowMenu
                                                        post={post}
                                                        onEdit={() => router.push(`/admin/blog/${post.id}`)}
                                                        onView={() => window.open(`${MAIN_APP_URL}/blog/${post.slug}?SOURCE=AdminPanel`, '_blank')}
                                                        onDelete={() => setDeleteTarget(post)}
                                                        onShare={() => setShareTarget(post)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center">
                        <p className="text-[13px] text-slate-500">
                            <span className="font-bold text-slate-800">{formatNumber(pagination.total)}</span>{' '}
                            {pagination.total === 1 ? 'post' : 'posts'}
                            {debouncedSearch ? <span className="ml-1">for &ldquo;{debouncedSearch}&rdquo;</span> : null}
                            {' · '}Page <span className="font-bold text-slate-800">{pagination.page}</span> of {pagination.total_pages || 1}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={pagination.page <= 1 || isLoading}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                disabled={pagination.page >= (pagination.total_pages || 1) || isLoading}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteBlogModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onDeleted={() => { fetchPosts(); fetchStats(); }}
                postId={deleteTarget?.id ?? null}
                postTitle={deleteTarget?.title}
            />

            {shareTarget && (
                <ShareModal post={shareTarget} onClose={() => setShareTarget(null)} />
            )}
        </AdminLayout>
    );
}
