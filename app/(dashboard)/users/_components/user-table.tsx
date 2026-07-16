"use client";

import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAuthSourceLabel, canEditUser } from "@/lib/auth-source";
import type { UserStatus } from "@prisma/client";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-tu-success/10 text-tu-success" },
  INACTIVE: { label: "Inactive", className: "bg-tu-text-muted/10 text-tu-text-muted" },
  MFA_PENDING: { label: "MFA Pending", className: "bg-tu-warning/10 text-tu-warning" },
};

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

export interface TableUser {
  id: string;
  name: string;
  email: string;
  authSource: string;
  role: string;
  department: string;
  status: string;
  mfaEnabled: boolean;
  lastAdSyncAt: string | null;
  lastLoginAt: string | null;
  ipAddress: string | null;
  userRoles?: Array<{ role: { roleCode: string }; isActive: boolean }>;
}

interface UserTableProps {
  users: TableUser[];
  selectedIds: string[];
  onSelectOne: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
  onUserClick: (user: TableUser) => void;
  onActionClick: (user: TableUser, event: React.MouseEvent) => void;
  loading?: boolean;
  className?: string;
}

export function UserTable({
  users,
  selectedIds,
  onSelectOne,
  onSelectAll,
  allSelected,
  onUserClick,
  onActionClick,
  loading,
  className,
}: UserTableProps) {
  const columns = [
    { key: "checkbox", label: "", width: "w-10 min-w-[40px]" },
    { key: "name", label: "Name", width: "min-w-[140px]" },
    { key: "email", label: "Email", width: "min-w-[180px]" },
    { key: "authSource", label: "Auth Source", width: "w-24 min-w-[90px]" },
    { key: "role", label: "Role", width: "min-w-[100px]" },
    { key: "department", label: "Department", width: "min-w-[120px]" },
    { key: "status", label: "Status", width: "w-24 min-w-[90px]" },
    { key: "mfa", label: "MFA", width: "w-20 min-w-[70px]" },
    { key: "lastAdSync", label: "Last AD Sync", width: "whitespace-nowrap min-w-[140px]" },
    { key: "lastLogin", label: "Last Login", width: "whitespace-nowrap min-w-[140px]" },
    { key: "ipAddress", label: "IP Address", width: "min-w-[100px]" },
    { key: "action", label: "", width: "w-10 min-w-[40px]" },
  ];

  if (loading) {
    return (
      <div className={cn("rounded-lg border border-tu-border bg-tu-bg", className)}>
        <div className="flex items-center justify-center py-12 text-sm text-tu-text-muted">
          กำลังโหลด...
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={cn("rounded-lg border border-tu-border bg-tu-bg", className)}>
        <div className="flex flex-col items-center justify-center py-12 text-sm text-tu-text-muted">
          <p>ไม่พบข้อมูลผู้ใช้</p>
          <p className="text-xs mt-1">ลองปรับการค้นหาหรือตัวกรอง</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-tu-border bg-tu-bg overflow-x-auto", className)}>
      <table className="min-w-[1100px] w-max text-sm">
        <thead>
          <tr className="border-b border-tu-border bg-tu-surface">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-3 py-2.5 text-left text-xs font-medium text-tu-text-secondary whitespace-nowrap",
                  col.width
                )}
              >
                {col.key === "checkbox" ? (
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="rounded border-tu-border"
                  />
                ) : col.key !== "action" ? (
                  col.label
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelected = selectedIds.includes(user.id);
            const statusBadge = STATUS_BADGE[user.status] ?? { label: user.status, className: "bg-tu-surface text-tu-text-secondary" };
            return (
              <tr
                key={user.id}
                className={cn(
                  "border-b border-tu-border transition-colors",
                  isSelected ? "bg-tu-primary-soft/50" : "hover:bg-tu-surface-hover"
                )}
              >
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelectOne(user.id, e.target.checked)}
                    className="rounded border-tu-border"
                  />
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap max-w-[160px] overflow-hidden text-ellipsis">
                  <button
                    type="button"
                    onClick={() => onUserClick(user)}
                    className="text-tu-primary hover:underline text-sm font-medium"
                  >
                    {user.name}
                  </button>
                </td>
                <td className="px-3 py-2.5 text-tu-text-secondary text-xs whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">{user.email}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                    user.authSource === "local"
                      ? "bg-tu-warning/10 text-tu-warning"
                      : "bg-tu-info/10 text-tu-info"
                  )}>
                    {getAuthSourceLabel(user.authSource)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-xs text-tu-text-primary whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis">{user.role}</td>
                <td className="px-3 py-2.5 text-xs text-tu-text-secondary whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis">{user.department}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", statusBadge.className)}>
                    {statusBadge.label}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-xs whitespace-nowrap">
                  {user.mfaEnabled ? (
                    <span className="text-tu-success">Enabled</span>
                  ) : (
                    <span className="text-tu-text-muted">Disabled</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-xs text-tu-text-muted whitespace-nowrap">
                  {formatDate(user.lastAdSyncAt)}
                </td>
                <td className="px-3 py-2.5 text-xs text-tu-text-muted whitespace-nowrap">
                  {formatDate(user.lastLoginAt)}
                </td>
                <td className="px-3 py-2.5 text-xs text-tu-text-muted font-mono whitespace-nowrap">
                  {user.ipAddress ?? "-"}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={(e) => onActionClick(user, e)}
                    className="inline-flex items-center justify-center rounded-md p-1 hover:bg-tu-surface-hover transition-colors"
                  >
                    <MoreHorizontal size={16} className="text-tu-text-secondary" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
