'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BarChart2, Globe, Wifi, Loader2, Edit } from 'lucide-react';
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
import LineChartTooltip from '@/components/admin/charts/LineChartTooltip';
import {
    adminBlogService,
    type BlogAnalyticsData,
    type TopIP,
} from '@/services/admin/blogService';

const SOURCE_COLORS: Record<string, string> = {
    linkedin:  '#0077B5',
    twitter:   '#000000',
    facebook:  '#1877F2',
    instagram: '#E4405F',
    reddit:    '#FF4500',
    tiktok:    '#010101',
    direct:    '#8c00ff',
};

function formatNumber(n: number) {
    return new Intl.NumberFormat('en-US').format(n);
}

function formatDate(iso: string | null) {
    if (!iso) return '—';
    const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SourceBadge({ source }: { source: string }) {
    const color = SOURCE_COLORS[source] ?? '#64748b';
    return (
        <span
            className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold capitalize text-white"
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

export default function BlogAnalyticsPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const [postTitle, setPostTitle] = useState<string>('');
    const [analytics, setAnalytics] = useState<BlogAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        Promise.all([
            adminBlogService.get(params.id),
            adminBlogService.getAnalytics(params.id),
        ])
            .then(([post, data]) => {
                if (cancelled) return;
                setPostTitle(post.title ?? 'Untitled');
                setAnalytics(data);
            })
            .catch(() => {
                if (!cancelled) toast.error('Failed to load analytics');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [params.id]);

    const topSource =
        analytics
            ? (Object.entries(analytics.views_by_source).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—')
            : '—';

    const activeSources = analytics
        ? Object.keys(analytics.views_by_source).filter((s) => (analytics.views_by_source[s] ?? 0) > 0)
        : [];

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1400px] space-y-6 pb-20">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <button
                            onClick={() => router.push('/admin/blog')}
                            className="mb-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 hover:text-slate-700"
                        >
                            <ArrowLeft size={13} /> Back to posts
                        </button>
                        <h1 className="text-[26px] font-black tracking-tight text-slate-900 line-clamp-1">
                            {postTitle || 'Analytics'}
                        </h1>
                        <p className="mt-0.5 text-[13px] text-slate-500">Traffic, sources, and visitor breakdown</p>
                    </div>
                    <button
                        onClick={() => router.push(`/admin/blog/${params.id}`)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        <Edit size={14} /> Edit post
                    </button>
                </div>

                {loading ? (
                    <div className="flex min-h-[400px] items-center justify-center text-slate-400">
                        <Loader2 size={20} className="mr-2 animate-spin" /> Loading analytics…
                    </div>
                ) : !analytics ? null : (
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
                                value={topSource === '—' ? '—' : topSource}
                                icon={Globe}
                                color={SOURCE_COLORS[topSource] ?? '#64748b'}
                            />
                            <StatCard
                                label="Unique IPs"
                                value={formatNumber(analytics.top_ips.length)}
                                icon={Wifi}
                                color="#3b82f6"
                            />
                        </div>

                        {/* Views over time */}
                        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-[15px] font-bold text-slate-900">Views over time</h3>
                            {analytics.daily_stats.length === 0 ? (
                                <div className="flex h-56 items-center justify-center text-[13px] text-slate-400">
                                    No data yet
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart
                                        data={analytics.daily_stats}
                                        margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                                    >
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
                                            content={<LineChartTooltip />}
                                            cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 2' }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                                        {activeSources.map((source) => (
                                            <Line
                                                key={source}
                                                type="monotone"
                                                dataKey={source}
                                                name={source}
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

                        {/* Top IPs */}
                        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-4">
                                <h3 className="text-[15px] font-bold text-slate-900">Top visitors</h3>
                                <p className="mt-0.5 text-[12px] text-slate-400">
                                    {analytics.top_ips.length} unique IP{analytics.top_ips.length !== 1 ? 's' : ''} tracked
                                </p>
                            </div>
                            {analytics.top_ips.length === 0 ? (
                                <div className="py-14 text-center text-[13px] text-slate-400">No visitor data yet</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/60">
                                                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">IP</th>
                                                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Location</th>
                                                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Views</th>
                                                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Sources</th>
                                                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Last seen</th>
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
                                                            : (row.country ?? '—')}
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
                )}
            </div>
        </AdminLayout>
    );
}
