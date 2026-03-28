import api from '@/services/api';

export interface SearchResult {
    type: 'user' | 'recording';
    id: string;
    name?: string;
    title?: string;
}

export const searchService = {
    lookupId: async (id: string) => {
        try {
            const response = await api.get(`/api/v1/admin/search/lookup?q=${encodeURIComponent(id)}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    }
};
