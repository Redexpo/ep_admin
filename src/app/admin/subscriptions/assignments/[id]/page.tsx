'use client';

import { useState, useEffect, useCallback, use } from 'react';
import {
    ArrowLeft, Gift, CheckCircle2, XCircle, Clock, RefreshCw,
    Calendar, Users, StickyNote, User, Shield, ExternalLink,
    Download, GitBranch, Wand2, Image as ImageIcon, Lock,
    Sparkles, Zap, Video, RotateCcw, Infinity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import RevokeAssignmentModal from '@/components/admin/RevokeAssignmentModal';
import { adminSubscriptionService, AssignmentDetail } from '@/services/admin/subscriptionService';
import { toast } from 'sonner';

export default function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<AssignmentDetail | null>(null);
    const [showRevokeModal, setShowRevokeModal] = useState(false);

    const fetchDetail = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await adminSubscriptionService.getAssignmentDetail(id);
            setData(res);
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Failed to fetch assignment';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    const handleRevoke = async (notes: string) => {
        if (!data) return;
        await adminSubscriptionService.revokeAssignment(data.id, { notes });
        toast.success('Assignment revoked — user downgraded to free plan');
        fetchDetail();
    };

    const statusConfig: Record<string, { label: string; classes: string; icon: React.ReactNode }> = {
        active:   { label: 'Active',   classes: 'bg-green-50 text-green-700 border-green-200',    icon: <CheckCircle2 size={13} /> },
        expired:  { label: 'Expired',  classes: 'bg-slate-100 text-slate-500 border-slate-200',   icon: <Clock size={13} /> },
        revoked:  { label: 'Revoked',  classes: 'bg-red-50 text-red-600 border-red-200',          icon: <XCircle size={13} /> },
        replaced: { label: 'Replaced', classes: 'bg-amber-50 text-amber-700 border-amber-200',    icon: <RefreshCw size={13} /> },
    };

    const subStatusConfig: Record<string, string> = {
        active:    'bg-green-50 text-green-700',
        cancelled: 'bg-red-50 text-red-600',
        replaced:  'bg-amber-50 text-amber-700',
        expired:   'bg-slate-100 text-slate-500',
    };

    const fmt = (date?: string) => date
        ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : '—';

    const fmtFull = (date?: string) => date
        ? new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
        : '—';

    const daysLeft = (endDate: string) => Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
    const capLabel = (n: unknown) => n === -1 || n === undefined ? '∞' : String(n);

    const boolFeatureKeys = [
        { key: 'allow_custom_thumbnail', label: 'Custom Thumbnails',     icon: <ImageIcon size={14} /> },
        { key: 'allow_download',         label: 'Video Downloads',       icon: <Download size={14} /> },
        { key: 'allow_password_protect', label: 'Password Protection',   icon: <Lock size={14} /> },
        { key: 'allow_watermark_removal',label: 'Remove Watermark',      icon: <Sparkles size={14} /> },
        { key: 'allow_camelai',          label: 'CamelAI Access',        icon: <Sparkles size={14} /> },
        { key: 'allow_sdk',              label: 'SDK Access',            icon: <Zap size={14} /> },
        { key: 'allow_video_upload',     label: 'Video Uploads',         icon: <Video size={14} /> },
        { key: 'allow_generate',         label: 'AI Generate',           icon: <Wand2 size={14} /> },
        { key: 'allow_workflows',        label: 'Workflows',             icon: <GitBranch size={14} /> },
    ];

    const capKeys = [
        { key: 'cap_max_recordings',         label: 'Max Recordings' },
        { key: 'cap_max_recording_minutes',  label: 'Max Length (min)' },
        { key: 'cap_max_transcription_uses', label: 'Transcription Uses' },
        { key: 'cap_max_chapter_uses',       label: 'Chapter Uses' },
        { key: 'cap_max_generate_uses',      label: 'AI Generate Uses' },
        { key: 'cap_max_active_workflows',   label: 'Active Workflows' },
    ];

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="p-8 space-y-6">
                    {[1, 2, 3].map(i => <div key={i} className="w-full h-28 bg-slate-100 animate-pulse rounded-3xl" />)}
                </div>
            </AdminLayout>
        );
    }

    if (!data) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <div className="p-6 rounded-full bg-red-50 text-red-500"><XCircle size={48} /></div>
                    <h2 className="text-[24px] font-bold text-slate-900">Assignment Not Found</h2>
                    <button onClick={() => router.push('/admin/subscriptions/assignments')} className="mt-4 px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold transition-all active:scale-95">
                        Back to Assignments
                    </button>
                </div>
            </AdminLayout>
        );
    }

    const sc = statusConfig[data.status] ?? statusConfig['expired'];
    const dl = daysLeft(data.end_date);
    const snap = data.features_snapshot;

    return (
        <AdminLayout>
            <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/admin/subscriptions/assignments')}
                            className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-90 shrink-0"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="p-2 rounded-xl shrink-0" style={{ background: 'linear-gradient(135deg,#8c00ff,#7c3aed)' }}>
                                    <Gift size={18} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-[24px] font-bold text-slate-900 tracking-tight">{data.plan_name || 'Assignment'}</h1>
                                    <p className="text-[13px] text-slate-500 mt-0.5">{data.user_name || data.user_email}</p>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase border ${sc.classes}`}>
                                    {sc.icon} {sc.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {data.user_subscription_id && (
                            <Link
                                href={`/admin/subscriptions/${data.user_subscription_id}`}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[13px] text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-95"
                            >
                                <ExternalLink size={14} /> View Subscription
                            </Link>
                        )}
                        {data.status === 'active' && (
                            <button
                                onClick={() => setShowRevokeModal(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[13px] text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-all active:scale-95"
                            >
                                <RotateCcw size={14} />
                                Revoke Assignment
                            </button>
                        )}
                    </div>
                </div>

                {/* Days left banner — only when active */}
                <AnimatePresence>
                    {data.status === 'active' && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className={`flex items-center justify-between p-5 rounded-3xl border ${
                                dl <= 7 ? 'bg-red-50 border-red-200' : dl <= 30 ? 'bg-amber-50 border-amber-200' : 'bg-violet-50 border-violet-200'
                            }`}
                        >
                            <div>
                                <p className={`text-[13px] font-bold ${dl <= 7 ? 'text-red-800' : dl <= 30 ? 'text-amber-800' : 'text-violet-800'}`}>
                                    {dl > 0 ? `${dl} days remaining` : 'Expires today'}
                                </p>
                                <p className={`text-[12px] mt-0.5 ${dl <= 7 ? 'text-red-600' : dl <= 30 ? 'text-amber-600' : 'text-violet-600'}`}>
                                    {fmt(data.start_date)} → {fmt(data.end_date)}
                                </p>
                            </div>
                            <div className={`text-[40px] font-black leading-none tabular-nums ${dl <= 7 ? 'text-red-500' : dl <= 30 ? 'text-amber-500' : 'text-violet-500'}`}>
                                {dl > 0 ? dl : 0}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left — Assignment Info */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8c00ff] px-1">Assignment Details</h3>
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                                {[
                                    { icon: <User size={15} />,     label: 'User',         value: data.user_name || data.user_email, sub: data.user_name ? data.user_email : undefined },
                                    { icon: <Gift size={15} />,     label: 'Plan',         value: data.plan_name || '—' },
                                    { icon: <Users size={15} />,    label: 'Seats',        value: String(data.seats) },
                                    { icon: <Calendar size={15} />, label: 'Start Date',   value: fmtFull(data.start_date) },
                                    { icon: <Calendar size={15} />, label: 'End Date',     value: fmtFull(data.end_date) },
                                    { icon: <Calendar size={15} />, label: 'Assigned On',  value: fmtFull(data.created_at) },
                                ].map((row, i) => (
                                    <div key={i} className="flex items-start gap-4 px-5 py-3.5">
                                        <div className="text-slate-400 shrink-0 mt-0.5">{row.icon}</div>
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider w-28 shrink-0 mt-0.5">{row.label}</span>
                                        <div className="min-w-0">
                                            <p className="text-[13px] font-semibold text-slate-800 break-all">{row.value}</p>
                                            {row.sub && <p className="text-[11px] text-slate-400 mt-0.5">{row.sub}</p>}
                                        </div>
                                    </div>
                                ))}

                                {/* Assigned by */}
                                <div className="flex items-start gap-4 px-5 py-3.5">
                                    <div className="text-slate-400 shrink-0 mt-0.5"><Shield size={15} /></div>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider w-28 shrink-0 mt-0.5">Assigned By</span>
                                    <div className="min-w-0">
                                        <p className="text-[13px] font-semibold text-slate-800">
                                            {data.assigned_by_admin_name || data.assigned_by_admin_email || data.assigned_by_admin_id.slice(-8)}
                                        </p>
                                        {data.assigned_by_admin_name && data.assigned_by_admin_email && (
                                            <p className="text-[11px] text-slate-400 mt-0.5">{data.assigned_by_admin_email}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Linked subscription */}
                                {data.user_subscription_id && (
                                    <div className="flex items-center gap-4 px-5 py-3.5">
                                        <div className="text-slate-400 shrink-0"><ExternalLink size={15} /></div>
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider w-28 shrink-0">Subscription</span>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Link href={`/admin/subscriptions/${data.user_subscription_id}`} className="text-[13px] font-semibold text-[#8c00ff] hover:underline font-mono">
                                                {data.user_subscription_id.slice(-10)}
                                            </Link>
                                            {data.subscription_status && (
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${subStatusConfig[data.subscription_status] ?? 'bg-slate-100 text-slate-500'}`}>
                                                    {data.subscription_status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        {data.notes && (
                            <div className="space-y-3">
                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8c00ff] px-1">Notes</h3>
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex gap-3">
                                    <StickyNote size={15} className="text-slate-400 shrink-0 mt-0.5" />
                                    <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">{data.notes}</p>
                                </div>
                            </div>
                        )}

                        {/* Revocation info */}
                        {data.status === 'revoked' && data.revoked_at && (
                            <div className="p-5 rounded-3xl border border-red-100 bg-red-50 space-y-1">
                                <p className="text-[12px] font-bold text-red-700 uppercase tracking-wide">Revocation Record</p>
                                <p className="text-[13px] text-red-600">Revoked on {fmtFull(data.revoked_at)}</p>
                                {data.revoked_by_admin_id && (
                                    <p className="text-[12px] text-red-500 font-mono">By admin: {data.revoked_by_admin_id.slice(-8)}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right — Features Snapshot */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Bool features */}
                        <div className="space-y-3">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8c00ff] px-1">Feature Access <span className="text-slate-400 normal-case font-normal">(snapshot at assignment time)</span></h3>
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {boolFeatureKeys.map(({ key, label, icon }) => {
                                    const enabled = !!snap[key];
                                    return (
                                        <div key={key} className={`flex items-center justify-between p-3.5 rounded-2xl border ${enabled ? 'border-purple-100 bg-purple-50/50' : 'border-slate-100 bg-slate-50'}`}>
                                            <div className="flex items-center gap-2.5">
                                                <div className={`p-1.5 rounded-lg ${enabled ? 'bg-purple-100 text-[#8c00ff]' : 'bg-slate-100 text-slate-400'}`}>
                                                    {icon}
                                                </div>
                                                <span className={`text-[12px] font-bold ${enabled ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${enabled ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                                                {enabled ? 'On' : 'Off'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Caps */}
                        <div className="space-y-3">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8c00ff] px-1">Entitlement Caps</h3>
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {capKeys.map(({ key, label }) => {
                                    const val = snap[key];
                                    const isUnlimited = val === -1 || val === undefined;
                                    return (
                                        <div key={key} className="p-4 rounded-2xl bg-slate-50 flex flex-col gap-1.5">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
                                            <div className="flex items-center gap-1">
                                                {isUnlimited
                                                    ? <Infinity size={20} className="text-[#8c00ff]" />
                                                    : <span className="text-[22px] font-black text-slate-900">{String(val)}</span>
                                                }
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Video quality */}
                                <div className="p-4 rounded-2xl bg-slate-50 flex flex-col gap-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Video Quality</span>
                                    <span className="text-[22px] font-black text-slate-900">
                                        {snap.video_quality_max === 2160 ? '4K' : snap.video_quality_max === 1440 ? '2K' : `${snap.video_quality_max}p`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Assignment ID */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Assignment ID</span>
                            <span className="text-[12px] font-mono text-slate-600 break-all">{data.id}</span>
                        </div>
                    </div>
                </div>
            </div>
            <RevokeAssignmentModal
                isOpen={showRevokeModal}
                onClose={() => setShowRevokeModal(false)}
                onConfirm={handleRevoke}
                userInfo={data?.user_email ?? data?.user_id}
            />
        </AdminLayout>
    );
}
