'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import BlogForm from '@/components/admin/blog/BlogForm';
import { adminBlogService, type BlogPost } from '@/services/admin/blogService';

export default function EditBlogPostPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setIsLoading(true);
                const p = await adminBlogService.get(params.id);
                if (!cancelled) setPost(p);
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Failed to load post';
                    setError(message);
                    toast.error(message);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [params.id]);

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1400px]">
                {isLoading ? (
                    <div className="flex min-h-[400px] items-center justify-center text-slate-400">
                        <Loader2 size={20} className="mr-2 animate-spin" /> Loading post…
                    </div>
                ) : error || !post ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                        <p className="text-[14px] font-semibold text-slate-700">Post could not be loaded</p>
                        <p className="mt-1 text-[12px] text-slate-500">{error ?? 'Not found.'}</p>
                        <button
                            onClick={() => router.push('/admin/blog')}
                            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Back to posts
                        </button>
                    </div>
                ) : (
                    <BlogForm mode="edit" initial={post} />
                )}
            </div>
        </AdminLayout>
    );
}
