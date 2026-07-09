"use client";
import { PermissionGuard } from "@/components/shared/permission-guard";
export default function HrLayout({ children }: { children: React.ReactNode }) {
  return <PermissionGuard permission="HR_VIEW">{children}</PermissionGuard>;
}
