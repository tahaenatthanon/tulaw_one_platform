"use client";

import { cn } from "@/lib/utils";
import {
  ShieldCheck, Key, Palette, HardDrive, Plug,
} from "lucide-react";

export type CategoryGroup = "core-settings" | "appearance" | "storage" | "integration";

export type CategoryId =
  | "auth"
  | "sso"
  | "branding"
  | "storage"
  | "integration";

export interface CategoryItem {
  id: CategoryId;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  group: CategoryGroup;
  keywords: string[];
}

export const CATEGORY_GROUPS: { id: CategoryGroup; label: string }[] = [
  { id: "core-settings", label: "Core Settings" },
  { id: "appearance", label: "Appearance" },
  { id: "storage", label: "Storage" },
  { id: "integration", label: "Integration" },
];

export const CATEGORIES: CategoryItem[] = [
  { id: "auth", label: "Authentication", description: "เซสชัน, JWT, MFA", icon: ShieldCheck, group: "core-settings",
    keywords: ["session", "timeout", "jwt", "token", "mfa", "login", "attempts", "auth", "authentication"] },
  { id: "sso", label: "SSO / LDAP", description: "Active Directory & Single Sign-On", icon: Key, group: "core-settings",
    keywords: ["sso", "ldap", "ad", "directory", "domain", "base dn", "sync"] },
  { id: "branding", label: "Branding", description: "โลโก้, สี, ชื่อระบบ", icon: Palette, group: "appearance",
    keywords: ["branding", "brand", "logo", "color", "theme", "ui"] },
  { id: "storage", label: "Storage", description: "โควตา, ประเภทไฟล์", icon: HardDrive, group: "storage",
    keywords: ["storage", "quota", "file", "upload", "types"] },
  { id: "integration", label: "Integration / API Keys", description: "คีย์เชื่อมต่อภายนอก", icon: Plug, group: "integration",
    keywords: ["api", "key", "integration", "secret", "token", "webhook"] },
];

interface CategorySidebarProps {
  active: CategoryId;
  onSelect: (id: CategoryId) => void;
  /** Categories to filter (for search). If empty, show all. */
  visible?: Set<CategoryId>;
}

/**
 * Category navigation sidebar for System Configuration.
 * Displays organized categories with icons and active state.
 * Replaces the old tab pills pattern.
 */
export function CategorySidebar({ active, onSelect, visible }: CategorySidebarProps) {
  const categoriesToShow = visible
    ? CATEGORIES.filter((c) => visible.has(c.id))
    : CATEGORIES;

  return (
    <nav className="flex flex-col gap-0.5 w-full">
      {categoriesToShow.map((cat) => {
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full text-left",
              isActive
                ? "bg-tu-primary text-white shadow-sm"
                : "text-tu-text-secondary hover:bg-tu-surface-hover hover:text-tu-text-primary",
            )}
          >
            <cat.icon size={18} className="shrink-0" />
            <span className="truncate">{cat.label}</span>
          </button>
        );
      })}
      {categoriesToShow.length === 0 && (
        <p className="text-xs text-tu-text-muted px-3 py-4 text-center">
          ไม่พบหมวดหมู่ที่ตรงกับคำค้นหา
        </p>
      )}
    </nav>
  );
}
