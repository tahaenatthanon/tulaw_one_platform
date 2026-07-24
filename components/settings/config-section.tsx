"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ConfigSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Optional action in the section header (e.g., a button) */
  action?: ReactNode;
}

/**
 * Reusable section container with Title + Description + Card layout.
 * Used across all settings categories for consistent visual structure.
 */
export function ConfigSection({ title, description, children, className, action }: ConfigSectionProps) {
  return (
    <div className={cn("rounded-[--radius-card] border border-tu-border bg-tu-bg p-5", className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-tu-text-primary">{title}</h3>
          {description && (
            <p className="text-xs text-tu-text-muted mt-0.5">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
