interface TooltipEntry {
    dataKey: string;
    name: string;
    value: number;
    color: string;
}

interface LineChartTooltipProps {
    active?: boolean;
    payload?: TooltipEntry[];
    label?: string;
}

export default function LineChartTooltip({ active, payload, label }: LineChartTooltipProps) {
    if (!active || !payload?.length) return null;
    const entries = payload.filter((p) => p.value > 0);
    if (!entries.length) return null;

    return (
        <div className="min-w-[150px] rounded-2xl border border-slate-100 bg-white px-3.5 py-3 shadow-2xl">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <div className="space-y-2">
                {entries.map((entry) => (
                    <div key={entry.dataKey} className="flex items-center justify-between gap-5">
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-[12px] capitalize text-slate-600">{entry.name}</span>
                        </div>
                        <span className="font-mono text-[13px] font-bold tabular-nums text-slate-900">
                            {entry.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
