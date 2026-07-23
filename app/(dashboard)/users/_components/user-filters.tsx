"use client";

import { Search, Filter, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "MFA_PENDING", label: "MFA Pending" },
];

const AUTH_SOURCE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "ldap", label: "LDAP" },
  { value: "local", label: "Local" },
];

const ROLE_ENGLISH: Record<string, string> = {
  super_admin: "Super Admin",
  system_admin: "System Admin",
  dean: "Dean",
  dept_admin: "Dept Admin",
  user: "User",
  viewer: "Viewer",
};

const MFA_OPTIONS = [
  { value: "all", label: "All" },
  { value: "enabled", label: "Enabled" },
  { value: "disabled", label: "Disabled" },
  { value: "pending", label: "Pending" },
];

export interface FilterValues {
  search: string;
  role: string;
  status: string;
  department: string;
  authSource: string;
  mfa: string;
}

interface UserFiltersProps {
  filters: FilterValues;
  onFilterChange: (filters: Partial<FilterValues>) => void;
  roles: Array<{ roleCode: string; nameTh: string }>;
  departments: Array<{ id: number; name: string }>;
  className?: string;
}

export function UserFilters({
  filters,
  onFilterChange,
  roles,
  departments,
  className,
}: UserFiltersProps) {
  const activeCount =
    (filters.role ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.department ? 1 : 0) +
    (filters.authSource !== "all" ? 1 : 0) +
    (filters.mfa !== "all" ? 1 : 0);

  function clearAll() {
    onFilterChange({
      role: "",
      status: "",
      department: "",
      authSource: "all",
      mfa: "all",
    });
  }

  const selectCls = (isActive: boolean) =>
    cn(
      "h-11 appearance-none rounded-xl border bg-white pl-8 pr-8 text-sm font-medium transition-all focus:border-[var(--tu-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--tu-primary)]/10",
      isActive
        ? "border-[var(--tu-primary)]/40 text-[var(--tu-text-primary)]"
        : "border-[var(--tu-border)] text-[var(--tu-text-secondary)]",
    );

  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--tu-border)] bg-[var(--tu-surface)] p-3 shadow-sm",
        className,
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:flex-wrap">
        {/* Search Input */}
        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--tu-text-muted)]"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="ค้นหาชื่อ อีเมล หรือหน่วยงาน…"
            className="h-11 w-full rounded-xl border border-transparent bg-slate-50 pl-10 pr-10 text-sm text-[var(--tu-text-primary)] placeholder:text-[var(--tu-text-muted)] transition-all focus:border-[var(--tu-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--tu-primary)]/10"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: "" })}
              className="absolute right-2 top-1/2 grid -translate-y-1/2 place-items-center rounded-md p-1.5 text-[var(--tu-text-muted)] hover:bg-slate-100"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Role */}
          <div className="relative">
            <Filter
              size={13}
              className={cn(
                "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2",
                filters.role ? "text-[var(--tu-primary)]" : "text-[var(--tu-text-muted)]",
              )}
            />
            <select
              value={filters.role}
              onChange={(e) => onFilterChange({ role: e.target.value })}
              className={cn(selectCls(!!filters.role), "min-w-[150px]")}
              aria-label="Role"
            >
              <option value="">ทุก Role</option>
              {roles.map((r) => (
                <option key={r.roleCode} value={r.roleCode}>
                  {ROLE_ENGLISH[r.roleCode] ?? r.nameTh}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--tu-text-muted)]"
            />
          </div>

          {/* Department */}
          <div className="relative">
            <Filter
              size={13}
              className={cn(
                "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2",
                filters.department ? "text-[var(--tu-primary)]" : "text-[var(--tu-text-muted)]",
              )}
            />
            <select
              value={filters.department}
              onChange={(e) => onFilterChange({ department: e.target.value })}
              className={cn(selectCls(!!filters.department), "min-w-[160px]")}
              aria-label="Department"
            >
              <option value="">ทุกหน่วยงาน</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--tu-text-muted)]"
            />
          </div>

          {/* Status */}
          <div className="relative">
            <Filter
              size={13}
              className={cn(
                "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2",
                filters.status ? "text-[var(--tu-primary)]" : "text-[var(--tu-text-muted)]",
              )}
            />
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className={cn(selectCls(!!filters.status), "min-w-[140px]")}
              aria-label="Status"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--tu-text-muted)]"
            />
          </div>

          {/* Clear Filters */}
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[var(--tu-text-muted)] hover:bg-slate-50 hover:text-[var(--tu-text-primary)] whitespace-nowrap"
            >
              <X size={13} /> ล้างตัวกรอง ({activeCount})
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
