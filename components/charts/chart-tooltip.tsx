"use client";

import type { ReactNode } from "react";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string; dataKey?: string | number }>;
  label?: ReactNode;
  labelFormatter?: (label: string) => string;
  valueFormatter?: (value: number, name: string) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-tu-border bg-tu-surface px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-tu-text-primary mb-1">
        {labelFormatter ? labelFormatter(String(label)) : label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-tu-text-secondary">{entry.name}:</span>
          <span className="font-medium text-tu-text-primary tabular-nums">
            {valueFormatter
              ? valueFormatter(Number(entry.value), String(entry.name))
              : Number(entry.value).toLocaleString("th-TH")}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Simple tooltip for single-series charts (area, pie) */
export function SimpleTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string; name?: string }>;
  label?: ReactNode;
  labelFormatter?: (label: string) => string;
  valueFormatter?: (value: number, name: string) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-tu-border bg-tu-surface px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-tu-text-primary mb-0.5">
        {labelFormatter ? labelFormatter(String(label)) : label}
      </p>
      {payload.map((entry, i) => (
        <p key={i} className="text-tu-text-secondary">
          {Number(entry.value).toLocaleString("th-TH")}
          {valueFormatter ? ` ${valueFormatter(Number(entry.value), String(entry.name))}` : ""}
        </p>
      ))}
    </div>
  );
}
