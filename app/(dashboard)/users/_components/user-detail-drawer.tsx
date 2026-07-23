"use client";

import { useEffect, useState } from "react";
import { X, Shield, Mail, Building2, Clock, Pencil, Calendar, Fingerprint, Lock } from "lucide-react";
import { fetchApi } from "@/lib/fetcher";
import { UserAvatar, getAvatarColor } from "@/components/shared/user-avatar";
import { RoleBadge } from "@/components/shared/role-badge";
import { StatusBadge } from "@/components/shared/status-badge";

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
    createdAt: string;
    updatedAt: string;
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
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !userId) return;
    setLoading(true);
    setError(null);
    fetchApi<UserDetail>(`/api/users/${userId}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId, isOpen]);

  if (!isOpen) return null;

  const avatarColor = data ? getAvatarColor(data.profile.id) : "#A31D1D";
  const primaryRole = data?.roles?.[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="relative flex h-full w-full max-w-md flex-col bg-[var(--tu-surface)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--tu-border)] px-5 py-4 shrink-0">
          <h3 className="text-sm font-semibold text-[var(--tu-text-primary)] truncate">
            {loading ? "กำลังโหลด..." : data?.profile.name ?? "รายละเอียดผู้ใช้งาน"}
          </h3>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--tu-text-muted)] hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content — single scrollable area, no tabs */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <p className="text-sm text-[var(--tu-text-muted)] text-center py-8">กำลังโหลด...</p>
          )}
          {error && (
            <p className="text-sm text-[var(--tu-error)] text-center py-8">{error}</p>
          )}

          {data && (
            <>
              {/* User Profile Header */}
              <div className="bg-gradient-to-b from-[var(--tu-primary-soft)]/60 to-transparent px-5 pb-5 pt-8 text-center">
                <div className="mx-auto">
                  <UserAvatar name={data.profile.name} color={avatarColor} size={72} />
                </div>
                <h2 className="mt-3 text-lg font-bold text-[var(--tu-text-primary)]">{data.profile.name}</h2>
                <p className="text-sm text-[var(--tu-text-muted)]">{data.profile.department ?? "-"}</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  {primaryRole && <RoleBadge roleCode={primaryRole.code} />}
                  <StatusBadge status={data.profile.status} />
                </div>
              </div>

              {/* Detail Cards — all profile info in one view */}
              <div className="space-y-3 px-5 pb-6 pt-2">
                <DetailRow icon={<Mail size={14} />} label="Email" value={data.profile.email} />
                <DetailRow icon={<Building2 size={14} />} label="Department" value={data.profile.department ?? "-"} />
                <DetailRow icon={<Shield size={14} />} label="Auth Source" value={data.profile.authSource?.toUpperCase() ?? "LDAP"} />
                <DetailRow icon={<Fingerprint size={14} />} label="MFA Status" value={data.profile.mfaEnabled ? "Enabled" : "Disabled"} />
                <DetailRow icon={<Lock size={14} />} label="Account Status" value={data.profile.isLocked ? "Locked" : data.profile.status} />
                <DetailRow icon={<Clock size={14} />} label="Last Login" value={formatDate(data.profile.lastLogin)} />
                <DetailRow icon={<Calendar size={14} />} label="Created Date" value={formatDate(data.profile.createdAt)} />
                <DetailRow icon={<Calendar size={14} />} label="Updated Date" value={formatDate(data.profile.updatedAt)} />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[var(--tu-border)] bg-slate-50/60 px-5 py-3 shrink-0">
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--tu-border)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--tu-text-secondary)] hover:bg-slate-50"
          >
            Close
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--tu-primary)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--tu-primary-hover)]"
          >
            <Pencil size={14} /> Edit
          </button>
        </div>
      </aside>
    </div>
  );
}

/* ──── DetailRow ──── */

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--tu-border)] bg-white p-3">
      <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-slate-50 text-[var(--tu-text-secondary)]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--tu-text-muted)]">{label}</div>
        <div className="mt-0.5 truncate text-sm font-medium text-[var(--tu-text-primary)]">{value}</div>
      </div>
    </div>
  );
}
