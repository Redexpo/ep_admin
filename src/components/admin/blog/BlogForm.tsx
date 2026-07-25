'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Check, ChevronDown, Eye, Image as ImageIcon,
    Loader2, RefreshCw, Save, Sparkles, Star, Tag, X,
} from 'lucide-react';
import { toast } from 'sonner';
import BlogEditor from './BlogEditor';
import {
    adminBlogService,
    slugify,
    type BlogCategory,
    type BlogPost,
    type BlogPostPayload,
    type BlogPostStatus,
} from '@/services/admin/blogService';

type BlogFormProps = {
    mode: 'create' | 'edit';
    initial?: BlogPost | null;
};

type FormState = {
    title: string;
    slug: string;
    slugTouched: boolean;
    excerpt: string;
    content_html: string;
    cover_image_url: string;
    category_id: string;
    tags: string[];
    status: BlogPostStatus;
    published_at: string;
    is_featured: boolean;
    seo_title: string;
    seo_description: string;
};

const STATUS_OPTIONS: { value: BlogPostStatus; label: string; color: string }[] = [
    { value: 'draft',     label: 'Draft',     color: 'bg-slate-100 text-slate-600 border-slate-200' },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { value: 'published', label: 'Published', color: 'bg-green-50 text-green-700 border-green-100' },
    { value: 'archived',  label: 'Archived',  color: 'bg-amber-50 text-amber-700 border-amber-100' },
];

