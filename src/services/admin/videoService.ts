import api from "../api";

export interface ViewRecord {
    user_name?: string;
    user_email?: string;
    ip_address?: string;
    ip_doc_id?: string;
    device_type?: string;
    created_at?: string;
}

export interface Video {
    id: string;
    encrypted_id: string;
    title: string;
    description?: string;
    duration: number;
    status: string;
    views: number;
    views_list?: ViewRecord[];
    created_at: string;
    creator: string;
    creator_email: string;
    creator_id?: string;
    thumbnail?: string;
    tags?: string[];
    file_size: number;
    folder?: {
        id: string;
        encrypted_id?: string;
        name: string;
    } | null;
    transcription?: string;
    chapters?: any[];
    reports?: any[];
    media_info?: any;
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
    },
    deleteVideo: async (id: string): Promise<{ status: string; message: string }> => {
        const response = await api.delete(`/api/v1/admin/videos/${id}`);
        return response.data;
    },
    updateReportStatus: async (reportId: string, status: string): Promise<{ status: string; message: string }> => {
        const response = await api.patch(`/api/v1/admin/videos/reports/${reportId}?status=${status}`);
        return response.data;
    }
};
