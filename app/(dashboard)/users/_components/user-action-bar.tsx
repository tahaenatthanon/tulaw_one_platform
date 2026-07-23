"use client";

import { Download, Upload, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHasPermission } from "@/hooks/use-permission";

interface UserActionBarProps {
  onImportClick: () => void;
  onExportClick: () => void;
  onAddUserClick?: () => void;
  className?: string;
}

export function UserActionBar({
  onImportClick,
  onExportClick,
  onAddUserClick,
  className,
}: UserActionBarProps) {
  const canImport = useHasPermission("USERS_BULK_IMPORT");

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {canImport && (
        <>
          <button
            type="button"
            onClick={onImportClick}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--tu-border)] bg-[var(--tu-surface)] px-3.5 py-2 text-sm font-medium text-[var(--tu-text-secondary)] shadow-sm transition-all hover:bg-[var(--tu-surface-hover)] hover:shadow-md"
          >
            <Upload size={16} /> Import
          </button>
          <button
            type="button"
            onClick={onExportClick}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--tu-border)] bg-[var(--tu-surface)] px-3.5 py-2 text-sm font-medium text-[var(--tu-text-secondary)] shadow-sm transition-all hover:bg-[var(--tu-surface-hover)] hover:shadow-md"
          >
            <Download size={16} /> Export
          </button>
        </>
      )}
      <button
        type="button"
        onClick={onAddUserClick}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--tu-primary)] px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-[var(--tu-primary-hover)] hover:shadow-lg active:scale-[.98]"
      >
        <Plus size={16} strokeWidth={2.5} /> เพิ่มผู้ใช้งาน
      </button>
    </div>
  );
}
