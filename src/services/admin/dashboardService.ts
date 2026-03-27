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

export interface DashboardDataResponse {
    status: string;
    message: string;
    data: {
        stats: DashboardStats;
        growth_data: GrowthData;
        activity: RecentActivity[];
    };
}

export const dashboardService = {
    getDashboardStats: async (): Promise<DashboardDataResponse> => {
        const response = await api.get<DashboardDataResponse>('/api/v1/admin/dashboard/stats');
        return response.data;
    }
};
