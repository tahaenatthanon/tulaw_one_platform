"use client";

import { useState, useMemo } from "react";
import {
  CalendarCheck, Building2, Users, Clock, Search,
  Video, MapPin, AlertTriangle, Check, X, Plus,
  ChevronRight, ListFilter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHasPermission } from "@/hooks/use-permission";

/* ==============================================================================
   Types
   ============================================================================== */

type TabId = "rooms" | "schedule" | "my-bookings" | "pending" | "history";

interface Room {
  id: string; name: string; location: string; capacity: number;
  status: "available" | "in-use" | "booked";
}

interface Booking {
  id: string; roomId: string; title: string; purpose: string;
  date: string; startTime: string; endTime: string; attendeeCount: number;
  msTeamsLink: string; notes?: string; status: "confirmed" | "pending" | "cancelled" | "completed";
  userId: string;
}

/* ==============================================================================
   Constants
   ============================================================================== */

const TABS: { id: TabId; label: string; icon: typeof Building2 }[] = [
  { id: "rooms", label: "รายการห้อง", icon: Building2 },
  { id: "schedule", label: "ตารางเวลา", icon: Clock },
  { id: "my-bookings", label: "การจองของฉัน", icon: CalendarCheck },
  { id: "pending", label: "รออนุมัติ", icon: ListFilter },
  { id: "history", label: "ประวัติ", icon: ListFilter },
];

const MOCK_ROOMS: Room[] = [
  { id: "room-201", name: "ห้องประชุม 201", location: "อาคารคณะนิติศาสตร์ ชั้น 2", capacity: 20, status: "available" },
  { id: "room-301", name: "ห้องประชุม 301", location: "อาคารคณะนิติศาสตร์ ชั้น 3", capacity: 60, status: "in-use" },
  { id: "room-302", name: "ห้องประชุม 302", location: "อาคารคณะนิติศาสตร์ ชั้น 3", capacity: 15, status: "available" },
  { id: "room-501", name: "ห้องประชุมใหญ่ ชั้น 5", location: "อาคารคณะนิติศาสตร์ ชั้น 5", capacity: 120, status: "booked" },
  { id: "room-101", name: "ห้องประชุมย่อย 101", location: "อาคารคณะนิติศาสตร์ ชั้น 1", capacity: 8, status: "available" },
  { id: "room-401", name: "ห้องสัมมนา 401", location: "อาคารคณะนิติศาสตร์ ชั้น 4", capacity: 30, status: "available" },
];

const MOCK_BOOKINGS: Booking[] = [
  { id: "b1", roomId: "room-301", title: "ประชุมคณะกรรมการบริหาร", purpose: "หารืองบประมาณประจำปี 2568", date: "2025-07-13", startTime: "09:00", endTime: "12:00", attendeeCount: 25, msTeamsLink: "", status: "confirmed", userId: "me" },
  { id: "b2", roomId: "room-201", title: "อบรม PDPA บุคลากร", purpose: "อบรม PDPA", date: "2025-07-13", startTime: "13:00", endTime: "16:00", attendeeCount: 15, msTeamsLink: "", status: "confirmed", userId: "me" },
  { id: "b3", roomId: "room-501", title: "สัมมนากฎหมายระหว่างประเทศ", purpose: "สัมมนา", date: "2025-07-13", startTime: "09:00", endTime: "16:30", attendeeCount: 100, msTeamsLink: "https://teams.microsoft.com/...", status: "confirmed", userId: "other" },
  { id: "b4", roomId: "room-302", title: "ประชุมฝ่ายวิชาการ", purpose: "สรุปผลการเรียน", date: "2025-07-13", startTime: "10:00", endTime: "11:00", attendeeCount: 8, msTeamsLink: "", status: "pending", userId: "me" },
  { id: "b5", roomId: "room-101", title: "สอบสัมภาษณ์อาจารย์", purpose: "สอบสัมภาษณ์", date: "2025-07-13", startTime: "14:00", endTime: "16:00", attendeeCount: 5, msTeamsLink: "", status: "pending", userId: "other" },
  { id: "b6", roomId: "room-401", title: "ปฐมนิเทศนักศึกษาใหม่", purpose: "ปฐมนิเทศ", date: "2025-07-13", startTime: "08:30", endTime: "16:00", attendeeCount: 28, msTeamsLink: "", status: "completed", userId: "me" },
];

