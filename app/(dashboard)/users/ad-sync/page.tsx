"use client";

import { RefreshCw, Clock, Users, CheckCircle, XCircle } from "lucide-react";

const syncLogs = [
  { id: "1", time: "2025-07-09 14:30", status: "success", users: 245, newUsers: 3, updatedUsers: 5 },
  { id: "2", time: "2025-07-09 14:15", status: "success", users: 242, newUsers: 0, updatedUsers: 2 },
  { id: "3", time: "2025-07-09 14:00", status: "error", users: 0, newUsers: 0, updatedUsers: 0, error: "Connection timeout" },
  { id: "4", time: "2025-07-09 13:45", status: "success", users: 240, newUsers: 1, updatedUsers: 4 },
  { id: "5", time: "2025-07-09 13:30", status: "success", users: 239, newUsers: 2, updatedUsers: 1 },
];

export default function AdSyncPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-tu-text-primary">ซิงค์ Active Directory</h1>
          <p className="text-tu-text-muted text-sm mt-1">
            เชื่อมต่อกับ Microsoft Active Directory ของมหาวิทยาลัยธรรมศาสตร์
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-[--radius-btn] bg-tu-primary px-4 py-2.5 text-sm font-medium text-tu-text-inverse hover:bg-tu-primary-hover transition-colors">
          <RefreshCw size={18} />
          ซิงค์ทันที
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tu-primary-soft">
            <Users size={24} className="text-tu-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-tu-text-primary">245</p>
            <p className="text-sm text-tu-text-muted">ผู้ใช้ใน AD</p>
          </div>
        </div>
        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tu-secondary-soft">
            <Clock size={24} className="text-tu-secondary-active" />
          </div>
          <div>
            <p className="text-2xl font-bold text-tu-text-primary">15 นาที</p>
            <p className="text-sm text-tu-text-muted">รอบการซิงค์</p>
          </div>
        </div>
        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
            <CheckCircle size={24} className="text-tu-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-tu-text-primary">14:30</p>
            <p className="text-sm text-tu-text-muted">ซิงค์ล่าสุด</p>
          </div>
        </div>
      </div>

      {/* Sync Log */}
      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border overflow-hidden">
        <div className="px-5 py-3 border-b border-tu-border bg-tu-bg">
          <h2 className="text-sm font-semibold text-tu-text-primary">ประวัติการซิงค์</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-tu-border text-left bg-tu-bg/50">
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">เวลา</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">สถานะ</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">ผู้ใช้</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">เพิ่มใหม่</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">อัปเดต</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tu-border">
            {syncLogs.map((log) => (
              <tr key={log.id} className="hover:bg-tu-surface-hover transition-colors">
                <td className="px-4 py-3 text-sm text-tu-text-primary">{log.time}</td>
                <td className="px-4 py-3">
                  {log.status === "success" ? (
                    <span className="inline-flex items-center gap-1 text-xs text-tu-success font-medium">
                      <CheckCircle size={14} /> สำเร็จ
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-tu-error font-medium">
                      <XCircle size={14} /> {log.error}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-tu-text-secondary">{log.users}</td>
                <td className="px-4 py-3 text-sm text-tu-success">+{log.newUsers}</td>
                <td className="px-4 py-3 text-sm text-tu-info">{log.updatedUsers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
