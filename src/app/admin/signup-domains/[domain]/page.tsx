'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { ArrowLeft, Globe, Users, ShieldBan, ShieldCheck, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { signupDomainService, SignupDomainDetail } from '@/services/admin/signupDomainService';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PER_PAGE = 15;

export default function SignupDomainDetailPage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain: encodedDomain } = use(params);
    const domain = decodeURIComponent(encodedDomain);
    const router = useRouter();

    const [data, setData] = useState<SignupDomainDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isToggling, setIsToggling] = useState(false);
    const [page, setPage] = useState(1);
    const [isUsersLoading, setIsUsersLoading] = useState(false);

    const fetchDetail = useCallback(async (p: number) => {
        try {
            p === 1 ? setIsLoading(true) : setIsUsersLoading(true);
            const res = await signupDomainService.get(domain, p, PER_PAGE);
            setData(res.data);
        } catch {
            toast.error('Failed to load domain');
            router.push('/admin/signup-domains');
        } finally {
            setIsLoading(false);
            setIsUsersLoading(false);
        }
    }, [domain, router]);

    useEffect(() => { fetchDetail(page); }, [fetchDetail, page]);

    const handleToggleBlock = async () => {
        if (!data) return;
        setIsToggling(true);
        try {
            await signupDomainService.toggleBlock(domain);
            setData(prev => prev ? { ...prev, domain: { ...prev.domain, is_blocked: !prev.domain.is_blocked } } : prev);
            toast.success(data.domain.is_blocked ? `${domain} unblocked` : `${domain} blocked`);
        } catch {
            toast.error('Failed to update domain');
        } finally {
            setIsToggling(false);
        }
    };

    const fmt = (iso: string | null) => iso
        ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : '—';

    const fmtShort = (iso: string | null) => iso
        ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—';

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="relative w-10 h-10">
                        <div className="absolute inset-0 border-4 border-purple-100 rounded-full" />
                        <div className="absolute inset-0 border-4 border-[#8c00ff] border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!data) return null;

    const { domain: doc, users } = data;

    return (
        <AdminLayout>
            <div className="space-y-8 text-slate-900">
                {/* Back + header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/admin/signup-domains')}
                            className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-[28px] font-black tracking-tight">{doc.domain}</h1>
                                {doc.is_blocked ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-50 text-red-600">
                                        <ShieldBan size={11} /> Blocked
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700">
                                        <ShieldCheck size={11} /> Active
                                    </span>
                                )}
                            </div>
                            <p className="text-[14px] text-slate-500 mt-0.5">Email domain detail</p>
                        </div>
                    </div>
                    <button
                        onClick={handleToggleBlock}
                        disabled={isToggling}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all disabled:opacity-50 ${
                            doc.is_blocked
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                    >
                        {doc.is_blocked ? <ShieldCheck size={15} /> : <ShieldBan size={15} />}
                        {isToggling ? '…' : doc.is_blocked ? 'Unblock Domain' : 'Block Domain'}
                    </button>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Users', value: doc.user_count.toLocaleString(), icon: Users, color: 'text-[#8c00ff] bg-purple-50' },
                        { label: 'Last Signup', value: fmtShort(doc.last_user_signup_at), icon: Clock, color: 'text-blue-600 bg-blue-50' },
                        { label: 'First Seen', value: fmtShort(doc.created_at), icon: Calendar, color: 'text-slate-600 bg-slate-100' },
                        { label: 'Status', value: doc.is_blocked ? 'Blocked' : 'Active', icon: doc.is_blocked ? ShieldBan : ShieldCheck, color: doc.is_blocked ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-3`}>
                                <Icon size={15} />
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                            <p className="text-[18px] font-black text-[#0F172A] mt-1">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Users table */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-[20px] font-black tracking-tight">Users from this domain</h2>
                        <span className="text-[12px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-xl">
                            {users.pagination.total} user{users.pagination.total !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/60 border-b border-slate-100">
                                        <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                                        <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Auth</th>
                                        <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Joined</th>
                                        <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {isUsersLoading ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-6 py-4"><div className="h-4 w-48 bg-slate-100 rounded-full" /></td>
                                                <td colSpan={4} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-lg" /></td>
                                            </tr>
                                        ))
                                    ) : users.results.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-14 text-center">
                                                <Users size={32} className="mx-auto text-slate-200 mb-3" />
                                                <p className="text-[13px] text-slate-400 font-medium">No users found</p>
                                            </td>
                                        </tr>
                                    ) : users.results.map(u => (
                                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-bold text-[#0F172A]">
                                                        {u.first_name} {u.last_name}
                                                    </span>
                                                    <span className="text-[12px] text-slate-400">{u.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize ${
                                                    u.auth_provider === 'google'
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {u.auth_provider}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    {u.is_active ? (
                                                        <span className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700">Active</span>
                                                    ) : (
                                                        <span className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-500">Inactive</span>
                                                    )}
                                                    {!u.is_verified && (
                                                        <span className="inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-600">Unverified</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[12px] text-slate-500">{fmt(u.created_at)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/admin/users/${u.id}`}
                                                    className="text-[11px] font-bold text-[#8c00ff] hover:underline"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {users.pagination.total_pages > 1 && (
                            <div className="px-6 py-4 border-t border-[#F1F5F9] flex items-center justify-between">
                                <span className="text-[12px] text-slate-500">
                                    Page {page} of {users.pagination.total_pages}
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
                                        onClick={() => setPage(p => Math.min(users.pagination.total_pages, p + 1))}
                                        disabled={page === users.pagination.total_pages}
                                        className="p-1.5 rounded-lg border border-[#E2E8F0] disabled:opacity-40 hover:bg-slate-50 transition-colors"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
