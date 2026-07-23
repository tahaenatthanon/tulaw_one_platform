"use client";

import { useState, useMemo } from "react";
import {
  Shield, Check, X,
  LayoutDashboard, LayoutGrid, Newspaper,
  CalendarRange, FileText, FolderKanban,
  UserCog, ScrollText, Settings,
} from "lucide-react";
import { ROLE_PERMISSIONS, type RoleCode } from "@/lib/permissions";

/* ============================================================
   Data
   ============================================================ */

type RoleKey = RoleCode;

interface RoleInfo {
  key: RoleKey;
  name: string;
  description: string;
  level: number;
}

const ROLES: RoleInfo[] = [
  { key: "super_admin", name: "Super Admin", description: "สิทธิ์สูงสุด จัดการทั้งระบบ", level: 100 },
  { key: "system_admin", name: "System Admin", description: "ผู้ดูแลระบบ จัดการผู้ใช้และบทบาท", level: 80 },
  { key: "dean", name: "Dean", description: "คณบดี อนุมัติและติดตามงาน", level: 70 },
  { key: "dept_admin", name: "Dept Admin", description: "หัวหน้าหน่วยงาน อนุมัติภายในหน่วยงาน", level: 50 },
  { key: "user", name: "User", description: "บุคลากรทั่วไป ใช้งานระบบประจำวัน", level: 30 },
  { key: "viewer", name: "Viewer", description: "ผู้อ่านอย่างเดียว ไม่สามารถแก้ไข", level: 10 },
];

// 9 modules ordered by sidebar
const MODULES = [
  { key: "dashboard", name: "Dashboard", icon: LayoutDashboard },
  { key: "application_hub", name: "Application Hub", icon: LayoutGrid },
  { key: "intranet", name: "Intranet", icon: Newspaper },
  { key: "book_meeting", name: "Book Meeting", icon: CalendarRange },
  { key: "documents", name: "Documents", icon: FileText },
  { key: "projects", name: "Projects", icon: FolderKanban },
  { key: "users", name: "Users & Roles", icon: UserCog },
  { key: "audit_log", name: "Audit Log", icon: ScrollText },
  { key: "settings", name: "Settings", icon: Settings },
];

const ACTIONS = ["view", "create", "update", "delete", "export"] as const;

// Direct mapping: permission code → { module, action }
const PERM_CODE_MAP: Record<string, { module: string; action: string }> = {
  DASHBOARD_VIEW:           { module: "dashboard",       action: "view" },
  DASHBOARD_MANAGE:         { module: "dashboard",       action: "create" },
  DASHBOARD_EDIT:           { module: "dashboard",       action: "update" },
  DASHBOARD_MANAGE_ACCESS:  { module: "dashboard",       action: "update" },
  APPLICATION_HUB_VIEW:     { module: "application_hub", action: "view" },
  APPLICATION_HUB_MANAGE:   { module: "application_hub", action: "create" },
  APPLICATION_HUB_PIN:      { module: "application_hub", action: "update" },
  INTRANET_VIEW:            { module: "intranet",        action: "view" },
  INTRANET_CREATE:          { module: "intranet",        action: "create" },
  INTRANET_EDIT:            { module: "intranet",        action: "update" },
  INTRANET_DELETE:          { module: "intranet",        action: "delete" },
  INTRANET_PUBLISH:         { module: "intranet",        action: "update" },
  BOOK_MEETING_VIEW:        { module: "book_meeting",    action: "view" },
  BOOK_MEETING_CREATE:      { module: "book_meeting",    action: "create" },
  BOOK_MEETING_EDIT:        { module: "book_meeting",    action: "update" },
  BOOK_MEETING_DELETE:      { module: "book_meeting",    action: "delete" },
  BOOK_MEETING_APPROVE:     { module: "book_meeting",    action: "update" },
  DOCUMENTS_VIEW:           { module: "documents",       action: "view" },
  DOCUMENTS_UPLOAD:         { module: "documents",       action: "create" },
  DOCUMENTS_EDIT:           { module: "documents",       action: "update" },
  DOCUMENTS_DELETE:         { module: "documents",       action: "delete" },
  DOCUMENTS_SHARE:          { module: "documents",       action: "update" },
  DOCUMENTS_MANAGE_POOL:    { module: "documents",       action: "delete" },
  PROJECTS_VIEW:            { module: "projects",        action: "view" },
  PROJECTS_CREATE:          { module: "projects",        action: "create" },
  PROJECTS_EDIT:            { module: "projects",        action: "update" },
  PROJECTS_DELETE:          { module: "projects",        action: "delete" },
  PROJECTS_APPROVE:         { module: "projects",        action: "update" },
  PROJECTS_MANAGE_ALL:      { module: "projects",        action: "update" },
  USERS_VIEW:               { module: "users",           action: "view" },
  USERS_CREATE:             { module: "users",           action: "create" },
  USERS_EDIT:               { module: "users",           action: "update" },
  USERS_DELETE:             { module: "users",           action: "delete" },
  USERS_MANAGE_ROLES:       { module: "users",           action: "update" },
  USERS_MANAGE_PERMISSIONS: { module: "users",           action: "update" },
  USERS_AD_SYNC:            { module: "users",           action: "update" },
  USERS_BULK_IMPORT:        { module: "users",           action: "create" },
  USERS_BULK_ASSIGN_ROLE:   { module: "users",           action: "update" },
  USERS_BULK_ENABLE:        { module: "users",           action: "update" },
  USERS_BULK_DISABLE:       { module: "users",           action: "update" },
  USERS_UNLOCK_ACCOUNT:     { module: "users",           action: "update" },
  USERS_RESET_MFA:          { module: "users",           action: "update" },
  USERS_EXPORT_SELECTED:    { module: "users",           action: "export" },
  AUDIT_LOG_VIEW:           { module: "audit_log",       action: "view" },
  AUDIT_LOG_EXPORT:         { module: "audit_log",       action: "export" },
  AUDIT_LOG_MANAGE:         { module: "audit_log",       action: "update" },
  SETTINGS_VIEW:            { module: "settings",        action: "view" },
  SETTINGS_MANAGE:          { module: "settings",        action: "update" },
  SETTINGS_API_KEYS:        { module: "settings",        action: "update" },
  SETTINGS_BRANDING:        { module: "settings",        action: "update" },
  SETTINGS_NOTIFICATION:    { module: "settings",        action: "update" },
  SETTINGS_SSO:             { module: "settings",        action: "update" },
};

