'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
    Plus, Search, Edit, Trash2, MoreVertical, Tag,
    FileText, ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import CategoryModal from '@/components/admin/blog/CategoryModal';
import DeleteCategoryModal from '@/components/admin/blog/DeleteCategoryModal';
import { adminBlogService, type BlogCategory } from '@/services/admin/blogService';

function RowMenu({ onEdit, onDelete, name }: { onEdit: () => void; onDelete: () => void; name: string }) {
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
                aria-label={`Actions for ${name}`}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
                <MoreVertical size={16} />
            </button>
            {open ? (
                <div className="absolute right-0 top-10 z-30 w-40 overflow-hidden rounded-2xl border border-slate-100 bg-white py-1.5 shadow-xl">
                    <button
                        onClick={() => { onEdit(); setOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <Edit size={14} className="text-slate-500" /> Edit
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

export default function AdminBlogCategoriesPage() {
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [deleteTarget, setDeleteTarget] = useState<BlogCategory | null>(null);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            const list = await adminBlogService.listCategories(debouncedSearch || undefined);
            setCategories(list);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to fetch categories');
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const stats = useMemo(() => {
        const totalPosts = categories.reduce((sum, c) => sum + (c.post_count ?? 0), 0);
        const empty = categories.filter((c) => (c.post_count ?? 0) === 0).length;
        return { total: categories.length, totalPosts, empty };
    }, [categories]);

    const openCreate = () => { setEditingId(null); setModalOpen(true); };
    const openEdit = (id: string) => { setEditingId(id); setModalOpen(true); };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1400px] space-y-6 pb-20">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                        <h1 className="text-[28px] font-black tracking-tight text-slate-900">Blog categories</h1>
                        <p className="mt-0.5 text-[14px] text-slate-500">
                            Group articles under topics your readers browse by. Categories power the filter chips on the marketing blog.
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[12px] font-bold text-slate-600">
                                <Tag size={12} /> {stats.total} {stats.total === 1 ? 'category' : 'categories'}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3eefe] px-3 py-1 text-[12px] font-bold text-[#8c00ff]">
                                <FileText size={12} /> {stats.totalPosts} tagged {stats.totalPosts === 1 ? 'post' : 'posts'}
                            </span>
                            {stats.empty > 0 ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[12px] font-bold text-amber-700">
                                    {stats.empty} empty
                                </span>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/admin/blog"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            View posts <ArrowRight size={13} />
                        </Link>
                        <button
                            onClick={openCreate}
                            className="inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-bold text-white shadow-lg shadow-purple-200 transition-all hover:scale-[1.02] active:scale-95"
                            style={{ background: 'linear-gradient(135deg,#8c00ff,#7c3aed)' }}
                        >
                            <Plus size={18} strokeWidth={2.5} /> New category
                        </button>
                    </div>
                </div>

                {/* Table card */}
                <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                    {/* Toolbar */}
                    <div className="flex items-center gap-3 border-b border-slate-100 p-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name, slug, or description…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-[13px] focus:border-[#8c00ff] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/20"
                            />
                            {searchQuery !== debouncedSearch ? (
                                <span className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-[#8c00ff] border-t-transparent" />
                            ) : null}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/60">
                                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Category</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Description</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Posts</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Order</th>
                                    <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    Array(4).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-4">
                                                <div className="h-9 w-full rounded-lg bg-slate-100" />
                                            </td>
                                        </tr>
                                    ))
                                ) : categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-24">
                                            <div className="flex flex-col items-center gap-3 text-center text-slate-300">
                                                <Tag size={40} strokeWidth={1} />
                                                <div>
                                                    <p className="text-[14px] font-medium text-slate-400">No categories found</p>
                                                    <p className="mt-0.5 text-[12px] text-slate-400">
                                                        {debouncedSearch
                                                            ? 'Try a different search term.'
                                                            : 'Add a category to start grouping posts.'}
                                                    </p>
                                                </div>
                                                {!debouncedSearch ? (
                                                    <button
                                                        onClick={openCreate}
                                                        className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                                                    >
                                                        <Plus size={13} /> New category
                                                    </button>
                                                ) : null}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                                                        style={{
                                                            background: cat.color ? `${cat.color}15` : '#f3eefe',
                                                            borderColor: cat.color ? `${cat.color}30` : '#e4d4fe',
                                                            color: cat.color || '#8c00ff',
                                                        }}
                                                    >
                                                        <Tag size={15} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <button
                                                            onClick={() => openEdit(cat.id)}
                                                            className="text-left"
                                                        >
                                                            <p className="text-[14px] font-bold text-slate-900 hover:text-[#8c00ff]">
                                                                {cat.name}
                                                            </p>
                                                        </button>
                                                        <p className="mt-0.5 line-clamp-1 font-mono text-[11px] uppercase text-slate-400">
                                                            /{cat.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {cat.description ? (
                                                    <p className="line-clamp-2 max-w-md text-[13px] text-slate-600">{cat.description}</p>
                                                ) : (
                                                    <span className="text-[12px] text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-bold ${
                                                    (cat.post_count ?? 0) > 0
                                                        ? 'border-[#e4d4fe] bg-[#f3eefe] text-[#8c00ff]'
                                                        : 'border-slate-200 bg-slate-50 text-slate-400'
                                                }`}>
                                                    <FileText size={10} />
                                                    {cat.post_count ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[13px] font-semibold text-slate-600 tabular-nums">
                                                    {cat.sort_order ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openEdit(cat.id)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                                                        title="Edit"
                                                    >
                                                        <Edit size={15} />
                                                    </button>
                                                    <RowMenu
                                                        name={cat.name}
                                                        onEdit={() => openEdit(cat.id)}
                                                        onDelete={() => setDeleteTarget(cat)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <CategoryModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchCategories}
                categoryId={editingId}
            />

            <DeleteCategoryModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onDeleted={fetchCategories}
                categoryId={deleteTarget?.id ?? null}
                categoryName={deleteTarget?.name}
                postCount={deleteTarget?.post_count}
            />
        </AdminLayout>
    );
}
