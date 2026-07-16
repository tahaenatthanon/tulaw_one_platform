"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHasPermission } from "@/hooks/use-permission";
import { UserActionBar } from "../_components/user-action-bar";
import { UserBulkActionBar } from "../_components/user-bulk-action-bar";
import { UserFilters, type FilterValues } from "../_components/user-filters";
import { UserTable, type TableUser } from "../_components/user-table";
import { UserActionMenu } from "../_components/user-action-menu";
import { UserDetailDrawer } from "../_components/user-detail-drawer";
import { UserImportDialog } from "../_components/user-import-dialog";
import { UserExportDialog } from "../_components/user-export-dialog";
import { UserPagination } from "../_components/user-pagination";

/* ==============================================================================
   Types
   ============================================================================== */

interface ApiUser {
  id: string;
  email: string;
  firstNameTh: string;
  lastNameTh: string;
  authSource: string;
  status: string;
  isLocked: boolean;
  lastAdSyncAt: string | null;
  ipAddress: string | null;
  department: { name: string } | null;
  userRoles: Array<{ role: { id: number; nameTh: string; roleCode: string; level: number }; isActive: boolean }>;
  userMfa: Array<{ isEnabled: boolean }>;
  loginHistories: Array<{ createdAt: string; ipAddress: string | null }>;
}

interface Role {
  id: number;
  nameTh: string;
  roleCode: string;
  level: number;
}

interface Department {
  id: number;
  name: string;
}

/* ==============================================================================
   Page Component
   ============================================================================== */

export default function UserManagementPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-tu-text-muted">Loading...</div>}>
      <UserManagementContent />
    </Suspense>
  );
}

function UserManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read all filter values from URL (single source of truth)
  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "25";
  const search = searchParams.get("search") ?? "";
  const roleFilter = searchParams.get("role") ?? "";
  const statusFilter = searchParams.get("status") ?? "";
  const departmentFilter = searchParams.get("department") ?? "";
  const authSourceFilter = searchParams.get("authSource") ?? "all";
  const mfaFilter = searchParams.get("mfa") ?? "all";

  // Batch URL update — push all params at once to avoid race conditions
  function updateUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(overrides)) {
      if (!val || val === "all") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    }
    // Always reset page to 1 when filters change
    if (!("page" in overrides)) {
      params.set("page", "1");
    }
    const qs = params.toString();
    router.push(`/users/user-management${qs ? "?" + qs : ""}`, { scroll: false });
  }

  // Local state
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Dialogs and drawers
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);
  const [actionMenu, setActionMenu] = useState<{
    user: TableUser;
    position: { top: number; left: number };
  } | null>(null);

  // Reference data
  const [departments, setDepartments] = useState<Department[]>([]);

  // Permissions
  const canView = useHasPermission("USERS_VIEW");

  // Roles are statically defined from permissions system (matches DB seed)
  const roles: Role[] = [
    { id: 1, nameTh: "ผู้ดูแลระบบสูงสุด", roleCode: "super_admin", level: 100 },
    { id: 2, nameTh: "ผู้ดูแลระบบ", roleCode: "system_admin", level: 80 },
    { id: 3, nameTh: "คณบดี", roleCode: "dean", level: 70 },
    { id: 4, nameTh: "ผู้ดูแลหน่วยงาน", roleCode: "dept_admin", level: 50 },
    { id: 5, nameTh: "ผู้ใช้งาน", roleCode: "user", level: 30 },
    { id: 6, nameTh: "ผู้ดูข้อมูล", roleCode: "viewer", level: 10 },
  ];

  // Fetch departments from API
  useEffect(() => {
    fetch("/api/departments")
      .then(r => r.json())
      .then(json => { if (json.success) setDepartments(json.data as Department[]); })
      .catch(() => {});
  }, []);

  // Derived filters
  const filters: FilterValues = {
    search, role: roleFilter, status: statusFilter,
    department: departmentFilter, authSource: authSourceFilter, mfa: mfaFilter,
  };

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!canView) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", limit);
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (departmentFilter) params.set("department", departmentFilter);
      if (authSourceFilter !== "all") params.set("authSource", authSourceFilter);
      if (mfaFilter !== "all") params.set("mfa", mfaFilter);

      const res = await fetch(`/api/users?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "??????????????????????????????????");

      setUsers(json.data as ApiUser[]);
      setTotal((json.meta?.total as number) ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "??????????????????????????????????");
    } finally {
      setLoading(false);
    }
  }, [canView, page, limit, search, roleFilter, statusFilter, departmentFilter, authSourceFilter, mfaFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Map API users to table format
  const tableUsers: TableUser[] = users.map((u) => {
    const primaryRole = u.userRoles?.find(r => r.isActive);
    const lastLogin = u.loginHistories?.[0];
    return {
      id: u.id,
      name: `${u.firstNameTh} ${u.lastNameTh}`,
      email: u.email,
      authSource: u.authSource ?? "ldap",
      role: primaryRole?.role.nameTh ?? "-",
      department: u.department?.name ?? "-",
      status: u.status,
      mfaEnabled: u.userMfa?.some(m => m.isEnabled) ?? false,
      lastAdSyncAt: u.lastAdSyncAt,
      lastLoginAt: lastLogin?.createdAt ?? null,
      ipAddress: lastLogin?.ipAddress ?? u.ipAddress ?? null,
      userRoles: u.userRoles?.map(ur => ({ role: { roleCode: ur.role.roleCode }, isActive: ur.isActive })),
    };
  });

  // Selection handlers
  function handleSelectOne(id: string, checked: boolean) {
    setSelectedIds(prev =>
      checked ? [...prev, id] : prev.filter(x => x !== id)
    );
  }

  function handleSelectAll(checked: boolean) {
    setSelectedIds(checked ? tableUsers.map(u => u.id) : []);
  }

  function handleClearSelection() {
    setSelectedIds([]);
  }

  // Action handlers
  function handleUserClick(user: TableUser) {
    setDrawerUserId(user.id);
  }

  function handleActionClick(user: TableUser, event: React.MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setActionMenu({
      user,
      position: { top: rect.bottom + 4, left: rect.left - 150 },
    });
  }

  function handleFilterChange(partial: Partial<FilterValues>) {
    const overrides: Record<string, string> = {};
    if ("search" in partial) overrides.search = partial.search ?? "";
    if ("role" in partial) overrides.role = partial.role ?? "";
    if ("status" in partial) overrides.status = partial.status ?? "";
    if ("department" in partial) overrides.department = partial.department ?? "";
    if ("authSource" in partial) overrides.authSource = partial.authSource ?? "";
    if ("mfa" in partial) overrides.mfa = partial.mfa ?? "";
    // page auto-resets to 1 in updateUrl
    updateUrl(overrides);
  }

  // Real-time Bulk Action filter callbacks
  function handleBulkRoleFilter(roleCode: string | null) {
    updateUrl({ role: roleCode ?? "" });
  }

  function handleBulkDeptFilter(deptId: number | null) {
    updateUrl({ department: deptId ? String(deptId) : "" });
  }

  if (!canView) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-tu-text-muted">????????????????????????????????????????????????????</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <UserActionBar
        onImportClick={() => setImportOpen(true)}
        onExportClick={() => setExportOpen(true)}
        hasSelection={selectedIds.length > 0}
        onBulkActionClick={() => {}}
      />

      {/* Bulk Action Bar */}
      <UserBulkActionBar
        selectedCount={selectedIds.length}
        selectedIds={selectedIds}
        onClearSelection={handleClearSelection}
        onActionComplete={() => { fetchUsers(); }}
        onFilterByRole={handleBulkRoleFilter}
        onFilterByDepartment={handleBulkDeptFilter}
      />

      {/* Filters */}
      <UserFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        roles={roles}
        departments={departments}
      />

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-tu-error/20 bg-tu-error/5 px-4 py-3 text-sm text-tu-error">
          {error}
          <button type="button" onClick={fetchUsers} className="ml-3 underline text-xs">
            ????????????
          </button>
        </div>
      )}

      {/* Table */}
      <UserTable
        users={tableUsers}
        selectedIds={selectedIds}
        onSelectOne={handleSelectOne}
        onSelectAll={handleSelectAll}
        allSelected={tableUsers.length > 0 && selectedIds.length === tableUsers.length}
        onUserClick={handleUserClick}
        onActionClick={handleActionClick}
        loading={loading}
      />

      {/* Pagination */}
      <UserPagination
        page={parseInt(page) || 1}
        limit={parseInt(limit) || 25}
        total={total}
        onPageChange={(p) => updateUrl({ page: String(p) })}
        onLimitChange={(l) => updateUrl({ limit: String(l), page: String(1) })}
      />

      {/* Action Menu (context) */}
      <UserActionMenu
        user={actionMenu?.user!}
        isOpen={!!actionMenu}
        onClose={() => setActionMenu(null)}
        onActionComplete={fetchUsers}
        onViewClick={() => {
          if (actionMenu?.user) setDrawerUserId(actionMenu.user.id);
          setActionMenu(null);
        }}
        position={actionMenu?.position ?? { top: 0, left: 0 }}
      />

      {/* User Detail Drawer */}
      <UserDetailDrawer
        userId={drawerUserId}
        isOpen={!!drawerUserId}
        onClose={() => setDrawerUserId(null)}
      />

      {/* Import Dialog */}
      <UserImportDialog
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onComplete={fetchUsers}
      />

      {/* Export Dialog */}
      <UserExportDialog
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
      />
    </div>
  );
}
