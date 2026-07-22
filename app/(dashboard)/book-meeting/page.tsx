"use client";

import { useMemo, useState, Suspense, useCallback } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { CalendarCheck, Building2, Clock, CalendarClock, DoorOpen, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { swrFetcher, fetchApi, ApiError } from "@/lib/fetcher";
import { useHasPermission, useRoleLevel } from "@/hooks/use-permission";
import { useUrlState } from "@/hooks/use-url-state";
import { toast } from "sonner";
import { RoomCard } from "./room-card";
import { ScheduleTable } from "./schedule-table";
import { UpcomingBookings } from "./upcoming-bookings";
import { HistoryTable } from "./history-table";
import { CreateBookingDialog } from "./create-booking-dialog";
import { BookingDetailSheet } from "./booking-detail-sheet";
import { EmptyState } from "./empty-state";

/* ==============================================================================
   Types
   ============================================================================== */

type TabId = "rooms" | "schedule" | "my-bookings" | "pending" | "history";

interface Room {
  id: string; name: string; location: string; capacity: number;
  status: "available" | "in-use" | "booked";
}

interface Booking {
  id: string; title: string; purpose?: string;
  date: string; startTime: string; endTime: string; attendeeCount?: number;
  msTeamsLink?: string; notes?: string;
  status: string;
  userId?: string; roomId: string; roomName?: string;
}

/* ==============================================================================
   Stat Card
   ============================================================================== */

function StatCard({ label, value, sub, icon: Icon, accent = "primary" }: {
  label: string; value: string; sub: string;
  icon: React.ElementType; accent?: "primary" | "success" | "info" | "warning";
}) {
  const colors: Record<string, { bg: string; text: string; ring: string }> = {
    primary: { bg: "bg-tu-primary/10", text: "text-tu-primary", ring: "ring-tu-primary/15" },
    success: { bg: "bg-tu-success/10", text: "text-tu-success", ring: "ring-tu-success/15" },
    info: { bg: "bg-tu-info/10", text: "text-tu-info", ring: "ring-tu-info/15" },
    warning: { bg: "bg-tu-warning/10", text: "text-tu-warning", ring: "ring-tu-warning/15" },
  };
  const c = colors[accent];
  return (
    <div className="rounded-2xl border border-tu-border bg-tu-surface p-5 flex items-start gap-4 hover:shadow-sm transition-shadow">
      <div className={cn("h-11 w-11 rounded-xl grid place-items-center shrink-0 ring-1 ring-inset", c.bg, c.text, c.ring)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-tu-text-muted">{label}</div>
        <div className="mt-1 text-[24px] font-semibold tracking-tight tabular-nums text-tu-text-primary">{value}</div>
        <div className="mt-0.5 text-[12px] text-tu-text-muted">{sub}</div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Tab Selector
   ============================================================================== */

const TABS: { id: TabId; label: string; icon: typeof Building2 }[] = [
  { id: "rooms", label: "รายการห้อง", icon: Building2 },
  { id: "schedule", label: "ตารางเวลา", icon: Clock },
  { id: "my-bookings", label: "การจองของฉัน", icon: CalendarCheck },
  { id: "pending", label: "รออนุมัติ", icon: Clock },
  { id: "history", label: "ประวัติ", icon: CalendarCheck },
];

function TabSelector({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  return (
    <div className="inline-flex p-1 rounded-xl bg-tu-bg/70 border border-tu-border">
      {TABS.map((tab) => (<button key={tab.id} onClick={() => onChange(tab.id)} className={cn("flex items-center gap-1.5 px-4 h-9 rounded-lg text-[12.5px] font-medium transition-all whitespace-nowrap", active === tab.id ? "bg-tu-primary text-white shadow-sm" : "text-tu-text-muted hover:text-tu-text-primary")}><tab.icon size={14} />{tab.label}</button>))}
    </div>
  );
}

/* ==============================================================================
   Main Content
   ============================================================================== */

export default function BookMeetingPage() {
  return <Suspense fallback={<div className="p-6 text-sm text-tu-text-muted">Loading...</div>}><BookMeetingContent /></Suspense>;
}

function BookMeetingContent() {
  const [activeTab, setActiveTab] = useUrlState<TabId>("tab", "rooms");
  const [search] = useUrlState<string>("search", "");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [presetRoom, setPresetRoom] = useState<Room | null>(null);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);

  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string } | undefined)?.id ?? "";
  const currentUserName = ((session?.user as { firstNameTh?: string; lastNameTh?: string } | undefined)?.firstNameTh ?? "") + " " + ((session?.user as { lastNameTh?: string } | undefined)?.lastNameTh ?? "");
  const displayName = currentUserName.trim() || ((session?.user as { email?: string } | undefined)?.email ?? "");

  const { data: apiBookings, mutate: mutateBookings } = useSWR("/api/book-meeting", swrFetcher);
  const bookings: Booking[] = useMemo(() => Array.isArray(apiBookings) ? apiBookings : [], [apiBookings]);

  const { data: apiRooms, mutate: mutateRooms } = useSWR("/api/book-meeting/rooms", swrFetcher, { refreshInterval: 10000 });
  const rooms: Room[] = useMemo(() => Array.isArray(apiRooms) ? apiRooms : [], [apiRooms]);

  const canCreate = useHasPermission("BOOK_MEETING_CREATE");
  const canApprove = useHasPermission("BOOK_MEETING_APPROVE");
  const userRoleLevel = useRoleLevel();

  const availableCount = rooms.filter(r => r.status === "available").length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings.filter(b => (b.status === "confirmed" || b.status === "pending") && b.date === todayStr).length;
  const myActiveBookings = bookings.filter(b => b.userId === currentUserId && b.status === "confirmed").length;

  const openBookingDetail = useCallback((b: Booking) => { setSelectedBooking(b); setDetailOpen(true); }, []);
  const openCreate = useCallback((room: Room | null) => { setPresetRoom(room); setEditBooking(null); setCreateOpen(true); }, []);

  const handleEditBooking = useCallback((b: Booking) => { setEditBooking(b); setPresetRoom(null); setCreateOpen(true); }, []);

  const handleCancelBooking = useCallback(async (id: string) => {
    await mutateBookings(
      (data: Booking[] | undefined) => Array.isArray(data) ? data.map(b => b.id === id ? { ...b, status: "cancelled" as const } : b) : data,
      { revalidate: false }
    );
    try { await fetchApi("/api/book-meeting", { method: "PUT", body: JSON.stringify({ id, status: "cancelled" }) }); } catch (e) { toast.error(e instanceof ApiError ? e.message : "ไม่สามารถยกเลิกการจองได้"); }
    await mutateBookings();
  }, [mutateBookings]);

  const handleCreate = useCallback(async (b: Omit<Booking, "id">) => {
    await fetchApi("/api/book-meeting", { method: "POST", body: JSON.stringify({ roomId: b.roomId, title: b.title, startTime: `${b.date}T${b.startTime}:00`, endTime: `${b.date}T${b.endTime}:00`, attendeeCount: b.attendeeCount, purpose: b.purpose, notes: b.notes, status: b.status }) });
    await mutateBookings(); await mutateRooms();
    toast.success("จองห้องประชุมสำเร็จ");
  }, [mutateBookings, mutateRooms]);

  const handleUpdate = useCallback(async (id: string, b: Partial<Booking>) => {
    await fetchApi("/api/book-meeting", { method: "PUT", body: JSON.stringify({ id, title: b.title, roomId: b.roomId, startTime: b.startTime ? `${b.date}T${b.startTime}:00` : undefined, endTime: b.endTime ? `${b.date}T${b.endTime}:00` : undefined, attendeeCount: b.attendeeCount, purpose: b.purpose, notes: b.notes, status: b.status }) });
    await mutateBookings(); await mutateRooms();
    toast.success("แก้ไขการจองสำเร็จ");
  }, [mutateBookings, mutateRooms]);

  const handleConfirm = useCallback(async (id: string) => {
    await mutateBookings(
      (data: Booking[] | undefined) => Array.isArray(data) ? data.map(b => b.id === id ? { ...b, status: "confirmed" as const } : b) : data,
      { revalidate: false }
    );
    try { await fetchApi("/api/book-meeting", { method: "PUT", body: JSON.stringify({ id, status: "confirmed" }) }); } catch (e) { toast.error(e instanceof ApiError ? e.message : "ไม่สามารถยืนยันการจองได้"); }
    await mutateBookings();
  }, [mutateBookings]);

  const handleCancel = useCallback(async (id: string) => {
    await mutateBookings(
      (data: Booking[] | undefined) => Array.isArray(data) ? data.map(b => b.id === id ? { ...b, status: "cancelled" as const } : b) : data,
      { revalidate: false }
    );
    try { await fetchApi("/api/book-meeting", { method: "PUT", body: JSON.stringify({ id, status: "cancelled" }) }); } catch (e) { toast.error(e instanceof ApiError ? e.message : "ไม่สามารถยกเลิกการจองได้"); }
    await mutateBookings();
  }, [mutateBookings]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="mt-3 truncate text-[26px] sm:text-[32px] font-semibold tracking-tight leading-tight text-tu-text-primary">Book Meeting</h1>
          <p className="mt-2 text-[14px] text-tu-text-muted max-w-2xl">บริหารจัดการห้องประชุมของคณะนิติศาสตร์ · ตรวจสอบสถานะห้อง จองล่วงหน้า และดูตารางประชุมได้ในที่เดียว</p>
        </div>
        {canCreate && <button onClick={() => openCreate(null)} className="shrink-0 h-10 px-4 rounded-xl bg-tu-primary text-white hover:bg-tu-primary-hover text-[13px] font-semibold inline-flex items-center gap-2 shadow-sm transition-colors"><Plus className="h-4 w-4" />จองห้องประชุม</button>}
      </div>

      <div><TabSelector active={activeTab} onChange={setActiveTab} /></div>

      <section className="mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard label="ห้องประชุมทั้งหมด" value={String(rooms.length)} sub="ครอบคลุมทุกอาคารของคณะ" icon={Building2} accent="primary" />
          <StatCard label="ห้องว่างวันนี้" value={String(availableCount)} sub="พร้อมให้จอง ณ ตอนนี้" icon={DoorOpen} accent="success" />
          <StatCard label="การจองวันนี้" value={String(todayBookings)} sub="อัปเดตเรียลไทม์" icon={CalendarCheck} accent="info" />
          <StatCard label="การจองของฉัน" value={String(myActiveBookings)} sub="ที่ยัง active อยู่" icon={CalendarClock} accent="warning" />
        </div>
      </section>

      {activeTab === "rooms" && (
        <section className="mt-8">
          <div className="mb-4 flex items-baseline justify-between"><div><h2 className="text-[18px] font-semibold tracking-tight text-tu-text-primary">ห้องประชุม</h2><p className="text-[12.5px] text-tu-text-muted">พบ {rooms.length} ห้องตามเงื่อนไข</p></div></div>
          {rooms.length === 0 ? <EmptyState /> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{rooms.map(r => <RoomCard key={r.id} room={r} onBook={openCreate} />)}</div>}
        </section>
      )}

      {activeTab === "schedule" && (
        <section className="mt-8">
          <ScheduleTable bookings={bookings} rooms={rooms} onSelectBooking={openBookingDetail} selectedId={selectedBooking?.id} search={search} />
        </section>
      )}

      {activeTab === "my-bookings" && (
        <section className="mt-8"><UpcomingBookings bookings={bookings} rooms={rooms} onSelect={openBookingDetail} selectedId={selectedBooking?.id} currentUserId={currentUserId} type="my-bookings" onEdit={handleEditBooking} onCancel={handleCancelBooking} /></section>
      )}
      {activeTab === "pending" && (
        <section className="mt-8"><UpcomingBookings bookings={bookings} rooms={rooms} onSelect={openBookingDetail} selectedId={selectedBooking?.id} currentUserId={currentUserId} type="pending" canApprove={canApprove} onConfirm={canApprove ? handleConfirm : undefined} onCancel={handleCancel} /></section>
      )}
      {activeTab === "history" && (
        <section className="mt-8"><HistoryTable bookings={bookings} rooms={rooms} onSelect={openBookingDetail} selectedId={selectedBooking?.id} currentUserId={currentUserId} userRoleLevel={userRoleLevel} /></section>
      )}

      <BookingDetailSheet booking={selectedBooking} rooms={rooms} open={detailOpen} onOpenChange={setDetailOpen} />
      <CreateBookingDialog open={createOpen} onOpenChange={setCreateOpen} rooms={rooms} bookings={bookings} presetRoom={presetRoom} mode={editBooking ? "edit" : "create"} editingBooking={editBooking} onCreate={handleCreate} onUpdate={handleUpdate} userName={displayName} />
    </div>
  );
}
