'use client';

import React, { useState, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User as UserType } from '@/services/admin/userService';
import {
    LayoutDashboard, Users, Video, AlertCircle, BarChart3,
    HardDrive, Layers, Shield, Globe, Settings, Search,
    Bell, ChevronDown, LogOut, ScrollText, Repeat, Receipt,
    PanelLeftClose, PanelLeftOpen, Building2, FolderOpen, MessageSquare, Briefcase, Camera, MessageCircle, FileText, Landmark, Package, Tag, Webhook,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AuthGuard from '@/components/auth/AuthGuard';
import { authService } from '@/services/admin/authService';
import { toast } from 'sonner';
import CommandPalette from '@/components/admin/CommandPalette';
import { fetchNavCounts, NavCounts } from '@/services/admin/navCountService';

interface AdminLayoutProps { children: ReactNode }

const navGroups: {
    label: string;
    items: { name: string; path: string; icon: React.ElementType; countKey?: keyof NavCounts }[];
}[] = [
    {
        label: 'Overview',
        items: [
            { name: 'Dashboard',  path: '/admin',            icon: LayoutDashboard },
            { name: 'Analytics',  path: '/admin/analytics',  icon: BarChart3 },
        ],
    },
    {
        label: 'Product',
        items: [
            { name: 'Users',        path: '/admin/users',        icon: Users,      countKey: 'users'       },
            { name: 'Videos',       path: '/admin/videos',       icon: Video,      countKey: 'videos'      },
            { name: 'Workspaces',   path: '/admin/workspaces',   icon: Building2,  countKey: 'workspaces'  },
            { name: 'Folders',      path: '/admin/folders',      icon: FolderOpen, countKey: 'folders'     },
            { name: 'Screenshots',     path: '/admin/screenshots',     icon: Camera,    countKey: 'screenshots'    },
            { name: 'Transcriptions',  path: '/admin/transcriptions',  icon: FileText,  countKey: 'transcriptions' },
        ],
    },
    {
        label: 'Revenue',
        items: [
            { name: 'Plans & Pricing',  path: '/admin/plans',          icon: Layers,   countKey: 'plans'         },
            { name: 'Subscriptions',    path: '/admin/subscriptions',  icon: Repeat,   countKey: 'subscriptions' },
            { name: 'Payments',         path: '/admin/payments',       icon: Receipt,  countKey: 'payments'      },
            { name: 'Gateway',          path: '/admin/gateway',                   icon: Landmark },
            { name: 'G. Products',      path: '/admin/gateway/products',          icon: Package  },
            { name: 'G. Prices',        path: '/admin/gateway/prices',            icon: Tag      },
            { name: 'G. Webhooks',      path: '/admin/gateway/webhooks',          icon: Webhook  },
        ],
    },
    {
        label: 'Operations',
        items: [
            { name: 'Reports',        path: '/admin/reports',         icon: AlertCircle,   countKey: 'reports'        },
            { name: 'Storage',        path: '/admin/storage',         icon: HardDrive                                 },
            { name: 'Comments',       path: '/admin/comments',        icon: MessageCircle, countKey: 'comments'       },
            { name: 'Notifications',  path: '/admin/notifications',   icon: Bell,          countKey: 'notifications'  },
            { name: 'Contact Us',     path: '/admin/contacts/us',     icon: MessageSquare, countKey: 'contacts_us'    },
            { name: 'Contact Sales',  path: '/admin/contacts/sales',  icon: Briefcase,     countKey: 'contacts_sales' },
        ],
    },
    {
        label: 'System',
        items: [
            { name: 'Admins',       path: '/admin/admins',    icon: Shield,      countKey: 'admins' },
            { name: 'IP Whitelist', path: '/admin/ips',       icon: Globe,       countKey: 'ips'    },
            { name: 'Logs',         path: '/admin/logs',      icon: ScrollText                      },
            { name: 'Settings',     path: '/admin/settings',  icon: Settings                        },
        ],
    },
];

const SIDEBAR_W  = 220;
const COLLAPSED_W = 60;

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [collapsed, setCollapsed]             = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [user, setUser]           = useState<UserType | null>(null);
    const [navCounts, setNavCounts] = useState<NavCounts | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        authService.getCurrentUser().then(setUser).catch(() => {});
    }, []);

    useEffect(() => {
        fetchNavCounts().then(setNavCounts).catch(() => {});
    }, []);

    const isActive = (path: string) =>
        path === '/admin' ? pathname === '/admin' : pathname.startsWith(path);

    const initials = user
        ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 'A'
        : 'A';

    const displayName = user
        ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email.split('@')[0]
        : 'Admin';

    return (
        <AuthGuard>
            <div className="min-h-screen flex bg-[#F8FAFC]">

                {/* ── Sidebar ── */}
                <aside
                    className="fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-white border-r border-slate-100 transition-all duration-200"
                    style={{ width: collapsed ? COLLAPSED_W : SIDEBAR_W }}
                >
                    {/* Logo */}
                    <div className="h-14 flex items-center px-4 border-b border-slate-100 shrink-0">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: 'linear-gradient(135deg,#8c00ff,#7c3aed)' }}>
                            <Video size={14} strokeWidth={2} color="#fff" />
                        </div>
                        {!collapsed && (
                            <div className="ml-2.5 overflow-hidden">
                                <p className="text-[13px] font-bold text-slate-900 leading-none">EdithPro</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Admin Console</p>
                            </div>
                        )}
                    </div>

                    {/* Nav groups — scrollable */}
                    <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                        {navGroups.map((group) => (
                            <div key={group.label}>
                                {!collapsed && (
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 pt-4 pb-1.5 first:pt-1">
                                        {group.label}
                                    </p>
                                )}
                                {collapsed && <div className="h-3" />}
                                {group.items.map((item) => {
                                    const active = isActive(item.path);
                                    const Icon = item.icon;
                                    const count = item.countKey && navCounts ? navCounts[item.countKey] : undefined;
                                    return (
                                        <Link
                                            key={item.path}
                                            href={item.path}
                                            title={collapsed ? item.name : undefined}
                                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                                                active
                                                    ? 'bg-[#f3eefe] text-[#8c00ff] font-semibold'
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        >
                                            <Icon size={16} strokeWidth={active ? 2 : 1.75} className="shrink-0" />
                                            {!collapsed && (
                                                <>
                                                    <span className="truncate flex-1">{item.name}</span>
                                                    {count !== undefined && count > 0 && (
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center tabular-nums ${
                                                            active
                                                                ? 'bg-[#8c00ff]/15 text-[#8c00ff]'
                                                                : 'bg-slate-100 text-slate-400'
                                                        }`}>
                                                            {count > 9999 ? '9999+' : count.toLocaleString()}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                    {/* User footer */}
                    <div className="border-t border-slate-100 p-3 shrink-0">
                        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden text-white text-[11px] font-bold"
                                style={{ background: 'linear-gradient(135deg,#8c00ff,#7c3aed)' }}
                            >
                                {user?.picture
                                    ? <img src={user.picture} alt="" className="w-full h-full object-cover" />
                                    : initials
                                }
                            </div>
                            {!collapsed && (
                                <>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-semibold text-slate-800 truncate leading-none">{displayName}</p>
                                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email ?? ''}</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            try { await authService.logout(); toast.success('Logged out'); }
                                            catch { toast.error('Logout failed'); }
                                        }}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut size={14} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Collapse toggle */}
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className={`mt-2 w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
                        >
                            {collapsed
                                ? <PanelLeftOpen size={14} />
                                : <><PanelLeftClose size={14} /><span>Collapse</span></>
                            }
                        </button>
                    </div>
                </aside>

                {/* ── Main area ── */}
                <div
                    className="flex-1 flex flex-col min-h-screen transition-all duration-200"
                    style={{ marginLeft: collapsed ? COLLAPSED_W : SIDEBAR_W }}
                >
                    {/* ── Header ── */}
                    <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-6 bg-white border-b border-slate-100">
                        {/* Breadcrumb */}
                        <Breadcrumb pathname={pathname} />

                        {/* Right actions */}
                        <div className="flex items-center gap-1.5">
                            {/* Search trigger */}
                            <button
                                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-400 text-[12px] hover:border-slate-300 hover:text-slate-600 transition-colors"
                                onClick={() => {
                                    const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
                                    window.dispatchEvent(e);
                                }}
                            >
                                <Search size={13} />
                                <span>Search</span>
                                <kbd className="ml-1 text-[10px] text-slate-300 font-mono bg-slate-50 border border-slate-200 px-1 rounded">⌘K</kbd>
                            </button>

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                                    className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <Bell size={16} />
                                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                                </button>

                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                            transition={{ duration: 0.12 }}
                                            className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden"
                                        >
                                            <div className="px-4 py-2.5 border-b border-slate-100">
                                                <p className="text-[12px] font-bold text-slate-700 uppercase tracking-wider">Notifications</p>
                                            </div>
                                            {[
                                                { text: 'New user registered', sub: 'john@example.com', dot: true },
                                                { text: 'Video reported', sub: 'Content moderation queue', dot: true },
                                                { text: 'Storage limit reached', sub: 'For user maria@acme.com', dot: false },
                                            ].map((n, i) => (
                                                <div key={i} className={`px-4 py-3 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-3`}>
                                                    {n.dot && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#8c00ff] shrink-0" />}
                                                    {!n.dot && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-200 shrink-0" />}
                                                    <div>
                                                        <p className="text-[13px] font-medium text-slate-800">{n.text}</p>
                                                        <p className="text-[11px] text-slate-400 mt-0.5">{n.sub}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Profile */}
                            <div className="relative">
                                <button
                                    onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden text-white text-[10px] font-bold shrink-0"
                                        style={{ background: 'linear-gradient(135deg,#8c00ff,#7c3aed)' }}
                                    >
                                        {user?.picture
                                            ? <img src={user.picture} alt="" className="w-full h-full object-cover" />
                                            : initials
                                        }
                                    </div>
                                    <span className="text-[13px] font-medium text-slate-700 hidden sm:block">{displayName}</span>
                                    <ChevronDown size={13} className="text-slate-400" />
                                </button>

                                <AnimatePresence>
                                    {showProfileMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                            transition={{ duration: 0.12 }}
                                            className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden"
                                        >
                                            <div className="px-4 py-3 border-b border-slate-100">
                                                <p className="text-[13px] font-semibold text-slate-800 truncate">{displayName}</p>
                                                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                                            </div>
                                            <div className="py-1">
                                                <Link href="/admin/settings" className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-slate-600 hover:bg-slate-50 transition-colors">
                                                    <Settings size={14} className="text-slate-400" /> Settings
                                                </Link>
                                                <button
                                                    onClick={async () => {
                                                        try { await authService.logout(); toast.success('Logged out'); }
                                                        catch { toast.error('Logout failed'); }
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut size={14} /> Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="flex-1 p-6">
                        {children}
                    </main>
                </div>

                <CommandPalette />

                {(showProfileMenu || showNotifications) && (
                    <div className="fixed inset-0 z-10" onClick={() => { setShowProfileMenu(false); setShowNotifications(false); }} />
                )}
            </div>
        </AuthGuard>
    );
}

/* ── Breadcrumb ── */
function Breadcrumb({ pathname }: { pathname: string }) {
    const crumbMap: Record<string, string> = {
        admin: 'Dashboard', users: 'Users', videos: 'Videos',
        plans: 'Plans & Pricing', subscriptions: 'Subscriptions',
        payments: 'Payments', reports: 'Reports', analytics: 'Analytics',
        storage: 'Storage', admins: 'Admins', ips: 'IP Whitelist',
        logs: 'Logs', settings: 'Settings', edit: 'Edit',
        workspaces: 'Workspaces', folders: 'Folders', screenshots: 'Screenshots',
        contacts: 'Contacts', us: 'Contact Us', sales: 'Contact Sales',
        comments: 'Comments & Reactions',
        transcriptions: 'Transcriptions',
        notifications: 'Notifications',
        gateway: 'Gateway Accounts',
        products: 'Products',
        prices: 'Prices',
        webhooks: 'Webhooks',
    };

    const segments = pathname.split('/').filter(Boolean);

    // Detect dynamic segments (MongoDB IDs or user_id patterns)
    const isDynamic = (seg: string) => /^[a-f0-9]{24}$/.test(seg) || seg.length > 20;

    const crumbs: { label: string; href: string }[] = [];
    let href = '';
    for (const seg of segments) {
        href += `/${seg}`;
        const label = isDynamic(seg) ? 'Detail' : (crumbMap[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1));
        crumbs.push({ label, href });
    }

    if (crumbs.length === 1) {
        return <h1 className="text-[15px] font-bold text-slate-900">{crumbs[0].label}</h1>;
    }

    return (
        <nav className="flex items-center gap-1.5">
            {crumbs.map((c, i) => (
                <span key={c.href} className="flex items-center gap-1.5">
                    {i < crumbs.length - 1 ? (
                        <>
                            <Link href={c.href} className="text-[13px] text-slate-400 hover:text-slate-700 transition-colors font-medium">
                                {c.label}
                            </Link>
                            <span className="text-slate-300 text-[13px]">/</span>
                        </>
                    ) : (
                        <span className="text-[13px] font-bold text-slate-900">{c.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
