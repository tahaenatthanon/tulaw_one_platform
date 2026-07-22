"use client";

import { Calendar, Clock, MapPin, User, Users, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryBooking {
  id: string; title: string; purpose?: string; notes?: string;
  date: string; startTime: string; endTime: string;
  attendeeCount?: number; status: string;
  userId?: string; roomId: string; bookerName?: string | null;
}

const BOOKING_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: "ยืนยัน", color: "text-tu-success", bg: "bg-tu-success/10" },
  pending: { label: "รออนุมัติ", color: "text-tu-warning", bg: "bg-tu-warning/10" },
  cancelled: { label: "ยกเลิก", color: "text-tu-text-muted", bg: "bg-tu-surface-hover" },
  completed: { label: "เสร็จสิ้น", color: "text-tu-info", bg: "bg-tu-info/10" },
};

export function HistoryTable({
  bookings,
  rooms,
  onSelect,
  selectedId,
  currentUserId,
  userRoleLevel = 0,
}: {
  bookings: HistoryBooking[];
  rooms: { id: string; name: string }[];
  onSelect: (b: HistoryBooking) => void;
  selectedId?: string;
  currentUserId?: string;
  userRoleLevel?: number;
}) {
  const now = new Date();
  const filtered = [...bookings]
    .filter((b) => {
      // Only past/archived bookings
      const isHistory =
        b.status === "completed" ||
        b.status === "cancelled" ||
        (b.status === "confirmed" && new Date(b.endTime) < now);
      if (!isHistory) return false;

      // Role-based scope: User (level < 50) sees own only, Admin+ sees all
      if (userRoleLevel < 50 && currentUserId) {
        return b.userId === currentUserId;
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by date descending, then startTime descending (newest first)
      const dateCmp = b.date.localeCompare(a.date);
      if (dateCmp !== 0) return dateCmp;
      return b.startTime.localeCompare(a.startTime);
    });

  const formatTimestamp = (d: string, st: string) => {
    const date = new Date(d);
    return `${date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}, ${new Date(st).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const formatTimeRange = (st: string, et: string) => {
    const s = new Date(st).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    const e = new Date(et).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    return `${s} – ${e}`;
  };

  return (
    <div className="rounded-2xl border border-tu-border bg-tu-surface">
      <div className="px-5 py-4 border-b border-tu-border flex items-baseline justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-tu-primary/80">ประวัติ</div>
          <h3 className="text-[16px] font-semibold tracking-tight mt-0.5 text-tu-text-primary">ประวัติการจอง</h3>
        </div>
        <div className="text-[12px] text-tu-text-muted">{filtered.length} รายการ</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-tu-border bg-tu-surface-hover">
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-tu-text-muted whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-3 w-3" />วัน/เวลา</span>
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-tu-text-muted whitespace-nowrap">หัวข้อ</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-tu-text-muted whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3" />ห้อง</span>
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-tu-text-muted whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5"><Users className="h-3 w-3" />จำนวน</span>
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-tu-text-muted whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5"><FileText className="h-3 w-3" />รายละเอียด</span>
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-tu-text-muted whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" />ช่วงเวลา</span>
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-tu-text-muted whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5"><User className="h-3 w-3" />ผู้จอง</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-[13px] text-tu-text-muted">
                  ไม่พบประวัติการจอง
                </td>
              </tr>
            )}
            {filtered.map((b) => {
              const sel = selectedId === b.id;
              const room = rooms.find((r) => r.id === b.roomId);
              const st = BOOKING_STATUS[b.status] || BOOKING_STATUS.pending;
              const detail = (b.purpose || b.notes || "—");
              return (
                <tr
                  key={b.id}
                  onClick={() => onSelect(b)}
                  className={cn(
                    "border-b border-tu-border cursor-pointer transition-colors",
                    sel ? "bg-tu-primary/5" : "hover:bg-tu-surface-hover"
                  )}
                >
                  <td className="px-5 py-3 text-[12px] text-tu-text-secondary whitespace-nowrap tabular-nums">
                    {formatTimestamp(b.date, b.startTime)}
                  </td>
                  <td className="px-4 py-3 font-medium text-tu-text-primary max-w-[200px] truncate">
                    {b.title}
                  </td>
                  <td className="px-4 py-3 text-tu-text-secondary whitespace-nowrap">
                    {room?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-tu-text-secondary whitespace-nowrap tabular-nums">
                    {b.attendeeCount != null ? `${b.attendeeCount} คน` : "—"}
                  </td>
                  <td className="px-4 py-3 text-tu-text-secondary max-w-[180px] truncate">
                    {detail}
                  </td>
                  <td className="px-4 py-3 text-tu-text-secondary whitespace-nowrap tabular-nums">
                    {formatTimeRange(b.startTime, b.endTime)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-tu-text-secondary whitespace-nowrap">{b.bookerName || "—"}</span>
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold", st.bg, st.color)}>
                        {st.label}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
