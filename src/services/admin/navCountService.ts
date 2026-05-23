import api from "../api";

export interface NavCounts {
    users: number;
    videos: number;
    workspaces: number;
    folders: number;
    screenshots: number;
    transcriptions: number;
    notifications: number;
    plans: number;
    subscriptions: number;
    payments: number;
    reports: number;
    comments: number;
    reactions: number;
    contacts_us: number;
    contacts_sales: number;
    admins: number;
    ips: number;
}

export async function fetchNavCounts(): Promise<NavCounts> {
    const response = await api.get("/api/v1/admin/nav-counts");
    return response.data;
}
