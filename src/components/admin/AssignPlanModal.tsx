'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Gift, Calendar, Users, StickyNote, DollarSign, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminSubscriptionService, AdminAssignPlanRequest, AssignmentFeatures } from '@/services/admin/subscriptionService';
import { adminPlanService, Plan, PlanLimit } from '@/services/admin/planService';
import { toast } from 'sonner';

const DEFAULT_FEATURES: AssignmentFeatures = {
    cap_max_recordings: -1,
    cap_max_recording_minutes: -1,
    cap_max_transcription_uses: -1,
    cap_max_chapter_uses: -1,
    cap_max_generate_uses: -1,
    cap_max_active_workflows: 3,
    video_quality_max: 1080,
    allow_custom_thumbnail: false,
    allow_download: false,
    allow_password_protect: false,
    allow_watermark_removal: false,
    allow_camelai: false,
    allow_sdk: false,
    allow_video_upload: false,
    allow_generate: false,
    allow_workflows: false,
};

interface Props {
    userId: string;
    userEmail: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AssignPlanModal({ userId, userEmail, onClose, onSuccess }: Props) {
    const [step, setStep] = useState<1 | 2>(1);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const [limitsLoading, setLimitsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Step 1 fields
    const [planId, setPlanId] = useState('');
    const [durationType, setDurationType] = useState<'months' | 'date'>('months');
    const [months, setMonths] = useState(3);
    const [endDate, setEndDate] = useState('');
    const [seats, setSeats] = useState(1);
    const [notes, setNotes] = useState('');
    const [paidPrice, setPaidPrice] = useState(0);

    // Step 2 fields
    const [features, setFeatures] = useState<AssignmentFeatures>(DEFAULT_FEATURES);

    const loadPlans = useCallback(async () => {
        try {
            setPlansLoading(true);
            const data = await adminPlanService.getPlans();
            setPlans(data.filter(p => p.is_active));
        } catch {
            toast.error('Failed to load plans');
        } finally {
            setPlansLoading(false);
        }
    }, []);

    useEffect(() => { loadPlans(); }, [loadPlans]);

    const prefillFromPlan = useCallback(async (pid: string) => {
        if (!pid) return;
        try {
            setLimitsLoading(true);
            const detail = await adminPlanService.getPlanDetail(pid);
            const lim: PlanLimit = detail.limits;
            setFeatures({
                cap_max_recordings: lim.max_recordings,
                cap_max_recording_minutes: lim.max_recording_minutes,
                cap_max_transcription_uses: lim.max_transcription_uses,
                cap_max_chapter_uses: lim.max_chapter_uses,
                cap_max_generate_uses: lim.max_generate_uses,
                cap_max_active_workflows: lim.max_active_workflows,
                video_quality_max: lim.video_quality_max,
                allow_custom_thumbnail: lim.allow_custom_thumbnail,
                allow_download: lim.allow_download,
                allow_password_protect: lim.allow_password_protect,
                allow_watermark_removal: lim.allow_watermark_removal,
                allow_camelai: lim.allow_camelai,
                allow_sdk: lim.allow_sdk,
                allow_video_upload: lim.allow_video_upload,
                allow_generate: lim.allow_generate,
                allow_workflows: lim.allow_workflows,
            });
        } catch {
            toast.error('Failed to load plan limits — using defaults');
            setFeatures(DEFAULT_FEATURES);
        } finally {
            setLimitsLoading(false);
        }
    }, []);

    const handlePlanChange = (pid: string) => {
        setPlanId(pid);
        prefillFromPlan(pid);
    };

    const handleStep1Next = () => {
        if (!planId) { toast.error('Select a plan'); return; }
        if (durationType === 'months' && (!months || months < 1)) { toast.error('Enter valid months'); return; }
        if (durationType === 'date' && !endDate) { toast.error('Select end date'); return; }
        setStep(2);
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const payload: AdminAssignPlanRequest = {
                user_id: userId,
                plan_id: planId,
                seats,
                notes,
                paid_price: paidPrice,
                features,
                ...(durationType === 'months' ? { months } : { end_date: new Date(endDate).toISOString() }),
            };
            await adminSubscriptionService.assignPlan(payload);
            toast.success('Plan assigned successfully');
            onSuccess();
            onClose();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to assign plan';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleFlag = (key: keyof AssignmentFeatures) => {
        setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const setCapValue = (key: keyof AssignmentFeatures, value: string) => {
        const num = value === '' ? -1 : parseInt(value, 10);
        if (!isNaN(num)) setFeatures(prev => ({ ...prev, [key]: num }));
    };

    const boolFeatures: { key: keyof AssignmentFeatures; label: string }[] = [
        { key: 'allow_custom_thumbnail', label: 'Custom Thumbnails' },
        { key: 'allow_download',         label: 'Video Downloads' },
        { key: 'allow_password_protect', label: 'Password Protection' },
        { key: 'allow_watermark_removal',label: 'Remove Watermark' },
        { key: 'allow_camelai',          label: 'CamelAI Access' },
        { key: 'allow_sdk',              label: 'SDK / Developer Access' },
        { key: 'allow_video_upload',     label: 'Video Uploads' },
        { key: 'allow_generate',         label: 'AI Content Generation' },
        { key: 'allow_workflows',        label: 'Workflow Automations' },
    ];

    const capFields: { key: keyof AssignmentFeatures; label: string; unit?: string }[] = [
        { key: 'cap_max_recordings',         label: 'Max Recordings' },
        { key: 'cap_max_recording_minutes',  label: 'Max Length', unit: 'min' },
        { key: 'cap_max_transcription_uses', label: 'Transcription Uses' },
        { key: 'cap_max_chapter_uses',       label: 'Chapter Uses' },
        { key: 'cap_max_generate_uses',      label: 'AI Generate Uses' },
        { key: 'cap_max_active_workflows',   label: 'Active Workflows' },
    ];

    const videoQualityOptions = [
        { value: 720,  label: '720p' },
        { value: 1080, label: '1080p' },
        { value: 1440, label: '2K' },
        { value: 2160, label: '4K' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.18 }}
                className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg,#8c00ff,#7c3aed)' }}>
                            <Gift size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-[18px] font-bold text-slate-900">Assign Plan</h2>
                            <p className="text-[12px] text-slate-400 font-medium mt-0.5">{userEmail}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Step indicator */}
                        <div className="flex items-center gap-2">
                            {[1, 2].map(s => (
                                <div key={s} className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black transition-all ${
                                    step === s ? 'text-white' : s < step ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                                }`} style={step === s ? { background: 'linear-gradient(135deg,#8c00ff,#7c3aed)' } : {}}>
                                    {s}
                                </div>
                            ))}
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-7 py-6">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div key="step1" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }} className="space-y-5">
                                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Step 1 — Plan & Duration</p>

                                {/* Plan selector */}
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">Plan</label>
                                    {plansLoading ? (
                                        <div className="h-11 bg-slate-100 animate-pulse rounded-xl" />
                                    ) : (
                                        <select
                                            value={planId}
                                            onChange={e => handlePlanChange(e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/30 focus:border-[#8c00ff]"
                                        >
                                            <option value="">Select a plan…</option>
                                            {plans.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Duration type toggle */}
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">Duration</label>
                                    <div className="flex gap-2">
                                        {(['months', 'date'] as const).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setDurationType(t)}
                                                className={`flex-1 h-10 rounded-xl text-[13px] font-bold border transition-all ${
                                                    durationType === t
                                                        ? 'border-[#8c00ff] text-[#8c00ff] bg-[#f3eefe]'
                                                        : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300'
                                                }`}
                                            >
                                                {t === 'months' ? 'By Months' : 'By End Date'}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-2">
                                        {durationType === 'months' ? (
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="number"
                                                    min={1} max={120}
                                                    value={months}
                                                    onChange={e => setMonths(parseInt(e.target.value) || 1)}
                                                    className="w-24 h-11 px-4 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/30 focus:border-[#8c00ff] text-center"
                                                />
                                                <span className="text-[13px] font-medium text-slate-500">months from today</span>
                                            </div>
                                        ) : (
                                            <input
                                                type="date"
                                                value={endDate}
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={e => setEndDate(e.target.value)}
                                                className="w-full h-11 px-4 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/30 focus:border-[#8c00ff]"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Seats */}
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                                        <Users size={13} /> Seats
                                    </label>
                                    <input
                                        type="number"
                                        min={1} max={5000}
                                        value={seats}
                                        onChange={e => setSeats(parseInt(e.target.value) || 1)}
                                        className="w-32 h-11 px-4 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/30 focus:border-[#8c00ff] text-center"
                                    />
                                </div>

                                {/* Paid Price */}
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                                        <DollarSign size={13} /> Paid Price (USD)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative w-36">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-slate-400">$</span>
                                            <input
                                                type="number"
                                                min={0}
                                                step={0.01}
                                                value={paidPrice}
                                                onChange={e => setPaidPrice(parseFloat(e.target.value) || 0)}
                                                className="w-full h-11 pl-7 pr-4 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/30 focus:border-[#8c00ff]"
                                            />
                                        </div>
                                        <span className="text-[12px] text-slate-400">0 = complimentary</span>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                                        <StickyNote size={13} /> Notes
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        maxLength={1000}
                                        rows={3}
                                        placeholder="Reason for this assignment, onboarding notes, etc."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/30 focus:border-[#8c00ff] placeholder:text-slate-300"
                                    />
                                    <p className="text-[11px] text-slate-400 text-right">{notes.length}/1000</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="step2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.15 }} className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Step 2 — Feature Control</p>
                                    {limitsLoading && (
                                        <div className="flex items-center gap-2 text-[12px] text-slate-400">
                                            <Loader2 size={13} className="animate-spin" /> Loading plan defaults…
                                        </div>
                                    )}
                                </div>

                                {/* Feature toggles */}
                                <div className="space-y-2">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c00ff]">Feature Access</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {boolFeatures.map(({ key, label }) => {
                                            const enabled = features[key] as boolean;
                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => toggleFlag(key)}
                                                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                                        enabled ? 'border-purple-200 bg-purple-50/60' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <span className={`text-[13px] font-semibold ${enabled ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
                                                    <div className={`w-9 h-5 rounded-full relative transition-colors ${enabled ? 'bg-[#8c00ff]' : 'bg-slate-200'}`}>
                                                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${enabled ? 'left-4' : 'left-0.5'}`} />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Cap fields */}
                                <div className="space-y-2">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c00ff]">Entitlement Caps <span className="text-slate-400 normal-case font-normal">(−1 = unlimited)</span></p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {capFields.map(({ key, label, unit }) => (
                                            <div key={key} className="space-y-1">
                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                                    {label}{unit && <span className="ml-1 normal-case font-normal text-slate-400">({unit})</span>}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={features[key] as number}
                                                    onChange={e => setCapValue(key, e.target.value)}
                                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/30 focus:border-[#8c00ff]"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Video quality */}
                                <div className="space-y-2">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c00ff]">Video Quality</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {videoQualityOptions.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setFeatures(prev => ({ ...prev, video_quality_max: opt.value }))}
                                                className={`px-4 py-2 rounded-xl text-[13px] font-bold border transition-all ${
                                                    features.video_quality_max === opt.value
                                                        ? 'border-[#8c00ff] text-[#8c00ff] bg-[#f3eefe]'
                                                        : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-7 py-5 border-t border-slate-100 shrink-0">
                    <button
                        onClick={step === 1 ? onClose : () => setStep(1)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[13px] text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        {step === 2 && <ChevronLeft size={16} />}
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>

                    {step === 1 ? (
                        <button
                            onClick={handleStep1Next}
                            disabled={!planId || plansLoading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[13px] text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)' }}
                        >
                            Set Features <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[13px] text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)' }}
                        >
                            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Gift size={15} />}
                            {submitting ? 'Assigning…' : 'Assign Plan'}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
