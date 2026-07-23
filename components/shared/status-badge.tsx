"use client";

import { CircleCheck, CircleMinus, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusKey = "active" | "inactive" | "mfa_pending";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_MAP: Record<StatusKey, { label: string; className: string; Icon: typeof CircleCheck }> = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Icon: CircleCheck,
  },
  inactive: {
    label: "Inactive",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
    Icon: CircleMinus,
  },
  mfa_pending: {
    label: "MFA Pending",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    Icon: CircleAlert,
  },
};

/**
 * Map DB status values to visual status keys.
 * - ACTIVE → active
 * - INACTIVE → inactive
 * - MFA_PENDING → mfa_pending
 */
function mapStatus(raw: string): StatusKey {
  const upper = raw.toUpperCase();
  if (upper === "ACTIVE") return "active";
  if (upper === "INACTIVE") return "inactive";
  if (upper === "MFA_PENDING") return "mfa_pending";
  return "inactive"; // fallback
}

function getStatusDisplay(raw: string) {
  const key = mapStatus(raw);
  const config = STATUS_MAP[key] ?? STATUS_MAP.inactive;
  return { ...config, key };
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: styleClass, Icon } = getStatusDisplay(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        styleClass,
        className,
      )}
    >
      <Icon size={12} strokeWidth={2.5} />
      {label}
    </span>
  );
}
