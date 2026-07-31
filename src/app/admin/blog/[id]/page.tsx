'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, BarChart2, Globe, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout';
import BlogForm from '@/components/admin/blog/BlogForm';
import {
    adminBlogService,
    type BlogPost,
    type BlogAnalyticsData,
    type TopIP,
} from '@/services/admin/blogService';

const SOURCE_COLORS: Record<string, string> = {
    linkedin: '#0077B5',
    twitter: '#000000',
    facebook: '#1877F2',
    instagram: '#E4405F',
    reddit: '#FF4500',
    tiktok: '#010101',
    direct: '#8c00ff',
};

function formatNumber(n: number) {
    return new Intl.NumberFormat('en-US').format(n);
}

function formatDate(iso: string | null) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SourceBadge({ source }: { source: string }) {
    const color = SOURCE_COLORS[source] ?? '#64748b';
    return (
        <span
            className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold text-white"
            style={{ backgroundColor: color }}
        >
            {source}
        </span>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-slate-500">{label}</p>
                <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: `${color}18`, color }}
                >
                    <Icon size={16} />
                </div>
            </div>
            <p className="mt-2 text-[26px] font-bold tracking-tight text-slate-900 tabular-nums">
                {value}
            </p>
        </div>
    );
}

function AnalyticsPanel({ postId }: { postId: string }) {
    const [analytics, setAnalytics] = useState<BlogAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        adminBlogService
            .getAnalytics(postId)
            .then((data) => {
                if (!cancelled) setAnalytics(data);
            })
            .catch(() => {
                if (!cancelled) toast.error('Failed to load analytics');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [postId]);

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center text-slate-400">
                <Loader2 size={20} className="mr-2 animate-spin" /> Loading analytics…
            </div>
        );
    }

    if (!analytics) return null;

    const topSource =
        Object.entries(analytics.views_by_source).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

    const uniqueIps = analytics.top_ips.length;

    // Determine which sources actually have data for the chart
    const activeSources = Object.keys(analytics.views_by_source).filter(
        (s) => (analytics.views_by_source[s] ?? 0) > 0,
    );

    return (
        <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    label="Total Views"
                    value={formatNumber(analytics.total_views)}
                    icon={BarChart2}
                    color="#8c00ff"
                />
                <StatCard
                    label="Top Source"
                    value={topSource}
                    icon={Globe}
                    color={SOURCE_COLORS[topSource] ?? '#64748b'}
                />
                <StatCard
                    label="Unique IPs"
                    value={formatNumber(uniqueIps)}
                    icon={Wifi}
                    color="#3b82f6"
                />
            </div>

            {/* Views over time chart */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-[15px] font-bold text-slate-900">Views over time</h3>
                {analytics.daily_stats.length === 0 ? (
                    <div className="flex h-[220px] items-center justify-center text-[13px] text-slate-400">
                        No data yet
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={analytics.daily_stats} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '12px',
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                            {activeSources.map((source) => (
                                <Line
                                    key={source}
                                    type="monotone"
                                    dataKey={source}
                                    stroke={SOURCE_COLORS[source] ?? '#64748b'}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Top IPs table */}
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                    <h3 className="text-[15px] font-bold text-slate-900">Top visitors</h3>
                </div>
                {analytics.top_ips.length === 0 ? (
                    <div className="py-12 text-center text-[13px] text-slate-400">No IP data yet</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/60">
                                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                        IP
                                    </th>
                                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                        Views
                                    </th>
                                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                        Sources
                                    </th>
                                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                        Last seen
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {analytics.top_ips.map((row: TopIP) => (
                                    <tr key={row.ip} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-3.5 font-mono text-[12px] text-slate-700">
                                            {row.ip}
                                        </td>
                                        <td className="px-6 py-3.5 text-[13px] text-slate-600">
                                            {row.city && row.country
                                                ? `${row.city}, ${row.country}`
                                                : row.country ?? '—'}
                                        </td>
                                        <td className="px-6 py-3.5 text-[13px] font-semibold tabular-nums text-slate-800">
                                            {formatNumber(row.count)}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex flex-wrap gap-1">
                                                {row.sources.map((s) => (
                                                    <SourceBadge key={s} source={s} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-[12px] text-slate-500">
                                            {formatDate(row.last_seen)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function EditBlogPostPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'editor' | 'analytics'>('editor');
    const [analyticsFetched, setAnalyticsFetched] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setIsLoading(true);
                const p = await adminBlogService.get(params.id);
                if (!cancelled) setPost(p);
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Failed to load post';
                    setError(message);
                    toast.error(message);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [params.id]);

    const handleTabChange = (tab: 'editor' | 'analytics') => {
        setActiveTab(tab);
        if (tab === 'analytics' && !analyticsFetched) {
            setAnalyticsFetched(true);
        }
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1400px]">
                {isLoading ? (
                    <div className="flex min-h-[400px] items-center justify-center text-slate-400">
                        <Loader2 size={20} className="mr-2 animate-spin" /> Loading post…
                    </div>
                ) : error || !post ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                        <p className="text-[14px] font-semibold text-slate-700">Post could not be loaded</p>
                        <p className="mt-1 text-[12px] text-slate-500">{error ?? 'Not found.'}</p>
                        <button
                            onClick={() => router.push('/admin/blog')}
                            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Back to posts
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Tab switcher */}
                        <div className="inline-flex overflow-hidden rounded-xl bg-slate-100 p-1">
                            <button
                                onClick={() => handleTabChange('editor')}
                                className={`rounded-lg px-4 py-1.5 text-[13px] font-bold transition-all ${
                                    activeTab === 'editor'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Editor
                            </button>
                            <button
                                onClick={() => handleTabChange('analytics')}
                                className={`rounded-lg px-4 py-1.5 text-[13px] font-bold transition-all ${
                                    activeTab === 'analytics'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Analytics
                            </button>
                        </div>

                        {activeTab === 'editor' ? (
                            <BlogForm mode="edit" initial={post} />
                        ) : (
                            analyticsFetched && <AnalyticsPanel postId={params.id} />
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
