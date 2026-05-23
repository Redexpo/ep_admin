import api from "../api";

export interface AdminScreenshot {
    id: string;
    screenshot_encrypted_id: string;
    title: string | null;
    file_name: string;
    mime_type: string | null;
    size: number | null;
    url: string;
    owner_id: string;
    owner_email: string;
    workspace_id: string;
    workspace_name: string;
    folder_id: string | null;
    is_deleted: boolean;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

export const adminScreenshotService = {
    async getScreenshots(
        page: number = 1,
        limit: number = 20,
        search?: string,
        showArchived: boolean = false,
        showDeleted: boolean = false,
    ): Promise<AdminScreenshot[]> {
        const params: Record<string, string | number | boolean> = {
            page, limit, show_archived: showArchived, show_deleted: showDeleted,
        };
        if (search) params.search = search;
        const response = await api.get("/api/v1/admin/screenshots", { params });
        return response.data;
    },

    async getScreenshotDetail(id: string): Promise<AdminScreenshot> {
        const response = await api.get(`/api/v1/admin/screenshots/${id}`);
        return response.data;
    },
};

export function formatBytes(bytes: number | null): string {
    if (!bytes) return '—';
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 ** 2)   return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 ** 3)   return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}
