'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Globe,
    MapPin,
    Monitor,
    Clock,
    User as UserIcon,
    Shield,
    Database,
    Code,
    Navigation,
    Info,
    ExternalLink,
    Download
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getIPDetails, syncIPGeodata, IPInfo } from '@/services/admin/ipService';
import { toast } from 'sonner';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

export default function IPDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [ip, setIp] = useState<IPInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showRawJson, setShowRawJson] = useState(false);

    const fetchDetails = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getIPDetails(id);
            if (response.success) {
                setIp(response.data);
            } else {
                toast.error("IP record not found");
                router.push('/admin/ips');
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch IP details");
            router.push('/admin/ips');
        } finally {
            setIsLoading(false);
        }
    }, [id, router]);

    const handleSync = async () => {
        try {
            setIsSyncing(true);
            const response = await syncIPGeodata(id);
            if (response.success) {
                setIp(response.data);
                toast.success(response.message || "Geodata synced successfully");
            } else {
                toast.error(response.message || "Failed to sync geodata");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to sync geodata");
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        if (id) fetchDetails();
    }, [id, fetchDetails]);

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="animate-pulse space-y-8">
                    <div className="h-8 w-48 bg-slate-200 rounded" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="h-64 bg-slate-100 rounded-3xl" />
                            <div className="h-64 bg-slate-100 rounded-3xl" />
                        </div>
                        <div className="h-96 bg-slate-100 rounded-3xl" />
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!ip) return null;

    const formattedDate = new Date(ip.created_at).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    return (
        <AdminLayout>
            <div className="space-y-8 pb-20">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-500 hover:text-[#8c00ff] transition-colors w-fit group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[14px] font-semibold">Back to Logs</span>
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-[#8c00ff] shadow-sm shadow-purple-100">
                                <Globe size={32} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h1 className="text-[32px] font-bold tracking-tight text-slate-900">{ip.ip}</h1>
                                <div className="flex items-center gap-2 text-slate-500 text-[14px] mt-1">
                                    <Clock size={14} />
                                    <span>First seen {formattedDate}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-slate-700 text-[14px] font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
                            >
                                <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                                {isSyncing ? 'Syncing...' : 'Sync Geodata'}
                            </button>
                            <button
                                onClick={() => setShowRawJson(!showRawJson)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-[14px] font-bold ${showRawJson
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-slate-700 border-[#E2E8F0] hover:bg-slate-50'
                                    }`}
                            >
                                <Code size={18} />
                                {showRawJson ? 'View Interface' : 'View Source JSON'}
                            </button>
                        </div>
                    </div>
                </div>

                {showRawJson ? (
                    <div className="bg-[#0f172a] rounded-3xl p-8 border border-slate-800 shadow-2xl relative group">
                        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Raw Document</span>
                        </div>
                        <pre className="text-slate-300 font-mono text-[13px] leading-relaxed overflow-x-auto selection:bg-purple-500/30 selection:text-white">
                            {JSON.stringify(ip, null, 4)}
                        </pre>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Info */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Geolocation Section */}
                            <div className="bg-white rounded-[32px] border border-[#E2E8F0] p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                            <MapPin size={20} />
                                        </div>
                                        <h2 className="text-[20px] font-bold text-slate-900">Geolocation Data</h2>
                                    </div>
                                    {ip.geodata && Object.keys(ip.geodata).length > 0 && (
                                        <button
                                            onClick={handleSync}
                                            disabled={isSyncing}
                                            className="text-[#8c00ff] hover:opacity-80 transition-opacity"
                                        >
                                            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                                        </button>
                                    )}
                                </div>

                                {ip.geodata && Object.keys(ip.geodata).length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                                            <DataPoint label="Country" value={ip.geodata?.country || 'Unknown'} icon={<Globe size={16} />} />
                                            <DataPoint label="City" value={ip.geodata?.city || 'Unknown'} icon={<MapPin size={16} />} />
                                            <DataPoint label="Region" value={ip.geodata?.region || 'Unknown'} icon={<Navigation size={16} />} />
                                            <DataPoint label="Timezone" value={ip.geodata?.timezone || 'Unknown'} icon={<Clock size={16} />} />
                                            <DataPoint label="Latitude" value={ip.geodata?.latitude?.toString() || 'Unknown'} />
                                            <DataPoint label="Longitude" value={ip.geodata?.longitude?.toString() || 'Unknown'} />
                                            <DataPoint label="ISP" value={ip.geodata?.isp || 'Unknown'} />
                                            <DataPoint label="ASN" value={ip.geodata?.asn || 'Unknown'} />
                                        </div>

                                        {ip.geodata?.latitude && ip.geodata?.longitude && (
                                            <div className="mt-10 pt-10 border-t border-slate-100">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Map Preview</span>
                                                    <a
                                                        href={`https://www.google.com/maps?q=${ip.geodata.latitude},${ip.geodata.longitude}`}
                                                        target="_blank"
                                                        className="text-[12px] font-bold text-[#8c00ff] flex items-center gap-1 hover:underline"
                                                    >
                                                        Open Google Maps <ExternalLink size={12} />
                                                    </a>
                                                </div>
                                                <div className="w-full h-48 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden relative group">
                                                    <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=${ip.geodata.latitude},${ip.geodata.longitude}&zoom=10&size=600x300&key=')] bg-cover bg-center opacity-40 blur-[2px] text-xs transition-opacity duration-300 group-hover:blur-0" />
                                                    <div className="relative z-10 flex flex-col items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-red-500 animate-bounce">
                                                            <MapPin size={24} fill="currentColor" fillOpacity={0.2} />
                                                        </div>
                                                        <span className="text-[13px] font-bold text-slate-800 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">
                                                            {ip.geodata.latitude}, {ip.geodata.longitude}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-[24px] bg-slate-50/50">
                                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-300 mb-6 shadow-sm">
                                            <Globe size={32} />
                                        </div>
                                        <h3 className="text-[16px] font-bold text-slate-900 mb-2">No Geodata Available</h3>
                                        <p className="text-[14px] text-slate-500 text-center max-w-[280px] mb-8">
                                            Geolocation data for this IP address has not been fetched yet.
                                        </p>
                                        <button
                                            onClick={handleSync}
                                            disabled={isSyncing}
                                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#8c00ff] text-white text-[14px] font-bold shadow-lg shadow-purple-100 hover:bg-[#7c00e0] transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {isSyncing ? (
                                                <RefreshCw size={18} className="animate-spin" />
                                            ) : (
                                                <Download size={18} />
                                            )}
                                            {isSyncing ? 'Fetching...' : 'Fetch Geolocation Now'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Request Details */}
                            <div className="bg-white rounded-[32px] border border-[#E2E8F0] p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                        <Info size={20} />
                                    </div>
                                    <h2 className="text-[20px] font-bold text-slate-900">Request Analytics</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                                    <DataPoint
                                        label="Source Action"
                                        value={ip.source.replace('_', ' ')}
                                        badge="cyan"
                                        icon={<Shield size={16} />}
                                    />
                                    <DataPoint
                                        label="Device Type"
                                        value={ip.device_type || 'Unknown'}
                                        icon={<Monitor size={16} />}
                                    />
                                    <DataPoint
                                        label="Is Geo Fetched"
                                        value={ip.is_geo_data_fetched ? 'Yes' : 'No'}
                                        icon={<Database size={16} />}
                                    />
                                    <DataPoint
                                        label="Data ID"
                                        value={ip._id}
                                        icon={<Code size={16} />}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* User Association */}
                            <div className="bg-white rounded-[32px] border border-[#E2E8F0] p-8 shadow-sm overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8c00ff]/[0.02] rounded-full -mr-16 -mt-16" />

                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#8c00ff]">
                                        <UserIcon size={20} />
                                    </div>
                                    <h2 className="text-[20px] font-bold text-slate-900">User Association</h2>
                                </div>

                                {ip.user_info ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8c00ff] to-[#7c3aed] flex items-center justify-center text-white text-[20px] font-bold shadow-lg shadow-purple-200">
                                                {ip.user_info.name[0]}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[16px] font-bold text-slate-900 truncate">{ip.user_info.name}</span>
                                                <span className="text-[13px] text-slate-500 truncate">{ip.user_info.email}</span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/admin/users/${ip.user_info.id}`}
                                            className="block w-full text-center py-3 rounded-xl bg-slate-50 border border-slate-200 text-[#0F172A] text-[14px] font-bold hover:bg-slate-100 transition-colors"
                                        >
                                            View Profile
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-4 pb-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
                                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4 mb-4">
                                            <UserIcon size={32} />
                                        </div>
                                        <p className="text-[14px] font-semibold text-slate-400">Anonymous Request</p>
                                        <p className="text-[12px] text-slate-400 mt-1 max-w-[180px] text-center">No user was authenticated when this IP was logged.</p>
                                    </div>
                                )}
                            </div>

                            {/* Info Card */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <Shield className="text-purple-400 mb-6" size={32} />
                                    <h3 className="text-[20px] font-bold mb-3">Security Note</h3>
                                    <p className="text-[14px] text-slate-400 leading-relaxed mb-6">
                                        IP logs are automatically collected for security auditing and to prevent abuse. Geolocation data is provided by internal lookup services and may have slight inaccuracies.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold uppercase tracking-wider">Audit Log</span>
                                        <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold uppercase tracking-wider">GDPR Compliant</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full -mb-24 -mr-24 blur-3xl" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function DataPoint({ label, value, icon, badge }: { label: string; value: string; icon?: React.ReactNode; badge?: string }) {
    return (
        <div className="flex flex-col gap-2 min-w-0">
            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                {icon}
                {label}
            </span>
            <span className={`text-[15px] font-bold text-slate-700 truncate ${badge ? 'inline-block px-2.5 py-0.5 rounded-lg bg-cyan-50 text-cyan-700 w-fit' : ''}`}>
                {value}
            </span>
        </div>
    );
}
