"use client";

import { useState } from "react";
import { Search, Shield, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockLogs = [
  { id: "1", user: "ผู้ดูแล ระบบ", action: "เข้าสู่ระบบ", module: "Authentication", entity: "-", time: "2025-07-09 14:30", status: "success" },
  { id: "2", user: "ผู้ดูแล ระบบ", action: "สร้างประกาศ", module: "Intranet", entity: "ประกาศ #12", time: "2025-07-09 14:15", status: "success" },
  { id: "3", user: "สมชาย ใจดี", action: "แก้ไขผู้ใช้งาน", module: "Users", entity: "user:somchai", time: "2025-07-09 13:50", status: "success" },
  { id: "4", user: "สมศรี รักเรียน", action: "อนุมัติเอกสาร", module: "E-Office", entity: "PR-2025-45", time: "2025-07-09 13:30", status: "success" },
  { id: "5", user: "-", action: "พยายามเข้าสู่ระบบ", module: "Authentication", entity: "unknown@test.com", time: "2025-07-09 13:00", status: "failed", ip: "10.0.0.55" },
  { id: "6", user: "วิชัย มั่นคง", action: "อัปโหลดเอกสาร", module: "Documents", entity: "file-234.pdf", time: "2025-07-09 12:30", status: "success" },
];

export default function ActivityLogPage() {
  const [search, setSearch] = useState("");
  const filtered = mockLogs.filter((l) => l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()) || l.module.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-tu-text-primary">บันทึกกิจกรรม</h1>
          <p className="text-tu-text-muted text-sm mt-1">บันทึกทั้งหมด — ไม่สามารถลบหรือแก้ไขได้</p>
        </div>
        <Badge variant="destructive" className="gap-1.5 h-8">
          <Lock size={12} />
          Immutable — ห้ามลบ/แก้ไข
        </Badge>
      </div>

      <div className="flex items-center gap-3 bg-tu-error/5 border border-tu-error/10 rounded-[--radius-card] p-4 text-sm">
        <Shield size={20} className="text-tu-error shrink-0" />
        <div>
          <p className="font-semibold text-tu-text-primary">Immutable Audit Log</p>
          <p className="text-tu-text-muted text-xs">ข้อมูลทั้งหมดถูกบันทึกแบบ Append-Only — ไม่สามารถแก้ไข ลบ หรือเปลี่ยนแปลงได้ ไม่ว่าจะเป็นผู้ใช้ระดับใดรวมถึง Super Admin บันทึกนี้เก็บไว้ไม่น้อยกว่า 1 ปี</p>
        </div>
      </div>

      <div className="relative max-w-md"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาบันทึก..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface pl-9 pr-4 py-2.5 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none transition" /></div>

      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-tu-bg border-b border-tu-border text-left"><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">เวลา</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">ผู้ใช้</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">การกระทำ</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden sm:table-cell">โมดูล</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden md:table-cell">รายการ</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">สถานะ</th></tr></thead>
          <tbody className="divide-y divide-tu-border">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-tu-surface-hover transition-colors">
                <td className="px-4 py-3 text-sm text-tu-text-muted whitespace-nowrap">{log.time}</td>
                <td className="px-4 py-3 text-sm font-medium text-tu-text-primary">{log.user}</td>
                <td className="px-4 py-3 text-sm text-tu-text-secondary">{log.action}</td>
                <td className="px-4 py-3 text-sm text-tu-text-secondary hidden sm:table-cell">{log.module}</td>
                <td className="px-4 py-3 text-sm text-tu-text-muted hidden md:table-cell">{log.entity}</td>
                <td className="px-4 py-3"><Badge variant={log.status === "success" ? "success" : "destructive"}>{log.status === "success" ? "สำเร็จ" : "ล้มเหลว"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
