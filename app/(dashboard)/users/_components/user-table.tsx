"use client";

import { Mail, Building2, Clock, MoreHorizontal, Search, Users, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar, getAvatarColor } from "@/components/shared/user-avatar";
import { RoleBadge } from "@/components/shared/role-badge";
import { StatusBadge } from "@/components/shared/status-badge";

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

function getRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "ยังไม่เคยเข้าใช้งาน";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "เมื่อสักครู่";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} สัปดาห์ที่แล้ว`;
  return formatDate(dateStr);
}

function getRoleCode(user: TableUser): string {
  return user.userRoles?.find((r) => r.isActive)?.role.roleCode ?? "viewer";
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
  sortBy?: string;
  sortDir?: string;
  onSort?: (column: string) => void;
}

function SortHeader({ label, column, sortBy, sortDir, onSort }: {
  label: string; column: string; sortBy?: string; sortDir?: string; onSort?: (c: string) => void;
}) {
  const active = sortBy === column;
  return (
    <button
      onClick={() => onSort?.(column)}
      className="inline-flex items-center gap-1 group cursor-pointer select-none"
    >
      <span className={active ? "text-[var(--tu-primary)]" : ""}>{label}</span>
      {active
        ? <span className="text-[var(--tu-primary)]">{sortDir === "asc" ? "↑" : "↓"}</span>
        : <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-40 transition-opacity" />
      }
    </button>
  );
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
  sortBy,
  sortDir,
  onSort,
}: UserTableProps) {
  if (loading) {
    return (
      <section className={cn("rounded-2xl border border-[var(--tu-border)] bg-[var(--tu-surface)] shadow-sm", className)}>
        <div className="flex items-center justify-center py-16 text-sm text-[var(--tu-text-muted)]">
          กำลังโหลด...
        </div>
      </section>
    );
  }

  return (
    <section className={cn("mb-6 overflow-hidden rounded-2xl border border-[var(--tu-border)] bg-[var(--tu-surface)] shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--tu-border)] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--tu-primary-soft)] text-[var(--tu-primary)]">
            <Users size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--tu-text-primary)]">ผู้ใช้งานทั้งหมด</h2>
            <p className="text-xs text-[var(--tu-text-muted)]">
              {users.length > 0 ? (
                <>พบ <span className="font-semibold text-[var(--tu-text-primary)]">{users.length}</span> รายการ</>
              ) : (
                "ไม่พบข้อมูลผู้ใช้"
              )}
              {selectedIds.length > 0 && (
                <> · เลือก <span className="font-semibold text-[var(--tu-primary)]">{selectedIds.length}</span> รายการ</>
              )}
            </p>
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        /* Empty State */
        <div className="grid place-items-center px-6 py-16 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--tu-primary-soft)] text-[var(--tu-primary)]">
            <Search size={22} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-[var(--tu-text-primary)]">
            ไม่พบผู้ใช้งานที่ตรงกัน
          </h3>
          <p className="mt-1 max-w-sm text-sm text-[var(--tu-text-muted)]">
            ลองปรับคำค้นหาหรือล้างตัวกรองเพื่อดูผลลัพธ์อื่น
          </p>
        </div>
      ) : (
        <div className="max-h-[560px] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--tu-text-muted)]">
                <th className="px-5 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="rounded border-[var(--tu-border)] accent-[var(--tu-primary)]"
                  />
                </th>
                <th className="px-5 py-3"><SortHeader label="User" column="name" sortBy={sortBy} sortDir={sortDir} onSort={onSort} /></th>
                <th className="px-5 py-3"><SortHeader label="Department" column="department" sortBy={sortBy} sortDir={sortDir} onSort={onSort} /></th>
                <th className="px-5 py-3"><SortHeader label="Role" column="role" sortBy={sortBy} sortDir={sortDir} onSort={onSort} /></th>
                <th className="px-5 py-3"><SortHeader label="Status" column="status" sortBy={sortBy} sortDir={sortDir} onSort={onSort} /></th>
                <th className="px-5 py-3"><SortHeader label="Last Login" column="lastLogin" sortBy={sortBy} sortDir={sortDir} onSort={onSort} /></th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--tu-border)]">
              {users.map((user) => {
                const isSelected = selectedIds.includes(user.id);
                const avatarColor = getAvatarColor(user.id);
                return (
                  <tr
                    key={user.id}
                    className={cn(
                      "group transition-colors",
                      isSelected ? "bg-[var(--tu-primary-soft)]/40" : "hover:bg-slate-50/70",
                    )}
                  >
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelectOne(user.id, e.target.checked)}
                        className="rounded border-[var(--tu-border)] accent-[var(--tu-primary)]"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <UserAvatar name={user.name} color={avatarColor} />
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onUserClick(user)}
                            className="block truncate text-left font-semibold text-[var(--tu-text-primary)] hover:text-[var(--tu-primary)] transition-colors"
                          >
                            {user.name}
                          </button>
                          <div className="flex items-center gap-1.5 truncate text-xs text-[var(--tu-text-muted)]">
                            <Mail size={11} />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 text-[var(--tu-text-secondary)]">
                        <Building2 size={13} className="text-[var(--tu-text-muted)]" />
                        <span className="truncate">{user.department}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <RoleBadge roleCode={getRoleCode(user)} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-5 py-3.5 text-[var(--tu-text-muted)]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        <span>{getRelativeTime(user.lastLoginAt)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={(e) => onActionClick(user, e as unknown as React.MouseEvent)}
                        aria-label="More"
                        title="More"
                        className="grid h-8 w-8 place-items-center rounded-lg text-[var(--tu-text-muted)] transition-colors hover:bg-[var(--tu-primary-soft)] hover:text-[var(--tu-primary)]"
                      >
                        <MoreHorizontal size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
