'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const SOURCE_COLORS: Record<string, string> = {
    linkedin:  '#0077B5',
    twitter:   '#000000',
    facebook:  '#1877F2',
    instagram: '#E4405F',
    reddit:    '#FF4500',
    tiktok:    '#010101',
    direct:    '#8c00ff',
};

const FALLBACK_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

interface SliceTooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number; percent: number; payload: { color: string } }>;
}

function SliceTooltip({ active, payload }: SliceTooltipProps) {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    return (
        <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-2xl">
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.payload.color }} />
                <span className="text-[12px] capitalize font-semibold text-slate-700">{item.name}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-[14px] font-bold tabular-nums text-slate-900">
                    {item.value.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400">
                    {(item.percent * 100).toFixed(1)}%
                </span>
            </div>
        </div>
    );
}

interface SourceDonutChartProps {
    views_by_source: Record<string, number>;
}

export default function SourceDonutChart({ views_by_source }: SourceDonutChartProps) {
    const entries = Object.entries(views_by_source)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1]);

    const total = entries.reduce((sum, [, v]) => sum + v, 0);

    const data = entries.map(([key, value], i) => ({
        name: key,
        value,
        color: SOURCE_COLORS[key] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }));

    if (data.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-[13px] text-slate-400">
                No source data yet
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={82}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                    >
                        {data.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<SliceTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            {/* Centre label overlay isn't possible in recharts easily, so show total below */}
            <div className="mt-1 space-y-2">
                {data.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="truncate text-[12px] capitalize text-slate-600">{entry.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono text-[12px] font-bold tabular-nums text-slate-900">
                                {entry.value.toLocaleString()}
                            </span>
                            <span className="w-10 text-right text-[11px] text-slate-400">
                                {total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
