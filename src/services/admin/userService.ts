import api from "../api";

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    is_verified: boolean;
    is_admin?: boolean;
    created_at: string;
    auth_provider: string;
    picture?: string;
}

export interface UserListResponse {
    status: string;
    message: string;
    data: {
        results: User[];
        pagination: {
            total: number;
            page: number;
            per_page: number;
            total_pages: number;
        };
    };
}

export interface UserStats {
    total_users: { value: number; change: string; trend: 'up' | 'down' };
    verified_users: { value: number; change: string; trend: 'up' | 'down' };
    active_users: { value: number; change: string; trend: 'up' | 'down' };
    new_users_7d: { value: number; change: string; trend: 'up' | 'down' };
}

export const userService = {
    getUsers: async (page: number = 1, perPage: number = 10): Promise<UserListResponse> => {
        const response = await api.get(`/api/v1/admin/users?page=${page}&per_page=${perPage}`);
        return response.data;
    },
    getUserStats: async (): Promise<{ data: UserStats }> => {
        const response = await api.get("/api/v1/admin/users/stats");
        return response.data;
    }
};
