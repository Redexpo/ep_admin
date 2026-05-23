'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Briefcase, Building2, Users, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminContactService, AdminContactSales } from '@/services/admin/contactService';
import { toast } from 'sonner';

function ExpandableMessage({ text }: { text: string }) {
    const [expanded, setExpanded] = useState(false);
    const truncated = text.length > 100;
    return (
        <div className="text-[13px] text-slate-700">
            <span className="whitespace-pre-wrap">{expanded || !truncated ? text : text.slice(0, 100) + '…'}</span>
            {truncated && (
                <button
                    onClick={() => setExpanded(v => !v)}
                    className="ml-1.5 inline-flex items-center gap-0.5 text-[11px] font-bold text-[#8c00ff] hover:underline"
                >
                    {expanded ? <><ChevronUp size={10} />less</> : <><ChevronDown size={10} />more</>}
                </button>
            )}
        </div>
    );
}

export default function ContactSalesPage() {
    const [isLoading,   setIsLoading]   = useState(true);
    const [items,       setItems]       = useState<AdminContactSales[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQ,  setDebouncedQ]  = useState('');

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedQ(searchQuery); setCurrentPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const fetchItems = useCallback(async () => {
        try {
            setIsLoading(true);
            setItems(await adminContactService.getContactSales(currentPage, 20, debouncedQ || undefined));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to load submissions');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedQ]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const fmtTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <AdminLayout>
            <div className="p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
                <div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight">Contact Sales</h1>
                    <p className="text-[14px] text-slate-500 mt-0.5">Enterprise and team plan inquiries from the marketing site.</p>
                    {!isLoading && (
                        <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-purple-50 text-[12px] font-bold text-[#8c00ff] border border-purple-100">
                            <Briefcase size={11} /> {items.length} lead{items.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-slate-50">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search name, email, or company…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/30 focus:border-[#8c00ff] transition-all"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Company</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Team Size</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Message</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Received</th>
                                    <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-4">
                                                <div className="h-5 bg-slate-100 rounded-lg w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 text-slate-300">
                                                <Briefcase size={40} strokeWidth={1} />
                                                <p className="text-[14px] text-slate-400 font-medium">No sales inquiries found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors align-top">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-[13px] font-bold text-slate-900">{item.first_name} {item.last_name}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <a href={`mailto:${item.email}`} className="text-[13px] font-medium text-[#8c00ff] hover:underline whitespace-nowrap">
                                                    {item.email}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
                                                    <Building2 size={10} /> {item.company}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-purple-50 text-[#8c00ff] border border-purple-100 whitespace-nowrap">
                                                    <Users size={10} /> {item.team_size}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 max-w-[340px]">
                                                <ExpandableMessage text={item.message} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-[12px] font-semibold text-slate-700">{fmt(item.created_at)}</p>
                                                <p className="text-[11px] text-slate-400">{fmtTime(item.created_at)}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/admin/contacts/sales/${item.id}`}
                                                    className="w-8 h-8 inline-flex items-center justify-center rounded-xl text-slate-400 hover:bg-purple-50 hover:text-[#8c00ff] transition-all"
                                                    title="View detail"
                                                >
                                                    <Eye size={15} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[12px] text-slate-500">
                            Showing <span className="font-bold text-slate-900">{items.length}</span> leads
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoading}
                                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-[13px] font-bold text-slate-700 px-2">Page {currentPage}</span>
                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={items.length < 20 || isLoading}
                                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
