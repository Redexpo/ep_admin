import api from "../api";

export interface GatewayAccount {
    id: string;
    gateway: string;
    environment: string;
    provider_account_id: string;
    is_active: boolean;
    archived_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface CatalogProduct {
    id: string;
    gateway: string;
    environment: string;
    plan_id: string;
    plan_name: string | null;
    external_product_id: string;
    is_active: boolean;
    archived_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface CatalogPrice {
    id: string;
    gateway: string;
    environment: string;
    plan_id: string;
    plan_name: string | null;
    billing_cycle: string;
    currency: string;
    unit_amount: number;
    seat_count: number;
    price_kind: string;
    external_product_id: string;
    external_price_id: string;
    is_active: boolean;
    archived_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface WebhookEvent {
    id: string;
    gateway: string;
    environment: string;
    event_id: string;
    event_type: string;
    transaction_id: string | null;
    processed: boolean;
    processed_at: string | null;
    error: string | null;
    received_at: string;
    payload_preview: Record<string, unknown>;
}

const base = "/api/v1/admin/gateway";

export const adminGatewayService = {
    async getAccounts(gateway?: string, environment?: string): Promise<GatewayAccount[]> {
        const params: Record<string, string> = {};
        if (gateway) params.gateway = gateway;
        if (environment) params.environment = environment;
        return (await api.get(`${base}/accounts`, { params })).data;
    },

    async getProducts(gateway?: string, environment?: string): Promise<CatalogProduct[]> {
        const params: Record<string, string> = {};
        if (gateway) params.gateway = gateway;
        if (environment) params.environment = environment;
        return (await api.get(`${base}/products`, { params })).data;
    },

    async getPrices(gateway?: string, environment?: string, billingCycle?: string): Promise<CatalogPrice[]> {
        const params: Record<string, string> = {};
        if (gateway) params.gateway = gateway;
        if (environment) params.environment = environment;
        if (billingCycle) params.billing_cycle = billingCycle;
        return (await api.get(`${base}/prices`, { params })).data;
    },

    async getWebhooks(
        page: number = 1,
        gateway?: string,
        environment?: string,
        eventType?: string,
        processed?: boolean,
    ): Promise<WebhookEvent[]> {
        const params: Record<string, string | number | boolean> = { page, limit: 20 };
        if (gateway) params.gateway = gateway;
        if (environment) params.environment = environment;
        if (eventType) params.event_type = eventType;
        if (processed !== undefined) params.processed = processed;
        return (await api.get(`${base}/webhooks`, { params })).data;
    },
};

export const GATEWAY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    paddle: { label: 'Paddle', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    stripe: { label: 'Stripe', color: 'text-violet-700',  bg: 'bg-violet-50'  },
};

export const ENV_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    production: { label: 'Production', color: 'text-green-700',  bg: 'bg-green-50'  },
    sandbox:    { label: 'Sandbox',    color: 'text-amber-700',  bg: 'bg-amber-50'  },
};
