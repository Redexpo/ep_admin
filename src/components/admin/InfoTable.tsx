'use client';

import { type ReactNode } from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import { toast } from 'sonner';

export function toLabel(key: string) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function CellValue({ value }: { value: any }) {
    if (value === null || value === undefined || value === '') {
        return <span className="text-slate-300 font-mono text-[11px]">—</span>;
    }
    if (typeof value === 'boolean') {
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide ${value ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                {value ? 'Yes' : 'No'}
            </span>
        );
    }
    if (typeof value === 'number') {
        return <span className="font-mono text-[12px] font-bold text-[#0F172A]">{value === -1 ? '∞' : value}</span>;
    }
    const str = String(value);
    const handleCopy = () => {
        navigator.clipboard.writeText(str);
        toast.success('Copied!');
    };
    return (
        <Tooltip text={str} side="top" className="w-full">
            <span
                onClick={handleCopy}
                className="text-[12px] font-bold text-[#0F172A] truncate block w-full text-right cursor-pointer hover:text-[#8c00ff] transition-colors"
            >
                {str}
            </span>
        </Tooltip>
    );
}

export function InfoTable({ title, icon, data }: {
    title: string;
    icon: ReactNode;
    data: Record<string, any> | null | undefined;
}) {
    if (!data) {
        return (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-[#F1F5F9]">
                    {icon}
                    <span className="text-[13px] font-black text-[#0F172A]">{title}</span>
                </div>
                <p className="px-5 py-3 text-[12px] text-slate-400 font-medium italic">No data recorded</p>
            </div>
        );
    }

    const entries = Object.entries(data).filter(([, v]) => v !== undefined);

    return (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#F1F5F9] bg-slate-50/60">
                {icon}
                <span className="text-[13px] font-black text-[#0F172A]">{title}</span>
                <span className="ml-auto text-[11px] font-bold text-slate-300">{entries.length} fields</span>
            </div>
            <div>
                {entries.map(([key, value], i) => (
                    <div key={key} className={`flex items-center gap-4 px-5 py-2 border-b border-[#F8FAFC] last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                        <span className="flex-1 min-w-0 text-[11px] font-medium text-[#475569] tracking-wide">
                            {toLabel(key)}
                        </span>
                        <div className="flex-1 min-w-0">
                            <CellValue value={value} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
