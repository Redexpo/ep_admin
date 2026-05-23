import api from "../api";

export interface AdminComment {
    id: string;
    document_type: string;
    document_id: string;
    document_title: string | null;
    user_id: string;
    user_name: string;
    user_email: string;
    comment: string;
    timestamp: string | null;
    is_reply: boolean;
    likes_count: number;
    created_at: string;
    updated_at: string;
}

export interface AdminReaction {
    id: string;
    recording_encrypted_id: string;
    recording_title: string | null;
    user_id: string;
    user_name: string;
    user_email: string;
    reaction: string;
    created_at: string;
}

export const adminCommentService = {
    async getComments(
        page: number = 1,
        limit: number = 20,
        search?: string,
        docType?: string,
    ): Promise<AdminComment[]> {
        const params: Record<string, string | number> = { page, limit };
        if (search)  params.search   = search;
        if (docType) params.doc_type = docType;
        const response = await api.get("/api/v1/admin/comments", { params });
        return response.data;
    },

    async getReactions(
        page: number = 1,
        limit: number = 20,
        reaction?: string,
        search?: string,
    ): Promise<AdminReaction[]> {
        const params: Record<string, string | number> = { page, limit };
        if (reaction) params.reaction = reaction;
        if (search)   params.search   = search;
        const response = await api.get("/api/v1/admin/reactions", { params });
        return response.data;
    },
};
