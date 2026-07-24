"use client";

import { cn } from "@/lib/utils";
import { ConfigSection } from "./config-section";

interface BrandingSettings {
  name: string;
  color: string;
  logoUrl?: string;
}

function darkenHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((num >> 16) & 0xFF) - amount);
  const g = Math.max(0, ((num >> 8) & 0xFF) - amount);
  const b = Math.max(0, (num & 0xFF) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Real-time branding preview component.
 * Reflects form state values without affecting the actual system.
 * Uses inline styles only — no CSS variable injection until save.
 */
export function BrandingPreview({ branding, logoUrl }: { branding: BrandingSettings; logoUrl?: string | null }) {
  const primary = branding.color || "#A31D1D";
  const primaryHover = darkenHex(primary, 30);
  const primaryActive = darkenHex(primary, 50);
  const name = branding.name || "TULAW ONE";

  return (
    <ConfigSection title="Preview" description="ตัวอย่างการแสดงผลในระบบจริง">
      <div className="space-y-4">
        {/* Color Swatch */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-tu-text-secondary">Theme Color:</span>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg border border-tu-border" style={{ backgroundColor: primary }} title="Primary" />
            <div className="h-8 w-8 rounded-lg border border-tu-border" style={{ backgroundColor: primaryHover }} title="Hover" />
            <div className="h-8 w-8 rounded-lg border border-tu-border" style={{ backgroundColor: primaryActive }} title="Active" />
          </div>
          <code className="text-xs text-tu-text-muted bg-tu-surface px-2 py-0.5 rounded">{primary}</code>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: primary }}>
            Primary Button
          </div>
          <div className="rounded-lg border px-4 py-2 text-sm font-medium" style={{ borderColor: primary, color: primary }}>
            Outline Button
          </div>
        </div>

          {/* Header Bar Preview */}
          <div className="rounded-lg overflow-hidden border border-tu-border">
            <div className="flex items-center gap-3 px-4 py-2.5" style={{ backgroundColor: primary }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-6 w-6 rounded object-contain bg-white/10" />
              ) : (
                <span className="text-white text-sm font-semibold">{name}</span>
              )}
              <span className="text-white text-sm font-semibold">{name}</span>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-white/20" />
              <div className="h-5 w-5 rounded-full bg-white/20" />
              <div className="h-6 w-6 rounded-full bg-white/30 flex items-center justify-center text-white text-[10px]">A</div>
            </div>
          </div>
        </div>

        {/* Sidebar Preview */}
        <div className="rounded-lg overflow-hidden border border-tu-border flex h-32">
          <div className="w-48 shrink-0 flex flex-col gap-0.5 p-2" style={{ backgroundColor: primaryActive }}>
            {["Dashboard", "Application Hub", "Intranet"].map((item, i) => (
              <div key={item} className={cn("px-3 py-1.5 rounded-md text-xs", i === 0 ? "bg-tu-secondary text-tu-text-primary font-medium" : "text-white/70")}>
                {item}
              </div>
            ))}
            <div className="mt-auto">
              <div className="px-3 py-1.5 rounded-md text-xs text-white/60">Settings</div>
            </div>
          </div>
          <div className="flex-1 bg-tu-bg p-3">
            <div className="h-full rounded border border-dashed border-tu-border flex items-center justify-center text-xs text-tu-text-muted">
              Main Content Area
            </div>
          </div>
        </div>
      </div>
    </ConfigSection>
  );
}
