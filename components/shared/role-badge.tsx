"use client";

import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export type RoleKey = "super_admin" | "system_admin" | "dean" | "dept_admin" | "user" | "viewer";

interface RoleBadgeProps {
  roleCode: string;
  roleName?: string;
  className?: string;
}

const ROLE_STYLES: Record<RoleKey, { name: string; className: string }> = {
  super_admin: {
    name: "Super Admin",
    className: "bg-[var(--tu-primary)] text-white",
  },
  system_admin: {
    name: "System Admin",
    className:
      "bg-[var(--tu-primary-soft)] text-[var(--tu-primary)] ring-1 ring-inset ring-[var(--tu-primary)]/20",
  },
  dean: {
    name: "Dean",
    className:
      "bg-[var(--tu-secondary-soft)] text-[#8B5A00] ring-1 ring-inset ring-[var(--tu-secondary)]/40",
  },
  dept_admin: {
    name: "Dept Admin",
    className: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  },
  user: {
    name: "User",
    className: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  },
  viewer: {
    name: "Viewer",
    className: "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200",
  },
};

function getRoleDisplay(code: string): { name: string; className: string } {
  const matching = ROLE_STYLES[code as RoleKey];
  if (matching) return matching;
  // Fallback for unknown role codes
  return { name: code, className: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200" };
}

export function RoleBadge({ roleCode, roleName, className }: RoleBadgeProps) {
  const { name, className: styleClass } = getRoleDisplay(roleCode);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold tracking-wide",
        styleClass,
        className,
      )}
    >
      <Shield size={11} strokeWidth={2.5} />
      {roleName ?? name}
    </span>
  );
}
