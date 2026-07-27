'use client';

import { useState, useEffect, useCallback, use } from 'react';
import {
    ArrowLeft, Users, Globe, Lock, Star, Archive, Trash2,
    Shield, UserCheck, UserX, Mail, Calendar, Key, Layers, Settings,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { InfoTable } from '@/components/admin/InfoTable';
import { adminWorkspaceService, AdminWorkspaceDetail } from '@/services/admin/workspaceService';
import { toast } from 'sonner';

const ROLE_CONFIG: Record<string, { label: string; cls: string }> = {
    OWNER:  { label: 'Owner',  cls: 'bg-purple-50 text-[#8c00ff] border-purple-100' },
    ADMIN:  { label: 'Admin',  cls: 'bg-blue-50   text-blue-700  border-blue-100'   },
    MEMBER: { label: 'Member', cls: 'bg-slate-100 text-slate-600 border-slate-200'  },
};

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    active:   { label: 'Active',   cls: 'bg-green-50  text-green-700  border-green-100',  icon: <UserCheck size={11} /> },
    invited:  { label: 'Invited',  cls: 'bg-amber-50  text-amber-700  border-amber-100',  icon: <Mail      size={11} /> },
    removed:  { label: 'Removed',  cls: 'bg-red-50    text-red-600    border-red-100',    icon: <UserX     size={11} /> },
};

const VISIBILITY_LABELS: Record<string, string> = {
    public:    'Public — anyone with the link',
    workspace: 'Workspace — members only',
    password:  'Password protected',
    invite:    'Invite only',
    private:   'Private',
};

export default function WorkspaceDetailPage({ params }: { params: Promise<{ workspace_id: string }> }) {
    const { workspace_id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<AdminWorkspaceDetail | null>(null);

    const fetchDetail = useCallback(async () => {
        try {
            setIsLoading(true);
            setData(await adminWorkspaceService.getWorkspaceDetail(workspace_id));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to fetch workspace');
        } finally {
            setIsLoading(false);
        }
    }, [workspace_id]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    const fmt = (d?: string | null) => d
        ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : '—';

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="p-8 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-full h-24 bg-slate-100 animate-pulse rounded-3xl" />
                    ))}
                </div>
            </AdminLayout>
        );
    }

    if (!data) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <div className="p-6 rounded-full bg-red-50 text-red-400"><Layers size={48} strokeWidth={1} /></div>
                    <h2 className="text-[22px] font-black text-slate-900">Workspace Not Found</h2>
                    <button onClick={() => router.push('/admin/workspaces')} className="mt-2 px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold active:scale-95 transition-all">
                        Back to Workspaces
                    </button>
                </div>
            </AdminLayout>
        );
    }

    const activeMembers  = data.members.filter(m => m.status === 'active').length;
    const invitedMembers = data.members.filter(m => m.status === 'invited').length;
    const owners         = data.members.filter(m => m.role === 'OWNER').length;

    return (
        <AdminLayout>
            <div className="p-8 max-w-6xl mx-auto space-y-8 pb-20">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/workspaces')}
                        className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-90"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        {data.logo ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={data.logo} alt={data.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-100" />
                        ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-[#8c00ff] font-black text-[18px]">
                                {data.name?.[0]?.toUpperCase() ?? 'W'}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-[26px] font-black text-slate-900 tracking-tight">{data.name}</h1>
                                {data.is_default && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-[#8c00ff] border border-purple-100">
                                        <Star size={10} className="fill-[#8c00ff]" /> Default
                                    </span>
                                )}
                                {data.is_deleted && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-100">
                                        <Trash2 size={10} /> Deleted
                                    </span>
                                )}
                                {data.is_archived && !data.is_deleted && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                        <Archive size={10} /> Archived
                                    </span>
                                )}
                            </div>
                            <p className="text-[13px] text-slate-400 font-mono mt-0.5">/{data.slug}</p>
                        </div>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Members', value: data.member_count, icon: <Users size={16} />, bg: 'bg-purple-50', text: 'text-[#8c00ff]' },
                        { label: 'Active',         value: activeMembers,     icon: <UserCheck size={16} />, bg: 'bg-green-50',  text: 'text-green-600' },
                        { label: 'Invited',        value: invitedMembers,    icon: <Mail size={16} />,      bg: 'bg-amber-50',  text: 'text-amber-600' },
                        { label: 'Owners',         value: owners,            icon: <Shield size={16} />,    bg: 'bg-blue-50',   text: 'text-blue-600'  },
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col gap-3 shadow-xl"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{card.label}</span>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.bg} ${card.text}`}>
                                    {card.icon}
                                </div>
                            </div>
                            <span className="text-[28px] font-black">{card.value}</span>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Workspace Info */}
                    <div className="lg:col-span-5 space-y-4">
                        <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#8c00ff] px-1">Workspace Info</h3>
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                            {[
                                { icon: <Layers   size={15} />, label: 'Name',           value: data.name },
                                { icon: <Key      size={15} />, label: 'Encrypted ID',   value: data.workspace_encrypted_id },
                                { icon: <Globe    size={15} />, label: 'Owner',          value: data.owner_email },
                                { icon: <Globe    size={15} />, label: 'Default Vis.',   value: VISIBILITY_LABELS[data.default_visibility] ?? data.default_visibility },
                                { icon: <Lock     size={15} />, label: 'Lock Visibility',value: data.lock_visibility ? 'Yes — all content forced to workspace' : 'No' },
                                { icon: <Shield   size={15} />, label: 'Member Sharing', value: data.allow_member_sharing_override ? 'Members can override sharing' : 'Owner/Admin only' },
                                { icon: <Calendar size={15} />, label: 'Created',        value: fmt(data.created_at) },
                                { icon: <Calendar size={15} />, label: 'Updated',        value: fmt(data.updated_at) },
                            ].map((row, i) => (
                                <div key={i} className="flex items-start gap-4 px-6 py-3.5">
                                    <div className="text-slate-400 shrink-0 mt-0.5">{row.icon}</div>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider w-28 shrink-0 mt-0.5">{row.label}</span>
                                    <span className="text-[13px] font-semibold text-slate-800 break-all">{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Members */}
                    <div className="lg:col-span-7 space-y-4">
                        <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#8c00ff] px-1">
                            Members <span className="text-slate-400 normal-case font-semibold">({data.members.length})</span>
                        </h3>
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            {data.members.length === 0 ? (
                                <div className="py-16 flex flex-col items-center gap-3 text-slate-300">
                                    <Users size={36} strokeWidth={1} />
                                    <p className="text-[13px] text-slate-400">No members</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {data.members.map((member, i) => {
                                        const role = ROLE_CONFIG[member.role] ?? ROLE_CONFIG['MEMBER'];
                                        const st   = STATUS_CONFIG[member.status] ?? STATUS_CONFIG['active'];
                                        return (
                                            <div key={i} className="flex items-center gap-4 px-6 py-4">
                                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[13px] shrink-0">
                                                    {member.user_email[0]?.toUpperCase() ?? '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-bold text-slate-900 truncate">{member.user_email}</p>
                                                    <p className="text-[11px] text-slate-400">
                                                        {member.joined_at ? `Joined ${fmt(member.joined_at)}` : 'Invite pending'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${role.cls}`}>
                                                        {role.label}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${st.cls}`}>
                                                        {st.icon} {st.label}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Video Defaults */}
                <div className="space-y-4">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#8c00ff] px-1">Video Defaults</h3>
                    <InfoTable
                        title="Video Defaults"
                        icon={<Settings size={15} className="text-slate-400" />}
                        data={data.video_defaults ?? null}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
