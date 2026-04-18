'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Plus, Edit, Trash2, Check, Lock,
    Eye, ToggleLeft, ToggleRight,
    ListOrdered, ShieldAlert, Search,
    ExternalLink, Copy, CheckCircle2
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminPlanService, Plan } from '@/services/admin/planService';
import { toast } from 'sonner';
import PlanModal from '@/components/admin/plans/PlanModal';
import FeaturesModal from '@/components/admin/plans/FeaturesModal';
import LimitsModal from '@/components/admin/plans/LimitsModal';
import { useRouter } from 'next/navigation';

export default function AdminPlansPage() {
    const router = useRouter();
    const [isDarkMode] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals state (to be implemented next)
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
    const [isLimitsModalOpen, setIsLimitsModalOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

    const fetchPlans = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await adminPlanService.getPlans();
            setPlans(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch plans");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const handleToggleStatus = async (planId: string) => {
        try {
            // Optimistic UI update
            setPlans(prev => prev.map(p =>
                p.id === planId ? { ...p, is_active: !p.is_active } : p
            ));
            await adminPlanService.togglePlanStatus(planId);
            toast.success("Plan status updated");
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
            // Revert on error
            fetchPlans();
        }
    };

    const handleDeletePlan = async (plan: Plan) => {
        if (!confirm(`Are you sure you want to delete the plan "${plan.name}"? This will also delete all its features and limits.`)) {
            return;
        }

        try {
            await adminPlanService.deletePlan(plan.id);
            setPlans(prev => prev.filter(p => p.id !== plan.id));
            toast.success("Plan deleted successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete plan");
        }
    };

    const getVisibilityBadge = (visibility: string) => {
        switch (visibility) {
            case 'public':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-green-50 text-green-600 border border-green-100">Public</span>;
            case 'private':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                        <Lock size={12} />
                        Private
                    </span>
                );
            case 'draft':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Draft</span>;
            default:
                return null;
        }
    };

    const filteredPlans = plans.filter(plan =>
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.billing_model.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1
                            className="text-[32px] font-bold tracking-tight mb-1"
                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                        >
                            Plans & Pricing
                        </h1>
                        <p
                            className="text-[14px]"
                            style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                        >
                            Create and manage subscription tiers, feature lists, and usage limits.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedPlanId(null);
                            setIsPlanModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-200"
                        style={{
                            background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)',
                            color: '#ffffff',
                            fontSize: '14px',
                        }}
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        Add New Plan
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden min-h-[500px]">
                    {/* Toolbar */}
                    <div className="p-6 border-b border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search plans by name or model..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#8c00ff] focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Plan Name</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Price/Model</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Visibility</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F1F5F9]">
                                {isLoading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-8">
                                                <div className="h-6 bg-slate-100 rounded-lg w-full"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredPlans.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                    <ShieldAlert size={32} />
                                                </div>
                                                <p className="text-slate-500 font-medium">No plans found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPlans.map((plan) => (
                                        <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div
                                                    onClick={() => router.push(`/admin/plans/${plan.id}`)}
                                                    className="cursor-pointer group/name"
                                                >
                                                    <p className="text-[14px] font-bold text-[#0F172A] group-hover/name:text-[#8c00ff] transition-colors">{plan.name}</p>
                                                    <p className="text-[11px] text-[#64748B] font-medium uppercase tracking-wider">/{plan.slug}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[14px] font-bold text-[#8c00ff]">
                                                        {plan.price === 0 ? 'Free' : `${plan.currency} ${plan.price}`}
                                                    </span>
                                                    <span className="text-[12px] text-slate-500 capitalize">
                                                        {plan.billing_model.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getVisibilityBadge(plan.visibility)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleStatus(plan.id)}
                                                    className="transition-transform active:scale-90"
                                                >
                                                    {plan.is_active ? (
                                                        <ToggleRight size={38} className="text-[#8c00ff] fill-purple-50" strokeWidth={1.5} />
                                                    ) : (
                                                        <ToggleLeft size={38} className="text-slate-300" strokeWidth={1.5} />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => router.push(`/admin/plans/${plan.id}`)}
                                                        className="p-2 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md border border-[#E2E8F0] transition-all group/btn"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} className="text-slate-600 group-hover/btn:text-[#8c00ff]" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPlanId(plan.id);
                                                            setIsPlanModalOpen(true);
                                                        }}
                                                        className="p-2 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md border border-[#E2E8F0] transition-all group/btn"
                                                        title="Edit Plan"
                                                    >
                                                        <Edit size={16} className="text-slate-600 group-hover/btn:text-[#8c00ff]" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPlanId(plan.id);
                                                            setIsFeaturesModalOpen(true);
                                                        }}
                                                        className="p-2 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md border border-[#E2E8F0] transition-all group/btn"
                                                        title="Manage Features"
                                                    >
                                                        <ListOrdered size={16} className="text-slate-600 group-hover/btn:text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPlanId(plan.id);
                                                            setIsLimitsModalOpen(true);
                                                        }}
                                                        className="p-2 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md border border-[#E2E8F0] transition-all group/btn"
                                                        title="Plan Limits"
                                                    >
                                                        <ShieldAlert size={16} className="text-slate-600 group-hover/btn:text-amber-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePlan(plan)}
                                                        className="p-2 rounded-xl bg-red-50 hover:bg-red-500 hover:shadow-md border border-red-100 transition-all group/btn"
                                                        title="Delete Plan"
                                                    >
                                                        <Trash2 size={16} className="text-red-500 group-hover/btn:text-white" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modals */}
                <PlanModal
                    isOpen={isPlanModalOpen}
                    onClose={() => setIsPlanModalOpen(false)}
                    onSuccess={fetchPlans}
                    planId={selectedPlanId}
                />

                <FeaturesModal
                    isOpen={isFeaturesModalOpen}
                    onClose={() => setIsFeaturesModalOpen(false)}
                    planId={selectedPlanId}
                />

                <LimitsModal
                    isOpen={isLimitsModalOpen}
                    onClose={() => setIsLimitsModalOpen(false)}
                    planId={selectedPlanId}
                />
            </div>
        </AdminLayout>
    );
}
