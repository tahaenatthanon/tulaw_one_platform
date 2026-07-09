"use client";
import { PermissionGuard } from "@/components/shared/permission-guard";
export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return <PermissionGuard permission="RESEARCH_VIEW">{children}</PermissionGuard>;
}
