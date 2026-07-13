"use client";

import { PermissionGuard } from "@/components/shared/permission-guard";

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permission="USERS_VIEW">
      <div className="flex-1 overflow-y-auto">{children}</div>
    </PermissionGuard>
  );
}
