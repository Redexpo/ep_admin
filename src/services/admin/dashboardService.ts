import api from '../api';

export interface DashboardStats {
    total_users: { value: number; change: string; trend: 'up' | 'down' };
    active_users_24h: { value: number; change: string; trend: 'up' | 'down' };
    total_videos: { value: number; change: string; trend: 'up' | 'down' };
    reported_videos: { value: number; change: string; trend: 'up' | 'down' };
}

export interface GrowthData {
    labels: string[];
    users: number[];
    videos: number[];
}

export interface RecentActivity {
    id: string;
    type: 'user' | 'video';
    text: string;
    detail: string;
    time: string;
}

export interface GrowthDataResponse {
    status: string;
    message: string;
    data: GrowthData;
}

export interface ActivityResponse {
    status: string;
    message: string;
    data: RecentActivity[];
}

export interface StatsResponse {
    status: string;
    message: string;
    data: DashboardStats;
}

export const dashboardService = {
    getDashboardSummary: async (): Promise<StatsResponse> => {
        const response = await api.get<StatsResponse>('/api/v1/admin/dashboard/stats');
        return response.data;
    },
    getGrowthData: async (days: number = 7): Promise<GrowthDataResponse> => {
        const response = await api.get<GrowthDataResponse>(`/api/v1/admin/dashboard/growth?days=${days}`);
        return response.data;
    },
    getRecentActivity: async (limit: number = 10): Promise<ActivityResponse> => {
        const response = await api.get<ActivityResponse>(`/api/v1/admin/dashboard/activity?limit=${limit}`);
        return response.data;
    }
};
