'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Plus, Shield, Edit, Trash2, ChevronLeft, ChevronRight, X,
    Eye, EyeOff, Loader2, Check,
    LayoutDashboard, Users, Video, AlertCircle, BarChart3,
    HardDrive, Layers, Globe, Settings, Bell, ScrollText, Repeat,
    Receipt, Building2, FolderOpen, MessageSquare, Briefcase,
    Camera, MessageCircle, FileText, Landmark,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    adminService, AdminUser, AdminRole,
    CreateAdminInput, UpdateAdminInput, PermissionsPayload,
} from '@/services/admin/adminService';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────────
type ModulePerms = Record<string, boolean>;
type PermissionsState = Record<string, { enabled: boolean; perms: ModulePerms }>;

// ── Modules Config ─────────────────────────────────────────────────────────────
const MODULE_GROUPS: {
    group: string;
    modules: { key: string; label: string; icon: React.ElementType; perms: { key: string; label: string }[] }[];
}[] = [
    {
        group: 'Overview',
        modules: [
            { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, perms: [
                { key: 'view', label: 'View' },
            ]},
            { key: 'analytics', label: 'Analytics', icon: BarChart3, perms: [
                { key: 'view', label: 'View' },
                { key: 'export', label: 'Export' },
            ]},
        ],
    },
    {
        group: 'Product',
        modules: [
            { key: 'users', label: 'Users', icon: Users, perms: [
                { key: 'view',   label: 'View'   },
                { key: 'edit',   label: 'Edit'   },
                { key: 'delete', label: 'Delete' },
                { key: 'export', label: 'Export' },
            ]},
            { key: 'videos', label: 'Videos', icon: Video, perms: [
                { key: 'view',   label: 'View'   },
                { key: 'delete', label: 'Delete' },
                { key: 'flag',   label: 'Flag'   },
            ]},
            { key: 'workspaces', label: 'Workspaces', icon: Building2, perms: [
                { key: 'view',   label: 'View'   },
                { key: 'edit',   label: 'Edit'   },
                { key: 'delete', label: 'Delete' },
            ]},
            { key: 'folders', label: 'Folders', icon: FolderOpen, perms: [
                { key: 'view',   label: 'View'   },
                { key: 'delete', label: 'Delete' },
            ]},
            { key: 'screenshots', label: 'Screenshots', icon: Camera, perms: [
                { key: 'view',   label: 'View'   },
                { key: 'delete', label: 'Delete' },
            ]},
            { key: 'transcriptions', label: 'Transcriptions', icon: FileText, perms: [
                { key: 'view',   label: 'View'   },
                { key: 'delete', label: 'Delete' },
            ]},
        ],
    },
    {
        group: 'Revenue',
        modules: [
            { key: 'plans', label: 'Plans & Pricing', icon: Layers, perms: [
                { key: 'view',   label: 'View'   },
                { key: 'create', label: 'Create' },
                { key: 'edit',   label: 'Edit'   },
                { key: 'delete', label: 'Delete' },
            ]},
            { key: 'subscriptions', label: 'Subscriptions', icon: Repeat, perms: [
                { key: 'view',   label: 'View'   },
                { key: 'edit',   label: 'Edit'   },
                { key: 'cancel', label: 'Cancel' },
            ]},
            { key: 'payments', label: 'Payments', icon: Receipt, perms: [
                { key: 'view',   label: 'View'   },
                { key: 'refund', label: 'Refund' },
            ]},
            { key: 'gateway', label: 'Gateway', icon: Landmark, perms: [
                { key: 'view',     label: 'View'     },
                { key: 'edit',     label: 'Edit'     },
                { key: 'products', label: 'Products' },
                { key: 'prices',   label: 'Prices'   },
                { key: 'webhooks', label: 'Webhooks' },
            ]},
        ],
    },
    {
        group: 'Operations',
        modules: [
            { key: 'reports', label: 'Reports', icon: AlertCircle, perms: [
                { key: 'view',    label: 'View'    },
                { key: 'resolve', label: 'Resolve' },
                { key: 'delete',  label: 'Delete'  },
            ]},
            { key: 'storage', label: 'Storage', icon: HardDrive, perms: [
                { key: 'view', label: 'View' },
            ]},
            { key: 'comments', label: 'Comments', icon: MessageCircle, perms: [
                { key: 'view',   label: 'View'   },
                { key: 'delete', label: 'Delete' },
            ]},
            { key: 'notifications', label: 'Notifications', icon: Bell, perms: [
                { key: 'view',   label: 'View'   },
                { key: 'create', label: 'Create' },
                { key: 'delete', label: 'Delete' },
            ]},
            { key: 'contacts_us', label: 'Contact Us', icon: MessageSquare, perms: [
                { key: 'view',   label: 'View'   },
                { key: 'reply',  label: 'Reply'  },
                { key: 'delete', label: 'Delete' },
            ]},
            { key: 'contacts_sales', label: 'Contact Sales', icon: Briefcase, perms: [
                { key: 'view',   label: 'View'   },
                { key: 'reply',  label: 'Reply'  },
                { key: 'delete', label: 'Delete' },
            ]},
        ],
    },
    {
        group: 'System',
        modules: [
            { key: 'admins', label: 'Admins', icon: Shield, perms: [
                { key: 'view',   label: 'View'   },
                { key: 'create', label: 'Create' },
                { key: 'edit',   label: 'Edit'   },
                { key: 'delete', label: 'Delete' },
            ]},
            { key: 'ips', label: 'IP Whitelist', icon: Globe, perms: [
                { key: 'view',    label: 'View'     },
                { key: 'block',   label: 'Block IP' },
                { key: 'delete',  label: 'Delete'   },
            ]},
            { key: 'logs', label: 'Logs', icon: ScrollText, perms: [
                { key: 'view', label: 'View' },
            ]},
            { key: 'settings', label: 'Settings', icon: Settings, perms: [
                { key: 'view', label: 'View' },
                { key: 'edit', label: 'Edit' },
            ]},
        ],
    },
];

