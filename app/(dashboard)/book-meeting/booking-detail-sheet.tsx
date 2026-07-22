"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Calendar, Clock, MapPin, User, Users, FileText, Building2, History } from "lucide-react";

const BOOKING_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: "ยืนยัน", color: "text-tu-success", bg: "bg-tu-success/10" },
  pending: { label: "รออนุมัติ", color: "text-tu-warning", bg: "bg-tu-warning/10" },
  cancelled: { label: "ยกเลิก", color: "text-tu-text-muted", bg: "bg-tu-surface-hover" },
  completed: { label: "เสร็จสิ้น", color: "text-tu-info", bg: "bg-tu-info/10" },
};

export function BookingDetailSheet({ booking, rooms, open, onOpenChange }: {
  booking: any;
  rooms: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!booking) return null;
  const st = BOOKING_STATUS[booking.status as string] || BOOKING_STATUS.pending;
  const room = rooms.find(r => r.id === booking.roomId);

  return (
    <Sheet open={open && !!booking} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[440px] p-0 overflow-y-auto">
        <div className="bg-gradient-to-br from-tu-primary to-[oklch(0.55_0.16_25)] text-white p-6">
          <SheetHeader className="p-0 text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.bg} ${st.color}`}>{st.label}</span>
            </div>
            <SheetTitle className="text-white text-[20px] leading-snug">{String(booking.title ?? "")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[12.5px] opacity-95">
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(booking.date as string).toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
            <span className="inline-flex items-center gap-1.5 tabular-nums"><Clock className="h-3.5 w-3.5" />{new Date(booking.startTime as string).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} – {new Date(booking.endTime as string).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2"><div className="h-7 w-7 rounded-lg bg-tu-primary/10 text-tu-primary grid place-items-center"><Building2 className="h-3.5 w-3.5" /></div><div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-tu-text-muted">ข้อมูลห้องประชุม</div></div>
            <div className="pl-9 flex items-center gap-1.5 text-[13px] text-tu-text-primary"><MapPin className="h-3.5 w-3.5 text-tu-text-muted" />{room?.name ?? "—"}</div>
          </div>
          {(booking.organizer || booking.participants) && (
            <div>
              <div className="flex items-center gap-2 mb-2"><div className="h-7 w-7 rounded-lg bg-tu-primary/10 text-tu-primary grid place-items-center"><User className="h-3.5 w-3.5" /></div><div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-tu-text-muted">ผู้จัด</div></div>
              <div className="pl-9"><div className="text-[13px] font-semibold text-tu-text-primary">{String(booking.organizer ?? "—")}</div></div>
            </div>
          )}
          {booking.notes && (
            <div>
              <div className="flex items-center gap-2 mb-2"><div className="h-7 w-7 rounded-lg bg-tu-primary/10 text-tu-primary grid place-items-center"><FileText className="h-3.5 w-3.5" /></div><div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-tu-text-muted">หมายเหตุ</div></div>
              <div className="pl-9"><p className="text-[13px] text-tu-text-secondary leading-relaxed">{String(booking.notes ?? "")}</p></div>
            </div>
          )}
          {Array.isArray(booking.statusLog) && booking.statusLog.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3"><div className="h-7 w-7 rounded-lg bg-tu-primary/10 text-tu-primary grid place-items-center"><History className="h-3.5 w-3.5" /></div><div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-tu-text-muted">ประวัติการเปลี่ยนสถานะ</div></div>
              <div className="pl-9 space-y-3">
                {booking.statusLog.map((entry: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.action === "approved" ? "var(--tu-success)" : "var(--tu-error)" }} />
                    <div>
                      <p className="text-[13px] font-medium text-tu-text-primary">{entry.action === "approved" ? "อนุมัติ" : entry.action === "rejected" ? "ปฏิเสธ" : "ยกเลิก"}</p>
                      <p className="text-[11.5px] text-tu-text-muted">{entry.prevStatus} → {entry.newStatus} · {entry.performedAt ? new Date(entry.performedAt).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
