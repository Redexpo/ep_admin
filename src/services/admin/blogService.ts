import api from "../api";

export type BlogPostStatus = "draft" | "scheduled" | "published" | "archived";

export interface DailyStatEntry {
    date: string;
    total?: number;
    direct?: number;
    linkedin?: number;
    twitter?: number;
    facebook?: number;
    instagram?: number;
    reddit?: number;
    tiktok?: number;
    [key: string]: string | number | undefined;
}

export interface TopIP {
    ip: string;
    count: number;
    sources: string[];
    first_seen: string | null;
    last_seen: string | null;
    country: string | null;
    city: string | null;
}

export interface BlogAnalyticsData {
    total_views: number;
    views_by_source: Record<string, number>;
    daily_stats: DailyStatEntry[];
    top_ips: TopIP[];
}

export interface BlogAuthor {
    id: string;
    name: string;
    email?: string;
    avatar_url?: string | null;
}

export interface BlogCategory {
    id: string;
    slug: string;
    name: string;
    description?: string;
    color?: string;
    sort_order?: number;
    post_count?: number;
}

export interface BlogCategoryPayload {
    name: string;
    slug?: string;
    description?: string | null;
    color?: string | null;
    sort_order?: number;
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content_html: string;
    cover_image_url?: string | null;
    cover_accent?: string | null;
    category_id?: string | null;
    category?: BlogCategory | null;
    tags: string[];
    author_id?: string | null;
    author?: BlogAuthor | null;
    status: BlogPostStatus;
    published_at?: string | null;
    reading_minutes: number;
    view_count: number;
    is_featured: boolean;
    seo_title?: string | null;
    seo_description?: string | null;
    created_at: string;
    updated_at: string;
}

export interface BlogPostListItem {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    status: BlogPostStatus;
    category?: BlogCategory | null;
    author?: BlogAuthor | null;
    cover_image_url?: string | null;
    published_at?: string | null;
    reading_minutes: number;
    view_count: number;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

export interface BlogListResponse {
    results: BlogPostListItem[];
    pagination: {
        total: number;
        page: number;
        per_page: number;
        total_pages: number;
    };
}

export interface BlogStats {
    total: number;
    published: number;
    drafts: number;
    scheduled: number;
    archived: number;
    total_views: number;
    published_change?: string;
    views_change?: string;
}

export interface BlogPostPayload {
    title: string;
    slug: string;
    excerpt: string;
    content_html: string;
    cover_image_url?: string | null;
    cover_accent?: string | null;
    category_id?: string | null;
    tags: string[];
    status: BlogPostStatus;
    published_at?: string | null;
    is_featured?: boolean;
    seo_title?: string | null;
    seo_description?: string | null;
}

export interface SlugAvailability {
    slug: string;
    available: boolean;
    suggested?: string;
}

export const adminBlogService = {
    async list(params: {
        page?: number;
        per_page?: number;
        search?: string;
        status?: BlogPostStatus | "all";
        category_id?: string;
    } = {}): Promise<BlogListResponse> {
        const response = await api.get("/api/v1/admin/blog/posts", { params });
        return response.data;
    },

    async stats(): Promise<BlogStats> {
        const response = await api.get("/api/v1/admin/blog/posts/stats");
        return response.data;
    },

    async get(id: string): Promise<BlogPost> {
        const response = await api.get(`/api/v1/admin/blog/posts/${id}`);
        return response.data;
    },

    async create(payload: BlogPostPayload): Promise<BlogPost> {
        const response = await api.post("/api/v1/admin/blog/posts", payload);
        return response.data;
    },

    async update(id: string, payload: Partial<BlogPostPayload>): Promise<BlogPost> {
        const response = await api.put(`/api/v1/admin/blog/posts/${id}`, payload);
        return response.data;
    },

    async remove(id: string): Promise<void> {
        await api.delete(`/api/v1/admin/blog/posts/${id}`);
    },

    async setStatus(id: string, status: BlogPostStatus): Promise<BlogPost> {
        const response = await api.patch(`/api/v1/admin/blog/posts/${id}/status`, { status });
        return response.data;
    },

    async setFeatured(id: string, is_featured: boolean): Promise<BlogPost> {
        const response = await api.patch(`/api/v1/admin/blog/posts/${id}/featured`, { is_featured });
        return response.data;
    },

    async checkSlug(slug: string, exclude_id?: string): Promise<SlugAvailability> {
        const response = await api.get("/api/v1/admin/blog/posts/check-slug", {
            params: { slug, exclude_id },
        });
        return response.data;
    },

    async listCategories(search?: string): Promise<BlogCategory[]> {
        const response = await api.get("/api/v1/admin/blog/categories", {
            params: search ? { search } : undefined,
        });
        return response.data;
    },

    async getCategory(id: string): Promise<BlogCategory> {
        const response = await api.get(`/api/v1/admin/blog/categories/${id}`);
        return response.data;
    },

    async createCategory(payload: BlogCategoryPayload): Promise<BlogCategory> {
        const response = await api.post("/api/v1/admin/blog/categories", payload);
        return response.data;
    },

    async updateCategory(id: string, payload: Partial<BlogCategoryPayload>): Promise<BlogCategory> {
        const response = await api.put(`/api/v1/admin/blog/categories/${id}`, payload);
        return response.data;
    },

    async deleteCategory(id: string): Promise<void> {
        await api.delete(`/api/v1/admin/blog/categories/${id}`);
    },

    async checkCategorySlug(slug: string, exclude_id?: string): Promise<SlugAvailability> {
        const response = await api.get("/api/v1/admin/blog/categories/check-slug", {
            params: { slug, exclude_id },
        });
        return response.data;
    },

    async getAnalytics(postId: string): Promise<BlogAnalyticsData> {
        const res = await api.get(`/api/v1/admin/blog/posts/${postId}/analytics`);
        return res.data;
    },
};

export function slugify(input: string): string {
    return input
        .toString()
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 96);
}
