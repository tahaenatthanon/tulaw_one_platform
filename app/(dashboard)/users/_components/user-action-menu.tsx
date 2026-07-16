"use client";

import { useRef, useEffect, useState } from "react";
import {
  Eye, Pencil, Shield, Key, Lock, CheckCircle, XCircle,
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
  position: { top: number; left: number };
}

export function UserActionMenu({
  user,
  isOpen,
  onClose,
  onActionComplete,
  onViewClick,
  position,
}: UserActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const canEdit = useHasPermission("USERS_EDIT");
  const canAssignRole = useHasPermission("USERS_BULK_ASSIGN_ROLE");
  const canResetMfa = useHasPermission("USERS_RESET_MFA");
  const canUnlock = useHasPermission("USERS_UNLOCK_ACCOUNT");
  const canEnable = useHasPermission("USERS_BULK_ENABLE");
  const canDisable = useHasPermission("USERS_BULK_DISABLE");

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
    { id: "view", label: "ดูรายละเอียด", icon: Eye, visible: true },
    { id: "edit", label: "แก้ไข", icon: Pencil, permission: "USERS_EDIT", visible: canEdit && canEditUser(user) },
    { id: "assign-role", label: "กำหนด Role", icon: Shield, permission: "USERS_BULK_ASSIGN_ROLE", visible: canAssignRole },
    { id: "reset-mfa", label: "รีเซ็ต MFA", icon: Key, permission: "USERS_RESET_MFA", visible: canResetMfa },
    { id: "unlock", label: "ปลดล็อกบัญชี", icon: Lock, permission: "USERS_UNLOCK_ACCOUNT", visible: canUnlock },
    ...(user.status === "ACTIVE"
      ? [{ id: "disable", label: "ปิดใช้งาน", icon: XCircle, permission: "USERS_BULK_DISABLE", visible: canDisable, danger: true }]
      : [{ id: "enable", label: "เปิดใช้งาน", icon: CheckCircle, permission: "USERS_BULK_ENABLE", visible: canEnable }]
    ),
  ];

  async function handleItemClick(item: ActionMenuItem) {
    if (item.id === "view") {
      onViewClick();
      onClose();
      return;
    }
    setLoading(item.id);
    try {
      if (item.id === "enable" || item.id === "disable") {
        await fetchApi("/api/users", {
          method: "PATCH",
          body: JSON.stringify({ action: item.id, userIds: [user.id] }),
        });
      } else if (item.id === "unlock") {
        await fetchApi(`/api/users/${user.id}/unlock`, { method: "POST" });
      } else if (item.id === "reset-mfa") {
        await fetchApi(`/api/users/${user.id}/reset-mfa`, { method: "POST" });
      } else if (item.id === "assign-role") {
        // Uses PATCH bulk endpoint with single user
        await fetchApi("/api/users", {
          method: "PATCH",
          body: JSON.stringify({ action: "assign-role", userIds: [user.id] }),
        });
      }
      onActionComplete();
      onClose();
    } catch {
      // Error handled by caller
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] rounded-lg border border-tu-border bg-white shadow-lg py-1"
      style={{ top: position.top, left: position.left }}
    >
      {items.filter(i => i.visible).map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => handleItemClick(item)}
          disabled={loading === item.id}
          className={cn(
            "flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors",
            item.danger
              ? "text-tu-error hover:bg-tu-error/5"
              : "text-tu-text-primary hover:bg-tu-surface-hover",
            loading === item.id && "opacity-50 cursor-wait"
          )}
        >
          <item.icon size={14} />
          {item.label}
        </button>
      ))}
    </div>
  );
}
