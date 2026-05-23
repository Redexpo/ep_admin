import api from "../api";

export interface AdminWorkspace {
    id: string;
    workspace_encrypted_id: string;
    name: string;
    slug: string;
    owner_id: string;
    owner_email: string;
    visibility: string;
    is_archived: boolean;
    is_deleted: boolean;
    is_default: boolean;
    member_count: number;
    default_visibility: string;
    lock_visibility: boolean;
    allow_member_sharing_override: boolean;
    logo: string | null;
    created_at: string;
    updated_at: string;
}

export interface AdminWorkspaceMember {
    user_id: string;
    user_email: string;
    role: string;
    status: string;
    is_invited: boolean;
    joined_at: string | null;
    created_at: string;
}

export interface AdminWorkspaceDetail extends AdminWorkspace {
    members: AdminWorkspaceMember[];
}

export const adminWorkspaceService = {
    async getWorkspaces(
        page: number = 1,
        limit: number = 20,
        search?: string,
        showArchived: boolean = false,
        showDeleted: boolean = false,
    ): Promise<AdminWorkspace[]> {
        const params: Record<string, string | number | boolean> = { page, limit, show_archived: showArchived, show_deleted: showDeleted };
        if (search) params.search = search;
        const response = await api.get("/api/v1/admin/workspaces", { params });
        return response.data;
    },

    async getWorkspaceDetail(workspaceId: string): Promise<AdminWorkspaceDetail> {
        const response = await api.get(`/api/v1/admin/workspaces/${workspaceId}`);
        return response.data;
    },
};
