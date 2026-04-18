import api from "../api";

export interface AdminSubscription {
    id: string;
    user_id: string;
    user_email: string;
    plan_name: string;
    status: 'free' | 'active' | 'cancelled' | 'past_due' | 'trialing';
    billing_cycle: 'none' | 'monthly' | 'annual';
    seats: number;
    created_at: string;
}

export interface SubscriptionUpdate {
    plan_id?: string;
    status?: string;
    billing_cycle?: string;
    seats?: number;
}

export const adminSubscriptionService = {
    async getSubscriptions(page: number = 1, limit: number = 20, status?: string, planId?: string): Promise<AdminSubscription[]> {
        const params: any = { page, limit };
        if (status) params.status = status;
        if (planId) params.plan_id = planId;

        const response = await api.get("/api/v1/admin/subscriptions", { params });
        return response.data;
    },

    async getSubscriptionDetail(userId: string): Promise<AdminSubscription> {
        const response = await api.get(`/api/v1/admin/subscriptions/${userId}`);
        return response.data;
    },

    async updateSubscription(userId: string, data: SubscriptionUpdate): Promise<void> {
        await api.patch(`/api/v1/admin/subscriptions/${userId}`, data);
    }
};
