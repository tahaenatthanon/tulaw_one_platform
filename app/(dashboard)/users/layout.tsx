"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Users,
  UserPlus,
  Search,
  Shield,
  UserCog,
  Database,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PermissionGuard } from "@/components/shared/permission-guard";

const subNav = [
  {
    href: "/users/user-management",
    label: "จัดการผู้ใช้งาน",
    icon: Users,
  },
  {
    href: "/users/role-management",
    label: "จัดการบทบาท",
    icon: Shield,
  },
  {
    href: "/users/permission-management",
    label: "จัดการสิทธิ์",
    icon: UserCog,
  },
  {
    href: "/users/ad-sync",
    label: "ซิงค์ Active Directory",
    icon: RefreshCw,
  },
];

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permission="USERS_VIEW">
      <UsersSubLayout>{children}</UsersSubLayout>
    </PermissionGuard>
  );
}

function UsersSubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Sub Sidebar */}
      <aside className="lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-tu-border bg-tu-surface p-3 space-y-1">
        <p className="px-3 py-2 text-xs font-semibold text-tu-text-muted uppercase tracking-wider">
          ผู้ใช้งานและสิทธิ์
        </p>
        {subNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-tu-primary-soft text-tu-primary"
                : "text-tu-text-secondary hover:bg-tu-surface-hover hover:text-tu-text-primary"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
