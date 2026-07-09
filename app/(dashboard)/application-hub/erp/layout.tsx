"use client";
import { PermissionGuard } from "@/components/shared/permission-guard";
export default function ErpLayout({ children }: { children: React.ReactNode }) {
  return <PermissionGuard permission="ERP_VIEW">{children}</PermissionGuard>;
}
