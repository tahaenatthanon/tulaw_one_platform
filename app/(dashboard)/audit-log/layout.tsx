"use client";

import { cn } from "@/lib/utils";
import { FileText, LogIn, ShieldAlert, Download } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { useHasPermission } from "@/hooks/use-permission";

const subNav = [
  { href: "/audit-log/activity-log", label: "บันทึกกิจกรรม", icon: FileText },
  { href: "/audit-log/login-history", label: "ประวัติการเข้าสู่ระบบ", icon: LogIn },
  { href: "/audit-log/security-events", label: "เหตุการณ์ความปลอดภัย", icon: ShieldAlert },
];

const exportNav = [
  { href: "/audit-log/export-logs", label: "ส่งออกบันทึก", icon: Download },
];

export default function AuditLogLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permission="AUDIT_LOG_VIEW">
      <AuditLogSubLayout>{children}</AuditLogSubLayout>
    </PermissionGuard>
  );
}

function AuditLogSubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const canExport = useHasPermission("AUDIT_LOG_EXPORT");
  return (
    <div className="flex flex-col lg:flex-row h-full">
      <aside className="lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-tu-border bg-tu-surface p-3 space-y-1">
        <p className="px-3 py-2 text-xs font-semibold text-tu-text-muted uppercase tracking-wider">
          บันทึกความปลอดภัย
        </p>
        {subNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-tu-primary-soft text-tu-primary"
                : "text-tu-text-secondary hover:bg-tu-surface-hover hover:text-tu-text-primary"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </aside>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
