"use client";

export default function SystemBrandingPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-tu-text-primary">ปรับแต่งระบบ</h1>
        <p className="text-tu-text-muted text-sm mt-1">ตั้งค่าโลโก้ สี และธีมของระบบ</p>
      </div>

      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6 space-y-6">
        {/* Logo */}
        <div className="pb-6 border-b border-tu-border">
          <h3 className="text-sm font-semibold text-tu-text-primary mb-3">โลโก้ระบบ</h3>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-tu-primary">
              <span className="text-white text-xl font-bold">มธ</span>
            </div>
            <div>
              <p className="text-sm text-tu-text-secondary">TULAW ONE PLATFORM</p>
              <p className="text-xs text-tu-text-muted">Faculty of Law, Thammasat University</p>
            </div>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="pb-6 border-b border-tu-border">
          <h3 className="text-sm font-semibold text-tu-text-primary mb-3">สีหลัก</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <div className="h-10 rounded-lg bg-tu-primary" />
              <span className="text-xs text-tu-text-muted">Primary #A31D1D</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-10 rounded-lg bg-tu-primary-hover" />
              <span className="text-xs text-tu-text-muted">Hover #8B1515</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-10 rounded-lg bg-tu-secondary" />
              <span className="text-xs text-tu-text-muted">Secondary #FDB813</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-10 rounded-lg bg-tu-secondary-hover" />
              <span className="text-xs text-tu-text-muted">Hover #E5A800</span>
            </div>
          </div>
        </div>

        {/* Theme */}
        <div>
          <h3 className="text-sm font-semibold text-tu-text-primary mb-3">ธีม</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-tu-text-secondary">ธีมปัจจุบัน</span>
            <span className="text-sm font-medium text-tu-text-primary">Light (ค่าเริ่มต้น)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
