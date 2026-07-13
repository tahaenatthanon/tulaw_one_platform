"use client";

import { useRouter } from "next/navigation";
import { PermissionGuard } from "@/components/shared/permission-guard";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permission="SETTINGS_VIEW">
      <div className="flex-1 overflow-y-auto">{children}</div>
    </PermissionGuard>
  );
}
