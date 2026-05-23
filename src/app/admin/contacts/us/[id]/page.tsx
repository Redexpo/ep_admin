'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { ArrowLeft, Mail, MessageSquare, Tag, Calendar, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminContactService, AdminContactUs } from '@/services/admin/contactService';
import { toast } from 'sonner';

export default function ContactUsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<AdminContactUs | null>(null);

    const fetchDetail = useCallback(async () => {
        try {
            setIsLoading(true);
            setData(await adminContactService.getContactUsDetail(id));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to load submission');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const fmtTime = (d: string) => new Date(d).toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    });

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="p-8 space-y-4 max-w-3xl mx-auto">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-3xl" />)}
                </div>
            </AdminLayout>
        );
    }

    if (!data) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <div className="p-6 rounded-full bg-red-50 text-red-400"><MessageSquare size={48} strokeWidth={1} /></div>
                    <h2 className="text-[22px] font-black text-slate-900">Submission Not Found</h2>
                    <button onClick={() => router.push('/admin/contacts/us')} className="mt-2 px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold active:scale-95 transition-all">
                        Back to Contact Us
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-8 max-w-3xl mx-auto space-y-8 pb-20">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/contacts/us')}
                        className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-90"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-[24px] font-black text-slate-900 tracking-tight">Contact Us Submission</h1>
                        <p className="text-[13px] text-slate-400 mt-0.5">{fmt(data.created_at)} · {fmtTime(data.created_at)}</p>
                    </div>
                </div>

                {/* Sender card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-[#8c00ff] font-black text-[22px] shrink-0">
                        {data.name[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[18px] font-black text-slate-900">{data.name}</p>
                        <a href={`mailto:${data.email}`} className="text-[14px] text-[#8c00ff] hover:underline font-medium flex items-center gap-1.5 mt-0.5">
                            <Mail size={13} /> {data.email}
                        </a>
                    </div>
                    <a
                        href={`mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}`}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[13px] text-white transition-all hover:scale-[1.02] active:scale-95 shrink-0"
                        style={{ background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)' }}
                    >
                        <Mail size={14} /> Reply
                    </a>
                </div>

                {/* Meta info */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                    {[
                        { icon: <User     size={15} />, label: 'Name',     value: data.name    },
                        { icon: <Mail     size={15} />, label: 'Email',    value: data.email   },
                        { icon: <Tag      size={15} />, label: 'Subject',  value: data.subject },
                        { icon: <Calendar size={15} />, label: 'Received', value: `${fmt(data.created_at)} at ${fmtTime(data.created_at)}` },
                    ].map((row, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4">
                            <div className="text-slate-400 shrink-0">{row.icon}</div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider w-24 shrink-0">{row.label}</span>
                            <span className="text-[13px] font-semibold text-slate-800 break-all">{row.value}</span>
                        </div>
                    ))}
                </div>

                {/* Message */}
                <div className="space-y-3">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#8c00ff] px-1">Message</h3>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <p className="text-[14px] text-slate-800 leading-relaxed whitespace-pre-wrap">{data.message}</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
