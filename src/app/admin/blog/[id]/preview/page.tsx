'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    ArrowLeft, ArrowUpRight, Clock, Eye, ExternalLink,
    Loader2, Newspaper, RefreshCw, Sparkles, Star,
} from 'lucide-react';
import { toast } from 'sonner';
import AuthGuard from '@/components/auth/AuthGuard';
import PreviewBody from '@/components/admin/blog/PreviewBody';
import { adminBlogService, type BlogPost, type BlogPostStatus } from '@/services/admin/blogService';

const STATUS_STYLES: Record<BlogPostStatus, { label: string; cls: string }> = {
    draft:     { label: 'Draft',     cls: 'border-slate-200 bg-slate-100 text-slate-600' },
    scheduled: { label: 'Scheduled', cls: 'border-blue-100 bg-blue-50 text-blue-700' },
    published: { label: 'Published', cls: 'border-green-100 bg-green-50 text-green-700' },
    archived:  { label: 'Archived',  cls: 'border-amber-100 bg-amber-50 text-amber-700' },
};

function formatDate(iso?: string | null): string {
    if (!iso) return 'Not scheduled';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function BlogPreviewPage() {
    const params = useParams<{ id: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [publicOrigin, setPublicOrigin] = useState<string | null>(null);

    // The public marketing site lives on a different origin. Read it from env
    // if you've set NEXT_PUBLIC_WEB_URL, otherwise leave the "Open on site"
    // link disabled.
    useEffect(() => {
        const envUrl = process.env.NEXT_PUBLIC_WEB_URL;
        if (envUrl) {
            setPublicOrigin(envUrl.replace(/\/$/, ''));
        }
    }, []);

    const load = async () => {
        try {
            setIsLoading(true);
            const p = await adminBlogService.get(params.id);
            setPost(p);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to load post');
            setPost(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [params.id]);

    if (isLoading) {
        return (
            <AuthGuard>
                <div className="flex min-h-screen items-center justify-center bg-white text-slate-400">
                    <Loader2 size={20} className="mr-2 animate-spin" /> Loading preview…
                </div>
            </AuthGuard>
        );
    }

    if (!post) {
        return (
            <AuthGuard>
                <div className="flex min-h-screen items-center justify-center bg-white">
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                        <p className="text-[14px] font-semibold text-slate-700">Post could not be loaded</p>
                        <Link
                            href="/admin/blog"
                            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            <ArrowLeft size={13} /> Back to posts
                        </Link>
                    </div>
                </div>
            </AuthGuard>
        );
    }

    const statusStyle = STATUS_STYLES[post.status];
    const publicUrl = publicOrigin ? `${publicOrigin}/blog/${post.slug}` : null;

    return (
        <AuthGuard>
            <div className="min-h-screen bg-white">
                {/* ── Admin preview banner ─────────────────────────────────── */}
                <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-3">
                        <div className="flex items-center gap-3">
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e4d4fe] bg-[#f3eefe] px-3 py-1">
                                <Eye size={12} className="text-[#8c00ff]" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-[#8c00ff]">
                                    Preview
                                </span>
                            </div>
                            <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-bold uppercase ${statusStyle.cls}`}>
                                {statusStyle.label}
                            </span>
                            {post.is_featured ? (
                                <span className="inline-flex items-center gap-1 rounded-lg border border-amber-100 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                                    <Star size={10} className="fill-amber-500 text-amber-500" /> Featured
                                </span>
                            ) : null}
                            <span className="hidden text-[11px] text-slate-400 sm:inline">
                                Last saved {formatDate(post.updated_at)}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={load}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                title="Refresh"
                            >
                                <RefreshCw size={13} />
                            </button>
                            <Link
                                href={`/admin/blog/${post.id}`}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                <ArrowLeft size={13} /> Back to editor
                            </Link>
                            {publicUrl ? (
                                <Link
                                    href={publicUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f0f11] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-slate-800"
                                >
                                    Open on site <ExternalLink size={12} />
                                </Link>
                            ) : (
                                <span
                                    title="Set NEXT_PUBLIC_WEB_URL to enable this shortcut"
                                    className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-semibold text-slate-400"
                                >
                                    Open on site <ExternalLink size={12} />
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Article header (mirrors lc_web blog detail) ──────────── */}
                <section className="relative border-b border-slate-100 bg-white px-6 pb-10 pt-14 lg:px-8">
                    <div
                        className="pointer-events-none absolute inset-x-0 top-0 h-[260px] bg-gradient-to-b from-[#f3eefe] via-white to-white"
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute -top-24 left-1/4 h-[380px] w-[380px] rounded-full bg-[#8c00ff]/8 blur-3xl"
                        aria-hidden
                    />

                    <div className="relative container mx-auto max-w-3xl">
                        <div className="flex items-center gap-2 text-[13px] text-slate-500">
                            <span className="inline-flex items-center gap-1 font-medium text-[#565564]">
                                <Newspaper size={13} /> Blog
                            </span>
                            {post.category ? (
                                <>
                                    <span aria-hidden>/</span>
                                    <span className="font-medium text-[#8c00ff]">{post.category.name}</span>
                                </>
                            ) : null}
                        </div>

                        <div className="mt-6">
                            {post.category ? (
                                <div
                                    className="inline-flex items-center rounded-full border px-2.5 py-1"
                                    style={{
                                        background: post.category.color ? `${post.category.color}15` : '#f3eefe',
                                        borderColor: post.category.color ? `${post.category.color}30` : '#e4d4fe',
                                        color: post.category.color || '#8c00ff',
                                    }}
                                >
                                    <span className="text-[11px] font-bold uppercase tracking-wider">
                                        {post.category.name}
                                    </span>
                                </div>
                            ) : (
                                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    Uncategorized
                                </span>
                            )}

                            <h1 className="mt-4 text-[clamp(2rem,4.5vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.03em] text-[#0f0f11] text-balance">
                                {post.title || <span className="text-slate-300">Untitled post</span>}
                            </h1>

                            {post.excerpt ? (
                                <p className="mt-4 text-[16px] leading-relaxed text-[#565564] sm:text-[17px]">
                                    {post.excerpt}
                                </p>
                            ) : (
                                <p className="mt-4 text-[15px] italic text-slate-400">
                                    No excerpt — add one in the editor for social sharing.
                                </p>
                            )}

                            <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-6">
                                <div className="flex items-center gap-3">
                                    {post.author?.avatar_url ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img
                                            src={post.author.avatar_url}
                                            alt=""
                                            className="h-11 w-11 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
                                            style={{ background: 'linear-gradient(135deg,#8c00ff,#7c3aed)' }}
                                        >
                                            {(post.author?.name ?? 'A').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <div className="text-[14px] font-semibold text-[#0f0f11]">
                                            {post.author?.name ?? 'Admin'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                                            <span>{formatDate(post.published_at ?? post.created_at)}</span>
                                            <span aria-hidden>·</span>
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {post.reading_minutes} min read
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Cover art ───────────────────────────────────────────── */}
                {post.cover_image_url ? (
                    <section className="bg-white px-6 pt-10 lg:px-8">
                        <div className="container mx-auto max-w-4xl">
                            <div className="relative aspect-[16/8] w-full overflow-hidden rounded-3xl border border-slate-200/80">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={post.cover_image_url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="bg-white px-6 pt-10 lg:px-8">
                        <div className="container mx-auto max-w-4xl">
                            <div className="flex aspect-[16/8] w-full items-center justify-center overflow-hidden rounded-3xl border border-dashed border-slate-200 bg-gradient-to-br from-[#8c00ff] via-[#7c3aed] to-[#3b0764]">
                                <Sparkles className="h-14 w-14 text-white/90" strokeWidth={1.5} />
                            </div>
                            <p className="mt-2 text-center text-[12px] text-slate-400">
                                Placeholder cover — add a cover image URL in the editor.
                            </p>
                        </div>
                    </section>
                )}

                {/* ── Body ────────────────────────────────────────────────── */}
                <section className="bg-white px-6 py-14 lg:px-8">
                    <div className="container mx-auto max-w-3xl">
                        {post.content_html ? (
                            <PreviewBody html={post.content_html} />
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                                <p className="text-[14px] font-semibold text-slate-500">This post has no content yet</p>
                                <p className="mt-1 text-[13px] text-slate-400">Add content in the editor to see the preview.</p>
                            </div>
                        )}

                        {/* Tags */}
                        {post.tags.length > 0 ? (
                            <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-8">
                                <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-400">
                                    Tagged
                                </span>
                                {post.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[12px] font-semibold text-[#565564]"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        ) : null}

                        {/* Author card */}
                        <div className="mt-10 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6">
                            <div className="flex items-start gap-4">
                                {post.author?.avatar_url ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={post.author.avatar_url}
                                        alt=""
                                        className="h-14 w-14 rounded-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-white"
                                        style={{ background: 'linear-gradient(135deg,#8c00ff,#7c3aed)' }}
                                    >
                                        {(post.author?.name ?? 'A').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="text-[15px] font-semibold text-[#0f0f11]">
                                        {post.author?.name ?? 'Admin'}
                                    </div>
                                    <div className="text-[13px] text-slate-500">Author</div>
                                    <p className="mt-2 text-[14px] leading-relaxed text-[#565564]">
                                        This is a preview of how the article will appear on the public marketing site.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Bottom admin actions ────────────────────────────────── */}
                <section className="border-t border-slate-100 bg-slate-50 px-6 py-10 lg:px-8">
                    <div className="container mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
                        <Link
                            href={`/admin/blog/${post.id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            <ArrowLeft size={14} /> Back to editor
                        </Link>
                        <Link
                            href="/admin/blog"
                            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-800"
                        >
                            All posts <ArrowUpRight size={13} />
                        </Link>
                    </div>
                </section>
            </div>
        </AuthGuard>
    );
}
