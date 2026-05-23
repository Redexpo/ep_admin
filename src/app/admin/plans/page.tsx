'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Plus, Edit, Lock, Eye, ListOrdered, ShieldAlert,
    Search, MoreVertical, ToggleRight, ToggleLeft, Layers
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminPlanService, Plan } from '@/services/admin/planService';
import { toast } from 'sonner';
import PlanModal from '@/components/admin/plans/PlanModal';
import FeaturesModal from '@/components/admin/plans/FeaturesModal';
import LimitsModal from '@/components/admin/plans/LimitsModal';
import { useRouter } from 'next/navigation';

function PlanRowMenu({ plan, onFeatures, onLimits, onToggle }: {
    plan: Plan;
    onFeatures: () => void;
    onLimits: () => void;
    onToggle: () => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(v => !v)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all active:scale-90"
            >
                <MoreVertical size={16} />
            </button>
            {open && (
                <div className="absolute right-0 top-10 z-50 w-48 bg-white rounded-2xl border border-slate-100 shadow-xl py-1.5 overflow-hidden">
                    <button
                        onClick={() => { onFeatures(); setOpen(false); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <ListOrdered size={15} className="text-blue-500" />
                        Manage Features
                    </button>
                    <button
                        onClick={() => { onLimits(); setOpen(false); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <ShieldAlert size={15} className="text-amber-500" />
                        Set Limits
                    </button>
                    <div className="h-px bg-slate-100 my-1" />
                    <button
                        onClick={() => { onToggle(); setOpen(false); }}
                        className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-bold transition-colors ${plan.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                    >
                        {plan.is_active
                            ? <ToggleLeft  size={15} />
                            : <ToggleRight size={15} />
                        }
                        {plan.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default function AdminPlansPage() {
    const router = useRouter();
    const [plans, setPlans]       = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isPlanModalOpen,     setIsPlanModalOpen]     = useState(false);
    const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
    const [isLimitsModalOpen,   setIsLimitsModalOpen]   = useState(false);
    const [selectedPlanId,      setSelectedPlanId]      = useState<string | null>(null);

    const fetchPlans = useCallback(async () => {
        try {
            setIsLoading(true);
            setPlans(await adminPlanService.getPlans());
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to fetch plans');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchPlans(); }, [fetchPlans]);

    const handleToggleStatus = async (planId: string) => {
        setPlans(prev => prev.map(p => p.id === planId ? { ...p, is_active: !p.is_active } : p));
        try {
            await adminPlanService.togglePlanStatus(planId);
            toast.success('Plan status updated');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update status');
            fetchPlans();
        }
    };

    const getVisibilityBadge = (v: string) => {
        const map: Record<string, { label: string; cls: string }> = {
            public:  { label: 'Public',  cls: 'bg-green-50 text-green-700 border-green-100' },
            private: { label: 'Private', cls: 'bg-amber-50 text-amber-700 border-amber-100' },
            draft:   { label: 'Draft',   cls: 'bg-slate-100 text-slate-600 border-slate-200' },
        };
        const m = map[v] ?? map['draft'];
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${m.cls}`}>
                {v === 'private' && <Lock size={10} />}
                {m.label}
            </span>
        );
    };

    const filtered = plans.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.billing_model.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activePlans = plans.filter(p => p.is_active).length;

    return (
        <AdminLayout>
            <div className="p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-black text-slate-900 tracking-tight">Plans &amp; Pricing</h1>
                        <p className="text-[14px] text-slate-500 mt-0.5">Manage subscription tiers, feature lists, and usage limits.</p>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[12px] font-bold text-slate-600">
                                <Layers size={12} />
                                {plans.length} plans
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-[12px] font-bold text-green-700">
                                {activePlans} active
                            </span>
                            {plans.length - activePlans > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[12px] font-bold text-slate-500">
                                    {plans.length - activePlans} inactive
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => { setSelectedPlanId(null); setIsPlanModalOpen(true); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[14px] text-white shadow-lg shadow-purple-200 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
                        style={{ background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)' }}
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        Add New Plan
                    </button>
                </div>

                {/* Table card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search plans..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/30 focus:border-[#8c00ff] transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Plan</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Model</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pricing</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Visibility</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    Array(4).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-5">
                                                <div className="h-5 bg-slate-100 rounded-lg w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 text-slate-300">
                                                <Layers size={40} strokeWidth={1} />
                                                <p className="text-[14px] text-slate-400 font-medium">No plans found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((plan) => (
                                        <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors">
                                            {/* Plan name */}
                                            <td className="px-6 py-4">
                                                <div
                                                    onClick={() => router.push(`/admin/plans/${plan.id}`)}
                                                    className="cursor-pointer group/name"
                                                >
                                                    <p className="text-[14px] font-bold text-slate-900 group-hover/name:text-[#8c00ff] transition-colors">{plan.name}</p>
                                                    <p className="text-[11px] text-slate-400 font-mono uppercase">/{plan.slug}</p>
                                                </div>
                                            </td>
                                            {/* Model */}
                                            <td className="px-6 py-4">
                                                <span className="text-[13px] font-bold text-[#8c00ff] capitalize">
                                                    {plan.billing_model.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            {/* Pricing */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[12px] text-slate-500"><span className="font-black text-slate-400 mr-1 text-[10px] uppercase">Mo</span>${plan.price_monthly}</span>
                                                    <span className="text-[12px] text-emerald-600 font-bold"><span className="font-black text-slate-400 mr-1 text-[10px] uppercase">Yr</span>${plan.price_annual}</span>
                                                </div>
                                            </td>
                                            {/* Visibility */}
                                            <td className="px-6 py-4">{getVisibilityBadge(plan.visibility)}</td>
                                            {/* Status chip */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${plan.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {plan.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => router.push(`/admin/plans/${plan.id}`)}
                                                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-purple-50 hover:text-[#8c00ff] transition-all"
                                                        title="View"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedPlanId(plan.id); setIsPlanModalOpen(true); }}
                                                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
                                                        title="Edit plan"
                                                    >
                                                        <Edit size={15} />
                                                    </button>
                                                    <PlanRowMenu
                                                        plan={plan}
                                                        onFeatures={() => { setSelectedPlanId(plan.id); setIsFeaturesModalOpen(true); }}
                                                        onLimits={() => { setSelectedPlanId(plan.id); setIsLimitsModalOpen(true); }}
                                                        onToggle={() => handleToggleStatus(plan.id)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <PlanModal     isOpen={isPlanModalOpen}     onClose={() => setIsPlanModalOpen(false)}     onSuccess={fetchPlans} planId={selectedPlanId} />
                <FeaturesModal isOpen={isFeaturesModalOpen} onClose={() => setIsFeaturesModalOpen(false)} planId={selectedPlanId} />
                <LimitsModal   isOpen={isLimitsModalOpen}   onClose={() => setIsLimitsModalOpen(false)}   planId={selectedPlanId} />
            </div>
        </AdminLayout>
    );
}
