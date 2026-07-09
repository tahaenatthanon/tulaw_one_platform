"use client";

import { Lock } from "lucide-react";

export default function SecuritySettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-tu-text-primary">ความปลอดภัย</h1>
        <p className="text-tu-text-muted text-sm mt-1">ตั้งค่าความปลอดภัยของระบบ</p>
      </div>

      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6 space-y-6">
        {/* Rate Limiting */}
        <div className="pb-6 border-b border-tu-border">
          <h3 className="text-sm font-semibold text-tu-text-primary mb-3">Rate Limiting</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-tu-text-secondary">จำกัดคำขอ API</span>
              <span className="text-sm font-medium text-tu-text-primary">100 ครั้ง/นาที</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-tu-text-secondary">จำกัดการเข้าสู่ระบบ</span>
              <span className="text-sm font-medium text-tu-text-primary">5 ครั้ง/นาที</span>
            </div>
          </div>
        </div>

        {/* TLS/HTTPS */}
        <div className="pb-6 border-b border-tu-border">
          <h3 className="text-sm font-semibold text-tu-text-primary mb-3">การเข้ารหัส</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-tu-text-secondary">TLS/HTTPS</span>
            <span className="text-sm font-medium text-tu-success">✓ บังคับใน Production</span>
          </div>
        </div>

        {/* IP Whitelist */}
        <div>
          <h3 className="text-sm font-semibold text-tu-text-primary mb-3">IP Whitelist</h3>
          <p className="text-xs text-tu-text-muted mb-2">ระบุ IP ที่อนุญาตให้เข้าถึงระบบ (เว้นว่างเพื่ออนุญาตทั้งหมด)</p>
          <textarea
            readOnly
            placeholder="192.168.1.0/24"
            rows={2}
            className="w-full rounded-[--radius-input] border border-tu-border bg-tu-bg px-3 py-2.5 text-sm text-tu-text-muted resize-none"
          />
        </div>
      </div>
    </div>
  );
}
