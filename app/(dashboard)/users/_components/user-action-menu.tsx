"use client";

import { useRef, useEffect, useState } from "react";
import {
  Eye, CheckCircle, XCircle, Pencil, Key, LogOut, ScrollText, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { canEditUser } from "@/lib/auth-source";
import { useHasPermission } from "@/hooks/use-permission";
import { fetchApi } from "@/lib/fetcher";
import type { TableUser } from "./user-table";

interface ActionMenuItem {
  id: string;
  label: string;
  icon: typeof Eye;
  permission?: string;
  visible: boolean;
  danger?: boolean;
}

interface UserActionMenuProps {
  user: TableUser;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete: () => void;
  onViewClick: () => void;
  onEditClick: () => void;
  onAuditLogClick: () => void;
  position: { top: number; left: number };
}

export function UserActionMenu({
  user,
  isOpen,
  onClose,
  onActionComplete,
  onViewClick,
  onEditClick,
  onAuditLogClick,
  position,
}: UserActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canEdit = useHasPermission("USERS_EDIT");
  const canDelete = useHasPermission("USERS_DELETE");
  const canResetMfa = useHasPermission("USERS_RESET_MFA");
  const canEnable = useHasPermission("USERS_BULK_ENABLE");
  const canDisable = useHasPermission("USERS_BULK_DISABLE");
  const canAudit = useHasPermission("AUDIT_LOG_VIEW");

  // Reset confirm state when menu opens/closes
  useEffect(() => { if (!isOpen) setConfirmDelete(false); }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items: ActionMenuItem[] = [
    { id: "view", label: "View Details", icon: Eye, visible: true },
    { id: "enable", label: "Enable Account", icon: CheckCircle, permission: "USERS_BULK_ENABLE", visible: canEnable && user.status !== "ACTIVE" },
    { id: "disable", label: "Disable Account", icon: XCircle, permission: "USERS_BULK_DISABLE", visible: canDisable && user.status === "ACTIVE" },
    { id: "edit", label: "Edit User", icon: Pencil, permission: "USERS_EDIT", visible: canEdit && canEditUser(user) },
    { id: "reset-mfa", label: "Reset MFA", icon: Key, permission: "USERS_RESET_MFA", visible: canResetMfa },
    { id: "force-sign-out", label: "Force Sign Out", icon: LogOut, permission: "USERS_EDIT", visible: canEdit },
    { id: "audit-log", label: "View Audit Log", icon: ScrollText, permission: "AUDIT_LOG_VIEW", visible: !!canAudit },
    { id: "delete", label: confirmDelete ? "Confirm Delete?" : "Delete User", icon: Trash2, permission: "USERS_DELETE", visible: canDelete, danger: true },
  ];

  async function handleItemClick(item: ActionMenuItem) {
    if (item.id === "view") { onViewClick(); onClose(); return; }
    if (item.id === "edit") { onEditClick(); onClose(); return; }
    if (item.id === "audit-log") { onAuditLogClick(); onClose(); return; }

    if (item.id === "delete" && !confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setLoading(item.id);
    try {
      if (item.id === "enable" || item.id === "disable") {
        await fetchApi("/api/users", {
          method: "PATCH",
          body: JSON.stringify({ action: item.id, userIds: [user.id] }),
        });
      } else if (item.id === "reset-mfa") {
        await fetchApi(`/api/users/${user.id}/reset-mfa`, { method: "POST" });
      } else if (item.id === "force-sign-out") {
        await fetchApi(`/api/users/${user.id}/force-sign-out`, { method: "POST" });
      } else if (item.id === "delete") {
        await fetchApi(`/api/users/${user.id}`, { method: "DELETE" });
      }
      onActionComplete();
      onClose();
    } catch {
      // Error handled by parent refresh
    } finally {
      setLoading(null);
      setConfirmDelete(false);
    }
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] rounded-xl border border-[var(--tu-border)] bg-white shadow-xl py-1.5"
      style={{ top: position.top, left: Math.min(position.left, window.innerWidth - 220) }}
    >
      {items.filter(i => i.visible).map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => handleItemClick(item)}
          disabled={loading === item.id}
          className={cn(
            "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors",
            item.danger
              ? confirmDelete && item.id === "delete"
                ? "text-white bg-[var(--tu-error)] hover:bg-[var(--tu-error)]/90"
                : "text-[var(--tu-error)] hover:bg-[var(--tu-error)]/5"
              : "text-[var(--tu-text-primary)] hover:bg-slate-50",
            loading === item.id && "opacity-50 cursor-wait"
          )}
        >
          <item.icon size={15} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
