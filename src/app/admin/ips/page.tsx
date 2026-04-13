'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    Globe,
    User as UserIcon,
    Shield,
    Clock,
    MapPin,
    Monitor
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getIPAddresses, IPInfo } from '@/services/admin/ipService';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminIPsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [ips, setIps] = useState<IPInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        skip: 0,
        limit: 20
    });

    const limit = 20;

    const fetchIPs = useCallback(async (page: number) => {
        try {
            setIsLoading(true);
            const skip = (page - 1) * limit;
            const response = await getIPAddresses(skip, limit);
            if (response.success) {
                setIps(response.data.results);
                setPagination(response.data.pagination);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch IP addresses");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIPs(currentPage);
    }, [fetchIPs, currentPage]);

    const totalPages = Math.ceil(pagination.total / limit);

    return (
        <AdminLayout>
            <div className="space-y-8 text-slate-900">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[32px] font-bold tracking-tight">IP Address Logs</h1>
                        <p className="text-[16px] mt-1 text-slate-500">
                            Monitor and review administrative IP address activity and geodata.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[14px] font-semibold hover:bg-slate-50 transition-all">
                            <Download size={18} />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                    {/* Table Filters */}
                    <div className="p-6 border-b border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by IP address or user..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#8c00ff] focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 transition-all text-slate-600">
                                <Filter size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">IP Address</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Most Recent User</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider text-center">Visits</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Last Activity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F1F5F9]">
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-6 h-[72px] bg-slate-50/10" />
                                        </tr>
                                    ))
                                ) : ips.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            No IP address records found.
                                        </td>
                                    </tr>
                                ) : ips.map((ip) => {
                                    const lastActivityDate = new Date(ip.updated_at || ip.created_at);
                                    const formattedDate = lastActivityDate.toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    });

                                    return (
                                        <tr key={ip._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <Link href={`/admin/ips/${ip._id}`} className="flex items-center gap-2 group/ip">
                                                    <Globe className="size-4 text-slate-400 group-hover/ip:text-[#8c00ff] transition-colors" />
                                                    <span className="text-[14px] font-bold text-[#0F172A] group-hover/ip:text-[#8c00ff] transition-colors underline decoration-slate-200 underline-offset-4">{ip.ip}</span>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                {ip.user_info ? (
                                                    <Link href={`/admin/users/${ip.user_info.id}`} className="flex items-center gap-2 hover:text-[#8c00ff] transition-colors">
                                                        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-[#8c00ff] text-[10px] font-bold">
                                                            {ip.user_info.name[0]}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[13px] font-semibold">{ip.user_info.name}</span>
                                                            <span className="text-[11px] text-slate-500">{ip.user_info.email}</span>
                                                        </div>
                                                    </Link>
                                                ) : (
                                                    <span className="text-[13px] text-slate-400 italic">Guest</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex px-2.5 py-1 rounded-full bg-slate-100 text-[#64748B] text-[12px] font-bold">
                                                    {ip.visit_count || (ip.logs ? ip.logs.length : 0) || 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-[13px] text-slate-600">
                                                    <MapPin size={14} className="text-slate-400" />
                                                    {ip.geodata?.city && ip.geodata?.country ? (
                                                        <span>{ip.geodata.city}, {ip.geodata.country}</span>
                                                    ) : (
                                                        <span className="text-slate-400">Unknown</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-[13px] text-slate-500">
                                                    <Clock size={14} className="text-slate-400" />
                                                    <span>{formattedDate}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-6 border-t border-[#F1F5F9] flex items-center justify-between">
                        <p className="text-[13px] text-[#64748B]">
                            Page <span className="font-bold text-[#0F172A]">{currentPage}</span> of {totalPages || 1}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1 || isLoading}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="flex items-center justify-center w-10 h-10 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 transition-all disabled:opacity-40"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                disabled={currentPage >= totalPages || isLoading}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="flex items-center justify-center w-10 h-10 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 transition-all disabled:opacity-40"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
