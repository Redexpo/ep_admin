'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CancelSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (internalNotes: string, userMessage: string) => Promise<void>;
    userInfo?: string;
    planName?: string;
}

export default function CancelSubscriptionModal({
    isOpen,
    onClose,
    onConfirm,
    userInfo,
    planName,
}: CancelSubscriptionModalProps) {
    const [internalNotes, setInternalNotes] = useState('');
    const [userMessage, setUserMessage]     = useState('');
    const [isLoading, setIsLoading]         = useState(false);

    useEffect(() => {
        if (isOpen) {
            setInternalNotes('');
            setUserMessage('');
        }
    }, [isOpen]);

    const canSubmit = internalNotes.trim().length > 0;

    const handleConfirm = async () => {
        if (!canSubmit) return;
        setIsLoading(true);
        try {
            await onConfirm(internalNotes.trim(), userMessage.trim());
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isLoading && onClose()}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ duration: 0.18 }}
                        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between px-7 pt-7 pb-5">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
                                    <AlertTriangle size={20} className="text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-[17px] font-black text-slate-900 tracking-tight">Cancel Subscription?</h2>
                                    <p className="text-[13px] text-slate-500 mt-0.5 leading-snug">
                                        {userInfo && <><span className="font-semibold text-slate-700">{userInfo}</span> · </>}
                                        {planName && <span className="font-semibold text-slate-700">{planName}</span>}
                                        {!userInfo && !planName && 'This subscription will be cancelled immediately.'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => !isLoading && onClose()}
                                className="ml-4 shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Warning banner */}
                        <div className="mx-7 mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                            <p className="text-[12px] font-semibold text-red-600 leading-snug">
                                The user will be immediately downgraded to the free plan. Invited workspace members will be deactivated. This cannot be undone.
                            </p>
                        </div>

                        {/* Fields */}
                        <div className="px-7 pb-6 space-y-5">
                            {/* Internal notes — mandatory */}
                            <div>
                                <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Internal Reason <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={internalNotes}
                                    onChange={e => setInternalNotes(e.target.value)}
                                    disabled={isLoading}
                                    rows={2}
                                    placeholder="Why is this subscription being cancelled?"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all resize-none disabled:opacity-50"
                                />
                                <p className="mt-1 text-[11px] text-slate-400 font-medium">Admin-only — not visible to the user.</p>
                            </div>

                            {/* User-facing message — optional */}
                            <div>
                                <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Message to User <span className="text-slate-300 font-normal normal-case">(optional)</span>
                                </label>
                                <textarea
                                    value={userMessage}
                                    onChange={e => setUserMessage(e.target.value)}
                                    disabled={isLoading}
                                    rows={2}
                                    placeholder="Leave blank to send a default cancellation message…"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition-all resize-none disabled:opacity-50"
                                />
                                <div className="mt-1 flex items-center gap-1.5">
                                    <Info size={11} className="text-slate-400 shrink-0" />
                                    <p className="text-[11px] text-slate-400 font-medium">This will be sent to the user via email and in-app notification.</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 px-7 pb-7">
                            <button
                                onClick={() => !isLoading && onClose()}
                                disabled={isLoading}
                                className="flex-1 h-10 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40"
                            >
                                Keep Active
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!canSubmit || isLoading}
                                className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                            >
                                {isLoading && <Loader2 size={14} className="animate-spin" />}
                                {isLoading ? 'Cancelling…' : 'Cancel Subscription'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
