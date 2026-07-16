"use client";

import { Download, Upload, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHasPermission } from "@/hooks/use-permission";

interface UserActionBarProps {
  onImportClick: () => void;
  onExportClick: () => void;
  hasSelection: boolean;
  onBulkActionClick: () => void;
  bulkActionDisabled?: boolean;
  className?: string;
}

export function UserActionBar({
  onImportClick,
  onExportClick,
  hasSelection,
  onBulkActionClick,
  bulkActionDisabled,
  className,
}: UserActionBarProps) {
  const canImport = useHasPermission("USERS_BULK_IMPORT");

  const buttons = [
    {
      label: "Import CSV",
      icon: Upload,
      onClick: onImportClick,
      visible: canImport,
      variant: "outline" as const,
    },
    {
      label: "Export CSV",
      icon: Download,
      onClick: onExportClick,
      visible: canImport,
      variant: "outline" as const,
    },
    {
      label: "Bulk Actions",
      icon: Users,
      onClick: onBulkActionClick,
      visible: true,
      variant: hasSelection ? "primary" as const : "outline" as const,
      disabled: !hasSelection || bulkActionDisabled,
    },
  ];

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {buttons
        .filter((b) => b.visible)
        .map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.onClick}
            disabled={btn.disabled}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              btn.variant === "primary"
                ? "bg-tu-primary text-white hover:bg-tu-primary-hover shadow-sm"
                : "border border-tu-border bg-tu-surface text-tu-text-secondary hover:bg-tu-surface-hover",
              btn.disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <btn.icon size={14} />
            {btn.label}
          </button>
        ))}
    </div>
  );
}
