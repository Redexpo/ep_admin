'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft,
    Mail,
    Calendar,
    Shield,
    ShieldCheck,
    ShieldAlert,
    Video,
    HardDrive,
    ExternalLink,
    Play,
    Clock,
    User as UserIcon,
    ArrowLeft,
    Share2,
    Settings,
    MoreHorizontal,
    LayoutGrid,
    List as ListIcon,
    MoreVertical,
    Eye
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { userService, UserDetail, Recording } from '@/services/admin/userService';
import { toast } from 'sonner';

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [isDarkMode] = useState(false);
    const [user, setUser] = useState<UserDetail | null>(null);
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRecordingsLoading, setIsRecordingsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        perPage: 12
    });

    const fetchUserData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await userService.getUserById(userId);
            if (response.data) {
                setUser(response.data);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch user details");
            router.push('/admin/users');
        } finally {
            setIsLoading(false);
        }
    }, [userId, router]);

    const fetchUserRecordings = useCallback(async (page: number) => {
        try {
            setIsRecordingsLoading(true);
            const response = await userService.getUserRecordings(userId, page, 12);
            if (response.data) {
                setRecordings(response.data.results);
                setPagination({
                    total: response.data.pagination.total,
                    totalPages: response.data.pagination.total_pages,
                    perPage: response.data.pagination.per_page
                });
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch recordings");
        } finally {
            setIsRecordingsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    useEffect(() => {
        fetchUserRecordings(currentPage);
    }, [fetchUserRecordings, currentPage]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[600px]">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-[#8c00ff] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!user) return null;

    const initials = `${user.first_name[0]}${user.last_name[0]}`;

    return (
        <AdminLayout>
            <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Modern Sticky Header */}
                <div className="sticky top-0 z-20 -mx-4 px-4 py-4 bg-white/80 backdrop-blur-xl border-b border-[#F1F5F9] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/users"
                            className="p-2.5 rounded-2xl border border-[#E2E8F0] bg-white hover:bg-slate-50 transition-all group shadow-sm active:scale-90"
                        >
                            <ArrowLeft size={20} className="text-[#64748B] group-hover:text-[#0F172A]" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="text-[14px] font-black tracking-tight text-[#0F172A]">User Details</span>
                            <span className="text-[#E2E8F0]">/</span>
                            <span className="text-[14px] font-bold text-[#64748B]">{user.first_name} {user.last_name}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#E2E8F0] bg-white text-[14px] font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-all active:scale-95">
                            <Settings size={18} />
                            Settings
                        </button>
                        <button className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#0F172A] text-white text-[14px] font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95">
                            Quick Actions
                        </button>
                    </div>
                </div>

                {/* User Profile Card */}
                <div className="bg-white rounded-[40px] border border-[#F1F5F9] p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-10 relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-200 transition-all duration-700">
                    <div className="relative z-10">
                        <div className="w-28 h-28 rounded-[32px] bg-gradient-to-br from-[#8c00ff] to-[#7c3aed] p-1 shadow-2xl shadow-purple-200 group-hover:scale-105 transition-transform duration-700">
                            <div className="w-full h-full rounded-[28px] bg-white overflow-hidden flex items-center justify-center border-2 border-white">
                                {user.picture ? (
                                    <img src={user.picture} alt={user.first_name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#8c00ff] to-[#7c3aed]">
                                        {initials}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-2xl bg-white border-2 border-white shadow-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                            {user.is_verified ? (
                                <ShieldCheck size={20} className="text-[#10B981]" fill="#10B98120" />
                            ) : (
                                <ShieldAlert size={20} className="text-[#F59E0B]" fill="#F59E0B20" />
                            )}
                        </div>
                    </div>

                    <div className="flex-1 space-y-6 text-center md:text-left z-10">
                        <div className="space-y-2">
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <h1 className="text-[32px] font-black tracking-tighter text-[#0F172A]">
                                    {user.first_name} {user.last_name}
                                </h1>
                                {user.is_admin && (
                                    <span className="px-3 py-1 bg-gradient-to-r from-[#8c00ff] to-[#7c3aed] text-white text-[11px] font-black uppercase rounded-lg shadow-xl shadow-purple-100">
                                        ADMIN
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-[#64748B]">
                                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-xl font-bold text-[14px]">
                                    <Mail size={16} className="opacity-50" />
                                    {user.email}
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-xl font-bold text-[14px]">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User ID</span>
                                    <span className="font-mono tracking-tighter uppercase text-[13px]">{user.id}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${user.is_active ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                                    <span className="text-[14px] font-bold text-[#0F172A]">{user.is_active ? 'Active Now' : 'Inactive'}</span>
                                </div>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-100 hidden md:block" />
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Provider</span>
                                <div className="flex items-center gap-2">
                                    {user.auth_provider === 'google' ? (
                                        <div className="flex items-center gap-2 text-[14px] font-bold text-[#0F172A]">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                <path
                                                    fill="#EA4335"
                                                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
                                                />
                                                <path
                                                    fill="#34A853"
                                                    d="M16.04 18.013c-1.09.696-2.415 1.078-3.84 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.223 3.255c2.41 4.795 7.39 8.16 13.146 8.16 3.082 0 5.95-.973 8.241-2.618l-6.551-5.052Z"
                                                />
                                                <path
                                                    fill="#4285F4"
                                                    d="M23.49 12.275c0-.826-.074-1.62-.21-2.387H12v4.513h6.44c-.278 1.496-1.122 2.766-2.4 3.612l6.551 5.052c3.815-3.513 6.1-8.623 6.1-13.623Z"
                                                />
                                                <path
                                                    fill="#FBBC05"
                                                    d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.795.14-1.558.384-2.27L1.24 6.615A11.977 11.977 0 0 0 0 12c0 1.926.45 3.743 1.258 5.37l4.019-3.102Z"
                                                />
                                            </svg>
                                            Google
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-[14px] font-bold text-[#0F172A]">
                                            <Mail size={16} className="text-[#64748B]" />
                                            Email
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-100 hidden md:block" />
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Subscription</span>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-lg text-[13px] font-bold ${user.plan_name === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                                            user.plan_name === 'Pro' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-[#0F172A]'
                                        }`}>
                                        {user.plan_name || 'Starter'}
                                    </span>
                                    <span className="text-[11px] font-black text-[#64748B] uppercase">({user.billing_cycle || 'none'})</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-50/30 to-blue-50/30 blur-[60px] rounded-full -mr-20 -mt-20 z-0"></div>
                </div>

                {/* Profile Overview Tiles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-[32px] border border-[#E2E8F0] shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Video size={80} className="text-[#8c00ff]" />
                        </div>
                        <p className="text-[14px] font-bold text-[#64748B] mb-1">Total Recordings</p>
                        <h3 className="text-[36px] font-black tracking-tighter text-[#0F172A]">{formatNumber(user.stats.total_recordings)}</h3>
                        <div className="mt-4 flex items-center gap-1.5 text-[12px] font-bold text-green-500">
                            <TrendingUp size={14} className="" />
                            +12% this month
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] border border-[#E2E8F0] shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <HardDrive size={80} className="text-[#3b82f6]" />
                        </div>
                        <p className="text-[14px] font-bold text-[#64748B] mb-1">Storage Usage</p>
                        <h3 className="text-[36px] font-black tracking-tighter text-[#0F172A]">1.2 <span className="text-[20px] font-bold text-[#94A3B8]">GB</span></h3>
                        <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#3b82f6] w-[45%] rounded-full"></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] border border-[#E2E8F0] shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Clock size={80} className="text-[#22c55e]" />
                        </div>
                        <p className="text-[14px] font-bold text-[#64748B] mb-1">Last Active</p>
                        <h3 className="text-[24px] font-black tracking-tight text-[#0F172A] mt-2 line-clamp-1">Today, 2:45 PM</h3>
                        <p className="text-[12px] font-bold text-[#94A3B8] mt-2">Active session on Chrome</p>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] border border-[#E2E8F0] shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Calendar size={80} className="text-[#f59e0b]" />
                        </div>
                        <p className="text-[14px] font-bold text-[#64748B] mb-1">Member Since</p>
                        <h3 className="text-[24px] font-black tracking-tight text-[#0F172A] mt-2">{formatDate(user.created_at)}</h3>
                        <p className="text-[12px] font-bold text-[#94A3B8] mt-2 capitalize">{user.auth_provider || 'Email'} registration</p>
                    </div>
                </div>

                {/* Main Content: Full Width Recordings */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[22px] font-black tracking-tight text-[#0F172A]">Recent Recordings</h2>
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-slate-100 rounded-xl flex">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-4 py-1.5 transition-all text-[13px] font-bold rounded-lg flex items-center gap-2 ${viewMode === 'grid' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B]'}`}
                                >
                                    <LayoutGrid size={16} />
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-4 py-1.5 transition-all text-[13px] font-bold rounded-lg flex items-center gap-2 ${viewMode === 'list' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B]'}`}
                                >
                                    <ListIcon size={16} />
                                    List
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] border border-[#E2E8F0] shadow-xl shadow-slate-100/50 overflow-hidden min-h-[600px] flex flex-col">
                        <div className="flex-1">
                            {isRecordingsLoading ? (
                                <div className="p-8 space-y-4">
                                    {Array(8).fill(0).map((_, i) => (
                                        <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-2xl" />
                                    ))}
                                </div>
                            ) : recordings.length > 0 ? (
                                viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-8">
                                        {recordings.map((recording) => (
                                            <div key={recording.id} className="group relative space-y-3 cursor-pointer">
                                                <div className="aspect-video bg-slate-50 rounded-[24px] border border-[#F1F5F9] overflow-hidden relative shadow-sm hover:shadow-xl hover:shadow-purple-100 transition-all duration-500 hover:-translate-y-1">
                                                    {recording.thumbnail_url ? (
                                                        <img src={recording.thumbnail_url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                                                            <Video size={40} className="text-slate-200" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-500">
                                                            <Play size={20} className="text-[#8c00ff] fill-current ml-1" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-white tracking-widest uppercase">
                                                        {formatDuration(recording.duration)}
                                                    </div>
                                                </div>
                                                <div className="px-2">
                                                    <h4 className="text-[15px] font-black text-[#0F172A] line-clamp-1 group-hover:text-[#8c00ff] transition-colors">
                                                        {recording.title || 'Untitled Recording'}
                                                    </h4>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-[12px] font-bold text-[#94A3B8]">
                                                            {new Date(recording.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${recording.status === 'completed'
                                                            ? 'bg-green-50 text-green-500'
                                                            : 'bg-amber-50 text-amber-500'
                                                            }`}>
                                                            {recording.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto p-4 sm:p-8">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-100">
                                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Recording</th>
                                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Duration</th>
                                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {recordings.map((recording) => (
                                                    <tr key={recording.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-16 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 relative">
                                                                    {recording.thumbnail_url ? (
                                                                        <img src={recording.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <Video size={16} className="absolute inset-0 m-auto text-slate-300" />
                                                                    )}
                                                                </div>
                                                                <span className="text-[14px] font-bold text-[#0F172A] group-hover:text-[#8c00ff] transition-colors line-clamp-1 max-w-[300px]">
                                                                    {recording.title || 'Untitled Recording'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-[13px] font-bold text-[#64748B]">{formatDuration(recording.duration)}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${recording.status === 'completed'
                                                                ? 'bg-green-50 text-green-500'
                                                                : 'bg-amber-50 text-amber-500'
                                                                }`}>
                                                                {recording.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-[13px] font-bold text-[#94A3B8]">{new Date(recording.created_at).toLocaleDateString()}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button className="p-2 rounded-lg bg-slate-50 hover:bg-white hover:shadow-sm border border-[#E2E8F0] transition-all">
                                                                    <Eye size={16} className="text-[#64748B]" />
                                                                </button>
                                                                <button className="p-2 rounded-lg bg-slate-50 hover:bg-white hover:shadow-sm border border-[#E2E8F0] transition-all">
                                                                    <MoreVertical size={16} className="text-[#64748B]" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[500px] text-center p-8">
                                    <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6 animate-bounce duration-[3000ms]">
                                        <Video size={48} />
                                    </div>
                                    <h3 className="text-[20px] font-black text-[#0F172A] mb-2 tracking-tight">No recordings captured yet</h3>
                                    <p className="text-[14px] font-bold text-[#64748B] max-w-xs">
                                        This user has a quiet account. Once they start recording, you'll see them all right here.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modern Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="px-8 py-8 border-t border-[#F1F5F9] flex items-center justify-between bg-white">
                                <button
                                    disabled={currentPage === 1 || isRecordingsLoading}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white border border-[#E2E8F0] text-[14px] font-black text-[#0F172A] shadow-sm hover:shadow-md disabled:opacity-30 disabled:hover:shadow-sm transition-all active:scale-90"
                                >
                                    <ChevronLeft size={18} />
                                    Previous
                                </button>
                                <div className="flex items-center gap-1.5">
                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-10 h-10 rounded-xl text-[14px] font-black transition-all ${currentPage === pageNum
                                                    ? 'bg-[#8c00ff] text-white shadow-lg shadow-purple-200'
                                                    : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] shadow-sm'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    disabled={currentPage === pagination.totalPages || isRecordingsLoading}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white border border-[#E2E8F0] text-[14px] font-black text-[#0F172A] shadow-sm hover:shadow-md disabled:opacity-30 disabled:hover:shadow-sm transition-all active:scale-90"
                                >
                                    Next
                                    <ArrowLeft size={18} className="rotate-180" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
};

const TrendingUp = ({ size, className }: { size: number, className: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);
