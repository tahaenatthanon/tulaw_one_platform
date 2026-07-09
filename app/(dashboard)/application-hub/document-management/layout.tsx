"use client";
import { PermissionGuard } from "@/components/shared/permission-guard";
export default function DocMgmtLayout({ children }: { children: React.ReactNode }) {
  return <PermissionGuard permission="DOCUMENT_MANAGEMENT_VIEW">{children}</PermissionGuard>;
}
