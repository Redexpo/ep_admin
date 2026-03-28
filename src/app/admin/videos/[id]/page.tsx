'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Video,
    Calendar,
    User,
    Eye,
    Clock,
    HardDrive,
    Trash2,
    Shield,
    Download,
    Share2,
    Play,
    Tag,
    MoreHorizontal
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { videoService, Video as VideoType } from '@/services/admin/videoService';
import { toast } from 'sonner';

export default function VideoDetailPage() {
    const params = useParams();
    const router = useRouter();
    const videoId = params.id as string;

    const [video, setVideo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchVideoData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await videoService.getVideoById(videoId);
            if (response.data) {
                setVideo(response.data);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch video details");
            router.push('/admin/videos');
        } finally {
            setIsLoading(false);
        }
    }, [videoId, router]);

    useEffect(() => {
        fetchVideoData();
    }, [fetchVideoData]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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

    if (!video) return null;

    return (
        <AdminLayout>
            <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/videos"
                            className="p-2.5 rounded-2xl border border-[#E2E8F0] bg-white hover:bg-slate-50 transition-all group shadow-sm active:scale-90"
                        >
                            <ArrowLeft size={20} className="text-[#64748B] group-hover:text-[#0F172A]" />
                        </Link>
                        <div>
                            <h1 className="text-[24px] font-black tracking-tight text-[#0F172A] line-clamp-1 max-w-[600px]">
                                {video.title || 'Untitled Recording'}
                            </h1>
                            <div className="flex items-center gap-3 text-[13px] font-bold text-[#64748B]">
                                <span className="uppercase tracking-tighter text-[11px] bg-slate-100 px-1.5 py-0.5 rounded-md">ID: {video.encrypted_id || video.id}</span>
                                <span className="opacity-30">•</span>
                                <div className="flex items-center gap-1.5">
                                    <Video size={14} />
                                    <span className="capitalize">{video.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:text-red-500 hover:bg-red-50 transition-all">
                            <Trash2 size={20} />
                        </button>
                        <button className="px-6 py-2.5 rounded-2xl bg-[#0F172A] text-white text-[14px] font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95">
                            Manage Video
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Video Preview & Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Video Player Placeholder/Preview */}
                        <div className="aspect-video bg-black rounded-[40px] overflow-hidden border border-[#E2E8F0] shadow-2xl relative group">
                            {video.thumbnail ? (
                                <img src={video.thumbnail} alt="" className="w-full h-full object-cover opacity-60" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-black">
                                    <Video size={80} className="text-slate-800" />
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transform group-hover:scale-110 transition-all duration-500">
                                    <Play size={32} className="text-white fill-current ml-1" />
                                </button>
                            </div>
                            <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                                <div className="px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-white font-black tracking-widest text-[12px] uppercase">
                                    {formatDuration(video.duration)}
                                </div>
                            </div>
                        </div>

                        {/* Video Description/Tags */}
                        <div className="bg-white rounded-[40px] border border-[#E2E8F0] p-8 space-y-6">
                            <div>
                                <h2 className="text-[20px] font-black tracking-tight text-[#0F172A] mb-3">Description</h2>
                                <p className="text-[16px] font-bold text-[#64748B] leading-relaxed">
                                    {video.description || 'No description provided for this recording.'}
                                </p>
                            </div>
                            {video.tags && video.tags.length > 0 && (
                                <div className="pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Tag size={18} className="text-[#8c00ff]" />
                                        <h3 className="text-[16px] font-black text-[#0F172A]">Tags</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {video.tags.map((tag: string, i: number) => (
                                            <span key={i} className="px-3 py-1.5 bg-purple-50 text-[#8c00ff] text-[13px] font-black rounded-xl border border-purple-100">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Metadata & Creator */}
                    <div className="space-y-8">
                        {/* Summary Metrics */}
                        <div className="bg-white rounded-[40px] border border-[#E2E8F0] p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[#64748B]">
                                        <Eye size={16} />
                                        <span className="text-[13px] font-bold">Views</span>
                                    </div>
                                    <p className="text-[24px] font-black text-[#0F172A]">{formatNumber(video.views)}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[#64748B]">
                                        <HardDrive size={16} />
                                        <span className="text-[13px] font-bold">Size</span>
                                    </div>
                                    <p className="text-[24px] font-black text-[#0F172A]">{(video.file_size / (1024 * 1024)).toFixed(1)} <span className="text-[14px]">MB</span></p>
                                </div>
                            </div>
                            <div className="pt-8 border-t border-slate-50 space-y-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[#64748B]">
                                        <Calendar size={16} />
                                        <span className="text-[13px] font-bold">Uploaded On</span>
                                    </div>
                                    <p className="text-[16px] font-black text-[#0F172A]">{formatDate(video.created_at)}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[#64748B]">
                                        <Shield size={16} />
                                        <span className="text-[13px] font-bold">Privacy</span>
                                    </div>
                                    <p className="text-[16px] font-black text-[#0F172A]">Workspace - Internal</p>
                                </div>
                            </div>
                        </div>

                        {/* Creator Info */}
                        <div className="bg-white rounded-[40px] border border-[#E2E8F0] p-8 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-110 transition-transform">
                                <User size={120} />
                            </div>
                            <h3 className="text-[18px] font-black text-[#0F172A] mb-6">Uploaded By</h3>
                            <Link href={`/admin/users/${video.creator_id}`} className="flex items-center gap-4 group/user">
                                <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-[#8c00ff] to-[#3b82f6] flex items-center justify-center text-white text-[24px] font-black shadow-lg shadow-purple-100">
                                    {video.creator[0]}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[18px] font-black text-[#0F172A] group-hover/user:text-[#8c00ff] transition-colors line-clamp-1">{video.creator}</p>
                                    <p className="text-[14px] font-bold text-[#94A3B8] line-clamp-1">{video.creator_email}</p>
                                </div>
                            </Link>
                            <div className="mt-8">
                                <Link
                                    href={`/admin/users/${video.creator_id}`}
                                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-50 rounded-2xl text-[14px] font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-all active:scale-95"
                                >
                                    <User size={18} />
                                    View Full Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
};
