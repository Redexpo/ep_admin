import api from "../api";

export interface AdminReport {
    id: string;
    recording_encrypted_id: string;
    recording_title: string | null;
    user_id: string;
    user_name: string;
    user_email: string;
    reason: string;
    details: string | null;
    status: "pending" | "resolved" | "dismissed";
    created_at: string;
    updated_at: string;
}

export const REPORT_REASONS = [
    "spam",
    "inappropriate_content",
    "copyright",
    "harassment",
    "misinformation",
    "other",
] as const;

class AdminReportService {
    async getReports(
        page: number,
        status?: string,
        reason?: string,
    ): Promise<AdminReport[]> {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        if (status) params.set("status", status);
        if (reason) params.set("reason", reason);
        const res = await api.get(`/api/v1/admin/reports?${params}`);
        return res.data;
    }

    async updateStatus(reportId: string, status: string): Promise<void> {
        await api.patch(`/api/v1/admin/videos/reports/${reportId}`, null, {
            params: { status },
        });
    }
}

export const adminReportService = new AdminReportService();
