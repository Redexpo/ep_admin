import api from "../api";

export interface SignupDomain {
    domain: string;
    user_count: number;
    last_user_signup_at: string | null;
    is_blocked: boolean;
    created_at: string | null;
}

export interface SignupDomainUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    is_verified: boolean;
    auth_provider: string;
    created_at: string;
}

export interface SignupDomainDetail {
    domain: SignupDomain;
    users: {
        results: SignupDomainUser[];
        pagination: { total: number; page: number; per_page: number; total_pages: number };
    };
}

export const signupDomainService = {
    list: async (params: {
        page?: number;
        per_page?: number;
        search?: string;
        blocked?: boolean;
    }): Promise<{ data: { results: SignupDomain[]; pagination: { total: number; page: number; per_page: number; total_pages: number } } }> => {
        const response = await api.get("/api/v1/admin/signup-domains", { params });
        return response.data;
    },

    get: async (domain: string, page = 1, per_page = 15): Promise<{ data: SignupDomainDetail }> => {
        const response = await api.get(`/api/v1/admin/signup-domains/${domain}`, { params: { page, per_page } });
        return response.data;
    },

    toggleBlock: async (domain: string): Promise<{ data: { domain: string; is_blocked: boolean } }> => {
        const response = await api.patch(`/api/v1/admin/signup-domains/${domain}/block`);
        return response.data;
    },
};
