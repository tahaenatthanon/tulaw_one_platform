"use client";

import { ShieldAlert, Lock } from "lucide-react";
import { useHasPermission } from "@/hooks/use-permission";
import type { PermissionCode } from "@/hooks/use-permission";

interface PermissionGuardProps {
  permission: PermissionCode;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wraps children — only renders if user has the required permission.
 * Otherwise shows a styled "Access Denied" message.
 */
export function PermissionGuard({
  permission,
  children,
  fallback,
}: PermissionGuardProps) {
  const hasAccess = useHasPermission(permission);

  if (hasAccess) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-tu-error/10 mb-4">
        <Lock size={32} className="text-tu-error" />
      </div>
      <h2 className="text-lg font-semibold text-tu-text-primary mb-1">
        ไม่มีสิทธิ์เข้าถึง
      </h2>
      <p className="text-sm text-tu-text-muted max-w-sm">
        คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบหากต้องการสิทธิ์เพิ่มเติม
      </p>
    </div>
  );
}

/**
 * Multi-permission guard — shows children if user has ANY of the given permissions.
 */
export function PermissionGate({
  permissions,
  children,
}: {
  permissions: PermissionCode[];
  children: React.ReactNode;
}) {
  const hasAccess = permissions.some((p) => useHasPermission(p));

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-tu-error/10 mb-4">
          <Lock size={32} className="text-tu-error" />
        </div>
        <h2 className="text-lg font-semibold text-tu-text-primary mb-1">
          ไม่มีสิทธิ์เข้าถึง
        </h2>
        <p className="text-sm text-tu-text-muted max-w-sm">
          คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
