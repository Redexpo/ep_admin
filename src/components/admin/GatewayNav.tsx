'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, Package, Tag, Webhook } from 'lucide-react';

const TABS = [
    { label: 'Accounts',  href: '/admin/gateway',          icon: CreditCard },
    { label: 'Products',  href: '/admin/gateway/products', icon: Package    },
    { label: 'Prices',    href: '/admin/gateway/prices',   icon: Tag        },
    { label: 'Webhooks',  href: '/admin/gateway/webhooks', icon: Webhook    },
];

export default function GatewayNav() {
    const pathname = usePathname();

    return (
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
            {TABS.map(t => {
                const active = pathname === t.href;
                const Icon = t.icon;
                return (
                    <Link
                        key={t.href}
                        href={t.href}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-bold transition-all ${
                            active
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Icon size={14} />
                        {t.label}
                    </Link>
                );
            })}
        </div>
    );
}
