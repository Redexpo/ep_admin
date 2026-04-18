'use client';

import { useState, useEffect } from 'react';
import { X, ShieldAlert, Zap, Globe, Lock, Download, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminPlanService, PlanLimit } from '@/services/admin/planService';
import { toast } from 'sonner';

interface LimitsModalProps {
    isOpen: boolean;
    onClose: () => void;
    planId: string | null;
}

export default function LimitsModal({ isOpen, onClose, planId }: LimitsModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<PlanLimit>>({
        max_recordings: 25,
        max_recording_minutes: 5,
        max_transcription_uses: 0,
        max_chapter_uses: 0,
        max_seats: 1,
        video_quality_max: 720,
        allow_custom_thumbnail: false,
        allow_download: false,
        allow_password_protect: false,
        allow_watermark_removal: false,
        allow_camelai: false,
        allow_sdk: false
    });

    useEffect(() => {
        if (planId && isOpen) {
            fetchLimits();
        }
    }, [planId, isOpen]);

    const fetchLimits = async () => {
        try {
            setIsLoading(true);
            const data = await adminPlanService.getLimits(planId!);
            setFormData(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch limits");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await adminPlanService.updateLimits(planId!, formData);
            toast.success("Limits updated successfully");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to save limits");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const LimitInput = ({ label, icon: Icon, field, helper }: { label: string, icon: any, field: keyof PlanLimit, helper?: string }) => (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Icon size={16} className="text-slate-400" />
                <label className="text-[13px] font-bold text-slate-700">{label}</label>
            </div>
            <div className="flex items-center gap-3">
                <input
                    type="number"
                    value={formData[field] as number}
                    onChange={(e) => setFormData({ ...formData, [field]: parseInt(e.target.value) })}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, [field]: -1 })}
                    className={`px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${formData[field] === -1 ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                    Unlimited
                </button>
            </div>
            {helper && <p className="text-[10px] text-slate-400 italic">{helper}</p>}
        </div>
    );

    const ToggleItem = ({ label, icon: Icon, field }: { label: string, icon: any, field: keyof PlanLimit }) => (
        <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${formData[field] ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'} transition-colors`}>
                    <Icon size={18} />
                </div>
                <span className={`text-[13px] font-bold transition-colors ${formData[field] ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>{label}</span>
            </div>
            <div className="relative inline-flex items-center">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData[field] as boolean}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.checked })}
                />
                <div className={`w-10 h-5 transition-colors rounded-full ${formData[field] ? 'bg-purple-600' : 'bg-slate-200'}`}></div>
                <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${formData[field] ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
        </label>
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                        <div>
                            <h2 className="text-[24px] font-bold text-slate-900">Plan Usage Limits</h2>
                            <p className="text-[14px] text-slate-500 mt-1">Configure quotas and feature access for this tier</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-400">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Numeric Quotas */}
                            <div className="space-y-6">
                                <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#8c00ff] mb-4">Quotas & Volume</h3>

                                <LimitInput label="Max Recordings" icon={Zap} field="max_recordings" helper="Total number of videos allowed" />
                                <LimitInput label="Max Recording Length" icon={Zap} field="max_recording_minutes" helper="Duration in minutes per video" />
                                <LimitInput label="Transcription Credits" icon={Sparkles} field="max_transcription_uses" helper="AI Transcriptions allowed" />
                                <LimitInput label="AI Chapter Credits" icon={Sparkles} field="max_chapter_uses" helper="AI Chapter generations allowed" />

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Zap size={16} className="text-slate-400" />
                                        <label className="text-[13px] font-bold text-slate-700">Max Video Quality</label>
                                    </div>
                                    <select
                                        value={formData.video_quality_max}
                                        onChange={(e) => setFormData({ ...formData, video_quality_max: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    >
                                        <option value={720}>720p (HD)</option>
                                        <option value={1080}>1080p (Full HD)</option>
                                        <option value={1440}>1440p (2K)</option>
                                        <option value={2160}>4K (Ultra HD)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Feature Toggles */}
                            <div className="space-y-6">
                                <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#8c00ff] mb-4">Feature Permissions</h3>

                                <div className="grid gap-3">
                                    <ToggleItem label="Custom Thumbnails" icon={ImageIcon} field="allow_custom_thumbnail" />
                                    <ToggleItem label="Direct Downloads" icon={Download} field="allow_download" />
                                    <ToggleItem label="Password Protection" icon={Lock} field="allow_password_protect" />
                                    <ToggleItem label="Remove Watermark" icon={Sparkles} field="allow_watermark_removal" />
                                    <ToggleItem label="CamelAI Access" icon={Sparkles} field="allow_camelai" />
                                    <ToggleItem label="SDK / Developer Access" icon={Zap} field="allow_sdk" />
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-bold text-[14px] text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-10 py-2.5 rounded-xl font-bold text-[14px] text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)' }}
                        >
                            {isLoading ? 'Saving...' : 'Save Limits'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
