"use client";

import { Search, X } from "lucide-react";

interface SettingsSearchProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Search field for filtering categories and settings.
 * Client-side only — no API calls.
 */
export function SettingsSearch({ value, onChange }: SettingsSearchProps) {
  return (
    <div className="relative max-w-md">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ค้นหาการตั้งค่า..."
        className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface pl-9 pr-9 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-tu-text-muted hover:text-tu-text-primary hover:bg-tu-surface-hover transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
