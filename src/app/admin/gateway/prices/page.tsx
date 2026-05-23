'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Archive } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminGatewayService, CatalogPrice, GATEWAY_CONFIG, ENV_CONFIG } from '@/services/admin/gatewayService';
import { toast } from 'sonner';

function GatewayBadge({ gateway }: { gateway: string }) {
    const cfg = GATEWAY_CONFIG[gateway] ?? { label: gateway, color: 'text-slate-600', bg: 'bg-slate-100' };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>;
}

function EnvBadge({ env }: { env: string }) {
    const cfg = ENV_CONFIG[env] ?? { label: env, color: 'text-slate-500', bg: 'bg-slate-100' };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>;
}

const GATEWAYS = ['', 'paddle', 'stripe'];
const ENVS     = ['', 'production', 'sandbox'];
const CYCLES   = ['', 'monthly', 'annual'];

const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export default function GatewayPricesPage() {
    const [data,    setData]    = useState<CatalogPrice[]>([]);
    const [loading, setLoading] = useState(true);
    const [gateway, setGateway] = useState('');
    const [env,     setEnv]     = useState('');
    const [cycle,   setCycle]   = useState('');

    const fetch = useCallback(async () => {
        try {
            setLoading(true);
            setData(await adminGatewayService.getPrices(gateway || undefined, env || undefined, cycle || undefined));
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to load prices');
        } finally {
            setLoading(false);
        }
    }, [gateway, env, cycle]);

    useEffect(() => { fetch(); }, [fetch]);

    return (
        <AdminLayout>
            <div className="p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
                <div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight">Payment Gateway</h1>
                    <p className="text-[14px] text-slate-500 mt-0.5">Catalog prices synced to the gateway per plan and billing cycle.</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Filters */}
                    <div className="px-6 py-4 border-b border-slate-50 flex flex-wrap items-center gap-2">
                        {GATEWAYS.map(g => (
                            <button key={g} onClick={() => setGateway(g)}
                                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold capitalize transition-all ${
                                    gateway === g ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}>
                                {g === '' ? 'All gateways' : g}
                            </button>
                        ))}
                        <div className="w-px h-5 bg-slate-200 mx-1" />
                        {ENVS.map(e => (
                            <button key={e} onClick={() => setEnv(e)}
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
                        {CYCLES.map(c => (
                            <button key={c} onClick={() => setCycle(c)}
                                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold capitalize transition-all ${
                                    cycle === c ? 'bg-[#8c00ff] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}>
                                {c === '' ? 'All cycles' : c}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Gateway</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Env</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Plan</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cycle</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Seats</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Kind</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Price ID</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-5 w-20 bg-slate-100 rounded-full" /></td>
                                            <td colSpan={9} className="px-6 py-4"><div className="h-5 bg-slate-100 rounded-lg" /></td>
                                        </tr>
                                    ))
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={10} className="px-6 py-20 text-center text-[13px] text-slate-400">No prices synced</td></tr>
                                ) : data.map(p => (
                                    <tr key={p.id} className={`hover:bg-slate-50/60 transition-colors ${!p.is_active ? 'opacity-50' : ''}`}>
                                        <td className="px-6 py-4"><GatewayBadge gateway={p.gateway} /></td>
                                        <td className="px-6 py-4"><EnvBadge env={p.environment} /></td>
                                        <td className="px-6 py-4">
                                            <span className="text-[13px] font-bold text-slate-900">
                                                {p.plan_name ?? <span className="text-slate-400 italic font-normal">Unknown</span>}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[11px] font-bold capitalize px-2.5 py-0.5 rounded-lg ${
                                                p.billing_cycle === 'annual' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                                            }`}>{p.billing_cycle}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[14px] font-black text-slate-900">
                                                ${p.unit_amount.toFixed(2)}
                                                <span className="text-[10px] font-medium text-slate-400 ml-1">{p.currency}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[12px] font-semibold text-slate-700">{p.seat_count}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] text-slate-500 capitalize">{p.price_kind.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] font-mono text-slate-500 select-all">{p.external_price_id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {p.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700">
                                                    <CheckCircle2 size={10} /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                                                    <Archive size={10} /> {p.archived_at ? 'Archived' : 'Inactive'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4"><span className="text-[12px] text-slate-500">{fmt(p.created_at)}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
