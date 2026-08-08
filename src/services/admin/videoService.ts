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
    stream_token?: string;
    title: string;
    description?: string;
    duration: number;
    status: string;
    is_active?: boolean;
    is_deleted?: boolean;
    is_archived?: boolean;
    workspace_id?: string;
    views: number;
    views_list?: ViewRecord[];
    created_at: string;
    updated_at?: string;
    creator: string;
    creator_email: string;
    creator_id?: string;
    thumbnail?: string;
    tags?: string[];
    supported_generation_type_ids?: string[];
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
    allow_transcription?: boolean;
    allow_chapters?: boolean;
    is_transcribed?: boolean;
    transcription_status?: string | null;
    device_settings?: Record<string, any> | null;
    system_info?: Record<string, any> | null;
    network_info?: Record<string, any> | null;
    audience_settings?: Record<string, any> | null;
    source_info?: Record<string, any> | null;
}

export interface GenerationType {
    id: string;
    name: string;
    slug: string;
    category: string;
    short_description?: string;
    is_active: boolean;
}

export interface ArtifactDelivery {
    platform: string;
    destination: string;
    delivered_at: string;
}

export interface GeneratedArtifact {
    id: string;
    recording_encrypted_id: string;
    generation_type: string;
    generation_type_id: string;
    content: string;
    title?: string;
    generated_by: string;
    params?: Record<string, any>;
    sent_to?: ArtifactDelivery[];
    created_at: string;
    updated_at?: string;
}

export interface AppLog {
    level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    service: string;
    action: string;
    message: string;
    metadata: Record<string, any>;
    is_mini?: boolean;
    created_at: string;
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
    },
    getVideoLogs: async (id: string): Promise<{ status: string; data: AppLog[] }> => {
        const response = await api.get(`/api/v1/admin/videos/${id}/logs`);
        return response.data;
    },
    getGenerationTypes: async (): Promise<GenerationType[]> => {
        const response = await api.get('/api/v1/admin/generation-types');
        return response.data;
    },
    getRecordingArtifacts: async (recordingId: string): Promise<{ data: GeneratedArtifact[] }> => {
        const response = await api.get(`/api/v1/admin/videos/${recordingId}/artifacts`);
        return response.data;
    },
};
