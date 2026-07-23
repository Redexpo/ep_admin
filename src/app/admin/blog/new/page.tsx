'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import BlogForm from '@/components/admin/blog/BlogForm';

export default function NewBlogPostPage() {
    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1400px]">
                <BlogForm mode="create" />
            </div>
        </AdminLayout>
    );
}
