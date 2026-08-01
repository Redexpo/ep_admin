'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Globe, ShieldBan, ShieldCheck, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { signupDomainService, SignupDomain } from '@/services/admin/signupDomainService';
import { toast } from 'sonner';
import Link from 'next/link';

const PER_PAGE = 20;

export default function SignupDomainsPage() {
    const [domains, setDomains] = useState<SignupDomain[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [blockedFilter, setBlockedFilter] = useState<'all' | 'blocked' | 'active'>('all');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, total_pages: 1 });
    const [togglingDomain, setTogglingDomain] = useState<string | null>(null);

    const fetchDomains = useCallback(async (p: number, q: string, bf: typeof blockedFilter) => {
        try {
            setIsLoading(true);
            const params: Record<string, unknown> = { page: p, per_page: PER_PAGE };
            if (q) params.search = q;
            if (bf === 'blocked') params.blocked = true;
            if (bf === 'active')  params.blocked = false;
            const res = await signupDomainService.list(params);
            setDomains(res.data.results);
            setPagination({ total: res.data.pagination.total, total_pages: res.data.pagination.total_pages });
        } catch {
            toast.error('Failed to fetch domains');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => fetchDomains(page, search, blockedFilter), search ? 300 : 0);
        return () => clearTimeout(t);
    }, [fetchDomains, page, search, blockedFilter]);

    const handleFilterChange = (f: typeof blockedFilter) => {
        setBlockedFilter(f);
        setPage(1);
    };

    const handleSearchChange = (v: string) => {
        setSearch(v);
        setPage(1);
    };

    const handleToggleBlock = async (domain: string, current: boolean) => {
        setTogglingDomain(domain);
        try {
            await signupDomainService.toggleBlock(domain);
            setDomains(prev => prev.map(d => d.domain === domain ? { ...d, is_blocked: !current } : d));
            toast.success(current ? `${domain} unblocked` : `${domain} blocked`);
        } catch {
            toast.error('Failed to update domain');
        } finally {
            setTogglingDomain(null);
        }
    };

    const fmt = (iso: string | null) => iso
        ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—';

    return (
        <AdminLayout>
            <div className="space-y-8 text-slate-900">
                {/* Header */}
                <div>
                    <h1 className="text-[32px] font-bold tracking-tight">Signup Domains</h1>
                    <p className="text-[16px] mt-1 text-slate-500">
                        Track which email domains users are signing up from.
                    </p>
                </div>

                {/* Table card */}
                <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                    {/* Filters */}
                    <div className="p-5 border-b border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                            <input
                                type="text"
                                placeholder="Search domain…"
                                value={search}
                                onChange={e => handleSearchChange(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-[13px] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8c00ff]/20 focus:border-[#8c00ff]"
                            />
                        </div>
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                            {(['all', 'active', 'blocked'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => handleFilterChange(f)}
                                    className={`px-3 py-1.5 text-[12px] font-bold rounded-lg capitalize transition-all ${blockedFilter === f ? 'bg-white shadow-sm text-[#8c00ff]' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <span className="text-[12px] text-slate-400 font-medium ml-auto">
                            {pagination.total} domain{pagination.total !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Domain</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Users</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Last Signup</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">First Seen</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    Array(8).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-4 w-36 bg-slate-100 rounded-full" /></td>
                                            <td className="px-6 py-4"><div className="h-4 w-10 bg-slate-100 rounded-full" /></td>
                                            <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded-full" /></td>
                                            <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded-full" /></td>
                                            <td className="px-6 py-4"><div className="h-5 w-16 bg-slate-100 rounded-lg" /></td>
                                            <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 rounded-full" /></td>
                                        </tr>
                                    ))
                                ) : domains.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <Globe size={32} className="mx-auto text-slate-200 mb-3" />
                                            <p className="text-[13px] text-slate-400 font-medium">No domains found</p>
                                        </td>
                                    </tr>
                                ) : domains.map(d => (
                                    <tr key={d.domain} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                                                    <Globe size={13} className="text-[#8c00ff]" />
                                                </div>
                                                <Link
                                                    href={`/admin/signup-domains/${encodeURIComponent(d.domain)}`}
                                                    className="text-[13px] font-bold text-[#0F172A] hover:text-[#8c00ff] transition-colors"
                                                >
                                                    {d.domain}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Users size={12} className="text-slate-400" />
                                                <span className="text-[13px] font-bold text-[#0F172A]">{d.user_count.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[12px] text-slate-500">{fmt(d.last_user_signup_at)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[12px] text-slate-500">{fmt(d.created_at)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {d.is_blocked ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-50 text-red-600">
                                                    <ShieldBan size={11} /> Blocked
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700">
                                                    <ShieldCheck size={11} /> Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={`/admin/signup-domains/${encodeURIComponent(d.domain)}`}
                                                    className="text-[11px] font-bold text-[#8c00ff] hover:underline"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => handleToggleBlock(d.domain, d.is_blocked)}
                                                    disabled={togglingDomain === d.domain}
                                                    className={`text-[11px] font-bold transition-colors ${d.is_blocked ? 'text-emerald-600 hover:underline' : 'text-red-500 hover:underline'} disabled:opacity-40`}
                                                >
                                                    {togglingDomain === d.domain ? '…' : d.is_blocked ? 'Unblock' : 'Block'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.total_pages > 1 && (
                        <div className="px-6 py-4 border-t border-[#F1F5F9] flex items-center justify-between">
                            <span className="text-[12px] text-slate-500">
                                Page {page} of {pagination.total_pages}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1.5 rounded-lg border border-[#E2E8F0] disabled:opacity-40 hover:bg-slate-50 transition-colors"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                                    disabled={page === pagination.total_pages}
                                    className="p-1.5 rounded-lg border border-[#E2E8F0] disabled:opacity-40 hover:bg-slate-50 transition-colors"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
