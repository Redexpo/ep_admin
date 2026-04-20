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

export interface AdminPaymentOrder {
    id: string;
    user_id: string;
    user_email: string;
    plan_name: string;
    amount_usd: number;
    gateway: string;
    basket_id: string;
    bill_id: string;
    status: string;
    created_at: string;
}

export interface AdminPaymentOrderDetail {
    order: AdminPaymentOrder & {
        user_name: string;
        billing_cycle: string;
        seats: number;
        updated_at: string;
    };
    transactions: Array<{
        id: string;
        transaction_id: string;
        step: string;
        scheme: string;
        status: string;
        gateway_response: any;
        created_at: string;
    }>;
    logs: Array<{
        id: string;
        step: string;
        url: string;
        request_payload: any;
        response_payload: any;
        status_code: number;
        success: boolean;
        error_message?: string;
        created_at: string;
    }>;
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
    },

    // Payment Management
    async listPaymentOrders(page: number = 1, limit: number = 20, status?: string, gateway?: string): Promise<{ orders: AdminPaymentOrder[], total: number }> {
        const params: any = { page, limit };
        if (status) params.status = status;
        if (gateway) params.gateway = gateway;

        const response = await api.get("/api/v1/admin/payments/orders", { params });
        return response.data;
    },

    async getPaymentOrderDetail(orderId: string): Promise<AdminPaymentOrderDetail> {
        const response = await api.get(`/api/v1/admin/payments/orders/${orderId}`);
        return response.data;
    }
};