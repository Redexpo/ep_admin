import api from "../api";

export interface AdminFolder {
    id: string;
    folder_encrypted_id: string;
    name: string;
    color: string;
    owner_id: string;
    owner_email: string;
    workspace_id: string;
    workspace_name: string;
    parent_folder_id: string | null;
    video_count: number;
    screen_shot_count: number;
    is_public: boolean;
    is_archived: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export const adminFolderService = {
    async getFolders(
        page: number = 1,
        limit: number = 20,
        search?: string,
        workspaceId?: string,
        showArchived: boolean = false,
        showDeleted: boolean = false,
    ): Promise<AdminFolder[]> {
        const params: Record<string, string | number | boolean> = {
            page, limit, show_archived: showArchived, show_deleted: showDeleted,
        };
        if (search)      params.search       = search;
        if (workspaceId) params.workspace_id = workspaceId;
        const response = await api.get("/api/v1/admin/folders", { params });
        return response.data;
    },

    async getFolderDetail(folderId: string): Promise<AdminFolder> {
        const response = await api.get(`/api/v1/admin/folders/${folderId}`);
        return response.data;
    },
};
