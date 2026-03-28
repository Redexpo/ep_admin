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
    recordings_count?: number;
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

export interface UserDetail extends User {
    stats: {
        total_recordings: number;
    };
}

export interface Recording {
    id: string;
    title: string | null;
    duration: number;
    status: string;
    thumbnail_url: string | null;
    created_at: string;
    file_size: number;
}

export interface RecordingListResponse {
    status: string;
    message: string;
    data: {
        results: Recording[];
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
    },
    getUserById: async (id: string): Promise<{ data: UserDetail }> => {
        const response = await api.get(`/api/v1/admin/users/${id}`);
        return response.data;
    },
    getUserRecordings: async (id: string, page: number = 1, perPage: number = 10): Promise<RecordingListResponse> => {
        const response = await api.get(`/api/v1/admin/users/${id}/recordings?page=${page}&per_page=${perPage}`);
        return response.data;
    }
};
