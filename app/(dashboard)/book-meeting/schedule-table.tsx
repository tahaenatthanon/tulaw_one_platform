"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TIME_SLOTS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"];

function getLocalTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function ScheduleTable({ bookings, rooms, onSelectBooking, selectedId, search }: {
  bookings: any[];
  rooms: { id: string; name: string; capacity: number }[];
  onSelectBooking: (b: any) => void;
  selectedId?: string;
  search: string;
}) {
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const dateStr = scheduleDate.toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const prevDay = () => setScheduleDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  const nextDay = () => setScheduleDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });

  const filteredRooms = rooms.filter(r =>
    r.name.toLowerCase().includes((search ?? "").toLowerCase()) ||
    String(r.capacity).includes(search ?? "")
  );

  const selectedDateStr = scheduleDate.toISOString().slice(0, 10);
  const dayBookings = bookings.filter(b => b.date === selectedDateStr && b.status === "confirmed");

  // Map start-time → booking
  const bookingByStart = new Map<string, any>();
  dayBookings.forEach(b => {
    bookingByStart.set(`${b.roomId}|${getLocalTime(b.startTime as string)}`, b);
  });

  const getSpan = (roomId: string, slot: string) => {
    const b = bookingByStart.get(`${roomId}|${slot}`);
    if (!b) return 0;
    return TIME_SLOTS.filter(s =>
      getLocalTime(b.startTime as string) <= s && getLocalTime(b.endTime as string) > s
    ).length;
  };

  const isStart = (roomId: string, slot: string) => bookingByStart.has(`${roomId}|${slot}`);

  return (
    <div className="bg-tu-surface rounded-2xl border border-tu-border overflow-auto">
      <div className="min-w-[800px]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-tu-border">
          <span className="text-sm font-semibold text-tu-text-primary">{dateStr}</span>
          <div className="flex items-center gap-1">
            <button onClick={prevDay} className="p-1.5 rounded-lg hover:bg-tu-surface-hover text-tu-text-muted transition-colors"><ChevronRight size={16} className="rotate-180" /></button>
            <button onClick={nextDay} className="p-1.5 rounded-lg hover:bg-tu-surface-hover text-tu-text-muted transition-colors"><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* Header — vertical time labels */}
        <div className="grid border-b border-tu-border" style={{ gridTemplateColumns: `140px repeat(${TIME_SLOTS.length}, 1fr)` }}>
          <div className="px-3 py-3 text-xs font-semibold text-tu-text-muted border-r border-tu-border bg-tu-bg/50">ห้อง / เวลา</div>
          {TIME_SLOTS.map((slot, i) => (
            <div key={slot} className="flex flex-col items-center justify-center py-2 text-[9px] font-medium text-tu-text-muted border-r border-tu-border bg-tu-bg/50 leading-none gap-0.5">
              <span>{slot}</span>
              {i < TIME_SLOTS.length - 1 && <span>-</span>}
              {i < TIME_SLOTS.length - 1 && <span>{TIME_SLOTS[i + 1]}</span>}
            </div>
          ))}
        </div>

        {/* Room rows */}
        {filteredRooms.map(room => (
          <div key={room.id} className="grid border-b border-tu-border hover:bg-tu-bg/30 transition-colors" style={{ gridTemplateColumns: `140px repeat(${TIME_SLOTS.length}, 1fr)` }}>
            <div className="px-3 py-3 border-r border-tu-border flex flex-col justify-center">
              <span className="text-xs font-semibold text-tu-text-primary">{room.name}</span>
              <span className="text-[10px] text-tu-text-muted">{room.capacity} คน</span>
            </div>

            {TIME_SLOTS.map(slot => {
              const span = getSpan(room.id, slot);
              const hasBooking = isStart(room.id, slot);
              const booking = bookingByStart.get(`${room.id}|${slot}`);

              // Non-start slot of a multi-slot booking → hidden (covered by gridColumn span)
              const isOccupied = dayBookings.some((b: any) =>
                b.roomId === room.id &&
                getLocalTime(b.startTime as string) <= slot &&
                getLocalTime(b.endTime as string) > slot
              );
              if (!hasBooking && isOccupied) return null;

              if (!hasBooking) {
                return <div key={slot} className="border-r border-tu-border flex items-center justify-center"><span className="text-[9px] text-tu-text-muted/40 font-medium">Free</span></div>;
              }

              const sel = booking && selectedId === booking.id;
              return (
                <div key={slot} className="border-r border-tu-border flex items-center justify-center bg-tu-primary-soft" style={{ gridColumn: `span ${span}` }}>
                  <button
                    onClick={() => onSelectBooking(booking)}
                    className={cn(
                      "text-[11px] font-semibold transition-colors text-white",
                      sel && "underline"
                    )}
                  >
                    {(booking as any).title as string}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
