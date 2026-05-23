import api from "../api";

export interface AdminTranscription {
    id: string;
    recording_encrypted_id: string;
    recording_title: string | null;
    title: string | null;
    language: string | null;
    direction: string | null;
    duration: number | null;
    status: string | null;
    chapters_count: number;
    word_count: number;
    created_at: string;
    updated_at: string;
}

export interface TranscriptionSegment {
    start: number;
    end: number;
    text: string;
}

export interface TranscriptionChapter {
    start: number;
    title: string;
    [key: string]: unknown;
}

export interface AdminTranscriptionDetail extends AdminTranscription {
    transcription: string | null;
    chapters: TranscriptionChapter[];
    transcription_segments: TranscriptionSegment[];
}

export const adminTranscriptionService = {
    async getTranscriptions(
        page: number = 1,
        limit: number = 20,
        search?: string,
        status?: string,
    ): Promise<AdminTranscription[]> {
        const params: Record<string, string | number> = { page, limit };
        if (search)  params.search = search;
        if (status)  params.status = status;
        const response = await api.get("/api/v1/admin/transcriptions", { params });
        return response.data;
    },

    async getTranscriptionDetail(id: string): Promise<AdminTranscriptionDetail> {
        const response = await api.get(`/api/v1/admin/transcriptions/${id}`);
        return response.data;
    },
};

export function fmtDuration(seconds: number | null): string {
    if (!seconds) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
}
