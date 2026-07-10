"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarCheck, CalendarDays, Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, Video, Users, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useActionPermissions } from "@/hooks/use-action-permissions";

type Booking = { id: string; title: string; room?: { name: string }; startTime: string; endTime: string; attendeeCount: number; msTeamsLink?: string; status: string; user?: { email: string; firstName?: string; lastName?: string } };

const STATUS_MAP: Record<string, { label: string; color: "success" | "warning" | "destructive" | "info" }> = {
  confirmed: { label: "ยืนยัน", color: "success" }, pending: { label: "รออนุมัติ", color: "warning" }, cancelled: { label: "ยกเลิก", color: "destructive" }, completed: { label: "เสร็จสิ้น", color: "info" },
};

function fmtDate(d: string) { return new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }

const ROOMS = [
  { id: "room-201", name: "ห้องประชุม 201", capacity: 20 },
  { id: "room-301", name: "ห้องประชุมใหญ่ ชั้น 3", capacity: 60 },
];

export default function BookMeetingPage() {
  const perm = useActionPermissions();
  const [activeTab, setActiveTab] = useState("room");
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1); const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ roomId: "room-201", title: "", startTime: "", endTime: "", attendeeCount: "0", msTeamsLink: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Booking | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const LIMIT = 10; const totalPages = Math.ceil(total / LIMIT);
  const showToast = (type: "success" | "error", msg: string) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) p.set("search", search);
      const res = await fetch(`/api/book-meeting?${p}`); const json = await res.json();
      if (json.success) { setData(json.data); setTotal(json.meta.total); }
    } catch { /* */ } setLoading(false);
  }, [page, search]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.title || !form.startTime || !form.endTime) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/book-meeting", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, attendeeCount: Number(form.attendeeCount) }) });
      const json = await res.json();
      if (json.success) { showToast("success", "จองห้องประชุมสำเร็จ"); setDialogOpen(false); fetchData(); }
      else { showToast("error", json.error?.message ?? "ช่วงเวลานี้มีผู้จองแล้ว"); }
    } catch { showToast("error", "เกิดข้อผิดพลาด"); }
    setSubmitting(false);
  };

  const handleDelete = async () => { if (!deleteConfirm) return; await fetch(`/api/book-meeting?id=${deleteConfirm.id}`, { method: "DELETE" }); showToast("success", "ยกเลิกการจองสำเร็จ"); setDeleteConfirm(null); fetchData(); };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-tu-text-primary flex items-center gap-2"><CalendarCheck size={24} className="text-tu-primary" /> จองห้องประชุม</h1>

      <div className="grid grid-cols-2 gap-2">
        <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", activeTab === "room" && "ring-2 ring-tu-primary")} onClick={() => setActiveTab("room")}>
          <CardContent className="pt-4 text-center">
            <CalendarCheck size={20} className={cn("mx-auto mb-1", activeTab === "room" ? "text-tu-primary" : "text-tu-text-muted")} />
            <p className="text-xs font-medium text-tu-text-secondary">จองห้องประชุม</p>
          </CardContent>
        </Card>
        <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", activeTab === "calendar" && "ring-2 ring-tu-primary")} onClick={() => setActiveTab("calendar")}>
          <CardContent className="pt-4 text-center">
            <CalendarDays size={20} className={cn("mx-auto mb-1", activeTab === "calendar" ? "text-tu-primary" : "text-tu-text-muted")} />
            <p className="text-xs font-medium text-tu-text-secondary">ปฏิทินการจอง</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">{activeTab === "room" ? "จองห้องประชุม" : "ปฏิทินการจอง"} ({total} รายการ)</h2>
        {perm.bookMeeting.create && <Button onClick={() => setDialogOpen(true)} variant="primary"><Plus size={16} /> จองห้อง</Button>}
      </div>

      <Card><CardContent className="pt-4">
        <div className="flex gap-2 mb-4"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><Input className="pl-9" placeholder="ค้นหา..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>{search && <Button variant="ghost" size="icon" onClick={() => { setSearch(""); setPage(1); }}><X size={16} /></Button>}</div>

        {activeTab === "room" && (
          <>{loading ? <div className="py-12 text-center text-tu-text-muted">กำลังโหลด...</div> : data.length === 0 ? <div className="py-12 text-center text-tu-text-muted">ไม่มีการจอง</div> :
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">หัวข้อ</th><th className="py-3 px-2">ห้อง</th><th className="py-3 px-2">เริ่ม</th><th className="py-3 px-2">สิ้นสุด</th><th className="py-3 px-2">ผู้เข้าร่วม</th><th className="py-3 px-2">สถานะ</th><th className="py-3 px-2 text-right">จัดการ</th></tr></thead><tbody>{data.map((b) => (<tr key={b.id} className="border-b border-tu-border hover:bg-tu-surface-hover"><td className="py-2.5 px-2 font-medium">{b.title}</td><td className="py-2.5 px-2">{b.room?.name ?? "-"}</td><td className="py-2.5 px-2 text-xs">{fmtDate(b.startTime)}</td><td className="py-2.5 px-2 text-xs">{fmtDate(b.endTime)}</td><td className="py-2.5 px-2"><Users size={12} className="inline mr-1" />{b.attendeeCount}</td><td className="py-2.5 px-2">{STATUS_MAP[b.status] ? <Badge variant={STATUS_MAP[b.status].color}>{STATUS_MAP[b.status].label}</Badge> : b.status}</td><td className="py-2.5 px-2 text-right"><div className="flex justify-end gap-1">{b.msTeamsLink && <Button variant="ghost" size="icon" title="Teams Link"><Video size={14} className="text-tu-info" /></Button>}<Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(b)}><Trash2 size={14} className="text-tu-error" /></Button></div></td></tr>))}</tbody></table></div>}
          </>
        )}

        {activeTab === "calendar" && (
          <div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">{["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."].map((d) => (<div key={d} className="py-2 font-medium text-tu-text-muted">{d}</div>))}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (<div key={day} className={cn("py-3 rounded-lg border border-tu-border text-sm cursor-pointer hover:bg-tu-surface-hover", data.some((b) => new Date(b.startTime).getDate() === day) && "bg-tu-primary-soft border-tu-primary")}><span>{day}</span>{data.some((b) => new Date(b.startTime).getDate() === day) && <div className="w-1.5 h-1.5 rounded-full bg-tu-primary mx-auto mt-1" />}</div>))}
            </div>
            <p className="text-xs text-tu-text-muted mt-2">เดือนกรกฎาคม 2568 | คลิกวันที่เพื่อดูรายละเอียด</p>
          </div>
        )}

        {totalPages > 1 && (<div className="flex items-center justify-between pt-4"><span className="text-sm text-tu-text-muted">หน้า {page} จาก {totalPages}</span><div className="flex gap-1"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /></Button><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></Button></div></div>)}
      </CardContent></Card>

      {dialogOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDialogOpen(false)}><div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between p-4 border-b border-tu-border"><h2 className="text-lg font-semibold">จองห้องประชุม</h2><Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}><X size={18} /></Button></div><form onSubmit={handleSubmit} className="p-4 space-y-3"><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">หัวข้อการประชุม <span className="text-tu-error">*</span></label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="ประชุมคณะกรรมการ..." required /></div><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">ห้องประชุม</label><select className="w-full rounded-[--radius-input] border border-tu-border px-3 py-2 text-sm bg-tu-surface" value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })}>{ROOMS.map((r) => (<option key={r.id} value={r.id}>{r.name} (จุ {r.capacity} คน)</option>))}</select></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">เริ่ม <span className="text-tu-error">*</span></label><Input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required /></div><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">สิ้นสุด <span className="text-tu-error">*</span></label><Input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required /></div></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">จำนวนผู้เข้าร่วม</label><Input type="number" value={form.attendeeCount} onChange={(e) => setForm({ ...form, attendeeCount: e.target.value })} /></div><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">MS Teams Link</label><Input value={form.msTeamsLink} onChange={(e) => setForm({ ...form, msTeamsLink: e.target.value })} placeholder="https://teams.microsoft.com/..." /></div></div>
        <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>ยกเลิก</Button><Button type="submit" variant="primary" disabled={submitting}>{submitting ? "กำลังบันทึก..." : "จองห้อง"}</Button></div></form></div></div>)}

      {deleteConfirm && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteConfirm(null)}><div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}><h2 className="text-lg font-semibold mb-2">ยกเลิกการจอง</h2><p className="text-sm text-tu-text-muted mb-4">ต้องการยกเลิกการจอง <strong>{deleteConfirm.title}</strong> ใช่หรือไม่?</p><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setDeleteConfirm(null)}>กลับ</Button><Button variant="destructive" onClick={handleDelete}>ยกเลิกการจอง</Button></div></div></div>)}

      {toast && (<div className={cn("fixed bottom-6 right-6 z-[60] rounded-[--radius-card] border px-4 py-3 shadow-lg text-sm flex items-center gap-2", toast.type === "success" ? "bg-tu-success/10 border-tu-success/30 text-tu-success" : "bg-tu-error/10 border-tu-error/30 text-tu-error")}>{toast.type === "success" ? "✅" : "❌"} {toast.msg}<button onClick={() => setToast(null)} className="ml-2"><X size={14} /></button></div>)}
    </div>
  );
}
