'use client';

import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
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
    MoreHorizontal,
    FileText,
    AlertTriangle,
    Info,
    Settings,
    Activity,
    Monitor,
    Wifi,
    ExternalLink,
    ScrollText,
    CheckCircle2,
    XCircle,
    Zap,
    Clapperboard,
    ImageIcon,
    Cpu,
    Upload,
    Braces,
    X,
    ChevronDown,
    ChevronRight,
    type LucideIcon,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tooltip } from '@/components/ui/Tooltip';
import { AdminVideoPlayer } from '@/components/ui/AdminVideoPlayer';
import { videoService, Video as VideoType, ViewRecord, AppLog } from '@/services/admin/videoService';
import { toast } from 'sonner';
import { DASHBOARD_APP_URL, MEDIA_API_URL } from '@/lib/constants';

export default function VideoDetailPage() {
    const params = useParams();
    const router = useRouter();
    const videoId = params.id as string;

    const [video, setVideo] = useState<VideoType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'transcription' | 'reports' | 'views' | 'tech' | 'logs'>('overview');
    const [isDeleting, setIsDeleting] = useState(false);
    const [logs, setLogs] = useState<AppLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsFetched, setLogsFetched] = useState(false);
    const [logFilter, setLogFilter] = useState<string | null>(null);
    const [showJsonModal, setShowJsonModal] = useState(false);

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

    useEffect(() => {
        if (activeTab !== 'logs' || logsFetched || !video?.encrypted_id) return;
        const fetchLogs = async () => {
            setLogsLoading(true);
            try {
                const res = await videoService.getVideoLogs(video.encrypted_id);
                setLogs(res.data || []);
            } catch {
                toast.error('Failed to load activity logs');
            } finally {
                setLogsLoading(false);
                setLogsFetched(true);
            }
        };
        fetchLogs();
    }, [activeTab, logsFetched, video?.encrypted_id]);

    const handleReportStatus = async (reportId: string, status: string) => {
        try {
            const res = await videoService.updateReportStatus(reportId, status);
            if (res.status === 'success') {
                toast.success(`Report marked as ${status}`);
                // Update local state to reflect change
                if (video) {
                    setVideo({
                        ...video,
                        reports: video.reports?.filter(r => r.id !== reportId)
                    });
                }
            } else {
                toast.error(res.message || "Failed to update report status");
            }
        } catch (error: any) {
            toast.error("An error occurred while updating report status");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this video? This action cannot be undone.")) return;

        try {
            setIsDeleting(true);
            const res = await videoService.deleteVideo(videoId);
            if (res.status === 'success') {
                toast.success("Video deleted successfully");
                router.push('/admin/videos');
            } else {
                toast.error(res.message || "Failed to delete video");
            }
        } catch (error: any) {
            toast.error("An error occurred while deleting the video");
        } finally {
            setIsDeleting(false);
        }
    };

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
            <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-[#E2E8F0] shadow-sm">
                    <div className="flex items-center gap-5">
                        <Link
                            href="/admin/videos"
                            className="p-3 rounded-2xl border border-[#E2E8F0] bg-white hover:bg-slate-50 transition-all group active:scale-90"
                        >
                            <ArrowLeft size={20} className="text-[#64748B] group-hover:text-[#0F172A]" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-[24px] font-black tracking-tight text-[#0F172A] line-clamp-1 max-w-[600px]">
                                    {video.title || 'Untitled Recording'}
                                </h1>
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${video.status === 'completed' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                    }`}>
                                    {video.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-[13px] font-bold text-[#64748B]">
                                <span className="opacity-60 font-mono">ID: {video.encrypted_id}</span>
                                <span className="opacity-20">•</span>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={14} />
                                    <span>{formatDuration(video.duration)}</span>
                                </div>
                                <span className="opacity-20">•</span>
                                <div className="flex items-center gap-1.5">
                                    <Eye size={14} />
                                    <span>{formatNumber(video.views)} views</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href={`${DASHBOARD_APP_URL}/v/${video.encrypted_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-[#E2E8F0] text-[#0F172A] text-[14px] font-bold hover:bg-slate-50 transition-all active:scale-95"
                        >
                            <ExternalLink size={18} />
                            View Video
                        </a>
                        <button
                            disabled={isDeleting}
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-50 text-red-600 text-[14px] font-bold hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <Trash2 size={18} />
                            Delete Video
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-[#E2E8F0] w-fit">
                        {[
                            { id: 'overview', label: 'Overview', icon: Info },
                            { id: 'transcription', label: 'Transcription', icon: FileText },
                            { id: 'reports', label: `Reports (${video.reports?.length || 0})`, icon: AlertTriangle, color: video.reports?.length ? 'text-red-500' : '' },
                            { id: 'views', label: `Views (${video.views_list?.length || video.views || 0})`, icon: Eye },
                            { id: 'tech', label: 'Technical Info', icon: Activity },
                            { id: 'logs', label: 'Activity Log', icon: ScrollText },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]'
                                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/50'
                                    }`}
                            >
                                <tab.icon size={16} className={tab.color} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowJsonModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#E2E8F0] text-[#64748B] text-[13px] font-bold hover:border-[#8c00ff] hover:text-[#8c00ff] hover:bg-[#f3eefe] transition-all active:scale-95 shrink-0"
                    >
                        <Braces size={15} />
                        Raw JSON
                    </button>
                </div>

                {showJsonModal && (
                    <JsonModal data={video} onClose={() => setShowJsonModal(false)} />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Video Player */}
                                {(() => {
                                    const storageUrl = video.media_info?.storage_url;
                                    const posterSrc = video.thumbnail && storageUrl
                                        ? `${storageUrl}/${video.thumbnail}`
                                        : null;
                                    const token = video.stream_token;
                                    if (!token || video.status !== 'completed') {
                                        return (
                                            <div className="aspect-video bg-black rounded-[40px] overflow-hidden border border-[#E2E8F0] shadow-xl flex items-center justify-center">
                                                {posterSrc
                                                    ? <img src={posterSrc} alt="" className="w-full h-full object-cover opacity-60" />
                                                    : <div className="flex flex-col items-center gap-3 text-white/30">
                                                        <Video size={80} strokeWidth={1} />
                                                        <span className="text-[13px] font-bold">Video not ready</span>
                                                    </div>
                                                }
                                            </div>
                                        );
                                    }
                                    const hlsBase = `${MEDIA_API_URL}/hls/${video.encrypted_id}`;
                                    const q = `?password_token=${encodeURIComponent(token)}`;
                                    const screenUrl = `${hlsBase}/screen/master.m3u8${q}`;
                                    const cameraUrl = video.media_info?.camera?.master
                                        ? `${hlsBase}/camera/master.m3u8${q}`
                                        : null;
                                    // Audio uses index.m3u8 (no master playlist), keyed by audio.hls field
                                    const audioUrl = video.media_info?.audio?.hls
                                        ? `${hlsBase}/audio/index.m3u8${q}`
                                        : null;
                                    return (
                                        <AdminVideoPlayer
                                            screenUrl={screenUrl}
                                            cameraUrl={cameraUrl}
                                            audioUrl={audioUrl}
                                            posterUrl={posterSrc}
                                            duration={video.duration}
                                        />
                                    );
                                })()}

                                {/* Details Card */}
                                <div className="bg-white rounded-[40px] border border-[#E2E8F0] p-8 space-y-8">
                                    <div>
                                        <h2 className="text-[20px] font-black tracking-tight text-[#0F172A] mb-4">Description</h2>
                                        <p className="text-[15px] font-medium text-[#64748B] leading-relaxed">
                                            {video.description || 'No description provided for this recording.'}
                                        </p>
                                    </div>

                                </div>

                                {video.media_info && <MediaInfoSection mediaInfo={video.media_info} />}
                            </div>
                        )}

                        {activeTab === 'transcription' && (
                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                <InfoTable
                                    title="Transcription Settings"
                                    icon={<FileText size={15} className="text-[#8c00ff]" />}
                                    data={{
                                        allow_transcription: video.allow_transcription ?? null,
                                        allow_chapters: video.allow_chapters ?? null,
                                        is_transcribed: video.is_transcribed ?? null,
                                        transcription_status: video.transcription_status ?? null,
                                    }}
                                />
                            <div className="bg-white rounded-[40px] border border-[#E2E8F0] p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-[24px] font-black text-[#0F172A]">Transcription</h2>
                                    <button className="text-[14px] font-black text-[#8c00ff] hover:underline">Download Text</button>
                                </div>
                                {video.transcription ? (
                                    <div className="text-[16px] font-medium text-[#64748B] leading-loose space-y-4">
                                        {video.transcription.split('\n').map((para, i) => (
                                            <p key={i}>{para}</p>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                                        <FileText size={48} className="text-slate-200 mb-4" />
                                        <p className="font-bold text-slate-400">No transcription available for this video.</p>
                                    </div>
                                )}

                                {video.chapters && video.chapters.length > 0 && (
                                    <div className="pt-10 border-t border-slate-50">
                                        <h3 className="text-[20px] font-black text-[#0F172A] mb-6">Chapters</h3>
                                        <div className="grid gap-4">
                                            {video.chapters.map((chapter: any, i: number) => (
                                                <div key={i} className="flex items-center gap-6 p-5 rounded-3xl border border-slate-100 hover:border-purple-100 hover:bg-purple-50/30 transition-all cursor-pointer">
                                                    <span className="font-mono text-[13px] font-black text-[#8c00ff] px-3 py-1 bg-white rounded-xl shadow-sm border border-purple-50">
                                                        {formatDuration(chapter.timestamp)}
                                                    </span>
                                                    <p className="font-black text-[#0F172A]">{chapter.title}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            </div>
                        )}

                        {activeTab === 'reports' && (
                            <div className="bg-white rounded-[40px] border border-[#E2E8F0] p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-[24px] font-black text-[#0F172A]">User Reports</h2>
                                    <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full font-black text-[12px]">
                                        {video.reports?.length || 0} Flags
                                    </span>
                                </div>

                                {video.reports && video.reports.length > 0 ? (
                                    <div className="grid gap-6">
                                        {video.reports.map((report: any) => (
                                            <div key={report.id} className="p-8 rounded-[32px] border border-red-50 bg-red-50/10 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                            <AlertTriangle size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-[#0F172A] capitalize">{report.reason}</p>
                                                            <p className="text-[13px] font-bold text-[#64748B]">Reported by {report.reporter_name}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[12px] font-bold text-[#94A3B8]">{formatDate(report.created_at)}</span>
                                                </div>
                                                <p className="text-[15px] font-medium text-slate-600 bg-white p-4 rounded-2xl border border-red-50">
                                                    {report.details || "No additional details provided."}
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleReportStatus(report.id, 'resolved')}
                                                        className="px-4 py-2 bg-white border border-red-100 text-red-600 text-[12px] font-black rounded-xl hover:bg-red-50 transition-colors"
                                                    >
                                                        Resolve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReportStatus(report.id, 'dismissed')}
                                                        className="px-4 py-2 bg-white border border-slate-100 text-slate-600 text-[12px] font-black rounded-xl hover:bg-slate-50 transition-colors"
                                                    >
                                                        Dismiss
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 bg-green-50 rounded-[32px] border border-dashed border-green-200">
                                        <Shield size={48} className="text-green-200 mb-4" />
                                        <p className="font-bold text-green-400">No reports found for this video. Safe!</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'views' && (
                            <div className="bg-white rounded-[40px] border border-[#E2E8F0] overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
                                <div className="px-8 py-5 border-b border-[#F1F5F9] flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Eye size={20} />
                                        </div>
                                        <h2 className="text-[20px] font-black text-[#0F172A]">View History</h2>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-slate-100 text-[#64748B] text-[12px] font-bold">
                                        {video.views_list?.length || 0} Records
                                    </span>
                                </div>

                                {video.views_list && video.views_list.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-50/60 border-b border-[#F1F5F9]">
                                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-10">#</th>
                                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Viewer</th>
                                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Device</th>
                                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">IP Address</th>
                                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Viewed At</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {video.views_list.map((view: ViewRecord, i: number) => (
                                                    <tr key={i} className="hover:bg-slate-50/60 transition-colors group">
                                                        <td className="px-6 py-4 text-[12px] font-bold text-slate-300 tabular-nums">{i + 1}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8c00ff] to-blue-500 flex items-center justify-center text-white text-[13px] font-black shrink-0">
                                                                    {view.user_name ? view.user_name[0].toUpperCase() : '?'}
                                                                </div>
                                                                {view.user_name ? (
                                                                    <div>
                                                                        <p className="text-[13px] font-bold text-[#0F172A] leading-tight">{view.user_name}</p>
                                                                        {view.user_email && (
                                                                            <Tooltip text={view.user_email} side="bottom">
                                                                                <p className="text-[11px] text-slate-400 font-medium max-w-[160px] truncate">{view.user_email}</p>
                                                                            </Tooltip>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[13px] text-slate-400 italic">Anonymous</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${
                                                                view.device_type === 'MOBILE'
                                                                    ? 'bg-blue-50 text-blue-600'
                                                                    : view.device_type === 'DESKTOP'
                                                                        ? 'bg-purple-50 text-[#8c00ff]'
                                                                        : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                                {view.device_type === 'MOBILE' ? <Monitor size={11} /> : <Monitor size={11} />}
                                                                {view.device_type?.toLowerCase() || 'unknown'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {view.ip_doc_id ? (
                                                                <Tooltip text="View IP details" side="top">
                                                                    <a
                                                                        href={`/admin/ips/${view.ip_doc_id}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="font-mono text-[12px] text-[#8c00ff] hover:underline"
                                                                    >
                                                                        {view.ip_address || '—'}
                                                                    </a>
                                                                </Tooltip>
                                                            ) : (
                                                                <span className="font-mono text-[12px] text-slate-500">
                                                                    {view.ip_address || '—'}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {view.created_at ? (
                                                                <Tooltip text={new Date(view.created_at).toLocaleString()} side="top">
                                                                    <div>
                                                                        <p className="text-[13px] font-bold text-slate-700">
                                                                            {new Date(view.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                        </p>
                                                                        <p className="text-[11px] text-slate-400 font-medium">
                                                                            {new Date(view.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                                        </p>
                                                                    </div>
                                                                </Tooltip>
                                                            ) : <span className="text-slate-300">—</span>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50">
                                        <Eye size={48} className="text-slate-200 mb-4" />
                                        <p className="font-bold text-slate-400">No views recorded for this video yet.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'logs' && (
                            <div className="bg-white rounded-[40px] border border-[#E2E8F0] p-10 animate-in fade-in zoom-in-95 duration-300">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#f3eefe] flex items-center justify-center">
                                            <ScrollText size={20} className="text-[#8c00ff]" />
                                        </div>
                                        <h2 className="text-[20px] font-black text-[#0F172A]">Activity Journey</h2>
                                    </div>
                                    {!logsLoading && (
                                        <span className="px-3 py-1 rounded-full bg-slate-100 text-[#64748B] text-[12px] font-bold">
                                            {logs.length} {logs.length === 1 ? 'event' : 'events'}
                                        </span>
                                    )}
                                </div>

                                {logsLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="relative w-10 h-10">
                                            <div className="absolute inset-0 border-4 border-purple-100 rounded-full" />
                                            <div className="absolute inset-0 border-4 border-[#8c00ff] border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    </div>
                                ) : logs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                                        <ScrollText size={48} className="text-slate-200 mb-4" />
                                        <p className="font-bold text-slate-400">No activity logged for this recording yet.</p>
                                    </div>
                                ) : (() => {
                                    const activeStage = PIPELINE_STAGES.find(s => s.label === logFilter);
                                    const stageActions = activeStage
                                        ? new Set([...activeStage.success, ...activeStage.error, ...activeStage.pending])
                                        : null;
                                    const visibleLogs = stageActions
                                        ? logs.filter(l => stageActions.has(l.action))
                                        : logs;
                                    return (
                                        <>
                                            <PipelineOverview
                                                logs={logs}
                                                activeFilter={logFilter}
                                                onFilter={label => setLogFilter(prev => prev === label ? null : label)}
                                            />
                                            <div>
                                                {buildLogGroups(visibleLogs).map((group) =>
                                                    group.kind === 'regular' ? (
                                                        <LogEntry
                                                            key={group.log.created_at + group.log.action}
                                                            log={group.log}
                                                            prevLog={group.prevLog}
                                                            isLast={group.isLast}
                                                        />
                                                    ) : (
                                                        <MiniLogGroup
                                                            key={group.logs[0].created_at}
                                                            logs={group.logs}
                                                            prevLog={group.prevLog}
                                                            isLast={group.isLast}
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}

                        {activeTab === 'tech' && (
                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoTable
                                        title="Device Settings"
                                        icon={<Monitor size={15} className="text-[#3b82f6]" />}
                                        data={video.device_settings}
                                    />
                                    <InfoTable
                                        title="Audience Settings"
                                        icon={<Settings size={15} className="text-amber-500" />}
                                        data={video.audience_settings}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoTable
                                        title="Network Info"
                                        icon={<Wifi size={15} className="text-green-500" />}
                                        data={video.network_info}
                                    />
                                    <div className="space-y-4">
                                        <InfoTable
                                            title="System Info"
                                            icon={<Activity size={15} className="text-[#8c00ff]" />}
                                            data={video.system_info}
                                        />
                                        <InfoTable
                                            title="Source Info"
                                            icon={<Zap size={15} className="text-slate-400" />}
                                            data={video.source_info}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        {/* Engagement Summary */}
                        <InfoTable
                            title="Engagement Summary"
                            icon={<Activity size={15} className="text-[#8c00ff]" />}
                            data={{
                                'Total Views': formatNumber(video.views),
                                'File Size': `${(video.file_size / (1024 * 1024)).toFixed(1)} MB`,
                                'Status': video.status,
                                'Uploaded On': formatDate(video.created_at),
                                'Updated At': video.updated_at ? formatDate(video.updated_at) : '—',
                            }}
                        />

                        {/* Recording State */}
                        <InfoTable
                            title="Recording State"
                            icon={<Shield size={15} className="text-slate-400" />}
                            data={{
                                'Active': video.is_active === false ? 'No' : 'Yes',
                                'Deleted': video.is_deleted ? 'Yes' : 'No',
                                'Archived': video.is_archived ? 'Yes' : 'No',
                                'Folder': video.folder ? video.folder.name : '—',
                                'Folder ID': video.folder?.encrypted_id ?? '—',
                                'Workspace ID': video.workspace_id ?? '—',
                            }}
                        />

                        {/* Tags & Generation */}
                        {((video.tags && video.tags.length > 0) || (video.supported_generation_type_ids && video.supported_generation_type_ids.length > 0)) && (
                            <div className="bg-white rounded-[40px] border border-[#E2E8F0] p-6 space-y-4">
                                {video.tags && video.tags.length > 0 && (
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Tags</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {video.tags.map((tag, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-[#f3eefe] text-[#8c00ff] text-[11px] font-bold rounded-xl border border-purple-100">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {video.supported_generation_type_ids && video.supported_generation_type_ids.length > 0 && (
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Generation Types</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {video.supported_generation_type_ids.map((id, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-xl">
                                                    {id}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Creator Info */}
                        <div className="bg-[#0F172A] rounded-[40px] p-8 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 transform -rotate-12 group-hover:scale-110 transition-transform">
                                <User size={140} className="text-white" />
                            </div>
                            <h3 className="text-[18px] font-black text-white mb-6 relative z-10">Creator</h3>
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-[#8c00ff] to-[#3b82f6] flex items-center justify-center text-white text-[24px] font-black shadow-xl shadow-black/20">
                                        {video.creator?.[0] || 'U'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[18px] font-black text-white truncate">{video.creator}</p>
                                        <p className="text-[14px] font-bold text-slate-400 truncate">{video.creator_email}</p>
                                    </div>
                                </div>
                                <Link
                                    href={`/admin/users/${video.creator_id}`}
                                    className="flex items-center justify-center gap-2 w-full py-4 bg-white/10 backdrop-blur-md rounded-2xl text-[14px] font-bold text-white hover:bg-white/20 transition-all active:scale-95 border border-white/5"
                                >
                                    <User size={18} />
                                    View Full Profile
                                </Link>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-[40px] border border-[#E2E8F0] p-8 space-y-6">
                            <h3 className="text-[18px] font-black text-[#0F172A]">Operations</h3>
                            <div className="grid gap-3">
                                <ActionButton icon={Download} label="Download Proxy" />
                                <ActionButton icon={Share2} label="Share Admin Link" />
                                <ActionButton icon={Settings} label="Content Settings" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function toLabel(key: string) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function CellValue({ value }: { value: any }) {
    if (value === null || value === undefined || value === '') {
        return <span className="text-slate-300 font-mono text-[11px]">—</span>;
    }
    if (typeof value === 'boolean') {
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide ${value ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                {value ? 'Yes' : 'No'}
            </span>
        );
    }
    if (typeof value === 'number') {
        return <span className="font-mono text-[12px] font-bold text-[#0F172A]">{value === -1 ? '∞' : value}</span>;
    }
    const str = String(value);
    const handleCopy = () => {
        navigator.clipboard.writeText(str);
        toast.success('Copied!');
    };
    return (
        <Tooltip text={str} side="top" className="w-full">
            <span
                onClick={handleCopy}
                className="text-[12px] font-bold text-[#0F172A] truncate block w-full text-right cursor-pointer hover:text-[#8c00ff] transition-colors"
            >
                {str}
            </span>
        </Tooltip>
    );
}

function InfoTable({ title, icon, data }: { title: string; icon: ReactNode; data: Record<string, any> | null | undefined }) {
    if (!data) {
        return (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-[#F1F5F9]">
                    {icon}
                    <span className="text-[13px] font-black text-[#0F172A]">{title}</span>
                </div>
                <p className="px-5 py-3 text-[12px] text-slate-400 font-medium italic">No data recorded</p>
            </div>
        );
    }

    const entries = Object.entries(data).filter(([, v]) => v !== undefined);

    return (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#F1F5F9] bg-slate-50/60">
                {icon}
                <span className="text-[13px] font-black text-[#0F172A]">{title}</span>
                <span className="ml-auto text-[11px] font-bold text-slate-300">{entries.length} fields</span>
            </div>
            <div>
                    {entries.map(([key, value], i) => (
                        <div key={key} className={`flex items-center gap-4 px-5 py-2 border-b border-[#F8FAFC] last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                            <span className="flex-1 min-w-0 text-[11px] font-medium text-[#475569] tracking-wide">
                                {toLabel(key)}
                            </span>
                            <div className="flex-1 min-w-0">
                                <CellValue value={value} />
                            </div>
                        </div>
                    ))}
                </div>
        </div>
    );
}

function ResolutionsTable({ resolutions }: { resolutions: Record<string, any> }) {
    const entries = Object.entries(resolutions);
    if (!entries.length) return null;
    return (
        <div className="mt-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Resolutions</p>
            <div className="rounded-xl overflow-hidden border border-[#F1F5F9]">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                            <th className="px-3 py-2">Quality</th>
                            <th className="px-3 py-2">Size</th>
                            <th className="px-3 py-2">Bitrate</th>
                            <th className="px-3 py-2 max-w-[160px]">Playlist</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F8FAFC]">
                        {entries.map(([res, info]) => (
                            <tr key={res} className="text-[11px]">
                                <td className="px-3 py-2 font-black text-[#8c00ff]">{res}</td>
                                <td className="px-3 py-2 font-mono text-slate-600">{info.width}×{info.height}</td>
                                <td className="px-3 py-2 font-mono text-slate-600">{(parseInt(info.bitrate) / 1_000_000).toFixed(1)} Mbps</td>
                                <td className="px-3 py-2 font-mono text-slate-400 max-w-[160px] truncate" title={info.playlist}>{info.playlist}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
    const [scale, setScale] = React.useState(1);

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const onWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        setScale(s => Math.min(4, Math.max(0.5, s - e.deltaY * 0.001)));
    };

    return (
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="relative flex items-center justify-center"
                style={{ width: '70vw', height: '70vh' }}
                onClick={e => e.stopPropagation()}
                onWheel={onWheel}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute -top-4 -right-4 z-10 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>

                {/* Zoom hint */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white/60 text-[11px] font-medium select-none pointer-events-none">
                    {Math.round(scale * 100)}% · scroll to zoom
                </div>

                <img
                    src={src}
                    alt=""
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-transform duration-100 cursor-zoom-in select-none"
                    style={{ transform: `scale(${scale})` }}
                    draggable={false}
                />
            </div>
        </div>
    );
}

function ThumbnailsSection({ thumbnails, storageUrl }: { thumbnails: Record<string, any>; storageUrl?: string }) {
    const [lightboxSrc, setLightboxSrc] = React.useState<string | null>(null);
    const entries = Object.entries(thumbnails);
    if (!entries.length) return null;
    return (
        <div className="mt-2">
            {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Thumbnails</p>
            <div className="flex flex-wrap gap-3">
                {entries.map(([size, info]) => {
                    const src = storageUrl && info.path ? `${storageUrl}/${info.path}` : null;
                    return (
                        <div
                            key={size}
                            className="flex items-center gap-2 p-2 rounded-xl border border-[#F1F5F9] bg-slate-50 cursor-pointer hover:border-[#8c00ff]/30 hover:bg-purple-50/30 transition-all"
                            onClick={() => src && setLightboxSrc(src)}
                        >
                            {src && (
                                <div className="w-24 h-14 rounded-lg overflow-hidden border border-slate-200 bg-black flex-shrink-0">
                                    <img src={src} alt={size} className="w-full h-full object-contain" />
                                </div>
                            )}
                            <div>
                                <p className="text-[11px] font-black text-[#8c00ff] uppercase">{size}</p>
                                <p className="text-[10px] font-mono text-slate-400">{info.width}×{info.height}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function TrackSection({ title, color, data, storageUrl }: { title: string; color: string; data: Record<string, any>; storageUrl?: string }) {
    const { resolutions, thumbnails, ...flat } = data;
    const flatEntries = Object.entries(flat).filter(([, v]) => v !== undefined && v !== null);

    return (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#F1F5F9] bg-slate-50/60">
                <Activity size={15} className={color} />
                <span className="text-[13px] font-black text-[#0F172A]">{title}</span>
                <span className="ml-auto text-[11px] font-bold text-slate-300">{flatEntries.length} fields</span>
            </div>
            <div className="px-5 py-3 space-y-1">
                {flatEntries.map(([key, value], i) => (
                    <div key={key} className={`flex items-center gap-4 py-1.5 ${i < flatEntries.length - 1 ? 'border-b border-[#F8FAFC]' : ''}`}>
                        <span className="flex-1 min-w-0 text-[11px] font-medium text-[#475569] tracking-wide">{toLabel(key)}</span>
                        <div className="flex-1 min-w-0">
                            <CellValue value={value} />
                        </div>
                    </div>
                ))}
                {resolutions && Object.keys(resolutions).length > 0 && (
                    <ResolutionsTable resolutions={resolutions} />
                )}
                {thumbnails && Object.keys(thumbnails).length > 0 && (
                    <ThumbnailsSection thumbnails={thumbnails} storageUrl={storageUrl} />
                )}
            </div>
        </div>
    );
}

function MediaInfoSection({ mediaInfo }: { mediaInfo: Record<string, any> }) {
    const { provider, storage_url, allow_lowest_resolutions, sprite_url, screen, camera, audio, combined, ...rest } = mediaInfo;

    const topLevel = Object.fromEntries(
        Object.entries({ provider, storage_url, allow_lowest_resolutions, sprite_url, ...rest })
            .filter(([, v]) => v !== undefined && v !== null)
    );

    const tracks = [
        { key: 'screen',   label: 'Screen Track',   color: 'text-[#3b82f6]',  data: screen   },
        { key: 'camera',   label: 'Camera Track',   color: 'text-[#8c00ff]',  data: camera   },
        { key: 'audio',    label: 'Audio Track',    color: 'text-green-500',  data: audio    },
        { key: 'combined', label: 'Combined Track', color: 'text-amber-500',  data: combined },
    ].filter(t => t.data && Object.keys(t.data).length > 0);

    return (
        <div className="space-y-3">
            <InfoTable
                title="Storage"
                icon={<HardDrive size={15} className="text-slate-400" />}
                data={topLevel}
            />
            {tracks.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                    {tracks.map(t => (
                        <TrackSection
                            key={t.key}
                            title={t.label}
                            color={t.color}
                            data={t.data}
                            storageUrl={storage_url}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function ActionButton({ icon: Icon, label }: any) {
    return (
        <button className="flex items-center gap-3 w-full p-4 rounded-2xl border border-slate-50 hover:border-slate-200 hover:bg-slate-50 transition-all font-bold text-[14px] text-slate-600 hover:text-[#0F172A]">
            <Icon size={18} />
            {label}
        </button>
    );
}

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
};

const LOG_LEVEL_CONFIG = {
    INFO:     { bg: 'bg-[#8c00ff]', ring: 'ring-purple-100', badge: 'bg-[#f3eefe] text-[#8c00ff]' },
    WARNING:  { bg: 'bg-amber-400', ring: 'ring-amber-100',  badge: 'bg-amber-50 text-amber-600' },
    ERROR:    { bg: 'bg-red-500',   ring: 'ring-red-100',    badge: 'bg-red-50 text-red-600' },
    CRITICAL: { bg: 'bg-red-700',   ring: 'ring-red-200',    badge: 'bg-red-100 text-red-800' },
} as const;


const SERVICE_LABEL: Record<string, string> = {
    lc_nodejs: 'Media Server',
    workers: 'Worker',
    lc_fastapi: 'API',
};

const PIPELINE_STAGES = [
    { label: 'Session',       icon: Clapperboard, success: ['recording_created', 'recording_finalized'], error: [],                                                              pending: [] },
    { label: 'Upload',        icon: Upload,        success: ['recording_finalized'],                      error: [],                                                              pending: ['recording_streaming_started'] },
    { label: 'Transcode',     icon: Cpu,           success: ['hls_transcode_complete'],                   error: ['transcode_plan_error', 'segment_transcode_error', 'hls_playlist_error'], pending: ['transcode_planned'] },
    { label: 'Thumbnail',     icon: ImageIcon,     success: ['thumbnail_generated'],                      error: ['thumbnail_failed'],                                            pending: ['thumbnail_queued', 'thumbnail_event_received'] },
    { label: 'Transcription', icon: FileText,      success: ['transcription_completed'],                  error: ['transcription_failed'],                                        pending: ['transcription_queued', 'transcription_started'] },
];

function toReadableAction(action: string) {
    return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatDelta(ms: number): string {
    if (ms < 1000) return `+${ms}ms`;
    if (ms < 60_000) return `+${(ms / 1000).toFixed(1)}s`;
    const m = Math.floor(ms / 60_000);
    const s = Math.floor((ms % 60_000) / 1000);
    return s > 0 ? `+${m}m ${s}s` : `+${m}m`;
}

function renderMetaValue(v: unknown): string {
    if (Array.isArray(v)) return v.join(', ');
    if (typeof v === 'object' && v !== null) return JSON.stringify(v);
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    return String(v);
}

function PipelineOverview({ logs, activeFilter, onFilter }: {
    logs: AppLog[];
    activeFilter: string | null;
    onFilter: (label: string) => void;
}) {
    const actionSet = new Set(logs.map(l => l.action));
    return (
        <div className="flex items-center gap-1.5 flex-wrap mb-6">
            {PIPELINE_STAGES.map((stage, i) => {
                const hasError    = stage.error.some(a => actionSet.has(a));
                const hasSuccess  = stage.success.some(a => actionSet.has(a));
                const hasActivity = [...stage.success, ...stage.error, ...stage.pending].some(a => actionSet.has(a));
                const isActive    = activeFilter === stage.label;

                let dotColor = 'bg-slate-300';
                let baseText = 'text-slate-400';
                if (hasSuccess && !hasError) { dotColor = 'bg-emerald-400'; baseText = 'text-slate-600'; }
                else if (hasError)           { dotColor = 'bg-red-400';     baseText = 'text-slate-600'; }
                else if (hasActivity)        { dotColor = 'bg-amber-400';   baseText = 'text-slate-600'; }

                const StageIcon = stage.icon;
                return (
                    <React.Fragment key={stage.label}>
                        <button
                            onClick={() => onFilter(stage.label)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                isActive
                                    ? 'bg-[#8c00ff] text-white'
                                    : `bg-slate-100 ${baseText} hover:bg-slate-200`
                            }`}
                        >
                            <StageIcon size={10} />
                            {stage.label}
                            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white/60' : dotColor}`} />
                        </button>
                        {i < PIPELINE_STAGES.length - 1 && (
                            <div className="w-3 h-px bg-slate-200 shrink-0" />
                        )}
                    </React.Fragment>
                );
            })}
            {activeFilter && (
                <button
                    onClick={() => onFilter(activeFilter)}
                    className="ml-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Clear
                </button>
            )}
        </div>
    );
}

type RegularGroup = { kind: 'regular'; log: AppLog; prevLog: AppLog | null; isLast: boolean };
type MiniGroup    = { kind: 'mini'; logs: AppLog[]; prevLog: AppLog | null; isLast: boolean };
type LogGroup = RegularGroup | MiniGroup;

function buildLogGroups(logs: AppLog[]): LogGroup[] {
    const groups: LogGroup[] = [];
    let i = 0;
    while (i < logs.length) {
        if (logs[i].is_mini) {
            const miniLogs: AppLog[] = [];
            while (i < logs.length && logs[i].is_mini) {
                miniLogs.push(logs[i++]);
            }
            groups.push({ kind: 'mini', logs: miniLogs, prevLog: null, isLast: false });
        } else {
            groups.push({ kind: 'regular', log: logs[i++], prevLog: null, isLast: false });
        }
    }
    for (let g = 0; g < groups.length; g++) {
        const prev = g > 0 ? groups[g - 1] : null;
        groups[g].prevLog = prev
            ? (prev.kind === 'regular' ? prev.log : prev.logs[prev.logs.length - 1])
            : null;
        groups[g].isLast = g === groups.length - 1;
    }
    return groups;
}

function MiniLogGroup({ logs, prevLog, isLast }: { logs: AppLog[]; prevLog: AppLog | null; isLast: boolean }) {
    const [expanded, setExpanded] = React.useState(false);
    const firstDate = new Date(logs[0].created_at);
    const lastDate  = new Date(logs[logs.length - 1].created_at);
    const deltaMs   = prevLog ? firstDate.getTime() - new Date(prevLog.created_at).getTime() : null;
    const action    = toReadableAction(logs[0].action);

    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center shrink-0 pt-[3px]">
                <div className="w-2 h-2 rounded-full shrink-0 bg-slate-300" />
                {!isLast && (
                    <div className="flex flex-col items-center flex-1 min-h-[24px]">
                        <div className="w-px flex-1 bg-slate-100" />
                        {deltaMs !== null && deltaMs >= 0 && (
                            <span className="text-[9px] font-bold text-slate-300 my-0.5 select-none leading-none">
                                {formatDelta(deltaMs)}
                            </span>
                        )}
                        <div className="w-px flex-1 bg-slate-100" />
                    </div>
                )}
            </div>

            <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-3'}`}>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1.5 text-left group w-full"
                >
                    {expanded
                        ? <ChevronDown size={11} className="text-slate-300 shrink-0" />
                        : <ChevronRight size={11} className="text-slate-300 shrink-0" />
                    }
                    <span className="text-[12px] text-slate-400 font-medium">
                        {logs.length} × {action}
                    </span>
                    <span className="text-[10px] text-slate-300 font-mono ml-1">
                        {firstDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        {logs.length > 1 && ` → ${lastDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
                    </span>
                </button>

                {expanded && (
                    <div className="mt-1.5 ml-1 border-l-2 border-dashed border-slate-100 pl-3 space-y-1">
                        {logs.map((log, i) => {
                            const metaEntries = Object.entries(log.metadata || {})
                                .filter(([, v]) => v !== null && v !== undefined && v !== '');
                            return (
                                <div key={i} className="flex items-baseline gap-2 flex-wrap">
                                    <span className="text-[10px] text-slate-300 font-mono shrink-0">
                                        {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                    {metaEntries.map(([k, v]) => (
                                        <span key={k} className="text-[10px] text-slate-400">
                                            {k}=<span className="text-slate-500 font-medium">{renderMetaValue(v)}</span>
                                        </span>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function LogEntry({ log, prevLog, isLast }: { log: AppLog; prevLog: AppLog | null; isLast: boolean }) {
    const cfg = LOG_LEVEL_CONFIG[log.level as keyof typeof LOG_LEVEL_CONFIG] ?? LOG_LEVEL_CONFIG.INFO;
    const metaEntries = Object.entries(log.metadata || {}).filter(([, v]) => v !== null && v !== undefined && v !== '');
    const date = new Date(log.created_at);
    const deltaMs = prevLog ? date.getTime() - new Date(prevLog.created_at).getTime() : null;

    return (
        <div className="flex gap-3">
            {/* Left: dot + connector */}
            <div className="flex flex-col items-center shrink-0 pt-[3px]">
                <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.bg}`} />
                {!isLast && (
                    <div className="flex flex-col items-center flex-1 min-h-[24px]">
                        <div className="w-px flex-1 bg-slate-100" />
                        {deltaMs !== null && deltaMs >= 0 && (
                            <span className="text-[9px] font-bold text-slate-300 my-0.5 select-none leading-none">
                                {formatDelta(deltaMs)}
                            </span>
                        )}
                        <div className="w-px flex-1 bg-slate-100" />
                    </div>
                )}
            </div>

            {/* Right: content */}
            <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-3'}`}>
                <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="text-[13px] font-bold text-[#0F172A] leading-snug">
                            {toReadableAction(log.action)}
                        </span>
                        {log.level !== 'INFO' && (
                            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
                                {log.level}
                            </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                            {SERVICE_LABEL[log.service] ?? log.service}
                        </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                        {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                </div>

                <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed">
                    {log.message}
                </p>

                {metaEntries.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                        {metaEntries.map(([k, v]) => (
                            <span key={k} className="text-[10px] text-slate-400">
                                {k}=<span className="text-slate-600 font-medium">{renderMetaValue(v)}</span>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function JsonModal({ data, onClose }: { data: object; onClose: () => void }) {
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Dynamically import to avoid SSR issues
    const [JsonView, setJsonView] = React.useState<React.ComponentType<any> | null>(null);
    React.useEffect(() => {
        import('@microlink/react-json-view').then(m => setJsonView(() => m.default));
    }, []);

    return (
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-6"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl max-h-[85vh] bg-[#0f1117] rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <Braces size={16} className="text-[#8c00ff]" />
                        <span className="text-[14px] font-black text-white">Raw JSON</span>
                        <span className="text-[11px] font-bold text-white/30 ml-1">
                            {JSON.stringify(data).length.toLocaleString()} chars
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                                copied
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white border border-white/10'
                            }`}
                        >
                            {copied ? 'Copied!' : 'Copy JSON'}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* JSON content */}
                <div className="overflow-y-auto flex-1 p-6">
                    {JsonView ? (
                        <JsonView
                            src={data}
                            theme="tomorrow"
                            collapsed={2}
                            enableClipboard={false}
                            displayDataTypes={false}
                            displayObjectSize={true}
                            style={{ background: 'transparent', fontSize: '13px', fontFamily: 'monospace' }}
                        />
                    ) : (
                        <pre className="text-[12px] text-white/70 font-mono leading-relaxed whitespace-pre-wrap break-all">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
}
