'use client';

import { useState, useEffect, useCallback, use } from 'react';
import {
    ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock,
    CreditCard, Users, Calendar, Zap, Download, GitBranch,
    Wand2, User, Tag, Shield, Edit2, RefreshCw, Image as ImageIcon, Lock, Sparkles, Video,
    Gift, Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import AssignPlanModal from '@/components/admin/AssignPlanModal';
import CancelSubscriptionModal from '@/components/admin/CancelSubscriptionModal';
import { adminSubscriptionService, AdminSubscriptionDetail } from '@/services/admin/subscriptionService';
import { toast } from 'sonner';

export default function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<AdminSubscriptionDetail | null>(null);
    const [showAssignModal, setShowAssignModal]   = useState(false);
    const [showCancelModal, setShowCancelModal]   = useState(false);

    const fetchDetail = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await adminSubscriptionService.getSubscriptionDetail(id);
            setData(res);
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Failed to fetch subscription';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    const handleCancel = async (internalNotes: string, userMessage: string) => {
        await adminSubscriptionService.cancelSubscription(id, {
            internal_notes: internalNotes,
            user_message: userMessage || undefined,
        });
        toast.success('Subscription cancelled — user downgraded to free plan');
        fetchDetail();
    };

    const statusConfig: Record<string, { icon: React.ReactNode; classes: string; label: string }> = {
        active:    { icon: <CheckCircle2 size={14} />, classes: 'bg-green-50 text-green-700 border-green-200',    label: 'Active' },
        cancelled: { icon: <XCircle size={14} />,      classes: 'bg-red-50 text-red-700 border-red-200',          label: 'Cancelled' },
        past_due:  { icon: <AlertCircle size={14} />,  classes: 'bg-amber-50 text-amber-700 border-amber-200',    label: 'Past Due' },
        trialing:  { icon: <Clock size={14} />,        classes: 'bg-blue-50 text-blue-700 border-blue-200',       label: 'Trialing' },
        expired:   { icon: <XCircle size={14} />,      classes: 'bg-slate-100 text-slate-600 border-slate-200',   label: 'Expired' },
        replaced:  { icon: <RefreshCw size={14} />,    classes: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Replaced' },
    };

    const sourceConfig: Record<string, { label: string; classes: string }> = {
        admin_assigned: { label: 'Admin Assigned', classes: 'bg-violet-50 text-violet-700 border-violet-200' },
        paddle:         { label: 'Paddle',          classes: 'bg-blue-50 text-blue-700 border-blue-200' },
        organic:        { label: 'Organic',         classes: 'bg-slate-50 text-slate-500 border-slate-200' },
    };

    const fmt = (date?: string) => date
        ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : '—';
    const capLabel = (n: number) => n === -1 ? '∞' : String(n);

    const daysLeft = (endDate?: string) => {
        if (!endDate) return null;
        const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
        return diff;
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="p-8 space-y-6">
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
                    <div className="p-6 rounded-full bg-red-50 text-red-500"><XCircle size={48} /></div>
                    <h2 className="text-[24px] font-bold text-slate-900">Subscription Not Found</h2>
                    <button onClick={() => router.push('/admin/subscriptions')} className="mt-4 px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold transition-all active:scale-95">
                        Back to Subscriptions
                    </button>
                </div>
            </AdminLayout>
        );
    }

    const status = statusConfig[data.status] ?? statusConfig['expired'];
    const source = sourceConfig[data.subscription_source] ?? sourceConfig['organic'];
    const days = daysLeft(data.current_period_end);
    const isAdminAssigned = data.subscription_source === 'admin_assigned' && data.status === 'active';

    const usageItems = [
        { label: 'Recordings', used: data.recordings_used, cap: data.cap_max_recordings },
        { label: 'Transcription', used: data.transcription_uses, cap: data.cap_max_transcription_uses },
        { label: 'AI Chapters', used: data.chapter_uses, cap: data.cap_max_chapter_uses },
        { label: 'AI Generate', used: data.generate_uses, cap: data.cap_max_generate_uses },
    ];

    const featureFlags = [
        { label: 'Custom Thumbnails',     enabled: data.allow_custom_thumbnail, icon: <ImageIcon size={16} /> },
        { label: 'Video Downloads',       enabled: data.allow_download,         icon: <Download size={16} /> },
        { label: 'Password Protection',   enabled: data.allow_password_protect, icon: <Lock size={16} /> },
        { label: 'Remove Watermark',      enabled: data.allow_watermark_removal,icon: <Sparkles size={16} /> },
        { label: 'CamelAI Access',        enabled: data.allow_camelai,          icon: <Sparkles size={16} /> },
        { label: 'SDK / Developer Access',enabled: data.allow_sdk,              icon: <Zap size={16} /> },
        { label: 'Video Uploads',         enabled: data.allow_video_upload,     icon: <Video size={16} /> },
        { label: 'AI Content Generation', enabled: data.allow_generate,         icon: <Wand2 size={16} /> },
        { label: 'Workflow Automations',  enabled: data.allow_workflows,        icon: <GitBranch size={16} /> },
    ];

    return (
        <AdminLayout>
            <div className="p-8 max-w-6xl mx-auto space-y-8 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/admin/subscriptions')}
                            className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-90"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
                                    {data.user_name || data.user_email}
                                </h1>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase border ${status.classes}`}>
                                    {status.icon} {status.label}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase border ${source.classes}`}>
                                    {source.label}
                                </span>
                            </div>
                            {data.user_name && (
                                <p className="text-slate-500 font-medium text-[14px] mt-0.5">{data.user_email}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {isAdminAssigned && data.active_assignment && (
                            <Link
                                href={`/admin/subscriptions/assignments/${data.active_assignment.id}`}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[14px] text-violet-700 border border-violet-200 bg-violet-50 hover:bg-violet-100 transition-all active:scale-95"
                            >
                                <Gift size={16} /> View Assignment
                            </Link>
                        )}
                        {data.status === 'active' && (
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[14px] text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-all active:scale-95"
                            >
                                <Ban size={16} />
                                Cancel Subscription
                            </button>
                        )}
                        <button
                            onClick={() => setShowAssignModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[14px] text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                            style={{ background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)' }}
                        >
                            <Gift size={16} /> Assign Plan
                        </button>
                        <Link
                            href={`/admin/subscriptions/${id}/edit`}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[14px] text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-95"
                        >
                            <Edit2 size={16} /> Edit Usage
                        </Link>
                    </div>
                </div>

                {/* Admin Assignment Info Card */}
                <AnimatePresence>
                    {isAdminAssigned && data.active_assignment && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="p-5 rounded-3xl border border-violet-200 bg-violet-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-violet-100 text-violet-600 shrink-0">
                                    <Gift size={20} />
                                </div>
                                <div>
                                    <p className="text-[14px] font-bold text-violet-900">Admin-Assigned Subscription</p>
                                    <p className="text-[12px] text-violet-600 mt-0.5">
                                        {fmt(data.active_assignment.start_date)} → {fmt(data.active_assignment.end_date)}
                                        {data.active_assignment.notes && ` · ${data.active_assignment.notes}`}
                                    </p>
                                </div>
                            </div>
                            {days !== null && (
                                <div className={`px-4 py-2 rounded-xl text-center shrink-0 ${days <= 7 ? 'bg-red-100 text-red-700' : days <= 30 ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'}`}>
                                    <p className="text-[22px] font-black leading-none">{days}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5">days left</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Cancellation Record */}
                {data.cancellation && (
                    <div className="p-5 rounded-3xl border border-red-200 bg-red-50/60 space-y-3">
                        <p className="text-[11px] font-bold text-red-600 uppercase tracking-widest">Cancellation Record</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Internal Reason</p>
                                <p className="text-[13px] text-red-700 font-medium">{data.cancellation.internal_notes}</p>
                            </div>
                            {data.cancellation.user_message && (
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">User Message</p>
                                    <p className="text-[13px] text-red-700 font-medium">{data.cancellation.user_message}</p>
                                </div>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                            Cancelled on {new Date(data.cancellation.cancelled_at).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            {' '}· by admin <span className="font-mono">{data.cancellation.cancelled_by_admin_id.slice(-8)}</span>
                        </p>
                    </div>
                )}

                {/* Usage Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {usageItems.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col gap-3 shadow-xl"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</span>
                                <span className="text-[11px] font-bold text-slate-500">/ {capLabel(item.cap)}</span>
                            </div>
                            <span className="text-[28px] font-black">{item.used}</span>
                            {item.cap !== -1 && item.cap > 0 && (
                                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-[#8c00ff] transition-all"
                                        style={{ width: `${Math.min(100, (item.used / item.cap) * 100)}%` }}
                                    />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left — Subscription Info */}
                    <div className="lg:col-span-5 space-y-4">
                        <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#8c00ff] px-1">Subscription Info</h3>
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                            {[
                                { icon: <CreditCard size={16} />, label: 'Plan',         value: data.plan_name },
                                { icon: <Tag size={16} />,        label: 'Type',         value: data.subscription_type === 'paid' ? 'Paid' : 'Free' },
                                { icon: <RefreshCw size={16} />,  label: 'Billing Cycle',value: data.billing_cycle === 'none' ? 'None (Free)' : data.billing_cycle.charAt(0).toUpperCase() + data.billing_cycle.slice(1) },
                                { icon: <Users size={16} />,      label: 'Seats',        value: `${data.used_seats} used / ${data.seats} total` },
                                { icon: <Calendar size={16} />,   label: 'Period Start',  value: fmt(data.current_period_start) },
                                { icon: <Calendar size={16} />,   label: 'Period End',    value: fmt(data.current_period_end) },
                                { icon: <Zap size={16} />,        label: 'Gateway',       value: data.payment_gateway || '—' },
                                { icon: <Shield size={16} />,     label: 'Gateway Sub ID',value: data.gateway_subscription_id || '—' },
                                { icon: <User size={16} />,       label: 'User ID',       value: data.user_id },
                                { icon: <Calendar size={16} />,   label: 'Created',       value: fmt(data.created_at) },
                                { icon: <Calendar size={16} />,   label: 'Updated',       value: fmt(data.updated_at) },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center gap-4 px-6 py-4">
                                    <div className="text-slate-400 shrink-0">{row.icon}</div>
                                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider w-32 shrink-0">{row.label}</span>
                                    <span className="text-[13px] font-semibold text-slate-800 break-all">{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — Caps & Features */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Entitlement Caps */}
                        <div className="space-y-4">
                            <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#8c00ff] px-1">Entitlement Caps</h3>
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Max Recordings',     value: data.cap_max_recordings },
                                    { label: 'Max Length (min)',   value: data.cap_max_recording_minutes },
                                    { label: 'Transcription Uses', value: data.cap_max_transcription_uses },
                                    { label: 'Chapter Uses',       value: data.cap_max_chapter_uses },
                                    { label: 'AI Generate Uses',   value: data.cap_max_generate_uses },
                                    { label: 'Active Workflows',   value: data.cap_max_active_workflows },
                                    { label: 'Video Quality',      value: data.video_quality_max === 2160 ? '4K' : data.video_quality_max === 1440 ? '2K' : `${data.video_quality_max}p`, raw: true },
                                ].map((cap, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-slate-50 flex flex-col gap-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{cap.label}</span>
                                        <span className="text-[22px] font-black text-slate-900">{'raw' in cap ? cap.value : capLabel(cap.value as number)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Feature Flags */}
                        <div className="space-y-4">
                            <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#8c00ff] px-1">Feature Access</h3>
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {featureFlags.map((flag, i) => (
                                    <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${flag.enabled ? 'border-purple-100 bg-purple-50/40' : 'border-slate-100 bg-slate-50'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${flag.enabled ? 'bg-purple-100 text-[#8c00ff]' : 'bg-slate-100 text-slate-400'}`}>
                                                {flag.icon}
                                            </div>
                                            <span className={`text-[13px] font-bold ${flag.enabled ? 'text-slate-900' : 'text-slate-400'}`}>{flag.label}</span>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${flag.enabled ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                                            {flag.enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showAssignModal && (
                    <AssignPlanModal
                        userId={data.user_id}
                        userEmail={data.user_email}
                        onClose={() => setShowAssignModal(false)}
                        onSuccess={fetchDetail}
                    />
                )}
            </AnimatePresence>
            <CancelSubscriptionModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancel}
                userInfo={data?.user_email}
                planName={data?.plan_name}
            />
        </AdminLayout>
    );
}
