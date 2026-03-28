import api from "../api";

export interface Video {
    id: string;
    encrypted_id: string;
    title: string;
    duration: number;
    status: string;
    views: number;
    created_at: string;
    creator: string;
    creator_email: string;
    thumbnail?: string;
}

export interface VideoListResponse {
    status: string;
    message: string;
    data: {
        results: Video[];
        pagination: {
            total: number;
            page: number;
            per_page: number;
            total_pages: number;
        };
    };
}

export interface VideoStats {
    total_videos: { value: number; change: string; trend: 'up' | 'down' };
    active_recordings: { value: number; change: string; trend: 'up' | 'down' };
    new_videos_7d: { value: number; change: string; trend: 'up' | 'down' };
    reported_videos: { value: number; change: string; trend: 'up' | 'down' };
}

export const videoService = {
    getVideos: async (page: number = 1, perPage: number = 10): Promise<VideoListResponse> => {
        const response = await api.get(`/api/v1/admin/videos?page=${page}&per_page=${perPage}`);
        return response.data;
    },
    getVideoStats: async (): Promise<{ data: VideoStats }> => {
        const response = await api.get("/api/v1/admin/videos/stats");
        return response.data;
    },
    getVideoById: async (id: string): Promise<{ data: Video }> => {
        const response = await api.get(`/api/v1/admin/videos/${id}`);
        return response.data;
    }
};
