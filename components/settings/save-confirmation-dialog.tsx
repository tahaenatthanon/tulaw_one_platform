"use client";

import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SaveConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pendingCount: number;
}

/**
 * Save confirmation dialog shown before saving settings changes.
 * Displays summary of pending changes, warning about immediate effect, and confirm/cancel actions.
 */
export function SaveConfirmationDialog({ open, onOpenChange, onConfirm, pendingCount }: SaveConfirmationDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative bg-tu-bg rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-md mx-4 p-6">
        {/* Close */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1 rounded-md text-tu-text-muted hover:bg-tu-surface-hover transition-colors"
        >
          <X size={16} />
        </button>

        {/* Warning */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tu-secondary-soft">
            <AlertTriangle size={20} className="text-tu-secondary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-tu-text-primary">ยืนยันการบันทึกการเปลี่ยนแปลง</h3>
            <p className="text-xs text-tu-text-muted mt-1">
              คุณมี {pendingCount} การเปลี่ยนแปลงที่รอดำเนินการ
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg border border-tu-border bg-tu-surface p-3 mb-4">
          <p className="text-xs font-medium text-tu-text-primary mb-1">สรุปการเปลี่ยนแปลง:</p>
          <ul className="text-xs text-tu-text-secondary space-y-1 list-disc list-inside">
            <li>จำนวนหมวดหมู่ที่มีการแก้ไข: {pendingCount} หมวด</li>
            <li>การเปลี่ยนแปลงจะมีผลทันทีหลังจากบันทึก</li>
            <li>ผู้ใช้ที่กำลังใช้งานอยู่อาจต้อง Refresh หน้า</li>
          </ul>
        </div>

        {/* Warning note */}
        <div className="flex items-start gap-2 mb-5 p-3 rounded-lg bg-tu-secondary-soft/50 border border-tu-secondary/20">
          <AlertTriangle size={14} className="text-tu-secondary shrink-0 mt-0.5" />
          <p className="text-[11px] text-tu-text-secondary">
            การเปลี่ยนแปลงจะมีผลทันทีกับผู้ใช้ทั้งหมดในระบบ กรุณาตรวจสอบให้แน่ใจก่อนยืนยัน
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-[--radius-btn] border border-tu-border px-4 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="rounded-[--radius-btn] bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors"
          >
            ยืนยันการบันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
