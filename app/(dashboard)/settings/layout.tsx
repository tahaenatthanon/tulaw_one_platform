"use client";

import { cn } from "@/lib/utils";
import { ShieldCheck, Key, Lock, Plug, Palette, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { useHasPermission } from "@/hooks/use-permission";

const subNav = [
  { href: "/settings/auth-settings", label: "การยืนยันตัวตน", icon: ShieldCheck },
  { href: "/settings/security-settings", label: "ความปลอดภัย", icon: Lock },
  { href: "/settings/api-integration", label: "API Integration", icon: Plug },
  { href: "/settings/system-branding", label: "ปรับแต่งระบบ", icon: Palette },
  { href: "/settings/notification-settings", label: "การแจ้งเตือน", icon: Bell },
];

const restrictedNav = [
  { href: "/settings/sso-config", label: "ตั้งค่า Microsoft SSO", icon: Key, perm: "SETTINGS_SSO" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permission="SETTINGS_VIEW">
      <SettingsSubLayout>{children}</SettingsSubLayout>
    </PermissionGuard>
  );
}

function SettingsSubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const canApiKeys = useHasPermission("SETTINGS_API_KEYS");
  const canSso = useHasPermission("SETTINGS_SSO");
  return (
    <div className="flex flex-col lg:flex-row h-full">
      <aside className="lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-tu-border bg-tu-surface p-3 space-y-1">
        <p className="px-3 py-2 text-xs font-semibold text-tu-text-muted uppercase tracking-wider">
          ตั้งค่าระบบ
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
