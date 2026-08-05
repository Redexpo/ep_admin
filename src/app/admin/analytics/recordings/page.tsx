'use client';

import { useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Activity, RefreshCw, TrendingUp } from 'lucide-react';
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
    if (intervalMs >= 60 * 60 * 1000) {
        return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatNumber(n: number): string {
    return n.toLocaleString();
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
                            Live analytics for recordings across the platform. UI shows mock data — backend wiring pending.
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

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <StatCard
                        label="Total in range"
                        value={formatNumber(stats.total)}
                        icon={<Activity size={16} strokeWidth={1.75} />}
                    />
                    <StatCard
                        label="Peak per bucket"
                        value={formatNumber(stats.peak)}
                        icon={<TrendingUp size={16} strokeWidth={1.75} />}
                    />
                    <StatCard
                        label="Avg per bucket"
                        value={stats.avg.toFixed(1)}
                    />
                    <StatCard
                        label="Avg per minute"
                        value={stats.avgPerMinute.toFixed(2)}
                    />
                </div>

                {/* Chart Card */}
                <div className="rounded-xl border border-[#E2E8F0] bg-white">
                    {/* Chart Controls */}
                    <div className="flex flex-wrap items-center gap-3 border-b border-[#E2E8F0] px-4 py-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-wide font-semibold text-[#94A3B8]">
                                Time Range
                            </span>
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
                            <span className="text-[10px] uppercase tracking-wide font-semibold text-[#94A3B8]">
                                Bucket Size
                            </span>
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

                    {/* Chart */}
                    <div className="p-4">
                        <h2 className="text-[15px] font-semibold text-[#0F172A] mb-1">
                            Recordings Created
                        </h2>
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
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fontSize: 11, fill: '#64748B' }}
                                        stroke="#E2E8F0"
                                        tickLine={false}
                                        minTickGap={30}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fontSize: 11, fill: '#64748B' }}
                                        stroke="#E2E8F0"
                                        tickLine={false}
                                        width={40}
                                    />
                                    <Tooltip content={<ChartTooltip intervalLabel={interval.label} />} />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke={BRAND_PURPLE}
                                        strokeWidth={2}
                                        fill="url(#recordingsGradient)"
                                        activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
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
                <span className="text-[11px] uppercase tracking-wide font-semibold text-[#94A3B8]">
                    {label}
                </span>
                {icon && <span className="text-[#94A3B8]">{icon}</span>}
            </div>
            <div className="mt-1 text-[24px] leading-[32px] font-semibold tabular-nums text-[#0F172A]">
                {value}
            </div>
        </div>
    );
}

interface TooltipPoint {
    payload?: Bucket;
    value?: number;
}

function ChartTooltip({
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
            <div className="text-[#0F172A] font-medium">
                {point.count} recordings
            </div>
            <div className="text-[11px] text-[#94A3B8]">
                per {intervalLabel}
            </div>
        </div>
    );
}
