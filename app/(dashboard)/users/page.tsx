"use client";

import { useState } from "react";
import { Users, Shield, Key, RefreshCw, Download, Upload, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHasPermission } from "@/hooks/use-permission";
import UserManagementPage from "./user-management/page";
import RoleManagementPage from "./role-management/page";
import PermissionManagementPage from "./permission-management/page";
import AdSyncPage from "./ad-sync/page";

const TABS = [
  { id: "user-management", label: "User Management", icon: Users },
  { id: "role-management", label: "Role Management", icon: Shield },
  { id: "permission-management", label: "Permission Management", icon: Key },
  { id: "ad-sync", label: "AD Sync", icon: RefreshCw },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<TabId>("user-management");
  const canViewRoles = useHasPermission("USERS_MANAGE_ROLES");
  const canViewPerms = useHasPermission("USERS_MANAGE_PERMISSIONS");
  const canAdSync = useHasPermission("USERS_AD_SYNC");
  const canImport = useHasPermission("USERS_BULK_IMPORT");

  const visibleTabs = TABS.filter((tab) => {
    if (tab.id === "role-management") return canViewRoles;
    if (tab.id === "permission-management") return canViewPerms;
    if (tab.id === "ad-sync") return canAdSync;
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--tu-bg)]">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10">
        {/* Header */}
        <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-[var(--tu-text-primary)] sm:text-[28px]">
              Users &amp; Roles
            </h1>
            <p className="mt-1 text-sm text-[var(--tu-text-muted)]">
              จัดการผู้ใช้งาน บทบาท และสิทธิ์การเข้าถึงระบบทั้งหมด
            </p>
          </div>
        </header>

        {/* Tab Menu */}
        <div className="mb-6">
          <div className="flex gap-1 bg-[var(--tu-surface)] border border-[var(--tu-border)] rounded-lg p-0.5 w-fit">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-[var(--tu-primary)] text-white shadow-sm"
                    : "text-[var(--tu-text-secondary)]",
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "user-management" && <UserManagementPage />}
          {activeTab === "role-management" && <RoleManagementPage />}
          {activeTab === "permission-management" && <PermissionManagementPage />}
          {activeTab === "ad-sync" && <AdSyncPage />}
        </div>
      </div>
    </div>
  );
}
