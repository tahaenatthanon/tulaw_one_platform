"use client";

import { cn } from "@/lib/utils";

/**
 * Storage visualization component showing usage progress bar.
 * Displays used/remaining space based on the configured quota value.
 * Does NOT connect to actual backend storage usage — displays quota setting only.
 */
export function StorageVisualization({ quota }: { quota: number }) {
  // Simulate usage (70% of quota for visual demo)
  const usedPercent = 70;
  const usedGB = Math.round((quota * usedPercent) / 100);
  const remainingGB = quota - usedGB;
  const usageLabel = usedPercent > 90 ? "Nearly Full" : usedPercent > 60 ? "Moderate" : "Healthy";

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-tu-text-secondary">Storage Usage</span>
          <span className={cn(
            "text-[10px] font-medium",
            usedPercent > 90 ? "text-tu-error" : usedPercent > 60 ? "text-tu-warning" : "text-tu-success",
          )}>
            {usageLabel} · {usedPercent}%
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-tu-surface border border-tu-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${usedPercent}%`,
              backgroundColor: "var(--tu-primary, #A31D1D)",
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-tu-border bg-tu-surface px-3 py-2.5">
          <p className="text-[10px] text-tu-text-muted mb-0.5">Used Space</p>
          <p className="text-sm font-semibold text-tu-text-primary">{usedGB} GB</p>
          <p className="text-[10px] text-tu-text-muted">of {quota} GB total</p>
        </div>
        <div className="rounded-lg border border-tu-border bg-tu-surface px-3 py-2.5">
          <p className="text-[10px] text-tu-text-muted mb-0.5">Remaining Space</p>
          <p className="text-sm font-semibold text-tu-text-primary">{remainingGB} GB</p>
          <p className="text-[10px] text-tu-text-muted">per user</p>
        </div>
      </div>
    </div>
  );
}
