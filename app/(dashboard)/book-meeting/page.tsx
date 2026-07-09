"use client";

import { useState } from "react";
import { CalendarCheck, Plus, Clock, Users, MapPin, ShieldAlert, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockBookings = [
  { id: "1", title: "ประชุมคณะกรรมการบริหาร", room: "ห้องประชุม 201", date: "2025-07-10", time: "09:00 - 12:00", attendees: 12, status: "confirmed", teamsLink: "https://teams.microsoft.com/l/meetup-join/abc123" },
  { id: "2", title: "สัมมนาวิชาการกฎหมาย", room: "ห้องประชุมใหญ่ ชั้น 5", date: "2025-07-12", time: "13:00 - 16:30", attendees: 45, status: "pending", teamsLink: null },
  { id: "3", title: "ประชุมฝ่ายวิชาการ", room: "ห้องประชุม 302", date: "2025-07-11", time: "10:00 - 11:00", attendees: 8, status: "confirmed", teamsLink: null },
];

const rooms = [
  { id: "1", name: "ห้องประชุม 201", capacity: 15, status: "available" },
  { id: "2", name: "ห้องประชุม 302", capacity: 8, status: "available" },
  { id: "3", name: "ห้องประชุมใหญ่ ชั้น 5", capacity: 50, status: "occupied" },
  { id: "4", name: "ห้องประชุมสภา", capacity: 30, status: "available" },
];

function checkDoubleBooking(roomName: string, date: string, time: string): boolean {
  return mockBookings.some((b) => b.room === roomName && b.date === date && b.time === time);
}

export default function BookMeetingPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", room: "", date: "", time: "" });
  const [addTeams, setAddTeams] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  const handleBook = () => {
    if (!form.title || !form.room || !form.date || !form.time) { alert("กรุณากรอกข้อมูลให้ครบ"); return; }
    if (checkDoubleBooking(form.room, form.date, form.time)) { alert("⚠ ห้องนี้ถูกจองแล้วในช่วงเวลาดังกล่าว — กรุณาเลือกห้องหรือเวลาใหม่"); return; }
    const link = addTeams ? `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substring(2, 10)}` : null;
    if (link) setGeneratedLink(link);
    setShowForm(false);
    alert(`✅ จองสำเร็จ${link ? " + MS Teams Link สร้างแล้ว" : ""}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-semibold text-tu-text-primary">จองห้องประชุม</h1><p className="text-tu-text-muted text-sm mt-1">จองห้องประชุมออนไลน์ + MS Teams + Double-Booking Prevention</p></div>
        <Button onClick={() => { setShowForm(true); setGeneratedLink(""); }}><Plus size={18} />จองห้องประชุม</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5 flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tu-primary-soft"><CalendarCheck size={24} className="text-tu-primary" /></div><div><p className="text-2xl font-bold text-tu-text-primary">5</p><p className="text-sm text-tu-text-muted">จองวันนี้</p></div></div>
        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5 flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tu-secondary-soft"><Clock size={24} className="text-tu-secondary-active" /></div><div><p className="text-2xl font-bold text-tu-text-primary">12</p><p className="text-sm text-tu-text-muted">สัปดาห์นี้</p></div></div>
        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5 flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50"><MapPin size={24} className="text-tu-info" /></div><div><p className="text-2xl font-bold text-tu-text-primary">4</p><p className="text-sm text-tu-text-muted">ห้องประชุม</p></div></div>
      </div>

      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5">
        <h2 className="text-sm font-semibold text-tu-text-primary mb-3">สถานะห้องประชุม (Real-time)</h2>
        <div className="flex gap-2 flex-wrap">
          {rooms.map((r) => (
            <Badge key={r.id} variant={r.status === "available" ? "success" : "destructive"} className="gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${r.status === "available" ? "bg-tu-success" : "bg-tu-error"}`} />
              {r.name} ({r.capacity} คน)
            </Badge>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-tu-text-primary flex items-center gap-2"><ShieldAlert size={16} className="text-tu-warning" />ระบบป้องกันการจองซ้อน (Double-Booking)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-tu-text-secondary mb-1">หัวข้อ<span className="text-tu-error">*</span></label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-[--radius-input] border border-tu-border px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" /></div>
            <div><label className="block text-sm font-medium text-tu-text-secondary mb-1">ห้อง<span className="text-tu-error">*</span></label><select value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="w-full rounded-[--radius-input] border border-tu-border px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none"><option value="">เลือกห้อง</option>{rooms.map((r) => (<option key={r.id} value={r.name}>{r.name} ({r.capacity} คน)</option>))}</select></div>
            <div><label className="block text-sm font-medium text-tu-text-secondary mb-1">วันที่<span className="text-tu-error">*</span></label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-[--radius-input] border border-tu-border px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" /></div>
            <div><label className="block text-sm font-medium text-tu-text-secondary mb-1">เวลา<span className="text-tu-error">*</span></label><input type="text" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="09:00 - 12:00" className="w-full rounded-[--radius-input] border border-tu-border px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" /></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={addTeams} onChange={(e) => setAddTeams(e.target.checked)} className="rounded accent-tu-primary" /><span className="text-sm text-tu-text-secondary flex items-center gap-1.5"><Video size={16} className="text-tu-info" />เชื่อมต่อ Microsoft Teams (สร้างลิงก์ประชุมออนไลน์)</span></label>
          {generatedLink && <div className="bg-tu-info/10 border border-tu-info/20 rounded-lg p-3 text-sm"><p className="font-medium text-tu-info flex items-center gap-1.5"><Video size={16} />MS Teams Link ถูกสร้างแล้ว</p><a href={generatedLink} target="_blank" rel="noopener" className="text-tu-primary text-xs break-all">{generatedLink}</a></div>}
          <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowForm(false)}>ยกเลิก</Button><Button onClick={handleBook}>ยืนยันการจอง</Button></div>
        </div>
      )}

      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-tu-bg border-b border-tu-border text-left"><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">ชื่อ</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden sm:table-cell">ห้อง</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden md:table-cell">วันที่</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">เวลา</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">Teams</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">สถานะ</th></tr></thead>
          <tbody className="divide-y divide-tu-border">
            {mockBookings.map((b) => (
              <tr key={b.id} className="hover:bg-tu-surface-hover">
                <td className="px-4 py-3 text-sm font-medium text-tu-text-primary">{b.title}</td>
                <td className="px-4 py-3 text-sm text-tu-text-secondary hidden sm:table-cell">{b.room}</td>
                <td className="px-4 py-3 text-sm text-tu-text-muted hidden md:table-cell">{new Date(b.date).toLocaleDateString("th-TH")}</td>
                <td className="px-4 py-3 text-sm text-tu-text-secondary">{b.time}</td>
                <td className="px-4 py-3">{b.teamsLink ? <Badge variant="info" className="text-[10px] gap-1"><Video size={10} />Teams</Badge> : <span className="text-xs text-tu-text-muted">—</span>}</td>
                <td className="px-4 py-3"><Badge variant={b.status === "confirmed" ? "success" : "warning"}>{b.status === "confirmed" ? "ยืนยัน" : "รอ"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
