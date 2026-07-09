"use client";
import { PermissionGuard } from "@/components/shared/permission-guard";
export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <PermissionGuard permission="SUPPORT_VIEW">{children}</PermissionGuard>;
}
