"use client";

import { Users, MapPin, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-tu-primary to-[oklch(0.55_0.16_25)]",
  "from-blue-600 to-blue-800",
  "from-emerald-600 to-teal-800",
  "from-violet-600 to-purple-800",
  "from-amber-500 to-orange-600",
  "from-rose-600 to-pink-800",
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  available: { label: "ว่าง", color: "text-tu-success", bg: "bg-tu-success/10" },
  "in-use": { label: "กำลังใช้งาน", color: "text-tu-warning", bg: "bg-tu-warning/10" },
  booked: { label: "ถูกจองแล้ว", color: "text-tu-error", bg: "bg-tu-error/10" },
};

interface Room {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: "available" | "in-use" | "booked";
}

type Props = {
  room: Room;
  onBook: (room: Room) => void;
};

export function RoomCard({ room, onBook }: Props) {
  const disabled = room.status !== "available";
  const st = STATUS_MAP[room.status] || STATUS_MAP.available;
  // Pick a gradient based on room name hash
  const gradientIdx = room.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % GRADIENTS.length;

  return (
    <article className="group flex flex-col rounded-2xl border border-tu-border bg-tu-surface overflow-hidden transition-all duration-200 hover:shadow-[0_12px_36px_-14px_rgba(15,23,42,0.18)] hover:-translate-y-0.5">
      {/* Gradient banner */}
      <div className={cn("relative h-36 bg-gradient-to-br", GRADIENTS[gradientIdx])}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
        <div className="absolute top-3 left-3">
          <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur bg-white/85", st.color)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", room.status === "available" ? "bg-tu-success" : room.status === "in-use" ? "bg-tu-warning" : "bg-tu-error")} />
            {st.label}
          </span>
        </div>
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <div className="text-[11px] uppercase tracking-[0.14em] font-semibold opacity-90">{room.location || `${room.capacity} คน`}</div>
          <div className="text-[17px] font-semibold leading-snug drop-shadow-sm truncate">{room.name}</div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-[12.5px] text-tu-text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{room.location || "—"}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-tu-surface-hover px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-tu-text-muted font-medium">
              <Users className="h-3.5 w-3.5" /> ความจุ
            </div>
            <div className="mt-0.5 text-[15px] font-semibold tabular-nums">{room.capacity} ที่นั่ง</div>
          </div>
          <div className="rounded-xl bg-tu-surface-hover px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-tu-text-muted font-medium">
              <Clock className="h-3.5 w-3.5" /> สถานะ
            </div>
            <div className={cn("mt-0.5 text-[15px] font-semibold", st.color)}>{st.label}</div>
          </div>
        </div>

        <div className="mt-auto pt-5">
          <button
            onClick={() => onBook(room)}
            disabled={disabled}
            className={cn(
              "w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl text-[13px] font-semibold transition-all",
              disabled
                ? "bg-tu-surface-hover text-tu-text-muted cursor-not-allowed"
                : "bg-tu-primary text-white hover:bg-tu-primary-hover shadow-sm group-hover:shadow-md",
            )}
          >
            {disabled ? "ไม่พร้อมให้จอง" : "จองห้องประชุม"}
            {!disabled && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
          </button>
        </div>
      </div>
    </article>
  );
}
