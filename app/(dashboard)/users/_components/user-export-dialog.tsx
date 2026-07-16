"use client";

import { X, Download } from "lucide-react";

interface UserExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserExportDialog({ isOpen, onClose }: UserExportDialogProps) {
  if (!isOpen) return null;

  function handleExportAll() {
    window.open("/api/users/export-csv", "_blank");
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-tu-border">
            <h3 className="text-base font-semibold text-tu-text-primary">Export CSV</h3>
            <button type="button" onClick={onClose} className="rounded-md p-1 hover:bg-tu-surface-hover">
              <X size={18} className="text-tu-text-secondary" />
            </button>
          </div>

          <div className="px-5 py-4 space-y-3">
            <p className="text-sm text-tu-text-secondary">
              เลือกรูปแบบการส่งออกข้อมูลผู้ใช้
            </p>

            <button
              type="button"
              onClick={handleExportAll}
              className="flex w-full items-center gap-3 rounded-lg border border-tu-border bg-tu-surface hover:bg-tu-surface-hover px-4 py-3 transition-colors"
            >
              <Download size={20} className="text-tu-primary" />
              <div className="text-left">
                <p className="text-sm font-medium text-tu-text-primary">Export All Users</p>
                <p className="text-xs text-tu-text-muted">ส่งออกผู้ใช้ทั้งหมดตาม filter ปัจจุบัน</p>
              </div>
            </button>

            <p className="text-xs text-tu-text-muted">
              หมายเหตุ: หากต้องการส่งออกผู้ใช้ที่เลือก ให้ใช้ Export Selected ใน Bulk Actions
            </p>
          </div>

          <div className="flex justify-end gap-2 px-5 py-3 border-t border-tu-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-tu-border px-3 py-1.5 text-xs font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
