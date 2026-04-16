'use client';

import { useState, useCallback, useEffect } from 'react';
import {
    Search,
    Filter,
    Download,
    MoreVertical,
    Eye,
    Trash2,
    Link2,
    Play,
    ChevronLeft,
    ChevronRight,
    Users,
    Clock,
    TrendingUp,
    PlayCircle,
    AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { videoService, Video, VideoStats } from '@/services/admin/videoService';
import { toast } from 'sonner';

export default function AdminVideosPage() {
    const [isDarkMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [videos, setVideos] = useState<Video[]>([]);
    const [stats, setStats] = useState<VideoStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isStatsLoading, setIsStatsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        perPage: 10
    });

    const fetchStats = useCallback(async () => {
        try {
            setIsStatsLoading(true);
            const response = await videoService.getVideoStats();
            setStats(response.data);
        } catch (error: any) {
            console.error("Failed to fetch video stats:", error);
        } finally {
            setIsStatsLoading(false);
        }
    }, []);

    const fetchVideos = useCallback(async (page: number) => {
        try {
            setIsLoading(true);
            const response = await videoService.getVideos(page, 10);
            if (response.status === 'success') {
                setVideos(response.data.results);
                setPagination({
                    total: response.data.pagination.total,
                    totalPages: response.data.pagination.total_pages,
                    perPage: response.data.pagination.per_page
                });
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch videos");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVideos(currentPage);
        fetchStats();
    }, [currentPage, fetchVideos, fetchStats]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1
                            className="text-[28px] leading-[36px] font-semibold mb-2"
                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                        >
                            Videos Management
                        </h1>
                        <p
                            className="text-[14px] leading-[22px]"
                            style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                        >
                            Manage and moderate all platform videos
                        </p>
                    </div>

                    <button
                        className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                        style={{
                            background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)',
                            color: '#ffffff',
                            fontSize: '14px',
                            lineHeight: '22px',
                        }}
                    >
                        <Download size={18} strokeWidth={1.5} />
                        Export Data
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
                    {isStatsLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="min-w-[260px] flex-shrink-0 lg:min-w-0 rounded-2xl p-6 shadow-sm animate-pulse"
                                style={{
                                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-100 mb-4" />
                                <div className="h-4 w-24 bg-slate-100 rounded mb-2" />
                                <div className="h-8 w-32 bg-slate-100 rounded mb-1" />
                                <div className="h-3 w-40 bg-slate-50 rounded" />
                            </div>
                        ))
                    ) : stats ? (
                        <>
                            {[
                                { label: 'Total Videos', value: stats.total_videos.value, change: stats.total_videos.change, trend: stats.total_videos.trend, icon: PlayCircle, color: '#8c00ff' },
                                { label: 'Active Recordings', value: stats.active_recordings.value, change: stats.active_recordings.change, trend: stats.active_recordings.trend, icon: TrendingUp, color: '#22c55e' },
                                { label: 'New Videos (7d)', value: stats.new_videos_7d.value, change: stats.new_videos_7d.change, trend: stats.new_videos_7d.trend, icon: Clock, color: '#3b82f6' },
                                { label: 'Reported Videos', value: stats.reported_videos.value, change: stats.reported_videos.change, trend: stats.reported_videos.trend, icon: AlertCircle, color: '#ef4444' },
                            ].map((stat, index) => (
                                <div
                                    key={index}
                                    className="min-w-[260px] flex-shrink-0 lg:min-w-0 rounded-2xl p-4 shadow-sm border border-[#E2E8F0]"
                                    style={{
                                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                    }}
                                >
                                    <p
                                        className="text-[16px] leading-[24px] font-bold mb-1"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        {stat.label}
                                    </p>
                                    <h3
                                        className="text-[28px] leading-[36px] font-semibold mb-1"
                                        style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                    >
                                        {stat.value.toLocaleString()}
                                    </h3>
                                    <span className="text-[12px] leading-[18px] font-medium" style={{ color: '#22c55e' }}>
                                        {stat.change} from last week
                                    </span>
                                </div>
                            ))}
                        </>
                    ) : null}
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <div
                        className="flex-1 relative"
                        style={{
                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            borderRadius: '12px',
                            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                        }}
                    >
                        <Search
                            size={18}
                            strokeWidth={1.5}
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                            style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                        />
                        <input
                            type="text"
                            placeholder="Search by title, owner, or video ID..."
                            className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-[14px] leading-[22px]"
                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                        />
                    </div>

                    <button
                        className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all hover:bg-gray-50 border border-[#E2E8F0] shadow-sm"
                        style={{
                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            color: isDarkMode ? '#ffffff' : '#0F172A',
                            fontSize: '14px',
                            lineHeight: '22px',
                        }}
                    >
                        <Filter size={18} strokeWidth={1.5} />
                        Filters
                    </button>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2">
                    {['all', 'public', 'private', 'reported'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setSelectedFilter(filter)}
                            className="px-4 py-2 rounded-lg text-[13px] leading-[20px] font-medium capitalize transition-all"
                            style={{
                                backgroundColor:
                                    selectedFilter === filter
                                        ? (isDarkMode ? 'rgba(140,0,255,0.15)' : '#f3eefe')
                                        : (isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC'),
                                color: selectedFilter === filter ? '#8c00ff' : (isDarkMode ? '#94A3B8' : '#64748B'),
                                border: selectedFilter === filter ? '1.5px solid #8c00ff' : 'none',
                            }}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Videos Table */}
                <div
                    className="rounded-2xl overflow-hidden shadow-sm"
                    style={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                    }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr
                                    style={{
                                        borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                    }}
                                >
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Video
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Owner
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Visibility
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Status
                                    </th>
                                    <th
                                        className="text-left px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Created
                                    </th>
                                    <th
                                        className="text-right px-6 py-4 text-[12px] leading-[18px] font-semibold uppercase tracking-wide"
                                        style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-16 h-10 rounded-lg bg-slate-100" />
                                                    <div className="space-y-2">
                                                        <div className="h-4 w-32 bg-slate-100 rounded" />
                                                        <div className="h-3 w-20 bg-slate-50 rounded" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td colSpan={7} className="px-6 py-4">
                                                <div className="h-4 w-full bg-slate-100 rounded" />
                                            </td>
                                        </tr>
                                    ))
                                ) : videos.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                                            No videos found.
                                        </td>
                                    </tr>
                                ) : (
                                    videos.map((video) => {
                                        const formattedDate = video.created_at ? new Date(video.created_at + 'Z').toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        }) : 'N/A';

                                        const formattedTime = video.created_at ? new Date(video.created_at + 'Z').toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        }) : '';

                                        return (
                                            <tr
                                                key={video.id}
                                                className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
                                                style={{
                                                    borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC'}`,
                                                }}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {video.thumbnail ? (
                                                            <div className="relative w-16 h-10 flex-shrink-0">
                                                                <img
                                                                    src={video.thumbnail}
                                                                    alt={video.title}
                                                                    className="w-16 h-10 rounded-lg object-cover shadow-sm bg-slate-100"
                                                                />
                                                                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-mono font-bold px-1 py-0.5 rounded leading-none">
                                                                    {formatDuration(video.duration)}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className="relative w-16 h-10 flex-shrink-0 rounded-lg flex items-center justify-center overflow-hidden shadow-inner"
                                                                style={{
                                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                }}
                                                            >
                                                                <Play size={16} strokeWidth={1.5} color="#ffffff" />
                                                                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-mono font-bold px-1 py-0.5 rounded leading-none">
                                                                    {formatDuration(video.duration)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="max-w-xs">
                                                            <Link
                                                                href={`/admin/videos/${video.id}`}
                                                                className="text-[14px] leading-[22px] font-medium truncate hover:text-[#8c00ff] transition-colors cursor-pointer"
                                                                style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                                            >
                                                                {video.title}
                                                            </Link>
                                                            <div
                                                                className="text-[12px] leading-[18px]"
                                                                style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                                            >
                                                                {video.encrypted_id}
                                                            </div>
                                                            {video.folder?.name && (
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold"
                                                                        style={{
                                                                            backgroundColor: isDarkMode ? 'rgba(251,191,36,0.12)' : '#fef9ee',
                                                                            color: isDarkMode ? '#fbbf24' : '#b45309',
                                                                            border: `1px solid ${isDarkMode ? 'rgba(251,191,36,0.2)' : '#fde68a'}`,
                                                                        }}
                                                                    >
                                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                                                            <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" />
                                                                        </svg>
                                                                        {video.folder.name}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div
                                                            className="text-[14px] leading-[22px] font-medium"
                                                            style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                                        >
                                                            {video.creator}
                                                        </div>
                                                        <div
                                                            className="text-[12px] leading-[18px]"
                                                            style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                                        >
                                                            {video.creator_email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className="text-[14px] leading-[22px]"
                                                        style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}
                                                    >
                                                        Public
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className="inline-flex px-3 py-1 rounded-full text-[12px] leading-[18px] font-medium capitalize"
                                                        style={{
                                                            backgroundColor:
                                                                video.status === 'completed'
                                                                    ? 'rgba(34, 197, 94, 0.1)'
                                                                    : 'rgba(100, 116, 139, 0.1)',
                                                            color: video.status === 'completed' ? '#22c55e' : '#64748B',
                                                        }}
                                                    >
                                                        {video.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div
                                                            className="text-[14px] leading-[22px]"
                                                            style={{ color: isDarkMode ? '#94A3B8' : '#475569' }}
                                                        >
                                                            {formattedDate}
                                                        </div>
                                                        <div
                                                            className="text-[12px] leading-[18px]"
                                                            style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                                                        >
                                                            {formattedTime}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/admin/videos/${video.id}`}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:bg-gray-100 dark:hover:bg-white/10"
                                                            style={{
                                                                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                                            }}
                                                        >
                                                            <Eye
                                                                size={16}
                                                                strokeWidth={1.5}
                                                                style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                                            />
                                                        </Link>
                                                        <button
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:bg-gray-100 dark:hover:bg-white/10"
                                                            style={{
                                                                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                                            }}
                                                        >
                                                            <Link2
                                                                size={16}
                                                                strokeWidth={1.5}
                                                                style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                                            />
                                                        </button>
                                                        <button
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:bg-gray-100 dark:hover:bg-white/10"
                                                            style={{
                                                                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                                            }}
                                                        >
                                                            <MoreVertical
                                                                size={16}
                                                                strokeWidth={1.5}
                                                                style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div
                        className="flex items-center justify-between px-6 py-4"
                        style={{
                            borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                        }}
                    >
                        <span
                            className="text-[13px] leading-[20px]"
                            style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                        >
                            Showing {(currentPage - 1) * pagination.perPage + 1}-{Math.min(currentPage * pagination.perPage, pagination.total)} of {pagination.total.toLocaleString()} videos
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1 || isLoading}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                }}
                            >
                                <ChevronLeft
                                    size={16}
                                    strokeWidth={1.5}
                                    style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                />
                            </button>
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage >= pagination.totalPages || isLoading}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                }}
                            >
                                <ChevronRight
                                    size={16}
                                    strokeWidth={1.5}
                                    style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
