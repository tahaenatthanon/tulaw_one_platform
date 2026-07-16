"use client";

import { useEffect, useState } from "react";
import { X, User, Shield, Key, History, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchApi } from "@/lib/fetcher";

interface UserDetail {
  profile: {
    id: string;
    name: string;
    email: string;
    department: string | null;
    authSource: string;
    status: string;
    mfaEnabled: boolean;
    mfaVerifiedAt: string | null;
    lastAdSyncAt: string | null;
    lastLogin: string | null;
    ipAddress: string | null;
    isLocked: boolean;
  };
  roles: Array<{ id: number; name: string; code: string; level: number }>;
  permissions: string[];
  activity: Array<{ id: string; action: string; module: string; timestamp: string; ipAddress?: string | null }>;
  sessions: Array<{
    id: string;
    device: string;
    browser: string;
    ipAddress: string | null;
    loginTime: string | null;
    lastActivity: string | null;
    status: string;
  }>;
}

type TabId = "profile" | "roles" | "permissions" | "activity" | "sessions";

const TABS: { id: TabId; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "permissions", label: "Permissions", icon: Key },
  { id: "activity", label: "Activity", icon: History },
  { id: "sessions", label: "Sessions", icon: Monitor },
];

interface UserDetailDrawerProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = d.getDate().toString().padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year} ${hours}:${mins}`;
}

export function UserDetailDrawer({ userId, isOpen, onClose }: UserDetailDrawerProps) {
  const [tab, setTab] = useState<TabId>("profile");
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !userId) return;
    setLoading(true);
    setError(null);
    setTab("profile");
    fetchApi<UserDetail>(`/api/users/${userId}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[380px] lg:w-[440px] max-w-[100vw] bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-tu-border">
          <h3 className="text-base font-semibold text-tu-text-primary">
            {loading ? "กำลังโหลด..." : data?.profile.name ?? "User Detail"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 hover:bg-tu-surface-hover transition-colors"
          >
            <X size={18} className="text-tu-text-secondary" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-tu-surface border-b border-tu-border px-5 py-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                tab === t.id
                  ? "bg-tu-primary text-white shadow-sm"
                  : "text-tu-text-secondary"
              )}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <p className="text-sm text-tu-text-muted text-center py-8">กำลังโหลด...</p>
          )}
          {error && (
            <p className="text-sm text-tu-error text-center py-8">{error}</p>
          )}
          {data && tab === "profile" && (
            <ProfileTab data={data} />
          )}
          {data && tab === "roles" && (
            <RolesTab data={data} />
          )}
          {data && tab === "permissions" && (
            <PermissionsTab data={data} />
          )}
          {data && tab === "activity" && (
            <ActivityTab data={data} formatDate={formatDate} />
          )}
          {data && tab === "sessions" && (
            <SessionsTab data={data} formatDate={formatDate} />
          )}
        </div>
      </div>
    </>
  );
}

/* ──── Profile Tab ──── */

function ProfileTab({ data }: { data: UserDetail }) {
  const p = data.profile;
  const fields = [
    { label: "Name", value: p.name },
    { label: "Email", value: p.email },
    { label: "Department", value: p.department ?? "-" },
    { label: "Authentication Source", value: p.authSource?.toUpperCase() ?? "LDAP" },
    { label: "Status", value: p.status },
    { label: "MFA", value: p.mfaEnabled ? "Enabled" : "Disabled" },
    { label: "Last AD Sync", value: formatDate(p.lastAdSyncAt) },
    { label: "Last Login", value: formatDate(p.lastLogin) },
    { label: "IP Address", value: p.ipAddress ?? "-" },
  ];

  return (
    <dl className="space-y-3">
      {fields.map((f) => (
        <div key={f.label}>
          <dt className="text-xs text-tu-text-muted mb-0.5">{f.label}</dt>
          <dd className="text-sm text-tu-text-primary">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ──── Roles Tab ──── */

function RolesTab({ data }: { data: UserDetail }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-tu-text-primary mb-3">Assigned Roles</h4>
      {data.roles.length === 0 ? (
        <p className="text-sm text-tu-text-muted">ไม่มี Role ที่กำหนด</p>
      ) : (
        <div className="space-y-2">
          {data.roles.map((role) => (
            <div key={role.id} className="flex items-center justify-between rounded-lg border border-tu-border bg-tu-surface px-3 py-2">
              <span className="text-sm font-medium text-tu-text-primary">{role.name}</span>
              <span className="text-xs text-tu-text-muted">Level {role.level}</span>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-tu-text-muted mt-4">
        Permission Source: Role-based
      </p>
    </div>
  );
}

/* ──── Permissions Tab ──── */

function PermissionsTab({ data }: { data: UserDetail }) {
  // Group permissions by prefix
  const grouped: Record<string, string[]> = {};
  for (const perm of data.permissions) {
    const prefix = perm.split("_")[0];
    if (!grouped[prefix]) grouped[prefix] = [];
    grouped[prefix].push(perm);
  }

  return (
    <div>
      <h4 className="text-sm font-medium text-tu-text-primary mb-3">
        Effective Permissions ({data.permissions.length})
      </h4>
      <p className="text-xs text-tu-text-muted mb-4">Read Only — มาจาก Role ที่ได้รับ</p>
      {Object.entries(grouped).map(([group, perms]) => (
        <div key={group} className="mb-4">
          <h5 className="text-xs font-semibold text-tu-text-secondary uppercase mb-2">{group}</h5>
          <div className="flex flex-wrap gap-1.5">
            {perms.map((perm) => (
              <span
                key={perm}
                className="inline-flex items-center rounded-md bg-tu-primary-soft px-2 py-0.5 text-xs text-tu-primary"
              >
                {perm}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──── Activity Tab ──── */

function ActivityTab({ data, formatDate }: { data: UserDetail; formatDate: (d: string | null) => string }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-tu-text-primary mb-3">Recent Activity</h4>
      {data.activity.length === 0 ? (
        <p className="text-sm text-tu-text-muted">ไม่มีประวัติกิจกรรม</p>
      ) : (
        <div className="space-y-2">
          {data.activity.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-lg border border-tu-border bg-tu-surface px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-tu-text-primary">{a.action}</p>
                <p className="text-xs text-tu-text-muted">{a.module}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-tu-text-secondary">{formatDate(a.timestamp)}</p>
                {a.ipAddress && (
                  <p className="text-xs text-tu-text-muted font-mono">{a.ipAddress}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──── Sessions Tab ──── */

function SessionsTab({ data, formatDate }: { data: UserDetail; formatDate: (d: string | null) => string }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-tu-text-primary mb-3">Active & Recent Sessions</h4>
      {data.sessions.length === 0 ? (
        <p className="text-sm text-tu-text-muted">ไม่มี session</p>
      ) : (
        <div className="space-y-2">
          {data.sessions.map((s) => (
            <div key={s.id} className="rounded-lg border border-tu-border bg-tu-surface px-3 py-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-tu-text-primary">{s.device}</span>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  s.status === "active" ? "bg-tu-success/10 text-tu-success" : "bg-tu-text-muted/10 text-tu-text-muted"
                )}>
                  {s.status === "active" ? "Active" : "Ended"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-tu-text-secondary">
                <div>Browser: {s.browser}</div>
                <div>IP: {s.ipAddress ?? "-"}</div>
                <div>Login: {formatDate(s.loginTime)}</div>
                <div>Last Activity: {formatDate(s.lastActivity)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
