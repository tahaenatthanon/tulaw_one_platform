"use client";

import { Settings } from "lucide-react";

/**
 * Page header for System Configuration.
 * Displays the page title and a brief description.
 */
export function SettingsHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tu-primary text-white">
        <Settings size={20} />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-tu-text-primary">ตั้งค่าระบบ</h1>
        <p className="text-sm text-tu-text-muted mt-0.5">
          จัดการการตั้งค่าทั้งหมดของระบบ — กดบันทึกเพื่อให้การเปลี่ยนแปลงมีผล
        </p>
      </div>
    </div>
  );
}
