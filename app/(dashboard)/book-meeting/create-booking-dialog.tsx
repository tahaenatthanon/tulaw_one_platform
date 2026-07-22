"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarPlus, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/fetcher";

export function CreateBookingDialog({ open, onOpenChange, rooms, bookings, presetRoom, mode = "create", editingBooking, onCreate, onUpdate, userName }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rooms: any[];
  bookings: any[];
  presetRoom: any;
  mode?: "create" | "edit";
  editingBooking?: any;
  onCreate: (b: any) => void;
  onUpdate?: (id: string, b: any) => void;
  userName?: string;
}) {
  const isEdit = mode === "edit" && !!editingBooking;
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [roomId, setRoomId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [attendeeCount, setAttendeeCount] = useState("10");
  const [notes, setNotes] = useState("");
  const [conflict, setConflict] = useState<string | null>(null);

  useEffect(() => { if (presetRoom) setRoomId(presetRoom.id as string); }, [presetRoom]);

  useEffect(() => {
    if (isEdit && editingBooking) {
      setTitle(editingBooking.title as string);
      setPurpose((editingBooking.purpose as string) || "");
      setRoomId(editingBooking.roomId as string);
      setDate(editingBooking.date as string);
      setStartTime(new Date(editingBooking.startTime as string).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }));
      setEndTime(new Date(editingBooking.endTime as string).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }));
      setAttendeeCount(String(editingBooking.attendeeCount || 10));
      setNotes((editingBooking.notes as string) || "");
    }
  }, [isEdit, editingBooking]);

  const checkConflict = (rid: string, d: string, st: string, et: string) => {
    if (!rid || !d) return;
    const stMin = parseInt(st.split(":")[0]) * 60 + parseInt(st.split(":")[1]);
    const etMin = parseInt(et.split(":")[0]) * 60 + parseInt(et.split(":")[1]);
    const hasConflict = bookings.some(b =>
      b.roomId === rid && b.date === d && b.status !== "cancelled" &&
      (isEdit ? b.id !== (editingBooking as any).id : true) &&
      new Date(b.startTime as string).getHours() * 60 + new Date(b.startTime as string).getMinutes() < etMin &&
      new Date(b.endTime as string).getHours() * 60 + new Date(b.endTime as string).getMinutes() > stMin
    );
    setConflict(hasConflict ? "ช่วงเวลานี้มีผู้จองแล้ว กรุณาเลือกเวลาใหม่" : null);
  };

  const handleSubmit = async () => {
    if (!title || !roomId || !startTime || !endTime || conflict) return;
    try {
      if (isEdit && onUpdate && editingBooking) {
        await onUpdate(editingBooking.id as string, { title, purpose, date, startTime, endTime, attendeeCount: Number(attendeeCount) || 0, notes, roomId, status: editingBooking.status });
      } else {
        await onCreate({ title, purpose, date, startTime, endTime, attendeeCount: Number(attendeeCount) || 0, msTeamsLink: "", notes, roomId, status: "pending" });
      }
      onOpenChange(false);
    } catch (e) {
      if (e instanceof ApiError && e.code === "CONFLICT") {
        setConflict(e.message);
      } else {
        const message = e instanceof ApiError ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่";
        toast.error(message);
      }
    }
  };

  const timeOptions = Array.from({ length: 21 }, (_, i) => {
    const h = Math.floor(i / 2) + 8;
    const m = i % 2 === 0 ? "00" : "30";
    return `${String(h).padStart(2, "0")}:${m}`;
  }).filter(t => t <= "18:00");

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] p-0 overflow-hidden">
        <div className="flex items-start justify-between p-6 pb-4 border-b border-tu-border">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-tu-primary/10 text-tu-primary grid place-items-center shrink-0"><CalendarPlus className="h-5 w-5" /></div>
            <DialogHeader className="p-0 text-left space-y-1">
              <DialogTitle className="text-[17px]">{isEdit ? "แก้ไขการจอง" : "สร้างการจองห้องประชุม"}</DialogTitle>
              <DialogDescription className="text-[12.5px]">กรอกรายละเอียดการจอง — ข้อมูลจะบันทึกในระบบ TULAW ONE</DialogDescription>
            </DialogHeader>
          </div>
          <button onClick={() => onOpenChange(false)} className="h-8 w-8 rounded-lg hover:bg-tu-surface-hover grid place-items-center text-tu-text-muted shrink-0" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid gap-2">
            <label className="text-[12.5px] font-medium text-tu-text-primary">หัวข้อการประชุม <span className="text-tu-error">*</span></label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="เช่น ประชุมคณะกรรมการหลักสูตร" className="h-10 w-full rounded-xl border border-tu-border bg-tu-surface px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-tu-border-focus/25" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-[12.5px] font-medium text-tu-text-primary">ห้องประชุม <span className="text-tu-error">*</span></label>
              <Select value={roomId} onValueChange={(v) => { setRoomId(v); checkConflict(v, date, startTime, endTime); }}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue>{rooms.find(r => r.id === roomId)?.name ?? "เลือกห้อง"}</SelectValue></SelectTrigger>
                <SelectContent>{rooms.map(r => <SelectItem key={r.id as string} value={r.id as string}>{(r.name as string)} ({(r.capacity as number)} คน)</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-[12.5px] font-medium text-tu-text-primary">ผู้จัด</label>
              <div className="h-10 w-full rounded-xl border border-tu-border bg-tu-bg/50 px-3 text-[13px] text-tu-text-secondary flex items-center">{userName ?? "—"}</div>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="grid gap-2 sm:col-span-1">
              <label className="text-[12.5px] font-medium text-tu-text-primary">วันที่ <span className="text-tu-error">*</span></label>
              <input type="date" value={date} onChange={e => { setDate(e.target.value); checkConflict(roomId, e.target.value, startTime, endTime); }} className="h-10 w-full rounded-xl border border-tu-border bg-tu-surface px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-tu-border-focus/25" />
            </div>
            <div className="grid gap-2">
              <label className="text-[12.5px] font-medium text-tu-text-primary">เวลาเริ่ม</label>
              <select value={startTime} onChange={e => { setStartTime(e.target.value); checkConflict(roomId, date, e.target.value, endTime); }} className="h-10 w-full rounded-xl border border-tu-border bg-tu-surface px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-tu-border-focus/25">
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-[12.5px] font-medium text-tu-text-primary">เวลาสิ้นสุด</label>
              <select value={endTime} onChange={e => { setEndTime(e.target.value); checkConflict(roomId, date, startTime, e.target.value); }} className="h-10 w-full rounded-xl border border-tu-border bg-tu-surface px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-tu-border-focus/25">
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          {conflict && <div className="flex items-center gap-2 text-[12px] text-tu-error bg-tu-error/5 rounded-lg px-3 py-2"><AlertTriangle className="h-3.5 w-3.5 shrink-0" />{conflict}</div>}
          <div className="grid gap-2">
            <label className="text-[12.5px] font-medium text-tu-text-primary">จำนวนผู้เข้าร่วม</label>
            <input type="number" value={attendeeCount} onChange={e => setAttendeeCount(e.target.value)} min={1} className="h-10 w-full rounded-xl border border-tu-border bg-tu-surface px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-tu-border-focus/25" />
          </div>
          <div className="grid gap-2">
            <label className="text-[12.5px] font-medium text-tu-text-primary">หมายเหตุ</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="รายละเอียดเพิ่มเติม" className="w-full rounded-xl border border-tu-border bg-tu-surface px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-tu-border-focus/25 resize-none" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 p-5 border-t border-tu-border bg-tu-surface-hover">
          <button onClick={() => onOpenChange(false)} className="h-10 px-4 rounded-xl border border-tu-border bg-tu-surface hover:bg-tu-surface-hover text-[13px] font-medium text-tu-text-secondary transition-colors">ยกเลิก</button>
          <button onClick={handleSubmit} disabled={!title || !roomId || !!conflict} className="h-10 px-5 rounded-xl bg-tu-primary text-white hover:bg-tu-primary-hover text-[13px] font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{isEdit ? "บันทึก" : "บันทึกการจอง"}</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
