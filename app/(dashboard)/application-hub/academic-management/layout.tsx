"use client";
import { PermissionGuard } from "@/components/shared/permission-guard";
export default function AcademicLayout({ children }: { children: React.ReactNode }) {
  return <PermissionGuard permission="ACADEMIC_VIEW">{children}</PermissionGuard>;
}
