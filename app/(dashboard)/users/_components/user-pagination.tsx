"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

interface UserPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  className?: string;
}

export function UserPagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  className,
}: UserPaginationProps) {
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-2", className)}>
      {/* Showing X-Y of Z */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-tu-text-secondary">
          Showing {start}&ndash;{end} of {total} users
        </span>

        {/* Page size selector */}
        <select
          value={limit}
          onChange={(e) => onLimitChange(parseInt(e.target.value))}
          className="rounded-md border border-tu-border bg-tu-bg px-2 py-1 text-xs text-tu-text-primary focus:outline-none focus:border-tu-primary"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center justify-center rounded-md border border-tu-border p-1.5 text-tu-text-secondary hover:bg-tu-surface-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
        </button>

        <span className="px-2 text-xs text-tu-text-secondary">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center justify-center rounded-md border border-tu-border p-1.5 text-tu-text-secondary hover:bg-tu-surface-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