// Pre-compute permission matrix once (no API call needed)
function computePermissions(): Record<RoleKey, Record<string, string[]>> {
  const result: Record<string, Record<string, Set<string>>> = {};
  for (const [roleKey, permCodes] of Object.entries(ROLE_PERMISSIONS)) {
    result[roleKey] = {};
    for (const code of permCodes as string[]) {
      const mapped = PERM_CODE_MAP[code];
      if (!mapped) continue;
      if (!result[roleKey][mapped.module]) result[roleKey][mapped.module] = new Set();
      result[roleKey][mapped.module].add(mapped.action);
    }
  }
  const final: Record<string, Record<string, string[]>> = {};
  for (const [role, modules] of Object.entries(result)) {
    final[role] = {};
    for (const [mod, actions] of Object.entries(modules)) {
      final[role][mod] = [...actions];
    }
  }
  return final as Record<RoleKey, Record<string, string[]>>;
}

interface RoleSummaryProps {
  roleCounts: Map<string, number>;
}

export function RoleSummary({ roleCounts }: RoleSummaryProps) {
  const [selectedRole, setSelectedRole] = useState<RoleKey>("system_admin");

  // Compute permission matrix once from ROLE_PERMISSIONS — always correct
  const permissions = useMemo(() => computePermissions(), []);

  function getActions(role: RoleKey, moduleKey: string): string[] {
    return permissions[role]?.[moduleKey] ?? [];
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      {/* Role List */}
      <div className="rounded-2xl border border-[var(--tu-border)] bg-[var(--tu-surface)] p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[var(--tu-text-primary)]">Roles</h3>
          <p className="text-xs text-[var(--tu-text-muted)]">คลิกเพื่อดูสิทธิ์ของแต่ละบทบาท</p>
        </div>
        <div className="space-y-2">
          {ROLES.map((r) => {
            const selected = selectedRole === r.key;
            const count = roleCounts.get(r.key) ?? 0;
            return (
              <button
                key={r.key}
                onClick={() => setSelectedRole(r.key)}
                className={`group w-full rounded-xl border p-3.5 text-left transition-all ${
                  selected
                    ? "border-[var(--tu-primary)] bg-[var(--tu-primary-soft)]/60 shadow-sm"
                    : "border-[var(--tu-border)] bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-lg ${
                          selected ? "bg-[var(--tu-primary)] text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Shield size={13} />
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          selected ? "text-[var(--tu-primary)]" : "text-[var(--tu-text-primary)]"
                        }`}
                      >
                        {r.name}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-[var(--tu-text-muted)]">{r.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div
                      className={`rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums ${
                        selected
                          ? "bg-white text-[var(--tu-primary)]"
                          : "bg-slate-100 text-[var(--tu-text-secondary)]"
                      }`}
                    >
                      {count}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-wider text-[var(--tu-text-muted)]">users</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="rounded-2xl border border-[var(--tu-border)] bg-[var(--tu-surface)] p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--tu-text-primary)]">Permission Preview</h3>
            <p className="text-xs text-[var(--tu-text-muted)]">
              สิทธิ์ของ{" "}
              <span className="font-semibold text-[var(--tu-primary)]">
                {ROLES.find((r) => r.key === selectedRole)?.name}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--tu-text-muted)]">
            {ACTIONS.map((a) => (
              <span key={a} className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
                <Check size={10} className="text-emerald-600" /> {a}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {MODULES.map((m) => {
            const allowed = getActions(selectedRole, m.key);
            return (
              <div
                key={m.key}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-[var(--tu-border)] bg-slate-50/40 p-3 sm:grid-cols-[200px_minmax(0,1fr)]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[var(--tu-text-secondary)] shadow-sm">
                    <m.icon size={15} />
                  </span>
                  <span className="text-sm font-medium text-[var(--tu-text-primary)] truncate">{m.name}</span>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1.5 sm:justify-start">
                  {ACTIONS.map((a) => {
                    const on = allowed.includes(a);
                    return (
                      <span
                        key={a}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium capitalize ring-1 ring-inset transition-colors ${
                          on
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-white text-slate-400 ring-slate-200"
                        }`}
                      >
                        {on ? <Check size={10} strokeWidth={3} /> : <X size={10} />}
                        {a}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
