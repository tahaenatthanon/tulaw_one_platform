"use client";

import { SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  title = "ไม่พบผลการค้นหา",
  description = "ลองปรับเงื่อนไขการค้นหาหรือรีเซ็ตตัวกรอง",
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-tu-border bg-tu-surface/50 p-10 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-tu-primary/10 text-tu-primary grid place-items-center">
        <SearchX className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-tu-text-primary">{title}</h3>
      <p className="mt-1.5 text-[13px] text-tu-text-muted max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