const TIME_SLOTS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"];
const TIME_OPTIONS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00"];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  available: { label: "ว่าง", color: "text-tu-success", bg: "bg-tu-success/10" },
  "in-use": { label: "กำลังใช้งาน", color: "text-tu-warning", bg: "bg-tu-warning/10" },
  booked: { label: "ถูกจองแล้ว", color: "text-tu-error", bg: "bg-tu-error/10" },
};

const BOOKING_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: "ยืนยัน", color: "text-tu-success", bg: "bg-tu-success/10" },
  pending: { label: "รออนุมัติ", color: "text-tu-warning", bg: "bg-tu-warning/10" },
  cancelled: { label: "ยกเลิก", color: "text-tu-text-muted", bg: "bg-tu-bg" },
  completed: { label: "เสร็จสิ้น", color: "text-tu-info", bg: "bg-tu-info/10" },
};

/* ==============================================================================
   Booking Modal
   ============================================================================== */

function BookingModal({ open, onClose, rooms, bookings, onCreate }: {
  open: boolean; onClose: () => void;
  rooms: Room[]; bookings: Booking[];
  onCreate: (b: Omit<Booking, "id" | "userId">) => void;
}) {
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [roomId, setRoomId] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendees, setAttendees] = useState("10");
  const [notes, setNotes] = useState("");
  const [msTeams, setMsTeams] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const [roomDdOpen, setRoomDdOpen] = useState(false);

  const checkConflict = (rid: string, date: string, st: string, et: string) => {
    if (!rid || !date) return;
    const hasConflict = bookings.some(b =>
      b.roomId === rid && b.date === date && b.status !== "cancelled" &&
      b.startTime < et && b.endTime > st
    );
    setConflict(hasConflict ? "ช่วงเวลานี้มีผู้จองแล้ว กรุณาเลือกเวลาใหม่" : null);
  };

  const handleRoomChange = (val: string) => {
    setRoomId(val); setConflict(null); checkConflict(val, bookingDate, startTime, endTime);
  };
  const handleDateChange = (val: string) => {
    setBookingDate(val); checkConflict(roomId, val, startTime, endTime);
  };
  const handleStartChange = (val: string) => {
    setStartTime(val); checkConflict(roomId, bookingDate, val, endTime);
  };
  const handleEndChange = (val: string) => {
    setEndTime(val); checkConflict(roomId, bookingDate, startTime, val);
  };

  const handleCreate = () => {
    if (!title || !roomId || !startTime || !endTime) return;
    if (conflict) return;
    const link = msTeams ? "https://teams.microsoft.com/l/meetup-join/..." : "";
    onCreate({ roomId, title, purpose, date: bookingDate, startTime, endTime, attendeeCount: Number(attendees) || 0, msTeamsLink: link, status: "confirmed", notes });
    setTitle(""); setPurpose(""); setRoomId(""); setStartTime("09:00"); setEndTime("12:00");
    setBookingDate(new Date().toISOString().slice(0, 10));
    setAttendees("10"); setNotes(""); setMsTeams(false); setConflict(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-tu-text-primary">จองห้องประชุม</h2>
          <button onClick={onClose} className="p-1 rounded-md text-tu-text-muted hover:bg-tu-surface-hover"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">หัวข้อ / วัตถุประสงค์ <span className="text-tu-error">*</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="ระบุหัวข้อการประชุม..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">วัตถุประสงค์</label>
            <textarea value={purpose} onChange={e => setPurpose(e.target.value)} rows={2} placeholder="ระบุวัตถุประสงค์..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none resize-none" />
          </div>

          {/* Room dropdown */}
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">เลือกห้อง <span className="text-tu-error">*</span></label>
            <select value={roomId} onChange={e => handleRoomChange(e.target.value)} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none">
              <option value="">เลือกห้อง</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.capacity} คน)</option>
              ))}
            </select>
          </div>

          {/* Booking Date */}
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">วันที่ <span className="text-tu-error">*</span></label>
            <input type="date" value={bookingDate} onChange={e => handleDateChange(e.target.value)} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" />
          </div>

          {/* Time range */}
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">เวลา <span className="text-tu-error">*</span></label>
            <div className="flex items-center gap-2">
              <select value={startTime} onChange={e => handleStartChange(e.target.value)} className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-2 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none">
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <span className="text-tu-text-muted text-xs">—</span>
              <select value={endTime} onChange={e => handleEndChange(e.target.value)} className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-2 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none">
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {conflict && <p className="text-xs text-tu-error mt-1 flex items-center gap-1"><AlertTriangle size={12} />{conflict}</p>}
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">จำนวนผู้เข้าร่วม</label>
            <input type="number" value={attendees} onChange={e => setAttendees(e.target.value)} min={1} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">หมายเหตุ</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="เพิ่มหมายเหตุ..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none resize-none" />
          </div>

          {/* MS Teams */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={msTeams} onChange={e => setMsTeams(e.target.checked)} className="rounded border-tu-border text-tu-primary focus:ring-tu-primary" />
            <Video size={16} className="text-tu-info" />
            <span className="text-sm text-tu-text-secondary">สร้าง Microsoft Teams Meeting</span>
          </label>
        </div>

        <div className="flex gap-2 mt-6 justify-end">
          <button onClick={onClose} className="rounded-[--radius-btn] border border-tu-border px-4 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">ยกเลิก</button>
          <button onClick={handleCreate} disabled={!title || !roomId || !!conflict} className="rounded-[--radius-btn] bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">จองห้อง</button>
        </div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Rooms Tab
   ============================================================================== */

function RoomsTab({ rooms, search }: { rooms: Room[]; search: string }) {
  const filtered = rooms.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.location.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {filtered.map(room => {
        const st = STATUS_MAP[room.status];
        return (
          <div key={room.id} className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5 hover:shadow-md transition-shadow relative">
            <span className={cn("absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium", st.bg, st.color)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", room.status === "available" ? "bg-tu-success" : room.status === "in-use" ? "bg-tu-warning" : "bg-tu-error")} />{st.label}
            </span>
            <div className="flex items-center gap-2 mb-3">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", st.bg)}><Building2 size={20} className={st.color} /></div>
              <h3 className="text-sm font-semibold text-tu-text-primary">{room.name}</h3>
            </div>
            <div className="space-y-2 text-xs text-tu-text-secondary mb-4">
              <p className="flex items-center gap-1.5"><MapPin size={12} className="text-tu-text-muted" />{room.location}</p>
              <p className="flex items-center gap-1.5"><Users size={12} className="text-tu-text-muted" />จำนวนสูงสุด: {room.capacity} คน</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ==============================================================================
   Schedule Tab
   ============================================================================== */

function ScheduleTab({ rooms, bookings, search }: { rooms: Room[]; bookings: Booking[]; search: string }) {
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const dateStr = scheduleDate.toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const prevDay = () => setScheduleDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  const nextDay = () => setScheduleDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });

  const filteredRooms = rooms.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase())
  );

  const getBooking = (roomId: string, slot: string) =>
    bookings.find(b => b.roomId === roomId && b.status !== "cancelled" && b.startTime <= slot && b.endTime > slot);

  const getIsStart = (roomId: string, slot: string) =>
    !!bookings.find(b => b.roomId === roomId && b.status !== "cancelled" && b.startTime === slot);

  // Show 8:00-18:00 (hourly)
  const hourlySlots = TIME_SLOTS.filter((_, i) => i % 2 === 0);

  return (
    <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border overflow-auto">
      <div className="min-w-[800px]">
        {/* Date picker */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-tu-border">
          <span className="text-sm font-semibold text-tu-text-primary">{dateStr}</span>
          <div className="flex items-center gap-1">
            <button onClick={prevDay} className="p-1 rounded hover:bg-tu-surface-hover text-tu-text-muted"><ChevronRight size={16} className="rotate-180" /></button>
            <button onClick={nextDay} className="p-1 rounded hover:bg-tu-surface-hover text-tu-text-muted"><ChevronRight size={16} /></button>
          </div>
        </div>
        {/* Header row: ห้อง / เวลา */}
        <div className="grid border-b border-tu-border" style={{ gridTemplateColumns: `120px repeat(${hourlySlots.length}, 1fr)` }}>
          <div className="px-3 py-3 text-xs font-semibold text-tu-text-muted border-r border-tu-border bg-tu-bg/50">ห้อง / เวลา</div>
          {hourlySlots.map(slot => (
            <div key={slot} className="px-2 py-3 text-center text-xs font-semibold text-tu-text-muted border-r border-tu-border bg-tu-bg/50">{slot}</div>
          ))}
        </div>

        {/* Room rows */}
        {filteredRooms.map(room => (
          <div key={room.id} className="grid border-b border-tu-border hover:bg-tu-bg/30 transition-colors" style={{ gridTemplateColumns: `120px repeat(${hourlySlots.length}, 1fr)` }}>
            {/* Room name */}
            <div className="px-3 py-3 border-r border-tu-border flex flex-col justify-center">
              <span className="text-xs font-semibold text-tu-text-primary">{room.name}</span>
              <span className="text-[10px] text-tu-text-muted">{room.capacity} คน</span>
            </div>

            {/* Time slots */}
            {hourlySlots.map(slot => {
              const booking = getBooking(room.id, slot);
              const isStart = getIsStart(room.id, slot);
              return (
                <div key={slot} className={cn("px-1 py-1.5 border-r border-tu-border text-center",
                  booking ? "bg-tu-primary-soft" : "")}>
                  {isStart && (
                    <div className="bg-tu-primary text-white rounded px-1.5 py-1 text-[9px] font-medium leading-tight text-left">
                      {booking?.title}
                    </div>
                  )}
                  {booking && !isStart && <div className="h-full" />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==============================================================================
   Bookings Tab (My Bookings / Pending / History)
   ============================================================================== */

function BookingsList({ bookings, rooms, type, onConfirm, onCancel }: {
  bookings: Booking[]; rooms: Room[]; type: "my-bookings" | "pending" | "history";
  onConfirm: (id: string) => void; onCancel: (id: string) => void;
}) {
  const filtered = type === "my-bookings"
    ? bookings.filter(b => b.userId === "me" && b.status !== "completed")
    : type === "pending"
    ? bookings.filter(b => b.status === "pending")
    : bookings.filter(b => b.status === "completed" || b.status === "cancelled");

  if (filtered.length === 0) return <div className="text-center py-12 text-tu-text-muted"><CalendarCheck size={40} className="mx-auto mb-3 opacity-20" /><p>ไม่พบรายการ</p></div>;

  return (
    <div className="space-y-3">
      {filtered.map(booking => {
        const room = rooms.find(r => r.id === booking.roomId);
        const st = BOOKING_STATUS[booking.status];
        return (
          <div key={booking.id} className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", st.bg)}><CalendarCheck size={20} className={st.color} /></div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-tu-text-primary">{booking.title}</h4>
                  <p className="text-xs text-tu-text-muted mt-0.5">{room?.name ?? "—"} · {new Date(booking.date).toLocaleDateString("th-TH", { dateStyle: "medium" })} · {booking.startTime} - {booking.endTime} · {booking.attendeeCount} คน</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {type === "history" && <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium", st.bg, st.color)}>{st.label}</span>}
                {(type === "my-bookings" || type === "pending") && booking.status !== "cancelled" && booking.status !== "completed" && (
                  <div className="flex gap-1.5">
                    <button onClick={() => onConfirm(booking.id)} className="rounded-[--radius-btn] bg-tu-success px-3 py-1 text-[11px] font-medium text-white hover:brightness-110 transition-all">ยืนยัน</button>
                    <button onClick={() => onCancel(booking.id)} className="rounded-[--radius-btn] border border-tu-error px-3 py-1 text-[11px] font-medium text-tu-error hover:bg-tu-error/10 transition-all">ยกเลิก</button>
                  </div>
                )}
                {booking.msTeamsLink && <a href={booking.msTeamsLink} target="_blank" className="p-1.5 rounded-md text-tu-info hover:bg-tu-info/10" title="MS Teams"><Video size={14} /></a>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ==============================================================================
   Main Page
   ============================================================================== */

export default function BookMeetingPage() {
  const [activeTab, setActiveTab] = useState<TabId>("rooms");
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [modalOpen, setModalOpen] = useState(false);
  const canCreate = useHasPermission("BOOK_MEETING_CREATE");
  const canApprove = useHasPermission("BOOK_MEETING_APPROVE");

  const now = new Date().toTimeString().slice(0, 5);
  const availableCount = rooms.filter(r => r.status === "available").length;
  const todayBookings = bookings.filter(b => b.status === "confirmed" || b.status === "pending").length;
  const myBookings = bookings.filter(b => b.userId === "me" && b.status === "confirmed").length;

  const handleCreate = (b: Omit<Booking, "id" | "userId">) => {
    const newBooking: Booking = { ...b, id: String(Date.now()), userId: "me" };
    setBookings(prev => [newBooking, ...prev]);
    // Update room status
    setRooms(prev => prev.map(r => r.id === b.roomId ? { ...r, status: "booked" as const } : r));
  };

  const handleConfirm = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "confirmed" as const } : b));
  };

  const handleCancel = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" as const } : b));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-tu-text-primary">Book Meeting</h1>
          <p className="text-tu-text-muted text-sm mt-1">จองห้องประชุมและสถานที่ภายในคณะนิติศาสตร์</p>
        </div>
        {canCreate && (
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 rounded-[--radius-btn] bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors shrink-0">
            <Plus size={16} />จองห้องประชุม
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "ห้องทั้งหมด", value: rooms.length, icon: Building2, c: "text-tu-primary", bg: "bg-tu-primary-soft" },
          { label: "ว่างขณะนี้", value: availableCount, icon: Check, c: "text-tu-success", bg: "bg-tu-success/10" },
          { label: "การจองวันนี้", value: todayBookings, icon: Clock, c: "text-tu-info", bg: "bg-tu-info/10" },
          { label: "การจองของฉัน", value: myBookings, icon: CalendarCheck, c: "text-tu-warning", bg: "bg-tu-warning/10" },
        ].map(s => (
          <div key={s.label} className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-4 flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", s.bg)}><s.icon size={20} className={s.c} /></div>
            <div><p className="text-lg font-bold text-tu-text-primary">{s.value}</p><p className="text-xs text-tu-text-muted">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5 w-fit">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === tab.id ? "bg-tu-primary text-white shadow-sm" : "text-tu-text-secondary hover:text-tu-text-primary")}>
              <tab.icon size={14} />{tab.label}
            </button>
          ))}
        </div>
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาห้องประชุม..." className="rounded-[--radius-input] border border-tu-border bg-tu-surface pl-9 pr-4 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none w-full sm:w-64" /></div>
      </div>

      {/* Content */}
      {activeTab === "rooms" && <RoomsTab rooms={rooms} search={search} />}
      {activeTab === "schedule" && <ScheduleTab rooms={rooms} bookings={bookings} search={search} />}
      {activeTab === "my-bookings" && <BookingsList bookings={bookings} rooms={rooms} type="my-bookings" onConfirm={handleConfirm} onCancel={handleCancel} />}
      {activeTab === "pending" && canApprove && <BookingsList bookings={bookings} rooms={rooms} type="pending" onConfirm={handleConfirm} onCancel={handleCancel} />}
      {activeTab === "history" && <BookingsList bookings={bookings} rooms={rooms} type="history" onConfirm={handleConfirm} onCancel={handleCancel} />}

      <BookingModal open={modalOpen} onClose={() => setModalOpen(false)} rooms={rooms} bookings={bookings} onCreate={handleCreate} />
    </div>
  );
}
