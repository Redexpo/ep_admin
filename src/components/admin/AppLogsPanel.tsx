'use client';

import React from 'react';
import { ScrollText, ChevronDown, ChevronRight } from 'lucide-react';
import { AppLog } from '@/services/admin/videoService';

// ── Helpers ────────────────────────────────────────────────────────────────────

const LOG_LEVEL_CONFIG = {
    INFO:     { bg: 'bg-[#8c00ff]', badge: 'bg-[#f3eefe] text-[#8c00ff]' },
    WARNING:  { bg: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-600' },
    ERROR:    { bg: 'bg-red-500',    badge: 'bg-red-50 text-red-600' },
    CRITICAL: { bg: 'bg-red-700',    badge: 'bg-red-100 text-red-800' },
} as const;

const SERVICE_LABEL: Record<string, string> = {
    lc_nodejs:  'Media Server',
    workers:    'Worker',
    fastapi:    'API',
    lc_fastapi: 'API',
};

function toUTC(s: string) {
    return s && !s.endsWith('Z') && !s.includes('+') ? s + 'Z' : s;
}

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

// ── Log grouping ───────────────────────────────────────────────────────────────

type RegularGroup = { kind: 'regular'; log: AppLog; prevLog: AppLog | null; isLast: boolean };
type MiniGroup    = { kind: 'mini'; logs: AppLog[]; prevLog: AppLog | null; isLast: boolean };
type LogGroup = RegularGroup | MiniGroup;

function buildLogGroups(logs: AppLog[]): LogGroup[] {
    const groups: LogGroup[] = [];
    let i = 0;
    while (i < logs.length) {
        if (logs[i].is_mini) {
            const miniLogs: AppLog[] = [];
            while (i < logs.length && logs[i].is_mini) miniLogs.push(logs[i++]);
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

// ── Sub-components ─────────────────────────────────────────────────────────────

function MiniLogGroup({ logs, prevLog, isLast }: { logs: AppLog[]; prevLog: AppLog | null; isLast: boolean }) {
    const [expanded, setExpanded] = React.useState(false);
    const firstDate = new Date(toUTC(logs[0].created_at));
    const lastDate  = new Date(toUTC(logs[logs.length - 1].created_at));
    const deltaMs   = prevLog ? firstDate.getTime() - new Date(toUTC(prevLog.created_at)).getTime() : null;
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
                    className="flex items-center gap-1.5 text-left group w-full cursor-pointer"
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
                        {logs.map((log, idx) => {
                            const metaEntries = Object.entries(log.metadata || {})
                                .filter(([, v]) => v !== null && v !== undefined && v !== '');
                            return (
                                <div key={idx} className="flex items-baseline gap-2 flex-wrap">
                                    <span className="text-[10px] text-slate-300 font-mono shrink-0">
                                        {new Date(toUTC(log.created_at)).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
    const date = new Date(toUTC(log.created_at));
    const deltaMs = prevLog ? date.getTime() - new Date(toUTC(prevLog.created_at)).getTime() : null;

    return (
        <div className="flex gap-3">
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

                <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed">{log.message}</p>

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

// ── Public component ───────────────────────────────────────────────────────────

interface AppLogsPanelProps {
    logs: AppLog[];
    loading: boolean;
    emptyMessage?: string;
}

export default function AppLogsPanel({ logs, loading, emptyMessage = 'No activity logged yet.' }: AppLogsPanelProps) {
    return (
        <div className="bg-white rounded-[40px] border border-[#E2E8F0] p-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f3eefe] flex items-center justify-center">
                        <ScrollText size={20} className="text-[#8c00ff]" />
                    </div>
                    <h2 className="text-[20px] font-black text-[#0F172A]">Activity Log</h2>
                </div>
                {!loading && (
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-[#64748B] text-[12px] font-bold">
                        {logs.length} {logs.length === 1 ? 'event' : 'events'}
                    </span>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="relative w-10 h-10">
                        <div className="absolute inset-0 border-4 border-purple-100 rounded-full" />
                        <div className="absolute inset-0 border-4 border-[#8c00ff] border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                    <ScrollText size={48} className="text-slate-200 mb-4" />
                    <p className="font-bold text-slate-400">{emptyMessage}</p>
                </div>
            ) : (
                <div>
                    {buildLogGroups(logs).map((group, i) =>
                        group.kind === 'regular' ? (
                            <LogEntry
                                key={group.log.created_at + group.log.action + i}
                                log={group.log}
                                prevLog={group.prevLog}
                                isLast={group.isLast}
                            />
                        ) : (
                            <MiniLogGroup
                                key={group.logs[0].created_at + i}
                                logs={group.logs}
                                prevLog={group.prevLog}
                                isLast={group.isLast}
                            />
                        )
                    )}
                </div>
            )}
        </div>
    );
}
