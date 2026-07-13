"use client";

import { PermissionGuard } from "@/components/shared/permission-guard";

export default function AuditLogLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permission="AUDIT_LOG_VIEW">
      <div className="flex-1 overflow-y-auto">{children}</div>
    </PermissionGuard>
  );
}
