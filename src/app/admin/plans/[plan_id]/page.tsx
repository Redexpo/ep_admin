'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft, Check, X, Shield, Star, Zap, Lock, Copy, Calendar, Tag, CreditCard, Users, Layout, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminPlanService, Plan, PlanFeature, PlanLimit } from '@/services/admin/planService';
import { toast } from 'sonner';

interface PlanDetailState {
    plan: Plan | null;
    features: PlanFeature[];
    limits: PlanLimit | null;
}

export default function PlanDetailPage({ params }: { params: Promise<{ plan_id: string }> }) {
    const { plan_id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<PlanDetailState>({
        plan: null,
        features: [],
        limits: null
    });

    useEffect(() => {
        fetchPlanDetail();
    }, [plan_id]);

    const fetchPlanDetail = async () => {
        try {
            setIsLoading(true);
            const res = await adminPlanService.getPlanDetail(plan_id);
            setData({
                plan: res,
                features: res.features || [],
                limits: res.limits || null
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch plan details");
            if (error.response?.status === 404) {
                // Handled in UI
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getBillingLabel = (model: string) => {
        const labels: Record<string, string> = {
            'free': 'Free Forever',
            'per_user': 'Per User',
            'flat_team': 'Flat Team',
            'custom': 'Custom / Contact Sales'
        };
        return labels[model] || model;
    };

    const getVisibilityBadge = (visibility: string) => {
        switch (visibility) {
            case 'public':
                return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[12px] font-bold flex items-center gap-1.5"><Check size={14} /> Public</span>;
            case 'private':
                return <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[12px] font-bold flex items-center gap-1.5"><Lock size={14} /> Private</span>;
            case 'draft':
                return <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[12px] font-bold flex items-center gap-1.5"><X size={14} /> Draft</span>;
            default:
                return null;
        }
    };

    const InfoRow = ({ label, value, icon: Icon, isFull = false }: { label: string, value: any, icon: any, isFull?: boolean }) => (
        <div className={`p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-start gap-4 ${isFull ? 'col-span-full' : ''}`}>
            <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <div className="text-[15px] font-semibold text-slate-900 break-words">{value}</div>
            </div>
        </div>
    );

    const StatusBadge = ({ active }: { active: boolean }) => (
        <div className={`px-4 py-1.5 rounded-xl font-bold text-[13px] flex items-center gap-2 ${active ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-slate-200 text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full ${active ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
            {active ? 'SYSTEM ACTIVE' : 'INACTIVE'}
        </div>
    );

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="p-8"><div className="w-full h-20 bg-slate-100 animate-pulse rounded-2xl" /></div>
            </AdminLayout>
        );
    }

    if (!data.plan) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <div className="p-6 rounded-full bg-red-50 text-red-500"><X size={48} /></div>
                    <h2 className="text-[24px] font-bold text-slate-900">Plan Not Found</h2>
                    <p className="text-slate-500">The plan you are looking for does not exist or has been deleted.</p>
                    <button onClick={() => router.push('/admin/plans')} className="mt-4 px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold transition-all active:scale-95">Back to Plans</button>
                </div>
            </AdminLayout>
        );
    }

    const { plan, features, limits } = data;

    return (
        <AdminLayout>
            <div className="p-8 max-w-6xl mx-auto space-y-8 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/admin/plans')}
                            className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-90"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-[32px] font-bold text-slate-900 tracking-tight">{plan.name}</h1>
                                {plan.is_popular && (
                                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-[11px] font-black uppercase tracking-widest border border-purple-200 shadow-sm flex items-center gap-1">
                                        <Star size={12} className="fill-purple-600" /> Popular
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-500 font-medium flex items-center gap-2">
                                <Tag size={16} /> {plan.slug}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {getVisibilityBadge(plan.visibility)}
                        <StatusBadge active={plan.is_active} />
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InfoRow
                        label="Monthly Price"
                        icon={CreditCard}
                        value={plan.billing_model === 'free' ? 'Free' : `$${plan.price_monthly}`}
                    />
                    <InfoRow
                        label="Annual Price"
                        icon={Calendar}
                        value={plan.billing_model === 'free' ? 'Free' : `$${plan.price_annual}`}
                    />
                    <InfoRow label="Billing Model" icon={Tag} value={getBillingLabel(plan.billing_model)} />
                    <InfoRow label="Seats" icon={Users} value={plan.billing_model === 'flat_team' ? `${plan.base_seats} Base` : 'Per User'} />

                    {plan.billing_model === 'flat_team' && (
                        <>
                            <InfoRow label="Extra Seat (Mo)" icon={CreditCard} value={`$${plan.extra_seat_price_monthly}`} />
                            <InfoRow label="Extra Seat (Ann)" icon={CreditCard} value={`$${plan.extra_seat_price_annual}`} />
                        </>
                    )}

                    <InfoRow label="Sort Order" icon={Layout} value={plan.sort_order} />
                    <InfoRow isFull label="Plan Description" icon={Info} value={plan.description || "No description provided."} />
                </div>

                {/* Private Link Section */}
                {plan.visibility === 'private' && plan.access_token && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 rounded-3xl bg-amber-50 border border-amber-100 flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl bg-amber-100 text-amber-600"><Lock size={24} /></div>
                            <div>
                                <h3 className="text-[18px] font-bold text-amber-900">Private Access Link</h3>
                                <p className="text-amber-700 text-[14px]">Only users with this unique link can view and subscribe to this plan.</p>
                            </div>
                        </div>
                        <div className="flex-1 flex max-w-xl items-center gap-2">
                            <div className="flex-1 bg-white px-4 py-3 rounded-2xl border border-amber-200 text-[13px] font-mono text-amber-900 select-all overflow-hidden text-ellipsis whitespace-nowrap shadow-sm">
                                https://edithpro.app/plans/token/{plan.access_token}
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`https://edithpro.app/plans/token/${plan.access_token}`);
                                    toast.success("Link copied to clipboard");
                                }}
                                className="p-3.5 rounded-2xl bg-amber-500 text-white hover:bg-amber-600 transition-all active:scale-95 shadow-lg shadow-amber-200"
                            >
                                <Copy size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Content Tabs-like structure */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Features Column */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="flex items-center gap-2 px-2">
                            <Shield size={20} className="text-[#8c00ff]" />
                            <h3 className="text-[18px] font-bold text-slate-900">Growth Features</h3>
                        </div>
                        <div className="space-y-3">
                            {features.length === 0 ? (
                                <div className="p-10 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-medium italic">No features defined for this plan yet.</p>
                                </div>
                            ) : (
                                features.map((f) => (
                                    <div key={f.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between gap-4 group hover:border-[#8c00ff]/30 transition-all">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-2 h-2 rounded-full ${f.is_highlighted ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-green-500'}`} />
                                            <span className="text-[14px] font-semibold text-slate-700 truncate">{f.feature_text}</span>
                                        </div>
                                        {f.is_highlighted && (
                                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-tighter">Gold</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Limits Column */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center gap-2 px-2">
                            <Zap size={20} className="text-purple-600" />
                            <h3 className="text-[18px] font-bold text-slate-900">Operational Limits</h3>
                        </div>

                        {limits ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Recordings', value: limits.max_recordings },
                                        { label: 'Length (min)', value: limits.max_recording_minutes },
                                        { label: 'AI Credits', value: limits.max_transcription_uses },
                                        { label: 'Chapters', value: limits.max_chapter_uses }
                                    ].map((l, i) => (
                                        <div key={i} className="p-4 rounded-3xl bg-slate-900 text-white flex flex-col items-center justify-center gap-1 shadow-xl">
                                            <span className="text-[20px] font-black">{l.value === -1 ? '∞' : l.value}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{l.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm col-span-full">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                        {[
                                            { label: 'Video Quality', value: limits.video_quality_max === 2160 ? '4K Ultra' : `${limits.video_quality_max}p` },
                                            { label: 'Custom Thumbnails', value: limits.allow_custom_thumbnail ? 'Yes' : 'No', type: 'bool' },
                                            { label: 'Direct Downloads', value: limits.allow_download ? 'Yes' : 'No', type: 'bool' },
                                            { label: 'Password Protect', value: limits.allow_password_protect ? 'Yes' : 'No', type: 'bool' },
                                            { label: 'Strict Branding', value: limits.allow_watermark_removal ? 'Yes' : 'No', type: 'bool' },
                                            { label: 'CamelAI Support', value: limits.allow_camelai ? 'Yes' : 'No', type: 'bool' },
                                            { label: 'Developer SDK', value: limits.allow_sdk ? 'Yes' : 'No', type: 'bool' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-2">
                                                <span className="text-[13px] font-bold text-slate-500">{item.label}</span>
                                                {item.type === 'bool' ? (
                                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${item.value === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                        {item.value}
                                                    </span>
                                                ) : (
                                                    <span className="text-[13px] font-black text-slate-900">{item.value}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-10 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-200 w-full col-span-full">
                                <p className="text-slate-400 font-medium italic">Limits not configured yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer info */}
                <div className="flex items-center justify-center gap-8 py-10 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Calendar size={16} />
                        <span className="text-[12px] font-bold uppercase tracking-wider">Created {new Date(plan.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <div className="flex items-center gap-2 text-slate-400">
                        <Calendar size={16} />
                        <span className="text-[12px] font-bold uppercase tracking-wider">Updated {new Date(plan.updated_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
