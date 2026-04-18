import api from "../api";

export interface Plan {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    price_monthly: number;
    price_annual: number;
    base_seats: number;
    extra_seat_price_monthly: number;
    extra_seat_price_annual: number;
    currency: string;
    billing_model: string;
    max_seats: number;
    is_popular: boolean;
    is_active: boolean;
    visibility: string;
    access_token?: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface PlanFeature {
    id: string;
    plan_id: string;
    feature_text: string;
    is_highlighted: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface PlanLimit {
    id: string;
    plan_id: string;
    max_recordings: number;
    max_recording_minutes: number;
    max_transcription_uses: number;
    max_chapter_uses: number;
    max_seats: number;
    video_quality_max: number;
    allow_custom_thumbnail: boolean;
    allow_download: boolean;
    allow_password_protect: boolean;
    allow_watermark_removal: boolean;
    allow_camelai: boolean;
    allow_sdk: boolean;
    created_at: string;
    updated_at: string;
}

export interface PlanDetail extends Plan {
    features: PlanFeature[];
    limits: PlanLimit;
}

export const adminPlanService = {
    // Plans CRUD
    async getPlans(): Promise<Plan[]> {
        const response = await api.get("/api/v1/admin/plans");
        return response.data;
    },

    async createPlan(data: Partial<Plan>): Promise<Plan> {
        const response = await api.post("/api/v1/admin/plans", data);
        return response.data;
    },

    async getPlanDetail(planId: string): Promise<PlanDetail> {
        const response = await api.get(`/api/v1/admin/plans/${planId}`);
        return response.data;
    },

    async updatePlan(planId: string, data: Partial<Plan>): Promise<Plan> {
        const response = await api.put(`/api/v1/admin/plans/${planId}`, data);
        return response.data;
    },

    async deletePlan(planId: string): Promise<void> {
        await api.delete(`/api/v1/admin/plans/${planId}`);
    },

    async togglePlanStatus(planId: string): Promise<Plan> {
        const response = await api.patch(`/api/v1/admin/plans/${planId}/toggle-status`);
        return response.data;
    },

    async changeVisibility(planId: string, visibility: string): Promise<Plan> {
        const response = await api.patch(`/api/v1/admin/plans/${planId}/visibility`, { visibility });
        return response.data;
    },

    async regenerateToken(planId: string): Promise<{ access_token: string }> {
        const response = await api.post(`/api/v1/admin/plans/${planId}/regenerate-token`);
        return response.data;
    },

    // Plan Features
    async getFeatures(planId: string): Promise<PlanFeature[]> {
        const response = await api.get(`/api/v1/admin/plans/${planId}/features`);
        return response.data;
    },

    async addFeature(planId: string, data: Partial<PlanFeature>): Promise<PlanFeature> {
        const response = await api.post(`/api/v1/admin/plans/${planId}/features`, data);
        return response.data;
    },

    async updateFeature(planId: string, featureId: string, data: Partial<PlanFeature>): Promise<PlanFeature> {
        const response = await api.put(`/api/v1/admin/plans/${planId}/features/${featureId}`, data);
        return response.data;
    },

    async deleteFeature(planId: string, featureId: string): Promise<void> {
        await api.delete(`/api/v1/admin/plans/${planId}/features/${featureId}`);
    },

    async reorderFeatures(planId: string, items: { id: string, sort_order: number }[]): Promise<void> {
        await api.patch(`/api/v1/admin/plans/${planId}/features/reorder`, { features: items });
    },

    // Plan Limits
    async getLimits(planId: string): Promise<PlanLimit> {
        const response = await api.get(`/api/v1/admin/plans/${planId}/limits`);
        return response.data;
    },

    async updateLimits(planId: string, data: Partial<PlanLimit>): Promise<PlanLimit> {
        const response = await api.put(`/api/v1/admin/plans/${planId}/limits`, data);
        return response.data;
    }
};
