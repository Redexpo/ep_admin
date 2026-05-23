'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ChevronLeft, ChevronRight, CheckCircle2, XCircle,
    ChevronDown, ChevronUp, AlertCircle,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminGatewayService, WebhookEvent, GATEWAY_CONFIG, ENV_CONFIG } from '@/services/admin/gatewayService';
import { toast } from 'sonner';

function GatewayBadge({ gateway }: { gateway: string }) {
    const cfg = GATEWAY_CONFIG[gateway] ?? { label: gateway, color: 'text-slate-600', bg: 'bg-slate-100' };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>;
}

function EnvBadge({ env }: { env: string }) {
    const cfg = ENV_CONFIG[env] ?? { label: env, color: 'text-slate-500', bg: 'bg-slate-100' };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>;
}

const GATEWAYS  = ['', 'paddle', 'stripe'];
const ENVS      = ['', 'production', 'sandbox'];

const fmtTs = (d: string) => new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
});

type ProcessedFilter = 'all' | 'yes' | 'no';

export default function GatewayWebhooksPage() {
    const [data,       setData]       = useState<WebhookEvent[]>([]);
    const [loading,    setLoading]    = useState(true);
    const [page,       setPage]       = useState(1);
    const [gateway,    setGateway]    = useState('');
    const [env,        setEnv]        = useState('');
    const [processed,  setProcessed]  = useState<ProcessedFilter>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        try {
            setLoading(true);
            const isProcessed = processed === 'all' ? undefined : processed === 'yes';
            setData(await adminGatewayService.getWebhooks(
                page, gateway || undefined, env || undefined, undefined, isProcessed,
            ));
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to load webhooks');
        } finally {
            setLoading(false);
        }
    }, [page, gateway, env, processed]);

    useEffect(() => { fetch(); }, [fetch]);

    const failedCount = useMemo(() => data.filter(e => !e.processed && e.error).length, [data]);

    return (
        <AdminLayout>
            <div className="p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
                <div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight">Payment Gateway</h1>
                    <p className="text-[14px] text-slate-500 mt-0.5">Incoming webhook events with processing audit trail.</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Filters */}
                    <div className="px-6 py-4 border-b border-slate-50 flex flex-wrap items-center gap-2">
                        {GATEWAYS.map(g => (
                            <button key={g} onClick={() => { setGateway(g); setPage(1); }}
                                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold capitalize transition-all ${
                                    gateway === g ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}>
                                {g === '' ? 'All gateways' : g}
                            </button>
                        ))}
                        <div className="w-px h-5 bg-slate-200 mx-1" />
                        {ENVS.map(e => (
                            <button key={e} onClick={() => { setEnv(e); setPage(1); }}
                                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold capitalize transition-all ${
                                    env === e
                                        ? e === 'production' ? 'bg-green-600 text-white'
                                        : e === 'sandbox'    ? 'bg-amber-500 text-white'
                                        : 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}>
                                {e === '' ? 'All envs' : e}
                            </button>
                        ))}
                        <div className="w-px h-5 bg-slate-200 mx-1" />
                        {(['all', 'yes', 'no'] as ProcessedFilter[]).map(v => (
                            <button key={v} onClick={() => { setProcessed(v); setPage(1); }}
                                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                                    processed === v
                                        ? v === 'yes' ? 'bg-green-600 text-white'
                                        : v === 'no'  ? 'bg-red-500 text-white'
                                        : 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}>
                                {v === 'all' ? 'All' : v === 'yes' ? 'Processed' : 'Unprocessed'}
                            </button>
                        ))}
                    </div>

                    {/* Failed alert */}
                    {!loading && failedCount > 0 && (
                        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-[12px] font-semibold text-red-700">
                            <AlertCircle size={14} /> {failedCount} failed webhook{failedCount > 1 ? 's' : ''} on this page
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto mt-2">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Gateway</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Env</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Event Type</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Transaction ID</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Processed</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Received</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Processed At</th>
                                    <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Payload</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-5 w-20 bg-slate-100 rounded-full" /></td>
                                            <td colSpan={7} className="px-6 py-4"><div className="h-5 bg-slate-100 rounded-lg" /></td>
                                        </tr>
                                    ))
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={8} className="px-6 py-20 text-center text-[13px] text-slate-400">No webhook events found</td></tr>
                                ) : data.map(e => {
                                    const expanded   = expandedId === e.id;
                                    const hasFailed  = !e.processed && !!e.error;
                                    const hasPayload = Object.keys(e.payload_preview).length > 0;
                                    return (
                                        <>
                                            <tr key={e.id} className={`hover:bg-slate-50/60 transition-colors ${hasFailed ? 'bg-red-50/40' : ''}`}>
                                                <td className="px-6 py-3.5"><GatewayBadge gateway={e.gateway} /></td>
                                                <td className="px-6 py-3.5"><EnvBadge env={e.environment} /></td>
                                                <td className="px-6 py-3.5">
                                                    <span className="text-[11px] font-mono font-semibold text-slate-700">{e.event_type}</span>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-[160px] block select-all">
                                                        {e.transaction_id ?? <span className="text-slate-300 not-italic">—</span>}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    {e.processed ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700">
                                                            <CheckCircle2 size={10} /> Yes
                                                        </span>
                                                    ) : e.error ? (
                                                        <div className="space-y-1">
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700">
                                                                <XCircle size={10} /> Failed
                                                            </span>
                                                            <p className="text-[10px] text-red-400 max-w-[180px] truncate">{e.error}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <span className="text-[11px] text-slate-500 whitespace-nowrap">{fmtTs(e.received_at)}</span>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <span className="text-[11px] text-slate-500 whitespace-nowrap">
                                                        {e.processed_at ? fmtTs(e.processed_at) : <span className="text-slate-300">—</span>}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5 text-right">
                                                    {hasPayload && (
                                                        <button
                                                            onClick={() => setExpandedId(expanded ? null : e.id)}
                                                            className="w-8 h-8 inline-flex items-center justify-center rounded-xl text-slate-400 hover:bg-purple-50 hover:text-[#8c00ff] transition-all"
                                                        >
                                                            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                            {expanded && (
                                                <tr key={`${e.id}-payload`} className="bg-slate-50/80">
                                                    <td colSpan={8} className="px-8 py-4">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Payload Preview</p>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-1.5">
                                                            {Object.entries(e.payload_preview).map(([k, v]) => (
                                                                <div key={k} className="flex items-start gap-2">
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide shrink-0 w-24 mt-0.5">{k.replace(/_/g, ' ')}</span>
                                                                    <span className="text-[11px] font-mono text-slate-600 break-all">{String(v)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[12px] text-slate-500">
                            Showing <span className="font-bold text-slate-900">{data.length}</span> events
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}
                                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-[13px] font-bold text-slate-700 px-2">Page {page}</span>
                            <button onClick={() => setPage(p => p + 1)} disabled={data.length < 20 || loading}
                                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
