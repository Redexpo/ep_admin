import api from "../api";

export type AdminRole = "super_admin" | "moderator" | "support";

export type ModulePermsData   = { enabled: boolean; perms: Record<string, boolean> };
export type PermissionsPayload = Record<string, ModulePermsData>;

export interface AdminUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    admin_role: AdminRole;
    created_at: string;
    last_active: string | null;
    enabled_modules?: number;
}

export interface AdminListResponse {
    status: string;
    message: string;
    data: {
        results: AdminUser[];
        pagination: {
            total: number;
            page: number;
            per_page: number;
            total_pages: number;
        };
    };
}

export interface AdminStats {
    total_admins: number;
    active_today: number;
}

export interface CreateAdminInput {
    email:        string;
    first_name:   string;
    last_name:    string;
    password:     string;
    admin_role:   AdminRole;
    permissions?: PermissionsPayload;
}

export interface UpdateAdminInput {
    first_name?: string;
    last_name?:  string;
    admin_role?: AdminRole;
    is_active?:  boolean;
}

export const adminService = {
    getAdmins: async (page = 1, perPage = 10): Promise<AdminListResponse> => {
        const response = await api.get(`/api/v1/admin/admins?page=${page}&per_page=${perPage}`);
        return response.data;
    },

    getAdminStats: async (): Promise<{ status: string; data: AdminStats }> => {
        const response = await api.get("/api/v1/admin/admins/stats");
        return response.data;
    },

    createAdmin: async (input: CreateAdminInput): Promise<{ status: string; message: string; data: AdminUser }> => {
        const response = await api.post("/api/v1/admin/admins", input);
        return response.data;
    },

    updateAdmin: async (id: string, input: UpdateAdminInput): Promise<{ status: string; message: string; data: AdminUser }> => {
        const response = await api.put(`/api/v1/admin/admins/${id}`, input);
        return response.data;
    },

    deleteAdmin: async (id: string): Promise<{ status: string; message: string }> => {
        const response = await api.delete(`/api/v1/admin/admins/${id}`);
        return response.data;
    },

    getPermissions: async (id: string): Promise<{
        status: string;
        data: { user_id: string; permissions: PermissionsPayload; updated_at: string | null };
    }> => {
        const response = await api.get(`/api/v1/admin/admins/${id}/permissions`);
        return response.data;
    },

    savePermissions: async (id: string, permissions: PermissionsPayload): Promise<{
        status: string;
        message: string;
        data: { user_id: string; permissions: PermissionsPayload; enabled_modules: number; updated_at: string };
    }> => {
        const response = await api.put(`/api/v1/admin/admins/${id}/permissions`, { permissions });
        return response.data;
    },
};
