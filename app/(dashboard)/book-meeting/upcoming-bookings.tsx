"use client";

import { Calendar, Clock, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Accepts any shape — caller provides real data from API
export function UpcomingBookings({ bookings, rooms, onSelect, selectedId, currentUserId, type = "upcoming", filterByUser, onConfirm, onCancel, onEdit, canApprove }: {
  bookings: any[];
  rooms: { id: string; name: string }[];
  onSelect: (b: any) => void;
  selectedId?: string;
  currentUserId?: string;
  type?: "upcoming" | "my-bookings" | "pending" | "history";
  filterByUser?: string;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  onEdit?: (b: any) => void;
  canApprove?: boolean;
}) {
  const sorted = [...bookings]
    .filter((b) => {
      if (type === "upcoming") return b.status === "confirmed" || b.status === "pending";
      if (type === "my-bookings") return b.userId === currentUserId && b.status !== "completed" && b.status !== "cancelled";
      if (type === "pending") {
        if (b.status !== "pending") return false;
        // Approver sees all pending, regular user sees only own
        if (canApprove) return true;
        return b.userId === currentUserId;
      }
      if (type === "history") {
        const now = new Date();
        return b.status === "completed" || (b.status === "confirmed" && new Date(b.endTime as string) < now);
      }
      return true;
    })
    .sort((a, b) => ((a.date as string) + (a.startTime as string)).localeCompare((b.date as string) + (b.startTime as string)));

  const titleMap: Record<string, string> = {
    upcoming: "การจองที่กำลังจะถึง", "my-bookings": "การจองของฉัน",
    pending: "รออนุมัติ", history: "ประวัติ",
  };

  const BOOKING_STATUS: Record<string, { label: string; color: string; bg: string }> = {
    confirmed: { label: "ยืนยัน", color: "text-tu-success", bg: "bg-tu-success/10" },
    pending: { label: "รออนุมัติ", color: "text-tu-warning", bg: "bg-tu-warning/10" },
    cancelled: { label: "ยกเลิก", color: "text-tu-text-muted", bg: "bg-tu-surface-hover" },
    completed: { label: "เสร็จสิ้น", color: "text-tu-info", bg: "bg-tu-info/10" },
  };

  return (
    <div className="rounded-2xl border border-tu-border bg-tu-surface">
      <div className="px-5 py-4 border-b border-tu-border flex items-baseline justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-tu-primary/80">{titleMap[type]}</div>
          <h3 className="text-[16px] font-semibold tracking-tight mt-0.5 text-tu-text-primary">{type === "history" ? "ประวัติการจอง" : titleMap[type]}</h3>
        </div>
        <div className="text-[12px] text-tu-text-muted">{sorted.length} รายการ</div>
      </div>
      <ul className="divide-y divide-tu-border">
        {sorted.length === 0 && (
          <li className="p-8 text-center text-[13px] text-tu-text-muted">ยังไม่มีการจอง</li>
        )}
        {sorted.map((b: any) => {
          const sel = selectedId === b.id;
          const room = rooms.find(r => r.id === b.roomId);
          const st = BOOKING_STATUS[b.status as string] || BOOKING_STATUS.pending;
          return (
            <li key={b.id as string}>
              <div className={cn("px-5 py-4 transition-colors", sel ? "bg-tu-primary/5" : "hover:bg-tu-surface-hover")}>
                <button onClick={() => onSelect(b)} className="w-full text-left">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-start">
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold truncate text-tu-text-primary">{String(b.title ?? "")}</div>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-tu-text-muted">
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{room?.name ?? "—"}</span>
                      {b.bookerName && <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{String(b.bookerName)}</span>}
                      {!b.bookerName && b.organizer && <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{String(b.organizer)}</span>}
                    </div>
                  </div>
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold", st.bg, st.color)}>{st.label}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-tu-text-secondary">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-tu-text-muted" />{new Date(b.date as string).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}</span>
                  <span className="inline-flex items-center gap-1.5 tabular-nums"><Clock className="h-3.5 w-3.5 text-tu-text-muted" />{new Date(b.startTime as string).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} – {new Date(b.endTime as string).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                </button>
                {type === "pending" && onConfirm && onCancel && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onConfirm(b.id as string); }}
                      className="h-8 px-3 rounded-lg bg-tu-success text-white text-[12px] font-medium hover:brightness-110 transition-all"
                    >ยืนยัน</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onCancel(b.id as string); }}
                      className="h-8 px-3 rounded-lg border border-tu-error text-tu-error text-[12px] font-medium hover:bg-tu-error/10 transition-all"
                    >ยกเลิก</button>
                  </div>
                )}
                {type === "my-bookings" && onEdit && onCancel && b.status !== "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(b); }}
                      className="h-8 px-3 rounded-lg border border-tu-border bg-white text-tu-text-secondary text-[12px] font-medium hover:bg-tu-surface-hover transition-all"
                    >แก้ไข</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onCancel(b.id as string); }}
                      className="h-8 px-3 rounded-lg border border-tu-error text-tu-error text-[12px] font-medium hover:bg-tu-error/10 transition-all"
                    >ยกเลิก</button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
