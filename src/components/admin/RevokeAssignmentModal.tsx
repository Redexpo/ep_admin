'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RevokeAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (notes: string) => Promise<void>;
    userInfo?: string;
}

export default function RevokeAssignmentModal({
    isOpen,
    onClose,
    onConfirm,
    userInfo,
}: RevokeAssignmentModalProps) {
    const [notes, setNotes] = useState('Revoked from admin panel');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) setNotes('Revoked from admin panel');
    }, [isOpen]);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm(notes.trim() || 'Revoked from admin panel');
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
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between px-7 pt-7 pb-5">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
                                    <AlertTriangle size={20} className="text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-[17px] font-black text-slate-900 tracking-tight">Revoke Assignment?</h2>
                                    <p className="text-[13px] text-slate-500 mt-0.5 leading-snug">
                                        {userInfo
                                            ? <><span className="font-semibold text-slate-700">{userInfo}</span> will be downgraded to the free plan immediately.</>
                                            : 'The user will be downgraded to the free plan immediately.'
                                        }
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
                                This action cannot be undone. Any active features granted by this plan will be removed immediately.
                            </p>
                        </div>

                        {/* Notes */}
                        <div className="px-7 pb-6">
                            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Revocation Note
                            </label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                disabled={isLoading}
                                rows={2}
                                placeholder="Reason for revocation…"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all resize-none disabled:opacity-50"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 px-7 pb-7">
                            <button
                                onClick={() => !isLoading && onClose()}
                                disabled={isLoading}
                                className="flex-1 h-10 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isLoading}
                                className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                            >
                                {isLoading && <Loader2 size={14} className="animate-spin" />}
                                {isLoading ? 'Revoking…' : 'Revoke Assignment'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
