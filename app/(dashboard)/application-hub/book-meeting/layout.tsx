"use client";
import { PermissionGuard } from "@/components/shared/permission-guard";
export default function BookMeetingLayout({ children }: { children: React.ReactNode }) {
  return <PermissionGuard permission="BOOK_MEETING_VIEW">{children}</PermissionGuard>;
}