function toLocalInputValue(iso?: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(value: string): string | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export default function BlogForm({ mode, initial }: BlogFormProps) {
    const router = useRouter();
    const [form, setForm] = useState<FormState>({
        title: initial?.title ?? '',
        slug: initial?.slug ?? '',
        slugTouched: Boolean(initial?.slug),
        excerpt: initial?.excerpt ?? '',
        content_html: initial?.content_html ?? '',
        cover_image_url: initial?.cover_image_url ?? '',
        category_id: initial?.category_id ?? '',
        tags: initial?.tags ?? [],
        status: initial?.status ?? 'draft',
        published_at: toLocalInputValue(initial?.published_at),
        is_featured: initial?.is_featured ?? false,
        seo_title: initial?.seo_title ?? '',
        seo_description: initial?.seo_description ?? '',
    });
    const [tagInput, setTagInput] = useState('');
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [slugCheck, setSlugCheck] = useState<{ state: 'idle' | 'checking' | 'ok' | 'taken'; suggested?: string }>({
        state: 'idle',
    });
    const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load categories once (best-effort — non-blocking)
    useEffect(() => {
        adminBlogService.listCategories().then(setCategories).catch(() => setCategories([]));
    }, []);

    const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((f) => ({ ...f, [key]: value }));
    }, []);

    // Auto-generate slug from title unless user has edited it manually
    useEffect(() => {
        if (form.slugTouched) return;
        setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }, [form.title, form.slugTouched]);

    // Debounced slug availability check
    useEffect(() => {
        if (!form.slug) {
            setSlugCheck({ state: 'idle' });
            return;
        }
        if (slugTimer.current) clearTimeout(slugTimer.current);
        setSlugCheck({ state: 'checking' });
        slugTimer.current = setTimeout(async () => {
            try {
                const res = await adminBlogService.checkSlug(form.slug, initial?.id);
                setSlugCheck({
                    state: res.available ? 'ok' : 'taken',
                    suggested: res.suggested,
                });
            } catch {
                // If the endpoint isn't wired yet, don't block the user
                setSlugCheck({ state: 'idle' });
            }
        }, 400);
        return () => {
            if (slugTimer.current) clearTimeout(slugTimer.current);
        };
    }, [form.slug, initial?.id]);

    const addTag = (raw: string) => {
        const t = raw.trim().replace(/,+$/, '');
        if (!t) return;
        if (form.tags.includes(t)) return;
        set('tags', [...form.tags, t]);
    };

    const removeTag = (t: string) => set('tags', form.tags.filter((x) => x !== t));

    const canPublish = useMemo(() => {
        return (
            form.title.trim().length >= 3 &&
            form.slug.trim().length >= 3 &&
            form.excerpt.trim().length >= 10 &&
            form.content_html.replace(/<[^>]+>/g, '').trim().length >= 20
        );
    }, [form.title, form.slug, form.excerpt, form.content_html]);

    const buildPayload = (overrideStatus?: BlogPostStatus): BlogPostPayload => ({
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        excerpt: form.excerpt.trim(),
        content_html: form.content_html,
        cover_image_url: form.cover_image_url.trim() || null,
        category_id: form.category_id || null,
        tags: form.tags,
        status: overrideStatus ?? form.status,
        published_at: fromLocalInputValue(form.published_at),
        is_featured: form.is_featured,
        seo_title: form.seo_title.trim() || null,
        seo_description: form.seo_description.trim() || null,
    });

    const save = async (nextStatus?: BlogPostStatus) => {
        if (!form.title.trim()) {
            toast.error('Please add a title first');
            return;
        }
        if (slugCheck.state === 'taken') {
            toast.error('This slug is already used — pick another');
            return;
        }
        setIsSaving(true);
        try {
            const payload = buildPayload(nextStatus);
            if (mode === 'create') {
                const created = await adminBlogService.create(payload);
                toast.success('Post created');
                router.push(`/admin/blog/${created.id}`);
            } else if (initial) {
                await adminBlogService.update(initial.id, payload);
                if (nextStatus) set('status', nextStatus);
                toast.success('Post saved');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save post');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 pb-16">
            {/* Top bar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                    <Link
                        href="/admin/blog"
                        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-800"
                    >
                        <ArrowLeft size={14} /> Back to posts
                    </Link>
                    <h1 className="mt-2 text-[26px] font-bold tracking-tight text-slate-900">
                        {mode === 'create' ? 'New blog post' : 'Edit post'}
                    </h1>
                    <p className="mt-0.5 text-[13px] text-slate-500">
                        {mode === 'create'
                            ? 'Write, format, and publish a new article on the marketing blog.'
                            : 'Update the article content, metadata, and publish state.'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {initial?.id ? (
                        <Link
                            href={`/admin/blog/${initial.id}/preview`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
                            title="Opens a preview of the last saved version in a new tab"
                        >
                            <Eye size={14} /> Preview
                        </Link>
                    ) : (
                        <span
                            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-[13px] font-semibold text-slate-400"
                            title="Save as draft first to preview"
                        >
                            <Eye size={14} /> Preview
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={() => save('draft')}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save draft
                    </button>

                    <button
                        type="button"
                        onClick={() => save('published')}
                        disabled={isSaving || !canPublish}
                        title={!canPublish ? 'Add a title, slug, excerpt, and some content first' : undefined}
                        className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:hover:scale-100"
                        style={{ background: 'linear-gradient(135deg,#8c00ff,#7c3aed)' }}
                    >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {form.status === 'published' ? 'Update & publish' : 'Publish'}
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                {/* Main column */}
                <div className="space-y-6">
                    {/* Title & slug card */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                            Title
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => set('title', e.target.value)}
                            placeholder="e.g. Introducing AI-generated chapters for every recording"
                            className="mt-1.5 w-full border-0 border-b border-transparent bg-transparent px-0 py-2 text-[26px] font-bold tracking-tight text-slate-900 placeholder:text-slate-300 focus:border-slate-200 focus:outline-none"
                        />

                        <div className="mt-5">
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                Slug
                            </label>
                            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 focus-within:border-[#8c00ff] focus-within:bg-white">
                                <span className="text-[13px] font-mono text-slate-400">/blog/</span>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={(e) => {
                                        set('slug', slugify(e.target.value));
                                        set('slugTouched', true);
                                    }}
                                    placeholder="auto-generated-from-title"
                                    className="flex-1 border-0 bg-transparent px-0 py-0 text-[13px] font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none"
                                />
                                <SlugState state={slugCheck.state} />
                                {form.slugTouched && form.title ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            set('slug', slugify(form.title));
                                            set('slugTouched', false);
                                        }}
                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                        title="Regenerate slug from title"
                                    >
                                        <RefreshCw size={11} />
                                    </button>
                                ) : null}
                            </div>
                            {slugCheck.state === 'taken' ? (
                                <p className="mt-1.5 text-[12px] text-red-600">
                                    That slug is already used.
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

                        <div className="mt-5">
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                Excerpt
                            </label>
                            <textarea
                                value={form.excerpt}
                                onChange={(e) => set('excerpt', e.target.value)}
                                placeholder="A one- or two-sentence summary shown on the listing and social shares."
                                rows={3}
                                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[14px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-[#8c00ff] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/20"
                            />
                            <p className="mt-1 text-[11px] text-slate-400">
                                {form.excerpt.length} chars · aim for 120–180.
                            </p>
                        </div>
                    </div>

                    {/* Editor card */}
                    <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                            Content
                        </label>
                        <BlogEditor
                            value={form.content_html}
                            onChange={(html) => set('content_html', html)}
                            placeholder="Start writing your article — use the toolbar to format, add links, or insert images."
                        />
                    </div>

                    {/* SEO card */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        <h3 className="text-[15px] font-bold text-slate-900">SEO</h3>
                        <p className="mt-0.5 text-[12px] text-slate-500">
                            Optional overrides for the search & social meta tags.
                        </p>

                        <div className="mt-4 grid gap-4">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-600">SEO title</label>
                                <input
                                    type="text"
                                    value={form.seo_title}
                                    onChange={(e) => set('seo_title', e.target.value)}
                                    placeholder={form.title || 'Falls back to the post title'}
                                    maxLength={70}
                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-[#8c00ff] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-600">Meta description</label>
                                <textarea
                                    value={form.seo_description}
                                    onChange={(e) => set('seo_description', e.target.value)}
                                    placeholder={form.excerpt || 'Falls back to the excerpt'}
                                    rows={2}
                                    maxLength={200}
                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-[#8c00ff] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/20"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="space-y-6">
                    {/* Status */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                        <h3 className="text-[13px] font-bold uppercase tracking-widest text-slate-400">Status</h3>
                        <div className="mt-3 space-y-1.5">
                            {STATUS_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => set('status', opt.value)}
                                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-[13px] font-semibold transition-colors ${
                                        form.status === opt.value
                                            ? 'border-[#8c00ff]/40 bg-[#f3eefe] text-[#8c00ff]'
                                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className={`inline-flex h-5 items-center rounded-md border px-1.5 text-[10px] font-bold uppercase ${opt.color}`}>
                                            {opt.label}
                                        </span>
                                    </span>
                                    {form.status === opt.value ? <Check size={14} /> : null}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4">
                            <label className="block text-[12px] font-semibold text-slate-600">Publish date</label>
                            <input
                                type="datetime-local"
                                value={form.published_at}
                                onChange={(e) => set('published_at', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 focus:border-[#8c00ff] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/20"
                            />
                            <p className="mt-1 text-[11px] text-slate-400">
                                Leave empty to use the current time when publishing.
                            </p>
                        </div>

                        <label className="mt-4 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3 cursor-pointer hover:bg-slate-50">
                            <input
                                type="checkbox"
                                checked={form.is_featured}
                                onChange={(e) => set('is_featured', e.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#8c00ff] focus:ring-[#8c00ff]"
                            />
                            <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-slate-800 inline-flex items-center gap-1.5">
                                    <Star size={12} className="text-amber-500" /> Featured post
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-500">Highlighted at the top of the blog listing.</p>
                            </div>
                        </label>
                    </div>

                    {/* Category */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                        <h3 className="text-[13px] font-bold uppercase tracking-widest text-slate-400">Category</h3>
                        <div className="relative mt-3">
                            <select
                                value={form.category_id}
                                onChange={(e) => set('category_id', e.target.value)}
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 pr-9 text-[13px] font-medium text-slate-800 focus:border-[#8c00ff] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/20"
                            >
                                <option value="">Uncategorized</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        {categories.length === 0 ? (
                            <p className="mt-2 text-[11px] text-slate-400">
                                No categories yet — you can add them from the categories page.
                            </p>
                        ) : null}
                    </div>

                    {/* Tags */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                        <h3 className="text-[13px] font-bold uppercase tracking-widest text-slate-400">
                            <span className="inline-flex items-center gap-1.5"><Tag size={12} /> Tags</span>
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {form.tags.map((t) => (
                                <span key={t} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-1 pl-2.5 pr-1 text-[11px] font-semibold text-slate-700">
                                    {t}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(t)}
                                        className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                                        aria-label={`Remove ${t}`}
                                    >
                                        <X size={10} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ',') {
                                    e.preventDefault();
                                    addTag(tagInput);
                                    setTagInput('');
                                }
                                if (e.key === 'Backspace' && !tagInput && form.tags.length > 0) {
                                    removeTag(form.tags[form.tags.length - 1]);
                                }
                            }}
                            onBlur={() => { addTag(tagInput); setTagInput(''); }}
                            placeholder="Type a tag and press Enter…"
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-[#8c00ff] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/20"
                        />
                    </div>

                    {/* Cover image */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                        <h3 className="text-[13px] font-bold uppercase tracking-widest text-slate-400">Cover image</h3>
                        {form.cover_image_url ? (
                            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={form.cover_image_url}
                                    alt="Cover preview"
                                    className="h-40 w-full object-cover"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).style.opacity = '0.2';
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="mt-3 flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
                                <div className="text-center text-slate-400">
                                    <ImageIcon className="mx-auto h-6 w-6" />
                                    <p className="mt-1 text-[12px]">Paste an image URL below</p>
                                </div>
                            </div>
                        )}
                        <input
                            type="url"
                            value={form.cover_image_url}
                            onChange={(e) => set('cover_image_url', e.target.value)}
                            placeholder="https://…"
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-[#8c00ff] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/20"
                        />
                    </div>
                </aside>
            </div>
        </div>
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
