'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown, GripVertical, CheckCircle2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminPlanService, PlanFeature } from '@/services/admin/planService';
import { toast } from 'sonner';

interface FeaturesModalProps {
    isOpen: boolean;
    onClose: () => void;
    planId: string | null;
}

export default function FeaturesModal({ isOpen, onClose, planId }: FeaturesModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [features, setFeatures] = useState<PlanFeature[]>([]);
    const [newFeatureText, setNewFeatureText] = useState('');
    const [isHighlighted, setIsHighlighted] = useState(false);

    useEffect(() => {
        if (planId && isOpen) {
            fetchFeatures();
        }
    }, [planId, isOpen]);

    const fetchFeatures = async () => {
        try {
            setIsLoading(true);
            const data = await adminPlanService.getFeatures(planId!);
            setFeatures(data.sort((a, b) => a.sort_order - b.sort_order));
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch features");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddFeature = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFeatureText.trim()) return;

        try {
            setIsLoading(true);
            const feature = await adminPlanService.addFeature(planId!, {
                feature_text: newFeatureText.trim(),
                is_highlighted: isHighlighted,
                sort_order: features.length
            });
            setFeatures([...features, feature]);
            setNewFeatureText('');
            setIsHighlighted(false);
            toast.success("Feature added");
        } catch (error: any) {
            toast.error(error.message || "Failed to add feature");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteFeature = async (featureId: string) => {
        try {
            await adminPlanService.deleteFeature(planId!, featureId);
            setFeatures(features.filter(f => f.id !== featureId));
            toast.success("Feature removed");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete feature");
        }
    };

    const handleToggleHighlight = async (feature: PlanFeature) => {
        try {
            const updated = await adminPlanService.updateFeature(planId!, feature.id, {
                is_highlighted: !feature.is_highlighted
            });
            setFeatures(features.map(f => f.id === feature.id ? updated : f));
        } catch (error: any) {
            toast.error(error.message || "Failed to update feature");
        }
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= features.length) return;

        const newFeatures = [...features];
        const temp = newFeatures[index];
        newFeatures[index] = newFeatures[newIndex];
        newFeatures[newIndex] = temp;

        // Update sort orders locally
        const updatedFeatures = newFeatures.map((f, i) => ({ ...f, sort_order: i }));
        setFeatures(updatedFeatures);

        try {
            await adminPlanService.reorderFeatures(planId!, updatedFeatures.map(f => ({
                id: f.id,
                sort_order: f.sort_order
            })));
        } catch (error: any) {
            toast.error(error.message || "Failed to save order");
            fetchFeatures(); // Revert on error
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
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                        <div>
                            <h2 className="text-[24px] font-bold text-slate-900 flex items-center gap-2">
                                Plan Features
                                <span className="text-[14px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">
                                    {features.length} Items
                                </span>
                            </h2>
                            <p className="text-[14px] text-slate-500 mt-1">
                                Manage the list of features shown on the pricing table
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-400"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                        {/* Add New Feature Form */}
                        <form onSubmit={handleAddFeature} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newFeatureText}
                                    onChange={(e) => setNewFeatureText(e.target.value)}
                                    placeholder="Type a new feature (e.g. 4K Video Support)"
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all bg-white"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !newFeatureText.trim()}
                                    className="px-6 py-2.5 rounded-xl bg-[#8c00ff] text-white font-bold text-[14px] shadow-lg shadow-purple-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer group w-fit">
                                <div className="relative inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={isHighlighted}
                                        onChange={(e) => setIsHighlighted(e.target.checked)}
                                    />
                                    <div className={`w-9 h-5 transition-colors rounded-full ${isHighlighted ? 'bg-amber-400' : 'bg-slate-200'}`}></div>
                                    <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${isHighlighted ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                                <span className="text-[12px] font-bold text-slate-600 group-hover:text-amber-500 transition-colors flex items-center gap-1">
                                    <Star size={14} className={isHighlighted ? 'fill-amber-400 text-amber-400' : ''} />
                                    Highlight this feature
                                </span>
                            </label>
                        </form>

                        {/* List of Features */}
                        <div className="space-y-3">
                            {isLoading && features.length === 0 ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
                                ))
                            ) : features.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-slate-400 font-medium">No features added yet</p>
                                </div>
                            ) : (
                                features.map((feature, index) => (
                                    <div
                                        key={feature.id}
                                        className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 transition-all hover:shadow-md group bg-white"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => handleMove(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1 rounded hover:bg-slate-50 disabled:opacity-20 text-slate-400 transition-colors"
                                            >
                                                <ArrowUp size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleMove(index, 'down')}
                                                disabled={index === features.length - 1}
                                                className="p-1 rounded hover:bg-slate-50 disabled:opacity-20 text-slate-400 transition-colors"
                                            >
                                                <ArrowDown size={14} />
                                            </button>
                                        </div>

                                        <div className="flex-1 flex items-center gap-3 min-w-0">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${feature.is_highlighted ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-green-500'}`} />
                                            <p className={`text-[14px] font-medium truncate ${feature.is_highlighted ? 'text-slate-900' : 'text-slate-600'}`}>
                                                {feature.feature_text}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleHighlight(feature)}
                                                className={`p-2 rounded-xl transition-all ${feature.is_highlighted ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-400'}`}
                                                title={feature.is_highlighted ? "Unlink highlight" : "Mark as important"}
                                            >
                                                <Star size={18} className={feature.is_highlighted ? 'fill-amber-500' : ''} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFeature(feature.id)}
                                                className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                                title="Remove feature"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end px-8 py-6 bg-slate-50 border-t border-slate-100">
                        <button
                            onClick={onClose}
                            className="px-10 py-2.5 rounded-xl font-bold text-[14px] text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                            style={{ background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)' }}
                        >
                            Done
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
