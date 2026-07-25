'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, RefreshCw, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import { adminBlogService, slugify, type BlogCategory } from '@/services/admin/blogService';

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    categoryId: string | null;
};

type FormState = {
    name: string;
    slug: string;
    slugTouched: boolean;
    description: string;
    color: string;
    sort_order: number;
};

const EMPTY: FormState = {
    name: '',
    slug: '',
    slugTouched: false,
    description: '',
    color: '',
    sort_order: 0,
};

export default function CategoryModal({ open, onClose, onSuccess, categoryId }: Props) {
    const [form, setForm] = useState<FormState>(EMPTY);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [slugCheck, setSlugCheck] = useState<{ state: 'idle' | 'checking' | 'ok' | 'taken'; suggested?: string }>({ state: 'idle' });
    const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((f) => ({ ...f, [key]: value }));
    }, []);

    // Load category when editing
    useEffect(() => {
        if (!open) return;
        if (!categoryId) {
            setForm(EMPTY);
            setSlugCheck({ state: 'idle' });
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                setIsLoading(true);
                const c: BlogCategory = await adminBlogService.getCategory(categoryId);
                if (cancelled) return;
                setForm({
                    name: c.name,
                    slug: c.slug,
                    slugTouched: true,
                    description: c.description ?? '',
                    color: c.color ?? '',
                    sort_order: c.sort_order ?? 0,
                });
                setSlugCheck({ state: 'idle' });
            } catch (err) {
                if (!cancelled) {
                    toast.error(err instanceof Error ? err.message : 'Failed to load category');
                    onClose();
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [open, categoryId, onClose]);

    // Auto-slug from name
    useEffect(() => {
        if (form.slugTouched) return;
        setForm((f) => ({ ...f, slug: slugify(f.name) }));
    }, [form.name, form.slugTouched]);

    // Debounced slug availability
    useEffect(() => {
        if (!open || !form.slug) {
            setSlugCheck({ state: 'idle' });
            return;
        }
        if (slugTimer.current) clearTimeout(slugTimer.current);
        setSlugCheck({ state: 'checking' });
        slugTimer.current = setTimeout(async () => {
            try {
                const res = await adminBlogService.checkCategorySlug(form.slug, categoryId ?? undefined);
                setSlugCheck({ state: res.available ? 'ok' : 'taken', suggested: res.suggested });
            } catch {
                setSlugCheck({ state: 'idle' });
            }
        }, 350);
        return () => { if (slugTimer.current) clearTimeout(slugTimer.current); };
    }, [open, form.slug, categoryId]);

    const canSave = form.name.trim().length >= 2 && form.slug.trim().length >= 2 && slugCheck.state !== 'taken';

    const save = async () => {
        if (!canSave) return;
        setIsSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                slug: form.slug.trim() || slugify(form.name),
                description: form.description.trim() || null,
                color: form.color.trim() || null,
                sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
            };
            if (categoryId) {
                await adminBlogService.updateCategory(categoryId, payload);
                toast.success('Category updated');
            } else {
                await adminBlogService.createCategory(payload);
                toast.success('Category created');
            }
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save category');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 py-10 backdrop-blur-sm sm:items-center"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 14, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.14 }}
                        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3eefe]">
                                    <Tag size={15} className="text-[#8c00ff]" />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-bold text-slate-900">
                                        {categoryId ? 'Edit category' : 'New category'}
                                    </h3>
                                    <p className="text-[12px] text-slate-500">
                                        Categories group your blog posts on the marketing site.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto p-6">
                            {isLoading ? (
                                <div className="flex min-h-[220px] items-center justify-center text-slate-400">
                                    <Loader2 size={18} className="mr-2 animate-spin" /> Loading category…
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-[12px] font-semibold text-slate-600">Name</label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => set('name', e.target.value)}
                                            placeholder="e.g. Product updates"
                                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[14px] font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#8c00ff] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/20"
                                            autoFocus
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[12px] font-semibold text-slate-600">Slug</label>
                                        <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 focus-within:border-[#8c00ff] focus-within:bg-white">
                                            <span className="text-[12px] font-mono text-slate-400">/blog?category=</span>
                                            <input
                                                type="text"
                                                value={form.slug}
                                                onChange={(e) => {
                                                    set('slug', slugify(e.target.value));
                                                    set('slugTouched', true);
                                                }}
                                                placeholder="auto-generated-from-name"
                                                className="flex-1 border-0 bg-transparent px-0 py-0 text-[13px] font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none"
                                            />
                                            <SlugState state={slugCheck.state} />
                                            {form.slugTouched && form.name ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        set('slug', slugify(form.name));
                                                        set('slugTouched', false);
                                                    }}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                                    title="Regenerate slug from name"
                                                >
                                                    <RefreshCw size={11} />
                                                </button>
                                            ) : null}
                                        </div>
                                        {slugCheck.state === 'taken' ? (
                                            <p className="mt-1.5 text-[12px] text-red-600">
                                                Slug is already used.
                                                {slugCheck.suggested ? (
                                                    <>
                                                        {' '}Try{' '}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                set('slug', slugCheck.suggested!);
                                                                set('slugTouched', true);
                                                            }}
                                                            className="font-semibold underline"
                                                        >
                                                            {slugCheck.suggested}
                                                        </button>
                                                        .
                                                    </>
                                                ) : null}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div>
                                        <label className="block text-[12px] font-semibold text-slate-600">Description</label>
                                        <textarea
                                            value={form.description}
                                            onChange={(e) => set('description', e.target.value)}
                                            placeholder="A short line shown on category pages and in the sidebar."
                                            rows={2}
                                            maxLength={280}
                                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-[#8c00ff] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/20"
                                        />
                                        <p className="mt-1 text-[11px] text-slate-400">{form.description.length}/280</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-[12px] font-semibold text-slate-600">Accent color</label>
                                            <div className="mt-1 flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={form.color || '#8c00ff'}
                                                    onChange={(e) => set('color', e.target.value)}
                                                    className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                                                />
                                                <input
                                                    type="text"
                                                    value={form.color}
                                                    onChange={(e) => set('color', e.target.value)}
                                                    placeholder="#8c00ff"
                                                    maxLength={32}
                                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-mono text-slate-800 placeholder:text-slate-400 focus:border-[#8c00ff] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/20"
                                                />
                                            </div>
                                            <p className="mt-1 text-[11px] text-slate-400">Optional — used to tint the category pill.</p>
                                        </div>

                                        <div>
                                            <label className="block text-[12px] font-semibold text-slate-600">Sort order</label>
                                            <input
                                                type="number"
                                                value={form.sort_order}
                                                onChange={(e) => set('sort_order', Number.parseInt(e.target.value || '0', 10) || 0)}
                                                placeholder="0"
                                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-[#8c00ff] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/20"
                                            />
                                            <p className="mt-1 text-[11px] text-slate-400">Lower numbers appear first.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3.5">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSaving}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={save}
                                disabled={isSaving || isLoading || !canSave}
                                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:hover:scale-100"
                                style={{ background: 'linear-gradient(135deg,#8c00ff,#7c3aed)' }}
                            >
                                {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                                {categoryId ? 'Save changes' : 'Create category'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function SlugState({ state }: { state: 'idle' | 'checking' | 'ok' | 'taken' }) {
    if (state === 'idle') return null;
    if (state === 'checking') {
        return (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-[#8c00ff]" />
                checking
            </span>
        );
    }
    if (state === 'ok') {
        return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600">
                <Check size={12} /> available
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
            <X size={12} /> taken
        </span>
    );
}
