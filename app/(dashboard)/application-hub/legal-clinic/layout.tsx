"use client";
import { PermissionGuard } from "@/components/shared/permission-guard";
export default function LegalClinicLayout({ children }: { children: React.ReactNode }) {
  return <PermissionGuard permission="LEGAL_CLINIC_VIEW">{children}</PermissionGuard>;
}
