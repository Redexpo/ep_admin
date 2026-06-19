import api from "../api";

export interface AdminSubscription {
    id: string;
    user_id: string;
    user_email: string;
    plan_name: string;
    status: 'free' | 'active' | 'cancelled' | 'past_due' | 'trialing' | 'expired' | 'replaced';
    billing_cycle: 'none' | 'monthly' | 'annual';
    seats: number;
    subscription_source: string;
    current_period_end?: string;
    created_at: string;
}

export interface AdminSubscriptionDetail {
    id: string;
    user_id: string;
    user_email: string;
    user_name?: string;
    plan_id?: string;
    plan_name: string;
    status: string;
    subscription_type: string;
    billing_cycle: string;
    seats: number;
    used_seats: number;
    recordings_used: number;
    transcription_uses: number;
    chapter_uses: number;
    generate_uses: number;
    cap_max_recordings: number;
    cap_max_recording_minutes: number;
    cap_max_transcription_uses: number;
    cap_max_chapter_uses: number;
    cap_max_generate_uses: number;
    video_quality_max: number;
    allow_custom_thumbnail: boolean;
    allow_download: boolean;
    allow_password_protect: boolean;
    allow_watermark_removal: boolean;
    allow_camelai: boolean;
    allow_sdk: boolean;
    allow_video_upload: boolean;
    allow_generate: boolean;
    allow_workflows: boolean;
    cap_max_active_workflows: number;
    current_period_start?: string;
    current_period_end?: string;
    payment_gateway?: string;
    gateway_subscription_id?: string;
    subscription_source: string;
    assigned_by_admin_id?: string;
    assignment_notes?: string;
    active_assignment?: AssignmentRecord | null;
    cancellation?: {
        internal_notes: string;
        user_message: string | null;
        cancelled_by_admin_id: string;
        cancelled_at: string;
    } | null;
    created_at: string;
    updated_at: string;
}

export interface AssignmentFeatures {
    cap_max_recordings: number;
    cap_max_recording_minutes: number;
    cap_max_transcription_uses: number;
    cap_max_chapter_uses: number;
    cap_max_generate_uses: number;
    cap_max_active_workflows: number;
    video_quality_max: number;
    allow_custom_thumbnail: boolean;
    allow_download: boolean;
    allow_password_protect: boolean;
    allow_watermark_removal: boolean;
    allow_camelai: boolean;
    allow_sdk: boolean;
    allow_video_upload: boolean;
    allow_generate: boolean;
    allow_workflows: boolean;
}

export interface AdminAssignPlanRequest {
    user_id: string;
    plan_id: string;
    months?: number;
    end_date?: string;
    seats: number;
    notes: string;
    features: AssignmentFeatures;
}

export interface AdminRevokeAssignmentRequest {
    notes?: string;
}

export interface AssignmentRecord {
    id: string;
    user_id: string;
    assigned_by_admin_id: string;
    plan_id?: string;
    plan_name: string;
    user_subscription_id: string;
    seats: number;
    notes: string;
    start_date: string;
    end_date: string;
    features_snapshot: Record<string, unknown>;
    status: string;
    revoked_at?: string;
    revoked_by_admin_id?: string;
    created_at: string;
    updated_at: string;
}

export interface AssignmentDetail extends AssignmentRecord {
    user_email: string;
    user_name?: string;
    assigned_by_admin_email?: string;
    assigned_by_admin_name?: string;
    subscription_status?: string;
}

export interface SubscriptionUpdate {
    plan_id?: string;
    status?: string;
    billing_cycle?: string;
    seats?: number;
}

export interface SubscriptionUsageOverride {
    recordings_used?: number;
    transcription_uses?: number;
    chapter_uses?: number;
    generate_uses?: number;
    cap_max_recordings?: number;
    cap_max_recording_minutes?: number;
    cap_max_transcription_uses?: number;
    cap_max_chapter_uses?: number;
    cap_max_generate_uses?: number;
    cap_max_active_workflows?: number;
    video_quality_max?: number;
    allow_custom_thumbnail?: boolean;
    allow_download?: boolean;
    allow_password_protect?: boolean;
    allow_watermark_removal?: boolean;
    allow_camelai?: boolean;
    allow_sdk?: boolean;
    allow_video_upload?: boolean;
    allow_generate?: boolean;
    allow_workflows?: boolean;
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
    async getSubscriptions(page: number = 1, limit: number = 20, status?: string, planId?: string, search?: string): Promise<AdminSubscription[]> {
        const params: any = { page, limit };
        if (status)  params.status   = status;
        if (planId)  params.plan_id  = planId;
        if (search)  params.search   = search;

        const response = await api.get("/api/v1/admin/subscriptions", { params });
        return response.data;
    },

    async getUserSubscriptions(userId: string): Promise<AdminSubscription[]> {
        const response = await api.get("/api/v1/admin/subscriptions", { params: { user_id: userId, limit: 50 } });
        return response.data;
    },

    async getSubscriptionDetail(subscriptionId: string): Promise<AdminSubscriptionDetail> {
        const response = await api.get(`/api/v1/admin/subscriptions/${subscriptionId}`);
        return response.data;
    },

    async updateSubscription(subscriptionId: string, data: SubscriptionUpdate): Promise<void> {
        await api.patch(`/api/v1/admin/subscriptions/${subscriptionId}`, data);
    },

    async overrideSubscriptionUsage(subscriptionId: string, data: SubscriptionUsageOverride): Promise<void> {
        await api.patch(`/api/v1/admin/subscriptions/${subscriptionId}/usage`, data);
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
    },

    // Assignment Management
    async getAssignmentDetail(assignmentId: string): Promise<AssignmentDetail> {
        const response = await api.get(`/api/v1/admin/subscriptions/assignments/${assignmentId}`);
        return response.data;
    },

    async assignPlan(data: AdminAssignPlanRequest): Promise<AssignmentRecord> {
        const response = await api.post("/api/v1/admin/subscriptions/assign", data);
        return response.data;
    },

    async listAssignments(page: number = 1, limit: number = 20, status?: string): Promise<{ assignments: AssignmentRecord[]; total: number; page: number; limit: number }> {
        const params: Record<string, unknown> = { page, limit };
        if (status) params.status = status;
        const response = await api.get("/api/v1/admin/subscriptions/assignments", { params });
        return response.data;
    },

    async revokeAssignment(assignmentId: string, data: AdminRevokeAssignmentRequest): Promise<AssignmentRecord> {
        const response = await api.post(`/api/v1/admin/subscriptions/assignments/${assignmentId}/revoke`, data);
        return response.data;
    },

    async getUserAssignments(subscriptionId: string): Promise<AssignmentRecord[]> {
        const response = await api.get(`/api/v1/admin/subscriptions/${subscriptionId}/assignments`);
        return response.data;
    },

    async cancelSubscription(subscriptionId: string, data: { internal_notes: string; user_message?: string }): Promise<void> {
        await api.post(`/api/v1/admin/subscriptions/${subscriptionId}/cancel`, data);
    },
};