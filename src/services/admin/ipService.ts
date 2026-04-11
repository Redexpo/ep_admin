import api from '../api';

export interface IPInfo {
    _id: string;
    ip: string;
    user_id?: string;
    source: string;
    device_type?: string;
    geodata?: {
        city?: string;
        country?: string;
        region?: string;
        [key: string]: any;
    };
    user_info?: {
        id: string;
        name: string;
        email: string;
    } | null;
    created_at: string;
    updated_at: string;
    is_geo_data_fetched: boolean;
}

export interface IPResponse {
    success: boolean;
    data: {
        results: IPInfo[];
        pagination: {
            total: number;
            skip: number;
            limit: number;
        };
    };
}

export const getIPAddresses = async (skip: number = 0, limit: number = 20): Promise<IPResponse> => {
    const response = await api.get(`/api/v1/admin/ips?skip=${skip}&limit=${limit}`);
    return response.data;
};

export const getIPDetails = async (id: string): Promise<{ success: boolean, data: IPInfo }> => {
    const response = await api.get(`/api/v1/admin/ips/${id}`);
    return response.data;
};

export const syncIPGeodata = async (id: string): Promise<{ success: boolean, data: IPInfo, message: string }> => {
    const response = await api.post(`/api/v1/admin/ips/${id}/sync-geo`);
    return response.data;
};
