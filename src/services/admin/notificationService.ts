import api from "../api";

export interface AdminNotification {
    id: string;
    event_id: string;
    notification_type: string;
    workspace_id: string;
    workspace_name: string | null;
    recording_encrypted_id: string | null;
    from_user_name: string | null;
    from_user_email: string | null;
    message: string | null;
    is_read: boolean;
    meta_data: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export const adminNotificationService = {
    async getNotifications(
        page: number = 1,
        limit: number = 20,
        notificationType?: string,
        isRead?: boolean,
        search?: string,
    ): Promise<AdminNotification[]> {
        const params: Record<string, string | number | boolean> = { page, limit };
        if (notificationType) params.notification_type = notificationType;
        if (isRead !== undefined) params.is_read = isRead;
        if (search) params.search = search;
        const response = await api.get("/api/v1/admin/notifications", { params });
        return response.data;
    },
};

export const NOTIFICATION_TYPES = ['comment', 'reaction', 'share', 'view', 'mention', 'system'] as const;

export const TYPE_CONFIG: Record<string, { label: string; emoji: string; bg: string; text: string }> = {
    comment:  { label: 'Comment',  emoji: '💬', bg: 'bg-blue-50',   text: 'text-blue-700'   },
    reaction: { label: 'Reaction', emoji: '❤️', bg: 'bg-rose-50',   text: 'text-rose-700'   },
    share:    { label: 'Share',    emoji: '🔗', bg: 'bg-green-50',  text: 'text-green-700'  },
    view:     { label: 'View',     emoji: '👁️', bg: 'bg-slate-100', text: 'text-slate-600'  },
    mention:  { label: 'Mention',  emoji: '🔔', bg: 'bg-amber-50',  text: 'text-amber-700'  },
    system:   { label: 'System',   emoji: '⚙️', bg: 'bg-purple-50', text: 'text-purple-700' },
};
