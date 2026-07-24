"use client";

import { cn } from "@/lib/utils";
import { SearchX, ChevronRight } from "lucide-react";
import { CATEGORIES, CATEGORY_GROUPS, CategoryId, CategoryGroup } from "./category-sidebar";

interface GroupedCategorySidebarProps {
  active: CategoryId;
  onSelect: (id: CategoryId) => void;
  visible?: Set<CategoryId>;
  searchQuery?: string;
}

/**
 * Grouped category sidebar with section headers.
 * Groups: Core Settings → Authentication, SSO/LDAP
 *         Appearance → Branding
 *         Storage → Storage
 *         Integration → API Keys
 */
export function GroupedCategorySidebar({ active, onSelect, visible, searchQuery }: GroupedCategorySidebarProps) {
  // Group categories
  const grouped = CATEGORY_GROUPS.map((group) => {
    const items = CATEGORIES.filter((c) => c.group === group.id && (!visible || visible.has(c.id)));
    return { ...group, items };
  }).filter((g) => g.items.length > 0);

  // Check if search returned no results
  const hasResults = grouped.length > 0;

  if (!hasResults) {
    return (
      <nav className="flex flex-col items-center justify-center py-8 px-3 text-center">
        <SearchX size={22} className="text-tu-text-muted/60 mb-2" />
        <p className="text-xs text-tu-text-muted">
          {searchQuery
            ? `ไม่พบหมวดหมู่ที่ตรงกับ "${searchQuery}"`
            : "ไม่พบหมวดหมู่"}
        </p>
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-3 w-full">
      {grouped.map((group) => (
        <div key={group.id}>
          {/* Group header */}
          <span className="block px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-tu-text-muted/70">
            {group.label}
          </span>
          {/* Group items */}
          <div className="flex flex-col gap-0.5">
            {group.items.map((cat) => {
              const Icon = cat.icon;
              const isActive = active === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelect(cat.id)}
                  className={cn(
                    "group w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    isActive
                      ? "bg-tu-primary-soft/60 text-tu-primary"
                      : "text-tu-text-secondary hover:bg-tu-surface-hover hover:text-tu-text-primary",
                  )}
                >
                  <span className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors",
                    isActive ? "bg-tu-primary text-white" : "bg-tu-bg text-tu-text-secondary group-hover:text-tu-primary",
                  )}>
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium truncate">{cat.label}</span>
                    <span className="block text-[11px] text-tu-text-muted truncate">{cat.description}</span>
                  </span>
                  <ChevronRight size={14} className={cn("shrink-0 opacity-0 transition-opacity", isActive && "opacity-100")} />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}