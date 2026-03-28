'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Check, X, Command } from 'lucide-react';
import { searchService } from '@/services/admin/searchService';

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<'idle' | 'searching' | 'success' | 'error'>('idle');
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Debounced search logic
    useEffect(() => {
        if (!query.trim()) {
            setStatus('idle');
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setStatus('searching');
                const response = await searchService.lookupId(query);
                if (response.data) {
                    setStatus('success');
                    // Tiny delay for the checkmark to be seen
                    setTimeout(() => {
                        const targetUrl = response.data.type === 'user'
                            ? `/admin/users/${response.data.id}`
                            : `/admin/videos/${response.data.id}`;
                        router.push(targetUrl);
                        setIsOpen(false);
                    }, 600);
                }
            } catch (error) {
                setStatus('error');
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [query, router]);

    // Keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setStatus('idle');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-xl bg-white rounded-[28px] shadow-2xl overflow-hidden border border-[#E2E8F0]"
                    >
                        <div className="p-4 flex items-center gap-3">
                            <div className="flex-1 flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-[#F1F5F9] transition-all focus-within:bg-white focus-within:border-[#8c00ff] focus-within:shadow-lg focus-within:shadow-purple-50">
                                {status === 'searching' ? (
                                    <Loader2 className="w-5 h-5 text-[#8c00ff] animate-spin" />
                                ) : status === 'success' ? (
                                    <Check className="w-5 h-5 text-green-500" />
                                ) : status === 'error' ? (
                                    <X className="w-5 h-5 text-red-500" />
                                ) : (
                                    <Search className="w-5 h-5 text-[#94A3B8]" />
                                )}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search by ID (User, Recording)..."
                                    className="flex-1 bg-transparent border-none outline-none text-[15px] font-bold text-[#0F172A] placeholder:text-[#94A3B8]"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <div className="flex items-center gap-1 px-2 py-1 bg-white border border-[#E2E8F0] rounded-lg shadow-sm">
                                    <Command size={12} className="text-[#64748B]" />
                                    <span className="text-[10px] font-black text-[#64748B]">K</span>
                                </div>
                            </div>
                        </div>

                        {/* Hint Section */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-[#F1F5F9] flex items-center justify-between">
                            <p className="text-[11px] font-bold text-[#94A3B8]">
                                Press <span className="text-[#64748B]">ESC</span> to close
                            </p>
                            <p className="text-[11px] font-bold text-[#8c00ff] flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#8c00ff]" />
                                Intelligent ID Lookup
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
