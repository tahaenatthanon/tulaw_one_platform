"use client";
import { PermissionGuard } from "@/components/shared/permission-guard";
export default function EofficeLayout({ children }: { children: React.ReactNode }) {
  return <PermissionGuard permission="E_OFFICE_VIEW">{children}</PermissionGuard>;
}
