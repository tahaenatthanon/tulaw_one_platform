"use client";

import { useState, useEffect } from "react";
import {
  Shield, CheckCircle, XCircle, Lock, Key, Download,
  X, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHasPermission } from "@/hooks/use-permission";
import { fetchApi } from "@/lib/fetcher";

interface BulkActionBarProps {
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
  onActionComplete: () => void;
  onFilterByRole?: (roleCode: string | null) => void;
  onFilterByDepartment?: (deptId: number | null) => void;
  className?: string;
}

// Static role order by level descending (matches DB roles table)
const ROLE_ORDER: Array<{ roleCode: string; nameTh: string; level: number }> = [
  { roleCode: "super_admin", nameTh: "ผู้ดูแลระบบสูงสุด", level: 100 },
  { roleCode: "system_admin", nameTh: "ผู้ดูแลระบบ", level: 80 },
  { roleCode: "dean", nameTh: "คณบดี", level: 70 },
  { roleCode: "dept_admin", nameTh: "ผู้ดูแลหน่วยงาน", level: 50 },
  { roleCode: "user", nameTh: "ผู้ใช้งาน", level: 30 },
  { roleCode: "viewer", nameTh: "ผู้ดูข้อมูล", level: 10 },
];

interface Department {
  id: number;
  name: string;
}

type BulkAction = "assign-role" | "enable" | "disable" | "unlock" | "reset-mfa" | "export-selected";

interface ActionItem {
  id: BulkAction;
  label: string;
  icon: typeof Shield;
  permission: string;
  confirmMessage: string;
}

const ACTIONS: ActionItem[] = [
  { id: "assign-role", label: "Assign Role", icon: Shield, permission: "USERS_BULK_ASSIGN_ROLE", confirmMessage: "กำหนด Role ให้ผู้ใช้ที่เลือก?" },
  { id: "enable", label: "Enable", icon: CheckCircle, permission: "USERS_BULK_ENABLE", confirmMessage: "เปิดใช้งานผู้ใช้ที่เลือก?" },
  { id: "disable", label: "Disable", icon: XCircle, permission: "USERS_BULK_DISABLE", confirmMessage: "ปิดใช้งานผู้ใช้ที่เลือก?" },
  { id: "unlock", label: "Unlock Account", icon: Lock, permission: "USERS_UNLOCK_ACCOUNT", confirmMessage: "ปลดล็อกบัญชีผู้ใช้ที่เลือก?" },
  { id: "reset-mfa", label: "Reset MFA", icon: Key, permission: "USERS_RESET_MFA", confirmMessage: "รีเซ็ต MFA ของผู้ใช้ที่เลือก?" },
  { id: "export-selected", label: "Export Selected", icon: Download, permission: "USERS_BULK_IMPORT", confirmMessage: "ส่งออกข้อมูลผู้ใช้ที่เลือก?" },
];

export function UserBulkActionBar({
  selectedCount,
  selectedIds,
  onClearSelection,
  onActionComplete,
  onFilterByRole,
  onFilterByDepartment,
  className,
}: BulkActionBarProps) {
  const [loading, setLoading] = useState(false);
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAssignRole = useHasPermission("USERS_BULK_ASSIGN_ROLE");
  const canEnable = useHasPermission("USERS_BULK_ENABLE");
  const canDisable = useHasPermission("USERS_BULK_DISABLE");
  const canUnlock = useHasPermission("USERS_UNLOCK_ACCOUNT");
  const canResetMfa = useHasPermission("USERS_RESET_MFA");
  const canExport = useHasPermission("USERS_BULK_IMPORT");

  const permMap: Record<string, boolean> = {
    "assign-role": canAssignRole,
    "enable": canEnable,
    "disable": canDisable,
    "unlock": canUnlock,
    "reset-mfa": canResetMfa,
    "export-selected": canExport,
  };

  async function handleAction(action: BulkAction, roleCode?: string) {
    setLoading(true);
    setError(null);
    try {
      if (action === "export-selected") {
        const idsParam = selectedIds.join(",");
        window.open(`/api/users/export-csv?ids=${idsParam}`, "_blank");
        onActionComplete();
        return;
      }
      await fetchApi("/api/users", {
        method: "PATCH",
        body: JSON.stringify({ action, userIds: selectedIds, roleCode }),
      });
      onClearSelection();
      onActionComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
      setShowRoleSelect(false);
    }
  }

  if (selectedCount === 0) return null;

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-2 rounded-lg bg-tu-primary-soft px-4 py-2.5 border border-tu-primary/20",
      className
    )}>
      <span className="text-sm font-medium text-tu-text-primary mr-2">
        {selectedCount} selected
      </span>

      {ACTIONS.filter(a => permMap[a.id]).map((action) => (
        <div key={action.id} className="relative">
          <button
            type="button"
            onClick={() => {
              if (action.id === "assign-role") {
                setShowRoleSelect(!showRoleSelect);
              } else {
                handleAction(action.id);
              }
            }}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium border border-tu-border bg-white text-tu-text-primary hover:bg-tu-surface-hover transition-colors disabled:opacity-50"
          >
            <action.icon size={12} />
            {action.label}
          </button>

          {action.id === "assign-role" && showRoleSelect && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-lg border border-tu-border shadow-lg p-2 min-w-[200px]">
              <p className="text-xs text-tu-text-secondary mb-2 px-1">เลือก Role (กรอง + กำหนด):</p>
              <button
                type="button"
                onClick={() => { onFilterByRole?.(null); }}
                className="block w-full text-left px-2 py-1.5 text-xs rounded hover:bg-tu-surface-hover text-tu-text-primary font-medium"
              >
                All Role
              </button>
              <div className="border-t border-tu-border my-1" />
              {ROLE_ORDER.map((role) => (
                <button
                  key={role.roleCode}
                  type="button"
                  onClick={() => {
                    onFilterByRole?.(role.roleCode);
                    if (selectedIds.length > 0) {
                      handleAction("assign-role", role.roleCode);
                    }
                  }}
                  className="block w-full text-left px-2 py-1.5 text-xs rounded hover:bg-tu-surface-hover text-tu-text-primary"
                >
                  {role.nameTh}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={onClearSelection}
        className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-tu-text-secondary hover:text-tu-text-primary transition-colors"
      >
        <X size={12} />
        Clear Selection
      </button>

      {error && (
        <span className="w-full text-xs text-tu-error mt-1">{error}</span>
      )}
    </div>
  );
}
