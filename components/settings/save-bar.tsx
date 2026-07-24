"use client";

import { Save, RotateCcw, Trash2, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SaveBarProps {
  dirty: boolean;
  saving: boolean;
  saved: boolean;
  pendingCount: number;
  onSave: () => void;
  onReset: () => void;
  onDiscard: () => void;
}

/**
 * Sticky action bar at the bottom of the settings page.
 * Shows save status, pending changes count, and action buttons.
 */
export function SaveBar({ dirty, saving, saved, pendingCount, onSave, onReset, onDiscard }: SaveBarProps) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-tu-border bg-tu-bg/95 backdrop-blur-sm px-6 py-3">
      <div className="flex items-center justify-between max-w-4xl">
        {/* Status */}
        <div className="flex items-center gap-3">
          {saving ? (
            <span className="flex items-center gap-1.5 text-sm text-tu-text-secondary">
              <Loader2 size={16} className="animate-spin text-tu-primary" />
              กำลังบันทึก...
            </span>
          ) : saved ? (
            <span className="flex items-center gap-1.5 text-sm text-tu-success">
              <CheckCircle size={16} />
              บันทึกสำเร็จ
            </span>
          ) : dirty ? (
            <span className="flex items-center gap-1.5 text-sm text-tu-secondary">
              <AlertTriangle size={16} />
              {pendingCount} การเปลี่ยนแปลงที่ยังไม่ได้บันทึก
            </span>
          ) : (
            <span className="text-sm text-tu-text-muted">
              ไม่มีการเปลี่ยนแปลง
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {dirty && (
            <>
              <button
                onClick={onReset}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-[--radius-btn] border border-tu-border px-3 py-2 text-xs font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors disabled:opacity-50"
              >
                <RotateCcw size={14} />
                รีเซ็ต
              </button>
              <button
                onClick={onDiscard}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-[--radius-btn] border border-tu-border px-3 py-2 text-xs font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors disabled:opacity-50"
              >
                <Trash2 size={14} />
                ทิ้งทั้งหมด
              </button>
            </>
          )}
          <button
            onClick={onSave}
            disabled={!dirty || saving}
            className={cn(
              "flex items-center gap-1.5 rounded-[--radius-btn] px-4 py-2 text-sm font-medium transition-colors",
              dirty && !saving
                ? "bg-tu-primary text-white hover:bg-tu-primary-hover"
                : "bg-tu-surface border border-tu-border text-tu-text-muted cursor-not-allowed",
            )}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
      </div>
    </div>
  );
}