function buildDefaultPermissions(): PermissionsState {
    const state: PermissionsState = {};
    for (const group of MODULE_GROUPS) {
        for (const mod of group.modules) {
            state[mod.key] = {
                enabled: false,
                perms: Object.fromEntries(mod.perms.map(p => [p.key, false])),
            };
        }
    }
    return state;
}

// ── Role config ────────────────────────────────────────────────────────────────
const ROLES: { value: AdminRole; label: string; color: string; bg: string }[] = [
    { value: 'super_admin', label: 'Super Admin', color: '#8c00ff', bg: 'rgba(140,0,255,0.10)' },
    { value: 'moderator',   label: 'Moderator',   color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
    { value: 'support',     label: 'Support',     color: '#22c55e', bg: 'rgba(34,197,94,0.10)'  },
];

function getRoleStyle(role: string) {
    return ROLES.find(r => r.value === role) ?? { label: role, color: '#64748B', bg: 'rgba(100,116,139,0.10)' };
}

function getInitials(first: string, last: string) {
    return `${(first ?? '').charAt(0)}${(last ?? '').charAt(0)}`.toUpperCase();
}

function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelative(iso: string | null) {
    if (!iso) return 'Never';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

// ── Permission Pill ────────────────────────────────────────────────────────────
function PermissionPill({
    label, checked, disabled,
    onChange,
}: {
    label: string;
    checked: boolean;
    disabled: boolean;
    onChange: () => void;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onChange}
            className={`inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-lg text-[11px] font-medium border transition-all select-none ${
                disabled
                    ? 'bg-[#F8FAFC] text-[#CBD5E1] border-[#F1F5F9] cursor-not-allowed'
                    : checked
                        ? 'bg-[#8c00ff]/10 text-[#8c00ff] border-[#8c00ff]/20 cursor-pointer'
                        : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#8c00ff]/25 hover:text-[#8c00ff] cursor-pointer'
            }`}
        >
            <span className={`w-3 h-3 rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-all ${
                disabled
                    ? 'border-[#CBD5E1]'
                    : checked
                        ? 'border-[#8c00ff] bg-[#8c00ff]'
                        : 'border-[#CBD5E1]'
            }`}>
                {checked && !disabled && <Check size={7} strokeWidth={3.5} className="text-white" />}
            </span>
            {label}
        </button>
    );
}

// ── Module Row ─────────────────────────────────────────────────────────────────
type ModuleDef = (typeof MODULE_GROUPS)[0]['modules'][0];

function ModuleRow({
    mod, state, onChange,
}: {
    mod: ModuleDef;
    state: { enabled: boolean; perms: ModulePerms };
    onChange: (enabled: boolean, perms: ModulePerms) => void;
}) {
    const Icon = mod.icon;

    const toggleModule = () => {
        const next = !state.enabled;
        const perms = { ...state.perms };
        // auto-check "view" when enabling
        if (next && 'view' in perms) perms['view'] = true;
        onChange(next, perms);
    };

    const togglePerm = (key: string) => {
        onChange(state.enabled, { ...state.perms, [key]: !state.perms[key] });
    };

    const allPermsChecked = mod.perms.every(p => state.perms[p.key]);

    const toggleAllPerms = () => {
        const next = !allPermsChecked;
        onChange(state.enabled, Object.fromEntries(mod.perms.map(p => [p.key, next])));
    };

    return (
        <div className={`flex items-start gap-3 px-4 py-3 transition-colors ${
            state.enabled ? 'bg-[#faf5ff]' : 'hover:bg-[#FAFAFA]'
        }`}>
            {/* Master checkbox */}
            <button
                type="button"
                onClick={toggleModule}
                className={`mt-[3px] w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    state.enabled
                        ? 'border-[#8c00ff] bg-[#8c00ff]'
                        : 'border-[#CBD5E1] bg-white hover:border-[#8c00ff]/60'
                }`}
            >
                {state.enabled && <Check size={9} strokeWidth={3.5} className="text-white" />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Icon
                            size={14}
                            strokeWidth={1.75}
                            className={state.enabled ? 'text-[#8c00ff]' : 'text-[#94A3B8]'}
                        />
                        <span className={`text-[13px] font-semibold leading-none ${
                            state.enabled ? 'text-[#0F172A]' : 'text-[#64748B]'
                        }`}>
                            {mod.label}
                        </span>
                    </div>

                    {/* Select all / clear per module */}
                    {state.enabled && mod.perms.length > 1 && (
                        <button
                            type="button"
                            onClick={toggleAllPerms}
                            className="text-[11px] font-medium text-[#94A3B8] hover:text-[#8c00ff] transition-colors"
                        >
                            {allPermsChecked ? 'Clear all' : 'Select all'}
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {mod.perms.map(perm => (
                        <PermissionPill
                            key={perm.key}
                            label={perm.label}
                            checked={!!state.perms[perm.key]}
                            disabled={!state.enabled}
                            onChange={() => togglePerm(perm.key)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Permissions Section ────────────────────────────────────────────────────────
function PermissionsSection({
    permissions, onChange,
}: {
    permissions: PermissionsState;
    onChange: (p: PermissionsState) => void;
}) {
    const allModules = MODULE_GROUPS.flatMap(g => g.modules);
    const allEnabled = allModules.every(m => permissions[m.key]?.enabled);

    const grantAll = () => {
        const next: PermissionsState = {};
        for (const group of MODULE_GROUPS) {
            for (const mod of group.modules) {
                next[mod.key] = {
                    enabled: true,
                    perms: Object.fromEntries(mod.perms.map(p => [p.key, true])),
                };
            }
        }
        onChange(next);
    };

    const revokeAll = () => {
        onChange(buildDefaultPermissions());
    };

    const handleModuleChange = (key: string, enabled: boolean, perms: ModulePerms) => {
        onChange({ ...permissions, [key]: { enabled, perms } });
    };

    // Count enabled modules
    const enabledCount = allModules.filter(m => permissions[m.key]?.enabled).length;

    return (
        <div className="space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-[14px] font-semibold text-[#0F172A]">Module Permissions</h3>
                    <p className="text-[12px] text-[#94A3B8] mt-0.5">
                        {enabledCount === 0
                            ? 'No modules enabled — admin will have no access'
                            : `${enabledCount} of ${allModules.length} modules enabled`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {!allEnabled && (
                        <button
                            type="button"
                            onClick={grantAll}
                            className="text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-[#8c00ff]/20 text-[#8c00ff] hover:bg-[#8c00ff]/5 transition-all"
                        >
                            Grant All
                        </button>
                    )}
                    {enabledCount > 0 && (
                        <button
                            type="button"
                            onClick={revokeAll}
                            className="text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-all"
                        >
                            Revoke All
                        </button>
                    )}
                </div>
            </div>

            {/* Groups */}
            {MODULE_GROUPS.map(group => {
                const groupEnabledCount = group.modules.filter(m => permissions[m.key]?.enabled).length;
                return (
                    <div key={group.group} className="rounded-2xl border border-[#E2E8F0] overflow-hidden">
                        {/* Group header */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                                {group.group}
                            </span>
                            {groupEnabledCount > 0 && (
                                <span className="text-[11px] font-semibold text-[#8c00ff] bg-[#8c00ff]/10 px-2 py-0.5 rounded-full">
                                    {groupEnabledCount}/{group.modules.length}
                                </span>
                            )}
                        </div>

                        {/* Module rows */}
                        <div className="divide-y divide-[#F8FAFC]">
                            {group.modules.map(mod => (
                                <ModuleRow
                                    key={mod.key}
                                    mod={mod}
                                    state={
                                        permissions[mod.key] ?? {
                                            enabled: false,
                                            perms: Object.fromEntries(mod.perms.map(p => [p.key, false])),
                                        }
                                    }
                                    onChange={(enabled, perms) => handleModuleChange(mod.key, enabled, perms)}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Admin Drawer (Create / Edit) ───────────────────────────────────────────────
const INPUT_CLS = `
    w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-[13px] text-[#0F172A]
    focus:outline-none focus:border-[#8c00ff] focus:ring-2 focus:ring-[#8c00ff]/10 transition-all
    placeholder:text-[#CBD5E1] bg-white
`.trim();

interface AdminDrawerProps {
    mode: 'create' | 'edit';
    admin?: AdminUser;
    onClose: () => void;
    onSuccess: () => void;
}

function AdminDrawer({ mode, admin, onClose, onSuccess }: AdminDrawerProps) {
    const [form, setForm] = useState({
        email:      admin?.email      ?? '',
        first_name: admin?.first_name ?? '',
        last_name:  admin?.last_name  ?? '',
        password:   '',
        admin_role: (admin?.admin_role ?? 'moderator') as AdminRole,
        is_active:  admin?.is_active  ?? true,
    });
    const [showPw, setShowPw]                   = useState(false);
    const [permissions, setPermissions]         = useState<PermissionsState>(buildDefaultPermissions());
    const [permissionsLoading, setPermsLoading] = useState(mode === 'edit');
    const [submitting, setSubmitting]           = useState(false);

    const roleStyle = getRoleStyle(form.admin_role);

    // Load existing permissions when editing
    useEffect(() => {
        if (mode !== 'edit' || !admin) return;
        setPermsLoading(true);
        adminService.getPermissions(admin.id)
            .then(res => {
                if (res.status === 'success' && res.data.permissions) {
                    // Merge with defaults so every module row is always present
                    setPermissions({ ...buildDefaultPermissions(), ...res.data.permissions } as PermissionsState);
                }
            })
            .catch(() => { /* non-critical — keep defaults */ })
            .finally(() => setPermsLoading(false));
    }, [mode, admin]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.first_name.trim() || !form.last_name.trim()) {
            toast.error('First and last name are required.');
            return;
        }
        if (mode === 'create') {
            if (!form.email.trim()) { toast.error('Email is required.'); return; }
            if (!form.password.trim()) { toast.error('Password is required.'); return; }
        }
        setSubmitting(true);
        try {
            if (mode === 'create') {
                const input: CreateAdminInput = {
                    email:       form.email.trim(),
                    first_name:  form.first_name.trim(),
                    last_name:   form.last_name.trim(),
                    password:    form.password,
                    admin_role:  form.admin_role,
                    permissions: permissions as unknown as PermissionsPayload,
                };
                const res = await adminService.createAdmin(input);
                if (res.status === 'success') { toast.success(res.message); onSuccess(); }
                else toast.error(res.message);
            } else if (admin) {
                const input: UpdateAdminInput = {
                    first_name: form.first_name.trim(),
                    last_name:  form.last_name.trim(),
                    admin_role: form.admin_role,
                    is_active:  form.is_active,
                };
                const [detailRes, permRes] = await Promise.all([
                    adminService.updateAdmin(admin.id, input),
                    adminService.savePermissions(admin.id, permissions as unknown as PermissionsPayload),
                ]);
                if (detailRes.status !== 'success') { toast.error(detailRes.message); return; }
                if (permRes.status !== 'success') toast.warning('Permissions could not be saved.');
                else toast.success('Admin updated successfully.');
                onSuccess();
            }
        } catch {
            toast.error('Something went wrong.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-white shadow-2xl"
                style={{ width: 'min(680px, 100vw)' }}>

                {/* ── Drawer Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-all"
                        >
                            <X size={18} strokeWidth={1.5} />
                        </button>
                        <div className="w-px h-5 bg-[#E2E8F0]" />
                        <h2 className="text-[16px] font-semibold text-[#0F172A]">
                            {mode === 'create' ? 'Add Admin' : 'Edit Admin'}
                        </h2>
                        <span
                            className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                            style={{ backgroundColor: roleStyle.bg, color: roleStyle.color }}
                        >
                            {roleStyle.label}
                        </span>
                    </div>
                    <button
                        form="admin-drawer-form"
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)' }}
                    >
                        {submitting && <Loader2 size={14} className="animate-spin" />}
                        {mode === 'create' ? 'Create Admin' : 'Save Changes'}
                    </button>
                </div>

                {/* ── Scrollable Body ── */}
                <form
                    id="admin-drawer-form"
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto px-6 py-6 space-y-8"
                >
                    {/* ─ Admin Details ─ */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 rounded-md bg-[#8c00ff]/10 flex items-center justify-center">
                                <Shield size={11} className="text-[#8c00ff]" />
                            </div>
                            <h3 className="text-[13px] font-bold text-[#0F172A] uppercase tracking-wide">
                                Admin Details
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {/* Name row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#64748B] mb-1.5">
                                        First Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        className={INPUT_CLS}
                                        placeholder="John"
                                        value={form.first_name}
                                        onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#64748B] mb-1.5">
                                        Last Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        className={INPUT_CLS}
                                        placeholder="Doe"
                                        value={form.last_name}
                                        onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* Email (create only) */}
                            {mode === 'create' && (
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#64748B] mb-1.5">
                                        Email Address <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className={INPUT_CLS}
                                        placeholder="admin@edithpro.app"
                                        value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    />
                                </div>
                            )}

                            {/* Password (create only) */}
                            {mode === 'create' && (
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#64748B] mb-1.5">
                                        Password <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPw ? 'text' : 'password'}
                                            className={`${INPUT_CLS} pr-10`}
                                            placeholder="Min. 8 characters"
                                            value={form.password}
                                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors"
                                        >
                                            {showPw
                                                ? <EyeOff size={15} strokeWidth={1.5} />
                                                : <Eye    size={15} strokeWidth={1.5} />
                                            }
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Role */}
                            <div>
                                <label className="block text-[12px] font-semibold text-[#64748B] mb-1.5">
                                    Role
                                </label>
                                <select
                                    className={INPUT_CLS}
                                    value={form.admin_role}
                                    onChange={e => setForm(f => ({ ...f, admin_role: e.target.value as AdminRole }))}
                                >
                                    {ROLES.map(r => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Active toggle (edit only) */}
                            {mode === 'edit' && (
                                <div className="flex items-center justify-between px-3.5 py-3 rounded-xl border border-[#E2E8F0] bg-[#FAFAFA]">
                                    <div>
                                        <p className="text-[13px] font-semibold text-[#0F172A]">Active</p>
                                        <p className="text-[11px] text-[#94A3B8] mt-0.5">Admin can log in and access the panel</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                                        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                                            form.is_active ? 'bg-[#8c00ff]' : 'bg-[#E2E8F0]'
                                        }`}
                                    >
                                        <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${
                                            form.is_active ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ─ Divider ─ */}
                    <div className="h-px bg-[#F1F5F9]" />

                    {/* ─ Permissions ─ */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 rounded-md bg-[#8c00ff]/10 flex items-center justify-center">
                                <Check size={11} className="text-[#8c00ff]" />
                            </div>
                            <h3 className="text-[13px] font-bold text-[#0F172A] uppercase tracking-wide">
                                Permissions
                            </h3>
                        </div>

                        {permissionsLoading ? (
                            <div className="flex items-center justify-center gap-3 py-16">
                                <Loader2 size={20} className="animate-spin text-[#8c00ff]" />
                                <span className="text-[13px] text-[#94A3B8]">Loading permissions…</span>
                            </div>
                        ) : (
                            <PermissionsSection
                                permissions={permissions}
                                onChange={setPermissions}
                            />
                        )}
                    </section>
                </form>
            </div>
        </>
    );
}

// ── Delete Confirmation ────────────────────────────────────────────────────────
interface DeleteConfirmProps {
    admin: AdminUser;
    onClose: () => void;
    onSuccess: () => void;
}

function DeleteConfirm({ admin, onClose, onSuccess }: DeleteConfirmProps) {
    const [submitting, setSubmitting] = useState(false);

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            const res = await adminService.deleteAdmin(admin.id);
            if (res.status === 'success') { toast.success(res.message); onSuccess(); }
            else toast.error(res.message);
        } catch {
            toast.error('Something went wrong.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[17px] font-semibold text-[#0F172A]">Revoke Access</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F8FAFC] transition-all">
                        <X size={17} strokeWidth={1.5} />
                    </button>
                </div>
                <p className="text-[13px] leading-[20px] text-[#64748B] mb-6">
                    Remove admin access for{' '}
                    <span className="font-semibold text-[#0F172A]">
                        {admin.first_name} {admin.last_name}
                    </span>
                    ? They will no longer be able to access the admin panel.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[13px] font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-60"
                    >
                        {submitting && <Loader2 size={14} className="animate-spin" />}
                        Revoke Access
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminAdminsPage() {
    const [admins, setAdmins]           = useState<AdminUser[]>([]);
    const [loading, setLoading]         = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages]   = useState(1);
    const [totalAdmins, setTotalAdmins] = useState(0);
    const [activeToday, setActiveToday] = useState(0);

    const [drawer, setDrawer] = useState<{
        open: boolean; mode: 'create' | 'edit'; admin?: AdminUser;
    }>({ open: false, mode: 'create' });
    const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

    const PER_PAGE = 10;

    const fetchAdmins = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const res = await adminService.getAdmins(page, PER_PAGE);
            if (res.status === 'success') {
                setAdmins(res.data.results);
                setTotalPages(res.data.pagination.total_pages);
                setTotalAdmins(res.data.pagination.total);
            }
        } catch {
            toast.error('Failed to load admins.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const res = await adminService.getAdminStats();
            if (res.status === 'success') setActiveToday(res.data.active_today);
        } catch { /* non-critical */ }
    }, []);

    useEffect(() => { fetchAdmins(currentPage); }, [currentPage, fetchAdmins]);
    useEffect(() => { fetchStats(); }, [fetchStats]);

    const handleDrawerSuccess = () => {
        setDrawer({ open: false, mode: 'create' });
        fetchAdmins(currentPage);
        fetchStats();
    };

    const handleDeleteSuccess = () => {
        setDeleteTarget(null);
        fetchAdmins(currentPage);
        fetchStats();
    };

    const start = (currentPage - 1) * PER_PAGE + 1;
    const end   = Math.min(currentPage * PER_PAGE, totalAdmins);

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[28px] leading-[36px] font-semibold mb-1 text-[#0F172A]">
                            Admin Management
                        </h1>
                        <p className="text-[14px] text-[#64748B]">Manage admin users and their permissions</p>
                    </div>
                    <button
                        onClick={() => setDrawer({ open: true, mode: 'create' })}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-[13px] text-white shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)' }}
                    >
                        <Plus size={17} strokeWidth={2} />
                        Add Admin
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Total Admins',    value: totalAdmins },
                        { label: 'Active Today',    value: activeToday },
                        { label: 'Pending Invites', value: 0           },
                    ].map((stat, i) => (
                        <div key={i} className="rounded-2xl p-4 bg-white shadow-sm border border-[#E2E8F0]">
                            <p className="text-[13px] font-semibold text-[#94A3B8] mb-1">{stat.label}</p>
                            <h3 className="text-[28px] font-bold text-[#0F172A]">
                                {loading ? '—' : stat.value}
                            </h3>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="rounded-2xl overflow-hidden shadow-sm border border-[#E2E8F0] bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                                    {['Admin', 'Role', 'Modules', 'Created', 'Last Active', ''].map((h, i) => (
                                        <th
                                            key={i}
                                            className={`${i === 5 ? 'text-right' : 'text-left'} px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-14 text-center">
                                            <Loader2 size={24} className="animate-spin text-[#8c00ff] mx-auto" />
                                        </td>
                                    </tr>
                                ) : admins.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-14 text-center text-[14px] text-[#94A3B8]">
                                            No admin users found.
                                        </td>
                                    </tr>
                                ) : (
                                    admins.map(admin => {
                                        const roleStyle = getRoleStyle(admin.admin_role);
                                        return (
                                            <tr
                                                key={admin.id}
                                                className="transition-colors hover:bg-[#FAFAFA]"
                                                style={{ borderBottom: '1px solid #F8FAFC' }}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                                            style={{ background: 'linear-gradient(135deg, #8c00ff 0%, #7c3aed 100%)' }}
                                                        >
                                                            <span className="text-white text-[11px] font-bold">
                                                                {getInitials(admin.first_name, admin.last_name)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="text-[13px] font-semibold text-[#0F172A]">
                                                                {admin.first_name} {admin.last_name}
                                                            </div>
                                                            <div className="text-[12px] text-[#94A3B8]">
                                                                {admin.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold"
                                                        style={{ backgroundColor: roleStyle.bg, color: roleStyle.color }}
                                                    >
                                                        {roleStyle.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {(admin.enabled_modules ?? 0) > 0 ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#8c00ff]/10 text-[#8c00ff]">
                                                            {admin.enabled_modules} / 22
                                                        </span>
                                                    ) : (
                                                        <span className="text-[12px] text-[#CBD5E1]">No access</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-[13px] text-[#64748B]">
                                                    {formatDate(admin.created_at)}
                                                </td>
                                                <td className="px-6 py-4 text-[13px] text-[#64748B]">
                                                    {formatRelative(admin.last_active)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setDrawer({ open: true, mode: 'edit', admin })}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-all"
                                                        >
                                                            <Edit size={15} strokeWidth={1.5} className="text-[#64748B]" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteTarget(admin)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                                                            style={{ backgroundColor: 'rgba(239,68,68,0.08)' }}
                                                        >
                                                            <Trash2 size={15} strokeWidth={1.5} style={{ color: '#ef4444' }} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div
                        className="flex items-center justify-between px-6 py-4"
                        style={{ borderTop: '1px solid #E2E8F0' }}
                    >
                        <span className="text-[13px] text-[#94A3B8]">
                            {totalAdmins === 0 ? 'No admins' : `Showing ${start}–${end} of ${totalAdmins} admins`}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage <= 1}
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={15} strokeWidth={1.5} className="text-[#64748B]" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages}
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={15} strokeWidth={1.5} className="text-[#64748B]" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {drawer.open && (
                <AdminDrawer
                    mode={drawer.mode}
                    admin={drawer.admin}
                    onClose={() => setDrawer({ open: false, mode: 'create' })}
                    onSuccess={handleDrawerSuccess}
                />
            )}

            {deleteTarget && (
                <DeleteConfirm
                    admin={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onSuccess={handleDeleteSuccess}
                />
            )}
        </AdminLayout>
    );
}
