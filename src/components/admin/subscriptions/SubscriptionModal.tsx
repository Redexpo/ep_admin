'use client';

import { useState, useEffect } from 'react';
import { X, Shield, CreditCard, Users, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminSubscriptionService, AdminSubscription } from '@/services/admin/subscriptionService';
import { adminPlanService, Plan } from '@/services/admin/planService';
import { toast } from 'sonner';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: string | null;
}

export default function SubscriptionModal({ isOpen, onClose, onSuccess, userId }: SubscriptionModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [subscription, setSubscription] = useState<AdminSubscription | null>(null);
    const [formData, setFormData] = useState({
        plan_id: '',
        status: '',
        billing_cycle: '',
        seats: 1
    });

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
            if (userId) {
                fetchSubscriptionDetail();
            }
        }
    }, [isOpen, userId]);

    const fetchPlans = async () => {
        try {
            const data = await adminPlanService.getPlans();
            setPlans(data);
        } catch (error) {
            console.error("Failed to fetch plans", error);
        }
    };

    const fetchSubscriptionDetail = async () => {
        try {
            setIsLoading(true);
            const data = await adminSubscriptionService.getSubscriptionDetail(userId!);
            setSubscription(data);

            // Find plan ID from plan name to pre-select
            // Note: Backend might need to return plan_id in detail for better mapping
            // For now, we'll try to find it by name if possible, or just wait for user to select

            setFormData({
                plan_id: '', // We'll need user to select if not matches
                status: data.status,
                billing_cycle: data.billing_cycle,
                seats: data.seats
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch subscription details");
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        try {
            setIsLoading(true);
            await adminSubscriptionService.updateSubscription(userId, {
                plan_id: formData.plan_id || undefined,
                status: formData.status,
                billing_cycle: formData.billing_cycle,
                seats: formData.seats
            });
            toast.success("Subscription updated successfully");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to update subscription");
        } finally {
            setIsLoading(false);
        }
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
                    className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                        <div>
                            <h2 className="text-[20px] font-bold text-slate-900">Manage Subscription</h2>
                            <p className="text-[14px] text-slate-500 mt-1">
                                {subscription?.user_email || 'Loading user...'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-400"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Plan Selection */}
                        <div className="space-y-2">
                            <label className="text-[14px] font-bold text-slate-700 flex items-center gap-2">
                                <CreditCard size={16} className="text-purple-500" />
                                Change Plan
                            </label>
                            <select
                                value={formData.plan_id}
                                onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all appearance-none bg-slate-50"
                            >
                                <option value="">Select a plan...</option>
                                {plans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name} - ${plan.price_monthly}/mo
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-slate-700 flex items-center gap-2">
                                    <Shield size={16} className="text-blue-500" />
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all appearance-none bg-slate-50"
                                >
                                    <option value="free">Free</option>
                                    <option value="active">Active</option>
                                    <option value="trialing">Trialing</option>
                                    <option value="past_due">Past Due</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-slate-700 flex items-center gap-2">
                                    <Clock size={16} className="text-amber-500" />
                                    Cycle
                                </label>
                                <select
                                    value={formData.billing_cycle}
                                    onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all appearance-none bg-slate-50"
                                >
                                    <option value="none">None</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="annual">Annual</option>
                                </select>
                            </div>
                        </div>

                        {/* Seats */}
                        <div className="space-y-2">
                            <label className="text-[14px] font-bold text-slate-700 flex items-center gap-2">
                                <Users size={16} className="text-green-500" />
                                Total Seats
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.seats}
                                onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) || 1 })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all bg-slate-50"
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl font-bold text-[14px] text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-2.5 rounded-xl font-bold text-[14px] text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)' }}
                            >
                                {isLoading ? 'Saving...' : 'Update Subscription'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
