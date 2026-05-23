import api from "../api";

export interface AdminContactUs {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
}

export interface AdminContactSales {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    company: string;
    team_size: string;
    message: string;
    created_at: string;
}

export const adminContactService = {
    async getContactUs(page: number = 1, limit: number = 20, search?: string): Promise<AdminContactUs[]> {
        const params: Record<string, string | number> = { page, limit };
        if (search) params.search = search;
        const response = await api.get("/api/v1/admin/contacts/us", { params });
        return response.data;
    },

    async getContactUsDetail(id: string): Promise<AdminContactUs> {
        const response = await api.get(`/api/v1/admin/contacts/us/${id}`);
        return response.data;
    },

    async getContactSales(page: number = 1, limit: number = 20, search?: string): Promise<AdminContactSales[]> {
        const params: Record<string, string | number> = { page, limit };
        if (search) params.search = search;
        const response = await api.get("/api/v1/admin/contacts/sales", { params });
        return response.data;
    },

    async getContactSalesDetail(id: string): Promise<AdminContactSales> {
        const response = await api.get(`/api/v1/admin/contacts/sales/${id}`);
        return response.data;
    },
};
