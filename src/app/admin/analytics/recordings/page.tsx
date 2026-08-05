'use client';

import { useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    Activity,
    AlertTriangle,
    Building2,
    Camera,
    CheckCircle2,
    Clock,
    DollarSign,
    Eye,
    Gauge,
    Globe,
    HardDrive,
    Layers,
    Mic,
    Radio,
    RefreshCw,
    Share2,
    TrendingUp,
    Users,
    Wifi,
    XCircle,
    Zap,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

type RangeKey = '5m' | '15m' | '1h' | '3h' | '6h' | '9h' | '24h' | '7d' | '30d';
type IntervalKey = '1m' | '5m' | '15m' | '1h' | '6h' | '1d';

const RANGE_OPTIONS: { key: RangeKey; label: string; windowMs: number; defaultInterval: IntervalKey }[] = [
    { key: '5m',  label: 'Last 5 min',   windowMs: 5 * 60 * 1000,             defaultInterval: '1m' },
    { key: '15m', label: 'Last 15 min',  windowMs: 15 * 60 * 1000,            defaultInterval: '1m' },
    { key: '1h',  label: 'Last 1 hour',  windowMs: 60 * 60 * 1000,            defaultInterval: '1m' },
    { key: '3h',  label: 'Last 3 hours', windowMs: 3 * 60 * 60 * 1000,        defaultInterval: '5m' },
    { key: '6h',  label: 'Last 6 hours', windowMs: 6 * 60 * 60 * 1000,        defaultInterval: '5m' },
    { key: '9h',  label: 'Last 9 hours', windowMs: 9 * 60 * 60 * 1000,        defaultInterval: '15m' },
    { key: '24h', label: 'Last 24 hours',windowMs: 24 * 60 * 60 * 1000,       defaultInterval: '15m' },
    { key: '7d',  label: 'Last 7 days',  windowMs: 7 * 24 * 60 * 60 * 1000,   defaultInterval: '1h' },
    { key: '30d', label: 'Last 30 days', windowMs: 30 * 24 * 60 * 60 * 1000,  defaultInterval: '6h' },
];

const INTERVAL_OPTIONS: { key: IntervalKey; label: string; ms: number }[] = [
    { key: '1m',  label: '1 min',   ms: 60 * 1000 },
    { key: '5m',  label: '5 min',   ms: 5 * 60 * 1000 },
    { key: '15m', label: '15 min',  ms: 15 * 60 * 1000 },
    { key: '1h',  label: '1 hour',  ms: 60 * 60 * 1000 },
    { key: '6h',  label: '6 hours', ms: 6 * 60 * 60 * 1000 },
    { key: '1d',  label: '1 day',   ms: 24 * 60 * 60 * 1000 },
];

const MAX_BUCKETS = 400;
const BRAND_PURPLE = '#8c00ff';
const COLOR_SUCCESS = '#0f9d58';
const COLOR_WARNING = '#f5a623';
const COLOR_ERROR = '#e53935';
const COLOR_INFO = '#3b82f6';
const COLOR_NEUTRAL = '#64748B';

const CHART_PALETTE = [
    BRAND_PURPLE,
    COLOR_INFO,
    COLOR_SUCCESS,
    COLOR_WARNING,
    COLOR_ERROR,
    '#8b5cf6',
    '#06b6d4',
    '#f97316',
];

interface Bucket {
    ts: number;
    label: string;
    count: number;
}

// Deterministic pseudo-random so re-renders don't reshuffle the mock series.
function seededRandom(seed: number): () => number {
    let state = seed || 1;
    return () => {
        state = (state * 9301 + 49297) % 233280;
        return state / 233280;
    };
}

function generateMockSeries(rangeKey: RangeKey, intervalMs: number, seedSalt: number): Bucket[] {
    const range = RANGE_OPTIONS.find((r) => r.key === rangeKey);
    if (!range) return [];
    const windowMs = range.windowMs;
    const bucketCount = Math.min(MAX_BUCKETS, Math.max(2, Math.floor(windowMs / intervalMs)));
    const now = Date.now();
    const alignedNow = Math.floor(now / intervalMs) * intervalMs;
    const rand = seededRandom(bucketCount * 7 + rangeKey.charCodeAt(0) * 13 + seedSalt);
    const series: Bucket[] = [];
    for (let i = bucketCount - 1; i >= 0; i--) {
        const ts = alignedNow - i * intervalMs;
        const base = 4 + Math.sin(i / 6) * 3;
        const noise = rand() * 6;
        const spike = rand() > 0.94 ? Math.floor(rand() * 12) : 0;
        const count = Math.max(0, Math.round(base + noise + spike));
        series.push({ ts, label: formatBucketLabel(ts, intervalMs), count });
    }
    return series;
}

function formatBucketLabel(ts: number, intervalMs: number): string {
    const d = new Date(ts);
    if (intervalMs >= 24 * 60 * 60 * 1000) {
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatNumber(n: number): string {
    return n.toLocaleString();
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB', 'TB', 'PB'];
    let value = bytes / 1024;
    let idx = 0;
    while (value >= 1024 && idx < units.length - 1) {
        value /= 1024;
        idx += 1;
    }
    return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[idx]}`;
}

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m < 60) return `${m}m ${s}s`;
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
}

export default function AdminRecordingsPage() {
    const [rangeKey, setRangeKey] = useState<RangeKey>('1h');
    const [intervalKey, setIntervalKey] = useState<IntervalKey>('1m');
    const [seedSalt, setSeedSalt] = useState(1);

    const range = RANGE_OPTIONS.find((r) => r.key === rangeKey)!;
    const interval = INTERVAL_OPTIONS.find((i) => i.key === intervalKey)!;

    const validIntervals = useMemo(() => {
        return INTERVAL_OPTIONS.filter((i) => {
            const buckets = Math.floor(range.windowMs / i.ms);
            return buckets >= 2 && buckets <= MAX_BUCKETS;
        });
    }, [range.windowMs]);

    const data = useMemo(
        () => generateMockSeries(rangeKey, interval.ms, seedSalt),
        [rangeKey, interval.ms, seedSalt],
    );

    const stats = useMemo(() => {
        if (data.length === 0) return { total: 0, peak: 0, avg: 0, avgPerMinute: 0 };
        const total = data.reduce((sum, b) => sum + b.count, 0);
        const peak = data.reduce((max, b) => Math.max(max, b.count), 0);
        const avg = total / data.length;
        const avgPerMinute = total / (range.windowMs / 60000);
        return { total, peak, avg, avgPerMinute };
    }, [data, range.windowMs]);

    const handleRangeChange = (key: RangeKey) => {
        setRangeKey(key);
        const next = RANGE_OPTIONS.find((r) => r.key === key);
        if (next) setIntervalKey(next.defaultInterval);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-[28px] leading-[36px] font-semibold text-[#0F172A]">
                            Recordings
                        </h1>
                        <p className="text-[14px] leading-[22px] text-[#64748B]">
                            Live analytics for recordings across the platform.
                        </p>
                    </div>
                    <button
                        onClick={() => setSeedSalt((s) => s + 1)}
                        className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 h-9 text-[13px] font-medium text-[#334155] hover:bg-[#F8FAFC] transition-colors"
                    >
                        <RefreshCw size={14} strokeWidth={1.75} />
                        Refresh
                    </button>
                </div>

                {/* ─── INTEGRATED: Recordings Created chart ───────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <StatCard label="Total in range" value={formatNumber(stats.total)} icon={<Activity size={16} strokeWidth={1.75} />} />
                    <StatCard label="Peak per bucket" value={formatNumber(stats.peak)} icon={<TrendingUp size={16} strokeWidth={1.75} />} />
                    <StatCard label="Avg per bucket" value={stats.avg.toFixed(1)} />
                    <StatCard label="Avg per minute" value={stats.avgPerMinute.toFixed(2)} />
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-white">
                    <div className="flex flex-wrap items-center gap-3 border-b border-[#E2E8F0] px-4 py-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-wide font-semibold text-[#94A3B8]">Time Range</span>
                            <div className="flex flex-wrap gap-1">
                                {RANGE_OPTIONS.map((r) => (
                                    <button
                                        key={r.key}
                                        onClick={() => handleRangeChange(r.key)}
                                        className={`h-8 px-3 rounded-md text-[12px] font-medium transition-colors border ${
                                            r.key === rangeKey
                                                ? 'bg-[#8c00ff] text-white border-[#8c00ff]'
                                                : 'bg-white text-[#334155] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                                        }`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="w-px h-10 bg-[#E2E8F0] mx-1" />
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-wide font-semibold text-[#94A3B8]">Bucket Size</span>
                            <div className="flex flex-wrap gap-1">
                                {validIntervals.map((i) => (
                                    <button
                                        key={i.key}
                                        onClick={() => setIntervalKey(i.key)}
                                        className={`h-8 px-3 rounded-md text-[12px] font-medium transition-colors border ${
                                            i.key === intervalKey
                                                ? 'bg-[#0F172A] text-white border-[#0F172A]'
                                                : 'bg-white text-[#334155] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                                        }`}
                                    >
                                        {i.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="ml-auto text-[11px] text-[#94A3B8]">
                            {data.length} data points · {interval.label} per bucket
                        </div>
                    </div>

                    <div className="p-4">
                        <h2 className="text-[15px] font-semibold text-[#0F172A] mb-1">Recordings Created</h2>
                        <p className="text-[12px] text-[#64748B] mb-4">
                            Number of recordings started in each {interval.label} bucket over the {range.label.toLowerCase()}.
                        </p>
                        <div className="h-[360px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -12 }}>
                                    <defs>
                                        <linearGradient id="recordingsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={BRAND_PURPLE} stopOpacity={0.35} />
                                            <stop offset="100%" stopColor={BRAND_PURPLE} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#F1F5F9" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} minTickGap={30} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} width={40} />
                                    <Tooltip content={<TimeSeriesTooltip intervalLabel={interval.label} />} />
                                    <Area type="monotone" dataKey="count" stroke={BRAND_PURPLE} strokeWidth={2} fill="url(#recordingsGradient)" activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════════ */}
                {/* ─── NOT INTEGRATED: Overview KPI Strip ─────────────────────────── */}
                <SectionHeader title="Overview" subtitle="At-a-glance health for the last 24 hours." />
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    <MockStatCard label="Recordings Today" value="1,284" delta="+12.4% vs yesterday" deltaTone="positive" icon={<Activity size={16} strokeWidth={1.75} />} sparkSeed={11} />
                    <MockStatCard label="Active Right Now" value="47" delta="live" deltaTone="live" icon={<Radio size={16} strokeWidth={1.75} />} sparkSeed={22} />
                    <MockStatCard label="Peak Concurrent (24h)" value="164" delta="at 14:32" deltaTone="neutral" icon={<TrendingUp size={16} strokeWidth={1.75} />} sparkSeed={33} />
                    <MockStatCard label="Completion Rate" value="94.8%" delta="+1.2%" deltaTone="positive" icon={<CheckCircle2 size={16} strokeWidth={1.75} />} sparkSeed={44} />
                    <MockStatCard label="Failed (24h)" value="67" delta="+18 vs yesterday" deltaTone="negative" icon={<XCircle size={16} strokeWidth={1.75} />} sparkSeed={55} />
                    <MockStatCard label="Storage Used" value="4.72 TB" delta="+62 GB today" deltaTone="neutral" icon={<HardDrive size={16} strokeWidth={1.75} />} sparkSeed={66} />
                </div>

                {/* ─── NOT INTEGRATED: Volume & Health ────────────────────────────── */}
                <SectionHeader title="Volume & Health" subtitle="Recording pipeline throughput and failure signals." />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <ChartCard
                        title="Started vs Completed"
                        subtitle="Gap between the two lines reveals failure rate."
                        notIntegrated
                    >
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={generateDualSeries(24, 77)} margin={{ top: 10, right: 12, bottom: 0, left: -12 }}>
                                    <CartesianGrid stroke="#F1F5F9" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} minTickGap={30} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} width={40} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Line type="monotone" dataKey="started" stroke={COLOR_INFO} strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="completed" stroke={COLOR_SUCCESS} strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    <ChartCard title="Status Distribution" subtitle="Recording lifecycle state right now." notIntegrated>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={STATUS_PIE_DATA}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                    >
                                        {STATUS_PIE_DATA.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    <ChartCard title="Failure Reasons" subtitle="Top causes of failed recordings (last 7 days)." notIntegrated>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={FAILURE_REASONS} layout="vertical" margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                                    <CartesianGrid stroke="#F1F5F9" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} />
                                    <YAxis type="category" dataKey="reason" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} width={140} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill={COLOR_ERROR} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    <ChartCard title="Orphan Rate" subtitle="% recordings finalized by the scavenger (network drops)." notIntegrated>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={generateRateSeries(24, 88, 2, 8)} margin={{ top: 10, right: 12, bottom: 0, left: -12 }}>
                                    <defs>
                                        <linearGradient id="orphanGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={COLOR_WARNING} stopOpacity={0.3} />
                                            <stop offset="100%" stopColor={COLOR_WARNING} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#F1F5F9" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} minTickGap={30} />
                                    <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} width={40} />
                                    <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
                                    <Area type="monotone" dataKey="value" stroke={COLOR_WARNING} strokeWidth={2} fill="url(#orphanGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>

                {/* ─── NOT INTEGRATED: User Activity ──────────────────────────────── */}
                <SectionHeader title="User Activity & Growth" subtitle="Who is recording and how often." />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MockStatCard label="DAU" value="8,204" delta="+3.2%" deltaTone="positive" icon={<Users size={16} strokeWidth={1.75} />} sparkSeed={101} notIntegrated />
                    <MockStatCard label="WAU" value="24,918" delta="+5.7%" deltaTone="positive" icon={<Users size={16} strokeWidth={1.75} />} sparkSeed={102} notIntegrated />
                    <MockStatCard label="MAU" value="61,342" delta="+9.1%" deltaTone="positive" icon={<Users size={16} strokeWidth={1.75} />} sparkSeed={103} notIntegrated />
                    <MockStatCard label="New Recorders Today" value="142" delta="+18 vs 7-day avg" deltaTone="positive" icon={<Zap size={16} strokeWidth={1.75} />} sparkSeed={104} notIntegrated />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <ChartCard title="Recordings per User" subtitle="Distribution of how many recordings each user has made." notIntegrated>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={USER_DISTRIBUTION} margin={{ top: 10, right: 12, bottom: 0, left: -12 }}>
                                    <CartesianGrid stroke="#F1F5F9" vertical={false} />
                                    <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} width={40} />
                                    <Tooltip />
                                    <Bar dataKey="users" fill={BRAND_PURPLE} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    <ChartCard title="Top Recorders" subtitle="Leaderboard by total recordings (last 30 days)." notIntegrated>
                        <LeaderboardTable rows={TOP_RECORDERS} />
                    </ChartCard>
                </div>

                {/* ─── NOT INTEGRATED: Workspace Health ───────────────────────────── */}
                <SectionHeader title="Workspace Health" subtitle="Team-level usage patterns and churn signals." />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MockStatCard label="Total Workspaces" value="3,472" delta="+42 this week" deltaTone="positive" icon={<Building2 size={16} strokeWidth={1.75} />} sparkSeed={201} notIntegrated />
                    <MockStatCard label="Active (7d)" value="1,918" delta="55.2%" deltaTone="neutral" icon={<Radio size={16} strokeWidth={1.75} />} sparkSeed={202} notIntegrated />
                    <MockStatCard label="Dormant (30d)" value="428" delta="churn risk" deltaTone="negative" icon={<AlertTriangle size={16} strokeWidth={1.75} />} sparkSeed={203} notIntegrated />
                    <MockStatCard label="Avg Recordings / Workspace" value="47.3" delta="+4.1" deltaTone="positive" icon={<Activity size={16} strokeWidth={1.75} />} sparkSeed={204} notIntegrated />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <ChartCard title="Top Workspaces" subtitle="By recording count (last 30 days)." notIntegrated>
                        <LeaderboardTable rows={TOP_WORKSPACES} />
                    </ChartCard>
                    <ChartCard title="Workspace Activity Heatmap" subtitle="Top 10 workspaces × last 7 days (darker = more recordings)." notIntegrated>
                        <ActivityHeatmap />
                    </ChartCard>
                </div>

                {/* ─── NOT INTEGRATED: Content Analysis ───────────────────────────── */}
                <SectionHeader title="Content Analysis" subtitle="What kind of recordings are being made." />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <ChartCard title="Duration Distribution" subtitle="How long are recordings?" notIntegrated>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={DURATION_BUCKETS} margin={{ top: 10, right: 12, bottom: 0, left: -12 }}>
                                    <CartesianGrid stroke="#F1F5F9" vertical={false} />
                                    <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} width={40} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill={BRAND_PURPLE} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                    <ChartCard title="Resolution Mix" subtitle="Recording quality distribution." notIntegrated>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={RESOLUTION_PIE} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                                        {RESOLUTION_PIE.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                    <ChartCard title="Media Source Combo" subtitle="Screen-only vs screen+camera vs full combo." notIntegrated>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={MEDIA_COMBO_PIE} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                                        {MEDIA_COMBO_PIE.map((_, i) => <Cell key={i} fill={CHART_PALETTE[(i + 2) % CHART_PALETTE.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MockStatCard label="Avg Duration" value="4m 32s" delta="+18s vs last week" deltaTone="neutral" icon={<Clock size={16} strokeWidth={1.75} />} sparkSeed={301} notIntegrated />
                    <MockStatCard label="With Camera" value="63.4%" delta="+2.1%" deltaTone="positive" icon={<Camera size={16} strokeWidth={1.75} />} sparkSeed={302} notIntegrated />
                    <MockStatCard label="With Mic" value="88.7%" delta="stable" deltaTone="neutral" icon={<Mic size={16} strokeWidth={1.75} />} sparkSeed={303} notIntegrated />
                    <MockStatCard label="With Transcription" value="71.2%" delta="+5.4%" deltaTone="positive" icon={<Layers size={16} strokeWidth={1.75} />} sparkSeed={304} notIntegrated />
                </div>

                {/* ─── NOT INTEGRATED: Engagement ─────────────────────────────────── */}
                <SectionHeader title="Engagement" subtitle="How much recordings are actually watched and interacted with." />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MockStatCard label="Total Views (30d)" value="284,102" delta="+8.2%" deltaTone="positive" icon={<Eye size={16} strokeWidth={1.75} />} sparkSeed={401} notIntegrated />
                    <MockStatCard label="Avg Views / Recording" value="12.4" delta="+0.8" deltaTone="positive" icon={<Eye size={16} strokeWidth={1.75} />} sparkSeed={402} notIntegrated />
                    <MockStatCard label="Engagement Rate" value="18.6%" delta="+1.4%" deltaTone="positive" icon={<Zap size={16} strokeWidth={1.75} />} sparkSeed={403} notIntegrated />
                    <MockStatCard label="Recordings Shared" value="4,912" delta="+412" deltaTone="positive" icon={<Share2 size={16} strokeWidth={1.75} />} sparkSeed={404} notIntegrated />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <ChartCard title="Views Trend" subtitle="Video views across the platform." notIntegrated>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={generateGrowthSeries(30, 501, 8000, 15000)} margin={{ top: 10, right: 12, bottom: 0, left: -12 }}>
                                    <defs>
                                        <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={COLOR_INFO} stopOpacity={0.35} />
                                            <stop offset="100%" stopColor={COLOR_INFO} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#F1F5F9" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} minTickGap={30} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} width={50} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="value" stroke={COLOR_INFO} strokeWidth={2} fill="url(#viewsGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                    <ChartCard title="Most Viewed Recordings" subtitle="Top performing content (last 30 days)." notIntegrated>
                        <LeaderboardTable rows={TOP_VIEWED_RECORDINGS} />
                    </ChartCard>
                </div>

                {/* ─── NOT INTEGRATED: Storage & Cost ─────────────────────────────── */}
                <SectionHeader title="Storage & Cost" subtitle="Where the money goes." />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MockStatCard label="Total Storage" value="4.72 TB" delta="+62 GB / day" deltaTone="neutral" icon={<HardDrive size={16} strokeWidth={1.75} />} sparkSeed={601} notIntegrated />
                    <MockStatCard label="Avg File Size" value="182 MB" delta="+3 MB" deltaTone="neutral" icon={<Layers size={16} strokeWidth={1.75} />} sparkSeed={602} notIntegrated />
                    <MockStatCard label="Monthly Cost (est.)" value="$118.4" delta="+$1.55 / day" deltaTone="neutral" icon={<DollarSign size={16} strokeWidth={1.75} />} sparkSeed={603} notIntegrated />
                    <MockStatCard label="Deleted Storage" value="284 GB" delta="reclaim candidate" deltaTone="neutral" icon={<XCircle size={16} strokeWidth={1.75} />} sparkSeed={604} notIntegrated />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <ChartCard title="Storage Growth (30d)" subtitle="Cumulative storage used across all buckets." notIntegrated>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={generateGrowthSeries(30, 611, 4000, 4720)} margin={{ top: 10, right: 12, bottom: 0, left: -12 }}>
                                    <defs>
                                        <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={BRAND_PURPLE} stopOpacity={0.3} />
                                            <stop offset="100%" stopColor={BRAND_PURPLE} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#F1F5F9" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} minTickGap={30} />
                                    <YAxis tickFormatter={(v) => `${v} GB`} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} width={60} />
                                    <Tooltip formatter={(v) => `${Number(v)} GB`} />
                                    <Area type="monotone" dataKey="value" stroke={BRAND_PURPLE} strokeWidth={2} fill="url(#storageGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                    <ChartCard title="Storage per Workspace" subtitle="Top 10 workspaces by storage (GB)." notIntegrated>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={STORAGE_PER_WORKSPACE} layout="vertical" margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                                    <CartesianGrid stroke="#F1F5F9" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} tickFormatter={(v) => `${v} GB`} />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} width={140} />
                                    <Tooltip formatter={(v) => `${Number(v)} GB`} />
                                    <Bar dataKey="gb" fill={BRAND_PURPLE} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>

                {/* ─── NOT INTEGRATED: Performance ────────────────────────────────── */}
                <SectionHeader title="Performance & Infrastructure" subtitle="Latency and reliability of the ingestion pipeline." />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MockStatCard label="P50 Finalize" value="420 ms" delta="-32 ms" deltaTone="positive" icon={<Gauge size={16} strokeWidth={1.75} />} sparkSeed={701} notIntegrated />
                    <MockStatCard label="P95 Finalize" value="1.4 s" delta="-180 ms" deltaTone="positive" icon={<Gauge size={16} strokeWidth={1.75} />} sparkSeed={702} notIntegrated />
                    <MockStatCard label="P99 Finalize" value="3.2 s" delta="+220 ms" deltaTone="negative" icon={<Gauge size={16} strokeWidth={1.75} />} sparkSeed={703} notIntegrated />
                    <MockStatCard label="Multipart Success" value="99.6%" delta="stable" deltaTone="neutral" icon={<CheckCircle2 size={16} strokeWidth={1.75} />} sparkSeed={704} notIntegrated />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <ChartCard title="Finalize Latency Percentiles" subtitle="P50 / P95 / P99 over the last 24 hours." notIntegrated>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={generateLatencySeries(24, 711)} margin={{ top: 10, right: 12, bottom: 0, left: -12 }}>
                                    <CartesianGrid stroke="#F1F5F9" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} minTickGap={30} />
                                    <YAxis tickFormatter={(v) => `${v}ms`} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} width={50} />
                                    <Tooltip formatter={(v) => `${Number(v)} ms`} />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Line type="monotone" dataKey="p50" stroke={COLOR_SUCCESS} strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="p95" stroke={COLOR_WARNING} strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="p99" stroke={COLOR_ERROR} strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                    <ChartCard title="Socket Disconnect Rate" subtitle="Disconnects per 100 active sockets." notIntegrated>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={generateRateSeries(24, 721, 0.5, 4)} margin={{ top: 10, right: 12, bottom: 0, left: -12 }}>
                                    <defs>
                                        <linearGradient id="disconnectGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={COLOR_ERROR} stopOpacity={0.3} />
                                            <stop offset="100%" stopColor={COLOR_ERROR} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#F1F5F9" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} minTickGap={30} />
                                    <YAxis tickFormatter={(v) => `${v.toFixed(1)}%`} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickLine={false} width={45} />
                                    <Tooltip formatter={(v) => `${Number(v).toFixed(2)}%`} />
                                    <Area type="monotone" dataKey="value" stroke={COLOR_ERROR} strokeWidth={2} fill="url(#disconnectGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>

                {/* ─── NOT INTEGRATED: Distribution / Segments ────────────────────── */}
                <SectionHeader title="Distribution & Segments" subtitle="Where and how users record from." />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <ChartCard title="Recordings by Plan Tier" subtitle="Revenue mix based on who records." notIntegrated>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={PLAN_TIER_PIE} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                                        {PLAN_TIER_PIE.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                    <ChartCard title="Device / OS" subtitle="What OS are recorders using." notIntegrated>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={OS_PIE} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                                        {OS_PIE.map((_, i) => <Cell key={i} fill={CHART_PALETTE[(i + 3) % CHART_PALETTE.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                    <ChartCard title="Browser" subtitle="Where the extension runs." notIntegrated>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={BROWSER_PIE} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                                        {BROWSER_PIE.map((_, i) => <Cell key={i} fill={CHART_PALETTE[(i + 5) % CHART_PALETTE.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>

                <ChartCard title="Peak Hours" subtitle="Recording activity across days of week × hour of day." notIntegrated>
                    <PeakHoursHeatmap />
                </ChartCard>
            </div>
        </AdminLayout>
    );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*   Reusable UI atoms                                                      */
/* ═══════════════════════════════════════════════════════════════════════ */

function NotIntegratedTag() {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Not Integrated
        </span>
    );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="pt-4 border-t border-[#E2E8F0]">
            <h2 className="text-[18px] font-semibold text-[#0F172A]">{title}</h2>
            {subtitle && <p className="text-[13px] text-[#64748B] mt-0.5">{subtitle}</p>}
        </div>
    );
}

function ChartCard({
    title,
    subtitle,
    notIntegrated,
    children,
}: {
    title: string;
    subtitle?: string;
    notIntegrated?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                    <h3 className="text-[14px] font-semibold text-[#0F172A]">{title}</h3>
                    {subtitle && <p className="text-[12px] text-[#64748B] mt-0.5">{subtitle}</p>}
                </div>
                {notIntegrated && <NotIntegratedTag />}
            </div>
            {children}
        </div>
    );
}

function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
            <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wide font-semibold text-[#94A3B8]">{label}</span>
                {icon && <span className="text-[#94A3B8]">{icon}</span>}
            </div>
            <div className="mt-1 text-[24px] leading-[32px] font-semibold tabular-nums text-[#0F172A]">{value}</div>
        </div>
    );
}

function MockStatCard({
    label,
    value,
    delta,
    deltaTone,
    icon,
    sparkSeed,
    notIntegrated = true,
}: {
    label: string;
    value: string;
    delta?: string;
    deltaTone?: 'positive' | 'negative' | 'neutral' | 'live';
    icon?: React.ReactNode;
    sparkSeed: number;
    notIntegrated?: boolean;
}) {
    const spark = useMemo(() => {
        const rand = seededRandom(sparkSeed);
        return Array.from({ length: 24 }, (_, i) => ({ i, v: 20 + rand() * 60 + Math.sin(i / 3) * 10 }));
    }, [sparkSeed]);

    const deltaClass =
        deltaTone === 'positive' ? 'text-[#0f9d58]' :
        deltaTone === 'negative' ? 'text-[#e53935]' :
        deltaTone === 'live' ? 'text-[#8c00ff]' :
        'text-[#94A3B8]';

    return (
        <div className="relative rounded-xl border border-[#E2E8F0] bg-white p-4">
            {notIntegrated && (
                <div className="absolute top-2 right-2">
                    <NotIntegratedTag />
                </div>
            )}
            <div className="flex items-center gap-2 text-[#94A3B8]">
                {icon}
                <span className="text-[11px] uppercase tracking-wide font-semibold">{label}</span>
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
                <div>
                    <div className="text-[22px] leading-[28px] font-semibold tabular-nums text-[#0F172A]">{value}</div>
                    {delta && <div className={`text-[11px] font-medium mt-0.5 ${deltaClass}`}>{delta}</div>}
                </div>
                <div className="w-[80px] h-[36px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={spark} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                            <Area type="monotone" dataKey="v" stroke={BRAND_PURPLE} strokeWidth={1.5} fill={BRAND_PURPLE} fillOpacity={0.15} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

interface LeaderboardRow {
    name: string;
    subtitle?: string;
    value: string;
    numeric: number;
}

function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
    const max = Math.max(...rows.map((r) => r.numeric), 1);
    return (
        <div className="divide-y divide-[#F1F5F9]">
            {rows.map((r, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                    <span className="text-[11px] font-mono text-[#94A3B8] w-5 shrink-0">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium text-[#0F172A] truncate">{r.name}</div>
                        {r.subtitle && <div className="text-[11px] text-[#94A3B8] truncate">{r.subtitle}</div>}
                    </div>
                    <div className="w-24 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden shrink-0">
                        <div className="h-full bg-[#8c00ff]" style={{ width: `${(r.numeric / max) * 100}%` }} />
                    </div>
                    <div className="text-[13px] font-mono font-semibold text-[#0F172A] w-16 text-right tabular-nums shrink-0">
                        {r.value}
                    </div>
                </div>
            ))}
        </div>
    );
}

function ActivityHeatmap() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const workspaces = ['Acme Corp', 'Nova Labs', 'Byte Studio', 'Vercel Team', 'Pixel Craft', 'Loom Insiders', 'Notion HQ', 'Zaptor Inc', 'Bento Bytes', 'Ripple AI'];
    const rand = seededRandom(999);
    const cells: number[][] = workspaces.map(() => Array.from({ length: 7 }, () => Math.floor(rand() * 60)));
    const max = Math.max(...cells.flat(), 1);

    return (
        <div className="overflow-auto">
            <table className="w-full text-[11px]">
                <thead>
                    <tr>
                        <th className="text-left font-normal text-[#94A3B8] pb-2 pr-3">Workspace</th>
                        {days.map((d) => (
                            <th key={d} className="text-center font-normal text-[#94A3B8] pb-2 px-1">{d}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {workspaces.map((ws, i) => (
                        <tr key={ws}>
                            <td className="py-1 pr-3 text-[#334155] font-medium whitespace-nowrap">{ws}</td>
                            {cells[i]!.map((v, j) => {
                                const intensity = v / max;
                                const bg = intensity === 0
                                    ? '#F8FAFC'
                                    : `rgba(140, 0, 255, ${0.1 + intensity * 0.8})`;
                                return (
                                    <td key={j} className="p-0.5" title={`${v} recordings`}>
                                        <div className="h-6 rounded" style={{ backgroundColor: bg }} />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function PeakHoursHeatmap() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const rand = seededRandom(555);
    const grid: number[][] = days.map((_, d) => (
        Array.from({ length: 24 }, (_, h) => {
            const isWeekend = d >= 5;
            const isWorkHour = h >= 9 && h <= 18;
            const base = isWorkHour && !isWeekend ? 40 : 8;
            return Math.max(0, Math.floor(base + rand() * 30 - 10));
        })
    ));
    const max = Math.max(...grid.flat(), 1);

    return (
        <div className="overflow-auto">
            <table className="w-full text-[10px] font-mono">
                <thead>
                    <tr>
                        <th className="text-left font-normal text-[#94A3B8] pb-2 pr-2 w-10">Day</th>
                        {Array.from({ length: 24 }, (_, h) => (
                            <th key={h} className="text-center font-normal text-[#94A3B8] pb-2 px-0.5">
                                {h % 3 === 0 ? h : ''}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {days.map((day, d) => (
                        <tr key={day}>
                            <td className="pr-2 text-[#334155] font-medium">{day}</td>
                            {grid[d]!.map((v, h) => {
                                const intensity = v / max;
                                const bg = intensity < 0.05
                                    ? '#F8FAFC'
                                    : `rgba(140, 0, 255, ${0.1 + intensity * 0.8})`;
                                return (
                                    <td key={h} className="p-0.5" title={`${day} ${h}:00 — ${v}`}>
                                        <div className="h-5 rounded-sm" style={{ backgroundColor: bg }} />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-[#94A3B8]">
                <span>less</span>
                <div className="flex gap-0.5">
                    {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((op, i) => (
                        <div key={i} className="w-4 h-3 rounded-sm" style={{ backgroundColor: `rgba(140, 0, 255, ${op})` }} />
                    ))}
                </div>
                <span>more</span>
            </div>
        </div>
    );
}

interface TooltipPoint {
    payload?: Bucket;
    value?: number;
}

function TimeSeriesTooltip({
    active,
    payload,
    intervalLabel,
}: {
    active?: boolean;
    payload?: TooltipPoint[];
    intervalLabel: string;
}) {
    if (!active || !payload || payload.length === 0) return null;
    const point = payload[0]?.payload;
    if (!point) return null;
    return (
        <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-md px-3 py-2 text-[12px]">
            <div className="text-[10px] uppercase tracking-wide font-semibold text-[#94A3B8] mb-0.5">
                {new Date(point.ts).toLocaleString()}
            </div>
            <div className="text-[#0F172A] font-medium">{point.count} recordings</div>
            <div className="text-[11px] text-[#94A3B8]">per {intervalLabel}</div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*   Mock data generators + fixtures                                        */
/* ═══════════════════════════════════════════════════════════════════════ */

function generateDualSeries(points: number, seed: number) {
    const rand = seededRandom(seed);
    return Array.from({ length: points }, (_, i) => {
        const started = Math.round(80 + rand() * 60 + Math.sin(i / 4) * 30);
        const failed = Math.round(started * (0.02 + rand() * 0.06));
        return {
            label: `${23 - i}h`,
            started,
            completed: started - failed,
        };
    }).reverse();
}

function generateRateSeries(points: number, seed: number, min: number, max: number) {
    const rand = seededRandom(seed);
    return Array.from({ length: points }, (_, i) => ({
        label: `${23 - i}h`,
        value: parseFloat((min + rand() * (max - min)).toFixed(2)),
    })).reverse();
}

function generateGrowthSeries(points: number, seed: number, startValue: number, endValue: number) {
    const rand = seededRandom(seed);
    const step = (endValue - startValue) / points;
    return Array.from({ length: points }, (_, i) => {
        const noise = (rand() - 0.5) * step * 0.4;
        return {
            label: `D-${points - i}`,
            value: Math.round(startValue + step * i + noise),
        };
    });
}

function generateLatencySeries(points: number, seed: number) {
    const rand = seededRandom(seed);
    return Array.from({ length: points }, (_, i) => {
        const load = 1 + Math.sin(i / 4) * 0.4;
        return {
            label: `${23 - i}h`,
            p50: Math.round(300 + rand() * 200 * load),
            p95: Math.round(1000 + rand() * 600 * load),
            p99: Math.round(2500 + rand() * 1500 * load),
        };
    }).reverse();
}

const STATUS_PIE_DATA = [
    { name: 'Completed', value: 8420, color: COLOR_SUCCESS },
    { name: 'Streaming', value: 47, color: COLOR_INFO },
    { name: 'Processing', value: 128, color: COLOR_WARNING },
    { name: 'Failed', value: 312, color: COLOR_ERROR },
    { name: 'Initial', value: 22, color: COLOR_NEUTRAL },
];

const FAILURE_REASONS = [
    { reason: 'Socket disconnect', count: 184 },
    { reason: 'S3 upload timeout', count: 62 },
    { reason: 'Multipart abort',   count: 41 },
    { reason: 'Browser crash',     count: 28 },
    { reason: 'Auth token expired', count: 14 },
];

const USER_DISTRIBUTION = [
    { bucket: '1',     users: 4820 },
    { bucket: '2-5',   users: 2340 },
    { bucket: '6-10',  users: 894 },
    { bucket: '11-25', users: 431 },
    { bucket: '26-50', users: 187 },
    { bucket: '50+',   users: 62 },
];

const TOP_RECORDERS: LeaderboardRow[] = [
    { name: 'Sarah Chen',   subtitle: 'sarah@acme.com',  value: '284', numeric: 284 },
    { name: 'Ali Raza',     subtitle: 'ali@nova.io',      value: '241', numeric: 241 },
    { name: 'Meera Patel',  subtitle: 'meera@byte.studio', value: '198', numeric: 198 },
    { name: 'James Ortega', subtitle: 'james@vercel.com', value: '176', numeric: 176 },
    { name: 'Kim Lee',      subtitle: 'kim@pixel.craft',  value: '154', numeric: 154 },
    { name: 'Diego Silva',  subtitle: 'diego@loom.in',    value: '132', numeric: 132 },
    { name: 'Riya Kapoor',  subtitle: 'riya@notion.hq',   value: '128', numeric: 128 },
    { name: 'Owen Green',   subtitle: 'owen@zaptor.inc',  value: '119', numeric: 119 },
];

const TOP_WORKSPACES: LeaderboardRow[] = [
    { name: 'Acme Corp',       subtitle: '42 seats · Team plan',        value: '2,148', numeric: 2148 },
    { name: 'Nova Labs',       subtitle: '18 seats · Team plan',        value: '1,712', numeric: 1712 },
    { name: 'Byte Studio',     subtitle: '9 seats · Pro plan',          value: '1,204', numeric: 1204 },
    { name: 'Vercel Team',     subtitle: '31 seats · Enterprise',       value: '994',  numeric: 994 },
    { name: 'Pixel Craft',     subtitle: '6 seats · Pro plan',          value: '821',  numeric: 821 },
    { name: 'Loom Insiders',   subtitle: '14 seats · Team plan',        value: '702',  numeric: 702 },
    { name: 'Notion HQ',       subtitle: '52 seats · Enterprise',       value: '641',  numeric: 641 },
    { name: 'Zaptor Inc',      subtitle: '8 seats · Team plan',         value: '512',  numeric: 512 },
];

const TOP_VIEWED_RECORDINGS: LeaderboardRow[] = [
    { name: 'Q4 All-Hands recap',      subtitle: 'by Sarah Chen · Acme Corp', value: '3,412', numeric: 3412 },
    { name: 'New onboarding flow',     subtitle: 'by Ali Raza · Nova Labs',    value: '2,894', numeric: 2894 },
    { name: 'Roadmap walkthrough',     subtitle: 'by Meera Patel · Byte',      value: '2,341', numeric: 2341 },
    { name: 'Bug fix explainer',       subtitle: 'by James Ortega · Vercel',   value: '1,982', numeric: 1982 },
    { name: 'Design review',           subtitle: 'by Kim Lee · Pixel Craft',   value: '1,714', numeric: 1714 },
    { name: 'Sales pitch template',    subtitle: 'by Diego Silva · Loom',       value: '1,428', numeric: 1428 },
    { name: 'Customer feedback loop',  subtitle: 'by Riya Kapoor · Notion',    value: '1,205', numeric: 1205 },
    { name: 'API integration demo',    subtitle: 'by Owen Green · Zaptor',     value: '984',  numeric: 984 },
];

const DURATION_BUCKETS = [
    { bucket: '0-1m',   count: 2412 },
    { bucket: '1-5m',   count: 4820 },
    { bucket: '5-15m',  count: 3184 },
    { bucket: '15-60m', count: 1042 },
    { bucket: '60m+',   count: 218 },
];

const RESOLUTION_PIE = [
    { name: '720p',  value: 5240 },
    { name: '1080p', value: 4128 },
    { name: '2K',    value: 892 },
    { name: '4K',    value: 214 },
];

const MEDIA_COMBO_PIE = [
    { name: 'Screen only',       value: 2418 },
    { name: 'Screen + Camera',   value: 3182 },
    { name: 'Screen + Audio',    value: 2214 },
    { name: 'All three',         value: 2894 },
];

const STORAGE_PER_WORKSPACE = [
    { name: 'Acme Corp',       gb: 412 },
    { name: 'Nova Labs',       gb: 328 },
    { name: 'Vercel Team',     gb: 284 },
    { name: 'Notion HQ',       gb: 241 },
    { name: 'Byte Studio',     gb: 194 },
    { name: 'Loom Insiders',   gb: 168 },
    { name: 'Pixel Craft',     gb: 142 },
    { name: 'Zaptor Inc',      gb: 118 },
    { name: 'Ripple AI',       gb: 92 },
    { name: 'Bento Bytes',     gb: 78 },
];

const PLAN_TIER_PIE = [
    { name: 'Free',       value: 4218 },
    { name: 'Pro',        value: 3894 },
    { name: 'Team',       value: 1842 },
    { name: 'Enterprise', value: 428 },
];

const OS_PIE = [
    { name: 'macOS',   value: 5820 },
    { name: 'Windows', value: 3892 },
    { name: 'Linux',   value: 512 },
    { name: 'Other',   value: 84 },
];

const BROWSER_PIE = [
    { name: 'Chrome',  value: 8912 },
    { name: 'Edge',    value: 894 },
    { name: 'Brave',   value: 312 },
    { name: 'Other',   value: 128 },
];

// Kept for potential future use — silence unused-import warnings in some linters
void [Wifi, Globe, formatBytes, formatDuration];
