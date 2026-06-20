'use client';

import { useState, useEffect, useCallback, use } from 'react';
import {
    ArrowLeft, Zap, Sparkles, Wand2, GitBranch, Download,
    Info, RotateCcw, XCircle, Image as ImageIcon, Lock, Video, Monitor, Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    adminSubscriptionService,
    AdminSubscriptionDetail,
    SubscriptionUsageOverride
} from '@/services/admin/subscriptionService';
import { toast } from 'sonner';

export default function EditSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [sub, setSub] = useState<AdminSubscriptionDetail | null>(null);
    const [form, setForm] = useState<SubscriptionUsageOverride>({});

    const fetchDetail = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await adminSubscriptionService.getSubscriptionDetail(id);
            setSub(data);
            setForm({
                seats:                      data.seats,
                used_seats:                 data.used_seats,
                recordings_used:            data.recordings_used,
                transcription_uses:         data.transcription_uses,
                chapter_uses:               data.chapter_uses,
                generate_uses:              data.generate_uses,
                cap_max_recordings:         data.cap_max_recordings,
                cap_max_recording_minutes:  data.cap_max_recording_minutes,
                cap_max_transcription_uses: data.cap_max_transcription_uses,
                cap_max_chapter_uses:       data.cap_max_chapter_uses,
                cap_max_generate_uses:      data.cap_max_generate_uses,
                cap_max_active_workflows:   data.cap_max_active_workflows,
                video_quality_max:          data.video_quality_max,
                allow_custom_thumbnail:     data.allow_custom_thumbnail,
                allow_download:             data.allow_download,
                allow_password_protect:     data.allow_password_protect,
                allow_watermark_removal:    data.allow_watermark_removal,
                allow_camelai:              data.allow_camelai,
                allow_sdk:                  data.allow_sdk,
                allow_video_upload:         data.allow_video_upload,
                allow_generate:             data.allow_generate,
                allow_workflows:            data.allow_workflows,
            });
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Failed to fetch subscription';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await adminSubscriptionService.overrideSubscriptionUsage(id, form);
            toast.success('Subscription updated');
            router.push(`/admin/subscriptions/${id}`);
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Failed to save changes';
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const setNum = (field: keyof SubscriptionUsageOverride, value: number) =>
        setForm(f => ({ ...f, [field]: value }));
    const setBool = (field: keyof SubscriptionUsageOverride, value: boolean) =>
        setForm(f => ({ ...f, [field]: value }));

    const NumInput = ({
        label, icon: Icon, field, helper, allowUnlimited = false, allowReset = false
    }: {
        label: string;
        icon: React.ElementType;
        field: keyof SubscriptionUsageOverride;
        helper?: string;
        allowUnlimited?: boolean;
        allowReset?: boolean;
    }) => {
        const val = form[field] as number ?? 0;
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Icon size={15} className="text-slate-400" />
                    <label className="text-[13px] font-bold text-slate-700">{label}</label>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={val === -1 ? '' : val}
                        placeholder={val === -1 ? '∞ Unlimited' : undefined}
                        onChange={e => setNum(field, parseInt(e.target.value) || 0)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-[14px]"
                    />
                    {allowUnlimited && (
                        <button
                            type="button"
                            onClick={() => setNum(field, val === -1 ? 0 : -1)}
                            className={`px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                val === -1 ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                        >
                            {val === -1 ? '∞ On' : '∞'}
                        </button>
                    )}
                    {allowReset && (
                        <button
                            type="button"
                            onClick={() => setNum(field, 0)}
                            className="px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all flex items-center gap-1"
                        >
                            <RotateCcw size={12} /> Reset
                        </button>
                    )}
                </div>
                {helper && <p className="text-[11px] text-slate-400 italic">{helper}</p>}
            </div>
        );
    };

    const Toggle = ({ label, icon: Icon, field, description }: {
        label: string;
        icon: React.ElementType;
        field: keyof SubscriptionUsageOverride;
        description?: string;
    }) => {
        const val = form[field] as boolean ?? false;
        return (
            <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all group ${
                val ? 'border-purple-100 bg-purple-50/40' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
            }`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${val ? 'bg-purple-100 text-[#8c00ff]' : 'bg-slate-100 text-slate-400'}`}>
                        <Icon size={18} />
                    </div>
                    <div>
                        <p className={`text-[13px] font-bold transition-colors ${val ? 'text-slate-900' : 'text-slate-500'}`}>{label}</p>
                        {description && <p className="text-[11px] text-slate-400">{description}</p>}
                    </div>
                </div>
                <div className="relative inline-flex items-center shrink-0">
                    <input
                        type="checkbox"
                        className="sr-only"
                        checked={val}
                        onChange={e => setBool(field, e.target.checked)}
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${val ? 'bg-[#8c00ff]' : 'bg-slate-200'}`} />
                    <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full shadow transition-transform ${val ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
            </label>
        );
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="p-8 space-y-6">
                    {[1, 2, 3].map(i => <div key={i} className="w-full h-24 bg-slate-100 animate-pulse rounded-3xl" />)}
                </div>
            </AdminLayout>
        );
    }

    if (!sub) {
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

    return (
        <AdminLayout>
            <div className="p-8 max-w-5xl mx-auto space-y-8 pb-24">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/admin/subscriptions/${id}`)}
                        className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-90"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Edit Usage & Entitlements</h1>
                        <p className="text-[14px] text-slate-500 mt-0.5">{sub.user_name ? `${sub.user_name} · ` : ''}{sub.user_email}</p>
                    </div>
                </div>

                {/* Read-only notice */}
                <div className="flex items-start gap-3 p-5 rounded-2xl bg-amber-50 border border-amber-100">
                    <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[13px] font-bold text-amber-800">Plan and billing cannot be changed here</p>
                        <p className="text-[12px] text-amber-700 mt-0.5">
                            This user is on the <span className="font-bold">{sub.plan_name}</span> plan ({sub.billing_cycle} billing).
                            Plan switches and billing cycle changes are managed through the payment gateway.
                        </p>
                    </div>
                </div>

                {/* Two-column form */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left — Current Period Usage */}
                    <section className="space-y-6">
                        <div>
                            <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#8c00ff]">Current Period Usage</h2>
                            <p className="text-[12px] text-slate-400 mt-1">These counters reset on billing renewal. Use Reset to clear a user&apos;s usage.</p>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
                            <NumInput label="Used Seats"          icon={Users}    field="used_seats"         helper="Seats currently occupied"            allowReset />
                            <NumInput label="Recordings Used"     icon={Zap}      field="recordings_used"    helper="Total recordings made this period"   allowReset />
                            <NumInput label="Transcription Uses"  icon={Sparkles} field="transcription_uses" helper="AI transcription uses this period"   allowReset />
                            <NumInput label="AI Chapter Uses"     icon={Sparkles} field="chapter_uses"       helper="AI chapter generation uses"          allowReset />
                            <NumInput label="AI Generate Uses"    icon={Wand2}    field="generate_uses"      helper="AI content generation uses"          allowReset />
                        </div>
                    </section>

                    {/* Right — Entitlement Cap Overrides */}
                    <section className="space-y-6">
                        <div>
                            <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#8c00ff]">Entitlement Cap Overrides</h2>
                            <p className="text-[12px] text-slate-400 mt-1">Override plan caps for this user. Set to -1 or toggle ∞ for unlimited.</p>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
                            <NumInput label="Total Seats"           icon={Users}     field="seats"                      helper="Seats allocated to this subscription" />
                            <NumInput label="Max Recordings"        icon={Zap}       field="cap_max_recordings"         helper="Max recordings allowed"             allowUnlimited />
                            <NumInput label="Max Length (minutes)"  icon={Zap}       field="cap_max_recording_minutes"  helper="Max duration per recording in mins"  allowUnlimited />
                            <NumInput label="Max Transcription Uses" icon={Sparkles} field="cap_max_transcription_uses" helper="Max AI transcription uses"           allowUnlimited />
                            <NumInput label="Max Chapter Uses"      icon={Sparkles}  field="cap_max_chapter_uses"       helper="Max AI chapter generation uses"      allowUnlimited />
                            <NumInput label="Max AI Generate Uses"  icon={Wand2}     field="cap_max_generate_uses"      helper="Max AI content generation uses"      allowUnlimited />
                            <NumInput label="Max Active Workflows"  icon={GitBranch} field="cap_max_active_workflows"   helper="Max concurrent active workflows"     allowUnlimited />
                        </div>
                    </section>
                </div>

                {/* Feature Access */}
                <section className="space-y-6">
                    <div>
                        <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#8c00ff]">Feature Permissions</h2>
                        <p className="text-[12px] text-slate-400 mt-1">Enable or disable specific features for this user independently of their plan.</p>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-6">
                        <div className="flex items-center gap-2 shrink-0">
                            <Monitor size={16} className="text-slate-400" />
                            <span className="text-[13px] font-bold text-slate-700">Max Video Quality</span>
                        </div>
                        <select
                            value={form.video_quality_max ?? 1080}
                            onChange={e => setNum('video_quality_max', parseInt(e.target.value))}
                            className="flex-1 max-w-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-[14px]"
                        >
                            <option value={720}>720p (HD)</option>
                            <option value={1080}>1080p (Full HD)</option>
                            <option value={1440}>1440p (2K)</option>
                            <option value={2160}>4K (Ultra HD)</option>
                        </select>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <Toggle label="Custom Thumbnails"     icon={ImageIcon} field="allow_custom_thumbnail" description="Upload custom video thumbnails" />
                        <Toggle label="Video Downloads"       icon={Download}  field="allow_download"         description="Direct video download access" />
                        <Toggle label="Password Protection"   icon={Lock}      field="allow_password_protect" description="Protect videos with a password" />
                        <Toggle label="Remove Watermark"      icon={Sparkles}  field="allow_watermark_removal" description="Hide the EdithPro watermark" />
                        <Toggle label="CamelAI Access"        icon={Sparkles}  field="allow_camelai"          description="Access to CamelAI features" />
                        <Toggle label="SDK / Developer Access" icon={Zap}      field="allow_sdk"              description="Programmatic API access" />
                        <Toggle label="Video Uploads"         icon={Video}     field="allow_video_upload"     description="Upload pre-recorded videos" />
                        <Toggle label="AI Content Generation" icon={Wand2}     field="allow_generate"         description="Access to AI generate tools" />
                        <Toggle label="Workflow Automations"  icon={GitBranch} field="allow_workflows"        description="Access to the workflow builder" />
                    </div>
                </section>
            </div>

            {/* Sticky footer */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-100 shadow-2xl">
                <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between gap-4">
                    <p className="text-[13px] text-slate-500 hidden sm:block">
                        Changes apply immediately to this user&apos;s session.
                    </p>
                    <div className="flex items-center gap-3 ml-auto">
                        <button
                            onClick={() => router.push(`/admin/subscriptions/${id}`)}
                            className="px-6 py-2.5 rounded-xl font-bold text-[14px] text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-10 py-2.5 rounded-xl font-bold text-[14px] text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)' }}
                        >
                            {isSaving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
