"use client";

import { ShieldAlert, AlertTriangle } from "lucide-react";

const events = [
  { id: "1", type: "failed_login", severity: "medium", message: "พยายามเข้าสู่ระบบล้มเหลว 5 ครั้ง", user: "10.0.0.55", time: "2025-07-09 13:00" },
  { id: "2", type: "brute_force", severity: "high", message: "ตรวจพบการพยายามเข้าสู่ระบบจำนวนมากจาก IP เดียวกัน", user: "45.33.32.156", time: "2025-07-09 03:15" },
  { id: "3", type: "role_change", severity: "medium", message: "บทบาทผู้ใช้งานถูกเปลี่ยนแปลง", user: "สมชาย ใจดี", time: "2025-07-09 02:00" },
  { id: "4", type: "api_key_created", severity: "low", message: "สร้าง API Key ใหม่", user: "ผู้ดูแล ระบบ", time: "2025-07-08 15:00" },
];

const severityColor: Record<string, string> = {
  high: "bg-tu-error/10 text-tu-error border-tu-error/20",
  medium: "bg-tu-warning/10 text-tu-warning border-tu-warning/20",
  low: "bg-tu-info/10 text-tu-info border-tu-info/20",
};

export default function SecurityEventsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-tu-text-primary">เหตุการณ์ความปลอดภัย</h1>
        <p className="text-tu-text-muted text-sm mt-1">เหตุการณ์ที่น่าสงสัยหรือมีความเสี่ยงด้านความปลอดภัย</p>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${severityColor[event.severity]} border`}>
                <ShieldAlert size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-tu-text-primary">{event.message}</h3>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${severityColor[event.severity]}`}>
                    {event.severity === "high" ? "สูง" : event.severity === "medium" ? "กลาง" : "ต่ำ"}
                  </span>
                </div>
                <p className="text-xs text-tu-text-muted mt-1">
                  {event.user} · {event.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 text-tu-text-muted">
          <AlertTriangle size={48} className="mx-auto mb-3 opacity-30" />
          <p>ไม่มีเหตุการณ์ความปลอดภัย</p>
        </div>
      )}
    </div>
  );
}
