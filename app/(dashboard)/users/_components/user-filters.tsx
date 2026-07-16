"use client";

import { Search } from "lucide-react";
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
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[320px]">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tu-text-muted" />
        <input
          type="text"
          placeholder="ค้นหาทุกข้อมูล (ชื่อ, อีเมล, Role, IP...)"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="w-full rounded-md border border-tu-border bg-tu-bg pl-8 pr-3 py-1.5 text-xs text-tu-text-primary placeholder:text-tu-text-muted focus:outline-none focus:border-tu-primary focus:ring-1 focus:ring-tu-primary/30"
        />
      </div>

      {/* Role */}
      <select
        value={filters.role}
        onChange={(e) => onFilterChange({ role: e.target.value })}
        className="rounded-md border border-tu-border bg-tu-bg px-2.5 py-1.5 text-xs text-tu-text-primary focus:outline-none focus:border-tu-primary"
      >
        <option value="">All Roles</option>
        {roles.map((r) => (
          <option key={r.roleCode} value={r.roleCode}>{r.nameTh}</option>
        ))}
      </select>

      {/* Status */}
      <select
        value={filters.status}
        onChange={(e) => onFilterChange({ status: e.target.value })}
        className="rounded-md border border-tu-border bg-tu-bg px-2.5 py-1.5 text-xs text-tu-text-primary focus:outline-none focus:border-tu-primary"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Department */}
      <select
        value={filters.department}
        onChange={(e) => onFilterChange({ department: e.target.value })}
        className="rounded-md border border-tu-border bg-tu-bg px-2.5 py-1.5 text-xs text-tu-text-primary focus:outline-none focus:border-tu-primary"
      >
        <option value="">All Departments</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>

      {/* Authentication Source */}
      <select
        value={filters.authSource}
        onChange={(e) => onFilterChange({ authSource: e.target.value })}
        className="rounded-md border border-tu-border bg-tu-bg px-2.5 py-1.5 text-xs text-tu-text-primary focus:outline-none focus:border-tu-primary"
      >
        {AUTH_SOURCE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.value === "all" ? "Auth Source: All" : o.label}</option>
        ))}
      </select>

      {/* MFA */}
      <select
        value={filters.mfa}
        onChange={(e) => onFilterChange({ mfa: e.target.value })}
        className="rounded-md border border-tu-border bg-tu-bg px-2.5 py-1.5 text-xs text-tu-text-primary focus:outline-none focus:border-tu-primary"
      >
        {MFA_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.value === "all" ? "MFA: All" : `MFA: ${o.label}`}</option>
        ))}
      </select>
    </div>
  );
}
