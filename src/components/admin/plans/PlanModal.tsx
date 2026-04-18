'use client';

import { useState, useEffect } from 'react';
import { X, Info, HelpCircle, Lock, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminPlanService, Plan } from '@/services/admin/planService';
import { toast } from 'sonner';

interface PlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    planId: string | null;
}

export default function PlanModal({ isOpen, onClose, onSuccess, planId }: PlanModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Plan>>({
        name: '',
        description: '',
        price: 0,
        price_monthly: 0,
        price_annual: 0,
        base_seats: 1,
        extra_seat_price_monthly: 0,
        extra_seat_price_annual: 0,
        currency: 'USD',
        billing_model: 'free',
        max_seats: 1,
        is_popular: false,
        is_active: true,
        visibility: 'public',
        sort_order: 0
    });

    useEffect(() => {
        if (planId && isOpen) {
            fetchPlanDetail();
        } else {
            setFormData({
                name: '',
                description: '',
                price: 0,
                price_monthly: 0,
                price_annual: 0,
                base_seats: 1,
                extra_seat_price_monthly: 0,
                extra_seat_price_annual: 0,
                currency: 'USD',
                billing_model: 'free',
                max_seats: 1,
                is_popular: false,
                is_active: true,
                visibility: 'public',
                sort_order: 0
            });
        }
    }, [planId, isOpen]);

    const fetchPlanDetail = async () => {
        try {
            setIsLoading(true);
            const data = await adminPlanService.getPlanDetail(planId!);
            setFormData(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch plan details");
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            if (planId) {
                await adminPlanService.updatePlan(planId, formData);
                toast.success("Plan updated successfully");
            } else {
                await adminPlanService.createPlan(formData);
                toast.success("Plan created successfully");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to save plan");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePriceLogic = (model: string) => {
        if (model === 'free') return 0;
        return formData.price;
    };

    if (!isOpen) return null;

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
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                        <div>
                            <h2 className="text-[24px] font-bold text-slate-900">
                                {planId ? 'Edit Plan' : 'Create New Plan'}
                            </h2>
                            <p className="text-[14px] text-slate-500 mt-1">
                                {planId ? 'Update existing plan details and configuration' : 'Configure a new subscription tier for EdithPro'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-400"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                        <div className="space-y-6">
                            {/* Basic Info Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-slate-700">Plan Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        placeholder="e.g. Pro Monthly"
                                    />
                                    {formData.name && (
                                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                            <Info size={12} />
                                            Slug: {formData.name.toLowerCase().replace(/ /g, '-')} (auto-preview)
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-slate-700">Billing Model</label>
                                    <select
                                        value={formData.billing_model}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            billing_model: e.target.value,
                                            price: e.target.value === 'free' ? 0 : formData.price
                                        })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center]"
                                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")' }}
                                    >
                                        <option value="free">Free</option>
                                        <option value="per_user">Per User</option>
                                        <option value="flat_team">Flat Team</option>
                                        <option value="custom">Custom (Sales)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Legacy Price & Max Seats (preserving for compatibility) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-slate-700">Price (Legacy)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                                            {formData.currency === 'USD' ? '$' : formData.currency}
                                        </span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-slate-700">Max Seats (Total Cap)</label>
                                    <input
                                        type="number"
                                        value={formData.max_seats}
                                        onChange={(e) => setFormData({ ...formData, max_seats: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Multi-Tier Pricing Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-slate-700">Price Monthly</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            disabled={formData.billing_model === 'free' || formData.billing_model === 'custom'}
                                            value={formData.price_monthly}
                                            onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm disabled:bg-slate-100"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-slate-700">Price Annual (per month)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            disabled={formData.billing_model === 'free' || formData.billing_model === 'custom'}
                                            value={formData.price_annual}
                                            onChange={(e) => setFormData({ ...formData, price_annual: parseFloat(e.target.value) })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm disabled:bg-slate-100"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium">Billed annually</p>
                                </div>

                                {formData.billing_model === 'flat_team' && (
                                    <>
                                        <div className="space-y-2 md:col-span-1">
                                            <label className="text-[14px] font-bold text-slate-700">Base Seats Included</label>
                                            <input
                                                type="number"
                                                value={formData.base_seats}
                                                onChange={(e) => setFormData({ ...formData, base_seats: parseInt(e.target.value) })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-white focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="md:col-span-1" /> {/* Spacer */}

                                        <div className="space-y-2">
                                            <label className="text-[14px] font-bold text-slate-700">Extra Seat (Monthly)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.extra_seat_price_monthly}
                                                    onChange={(e) => setFormData({ ...formData, extra_seat_price_monthly: parseFloat(e.target.value) })}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[14px] font-bold text-slate-700">Extra Seat (Annual)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.extra_seat_price_annual}
                                                    onChange={(e) => setFormData({ ...formData, extra_seat_price_annual: parseFloat(e.target.value) })}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-slate-700">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                                    placeholder="Summarize what this plan offers..."
                                />
                            </div>

                            {/* Visibility & Sort Order */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-slate-700">Visibility</label>
                                    <select
                                        value={formData.visibility}
                                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="public">Public</option>
                                        <option value="private">Private (Link Only)</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                    {formData.visibility === 'private' && (
                                        <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 mt-2">
                                            <p className="text-[12px] text-amber-700 flex items-start gap-2">
                                                <Lock size={14} className="mt-0.5" />
                                                A unique access link will be auto-generated for this plan upon saving.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-slate-700">Sort Order</label>
                                    <input
                                        type="number"
                                        value={formData.sort_order}
                                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="flex flex-wrap gap-8 py-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={formData.is_popular}
                                            onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                                        />
                                        <div className={`w-11 h-6 transition-colors rounded-full ${formData.is_popular ? 'bg-purple-600' : 'bg-slate-200'}`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_popular ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </div>
                                    <span className="text-[14px] font-semibold text-slate-700 group-hover:text-purple-600 transition-colors">Mark as Popular</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        />
                                        <div className={`w-11 h-6 transition-colors rounded-full ${formData.is_active ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_active ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </div>
                                    <span className="text-[14px] font-semibold text-slate-700 group-hover:text-green-600 transition-colors">Active Status</span>
                                </label>
                            </div>

                            {/* Private Token View (if edit and private) */}
                            {planId && formData.visibility === 'private' && formData.access_token && (
                                <div className="pt-4 border-t border-slate-100">
                                    <label className="text-[14px] font-bold text-slate-700 mb-2 block">Shareable Link</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-[12px] font-mono select-all overflow-hidden text-ellipsis whitespace-nowrap">
                                            {window.location.origin}/plans/token/{formData.access_token}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/plans/token/${formData.access_token}`);
                                                toast.success("Link copied to clipboard");
                                            }}
                                            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
                                        >
                                            <Copy size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
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
                            disabled={isLoading || !formData.name}
                            className="px-10 py-2.5 rounded-xl font-bold text-[14px] text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
                            style={{ background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)' }}
                        >
                            {isLoading ? 'Saving...' : planId ? 'Update Plan' : 'Create Plan'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
