"use client";

import { Bell, Mail, Smartphone } from "lucide-react";

export default function NotificationSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-tu-text-primary">การแจ้งเตือน</h1>
        <p className="text-tu-text-muted text-sm mt-1">ตั้งค่าการแจ้งเตือนของระบบ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tu-primary-soft">
              <Bell size={20} className="text-tu-primary" />
            </div>
            <h3 className="text-sm font-semibold text-tu-text-primary">In-App Notification</h3>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-tu-text-secondary">
              <input type="checkbox" defaultChecked className="rounded accent-tu-primary" />
              ประกาศใหม่
            </label>
            <label className="flex items-center gap-2 text-sm text-tu-text-secondary">
              <input type="checkbox" defaultChecked className="rounded accent-tu-primary" />
              เอกสารที่แชร์
            </label>
            <label className="flex items-center gap-2 text-sm text-tu-text-secondary">
              <input type="checkbox" defaultChecked className="rounded accent-tu-primary" />
              การอนุมัติ
            </label>
          </div>
        </div>

        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tu-secondary-soft">
              <Mail size={20} className="text-tu-secondary-active" />
            </div>
            <h3 className="text-sm font-semibold text-tu-text-primary">Email</h3>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-tu-text-secondary">
              <input type="checkbox" defaultChecked className="rounded accent-tu-primary" />
              อีเมลสรุปรายสัปดาห์
            </label>
            <label className="flex items-center gap-2 text-sm text-tu-text-secondary">
              <input type="checkbox" className="rounded accent-tu-primary" />
              อีเมลยืนยันทุกการกระทำ
            </label>
          </div>
        </div>

        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Smartphone size={20} className="text-tu-info" />
            </div>
            <h3 className="text-sm font-semibold text-tu-text-primary">Push Notification</h3>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-tu-text-secondary">
              <input type="checkbox" className="rounded accent-tu-primary" />
              แจ้งเตือนเร่งด่วน
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
