'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { adminBlogService } from '@/services/admin/blogService';

type Props = {
    open: boolean;
    onClose: () => void;
    onDeleted: () => void;
    categoryId: string | null;
    categoryName?: string;
    postCount?: number;
};

export default function DeleteCategoryModal({ open, onClose, onDeleted, categoryId, categoryName, postCount }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        if (!categoryId) return;
        try {
            setIsDeleting(true);
            await adminBlogService.deleteCategory(categoryId);
            toast.success('Category deleted');
            onDeleted();
            onClose();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete category');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.14 }}
                        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X size={16} />
                        </button>

                        <div className="p-6">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <h3 className="mt-4 text-[17px] font-bold text-slate-900">Delete this category?</h3>
                            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
                                {categoryName ? (
                                    <>
                                        <span className="font-semibold text-slate-700">&ldquo;{categoryName}&rdquo;</span> will be permanently deleted.{' '}
                                    </>
                                ) : (
                                    <>This category will be permanently deleted. </>
                                )}
                                {postCount && postCount > 0 ? (
                                    <span>
                                        <span className="font-semibold text-slate-700">{postCount}</span> {postCount === 1 ? 'post' : 'posts'} currently in this category will keep existing but lose their category link.
                                    </span>
                                ) : (
                                    <>This action cannot be undone.</>
                                )}
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3.5">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isDeleting}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-70"
                            >
                                {isDeleting ? (
                                    <>
                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                                        Deleting…
                                    </>
                                ) : (
                                    'Delete category'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
