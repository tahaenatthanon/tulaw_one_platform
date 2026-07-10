"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, GraduationCap, CalendarDays, ClipboardCheck, FileText, Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useActionPermissions } from "@/hooks/use-action-permissions";

const TABS = [
  { id: "courses", label: "รายวิชา", icon: GraduationCap },
  { id: "curriculum", label: "หลักสูตร", icon: BookOpen },
  { id: "schedule", label: "ตารางเรียน", icon: CalendarDays },
  { id: "exams", label: "ตารางสอบ", icon: ClipboardCheck },
  { id: "requests", label: "คำร้อง", icon: FileText },
];

type Course = { id: string; courseCode: string; nameTh: string; credits: number; room?: { roomName: string }; schedule?: string };
const DAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];
const TIMES = ["09:00-12:00", "13:00-16:00", "16:00-19:00"];

export default function AcademicPage() {
  const perm = useActionPermissions();
  const [activeTab, setActiveTab] = useState("courses");
  const [data, setData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1); const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ courseCode: "", nameTh: "", credits: "3" });
  const [editing, setEditing] = useState<Course | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Course | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const LIMIT = 10; const totalPages = Math.ceil(total / LIMIT);
  const showToast = (type: "success" | "error", msg: string) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) p.set("search", search);
      const res = await fetch(`/api/academic?${p}`); const json = await res.json();
      if (json.success) { setData(json.data); setTotal(json.meta.total); }
    } catch { /* */ }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm({ courseCode: "", nameTh: "", credits: "3" }); setDialogOpen(true); };
  const openEdit = (c: Course) => { setEditing(c); setForm({ courseCode: c.courseCode, nameTh: c.nameTh, credits: String(c.credits) }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.courseCode || !form.nameTh) return;
    setSubmitting(true);
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing ? { id: editing.id, nameTh: form.nameTh, credits: Number(form.credits) } : form;
      const res = await fetch("/api/academic", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.success) { showToast("success", editing ? "แก้ไขรายวิชาสำเร็จ" : "เพิ่มรายวิชาสำเร็จ"); setDialogOpen(false); fetchData(); }
    } catch { showToast("error", "เกิดข้อผิดพลาด"); }
    setSubmitting(false);
  };

  const handleDelete = async () => { if (!deleteConfirm) return; await fetch(`/api/academic?id=${deleteConfirm.id}`, { method: "DELETE" }); showToast("success", "ลบรายวิชาสำเร็จ"); setDeleteConfirm(null); fetchData(); };

  const mockExams = [
    { code: "น.101", name: "กฎหมายแพ่ง 1", date: "15 ส.ค. 2568", time: "09:00-12:00", room: "ห้องสอบ 301" },
    { code: "น.201", name: "กฎหมายอาญา 1", date: "17 ส.ค. 2568", time: "13:00-16:00", room: "ห้องสอบ 302" },
    { code: "น.301", name: "กฎหมายรัฐธรรมนูญ", date: "19 ส.ค. 2568", time: "09:00-12:00", room: "ห้องสอบ 303" },
    { code: "น.401", name: "กฎหมายระหว่างประเทศ", date: "21 ส.ค. 2568", time: "13:00-16:00", room: "ห้องสอบ 304" },
  ];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-tu-text-primary flex items-center gap-2"><GraduationCap size={24} className="text-tu-primary" /> ระบบงานวิชาการ</h1>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {TABS.map((tab) => (
          <Card key={tab.id} className={cn("cursor-pointer hover:shadow-md transition-shadow", activeTab === tab.id && "ring-2 ring-tu-primary")} onClick={() => setActiveTab(tab.id)}>
            <CardContent className="pt-4 text-center">
              <tab.icon size={20} className={cn("mx-auto mb-1", activeTab === tab.id ? "text-tu-primary" : "text-tu-text-muted")} />
              <p className="text-xs font-medium text-tu-text-secondary">{tab.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">{TABS.find((t) => t.id === activeTab)?.label} ({activeTab === "courses" ? total : "-"} รายการ)</h2>
        {(activeTab === "courses" || activeTab === "curriculum") && perm.academic.manage && <Button onClick={openCreate} variant="primary"><Plus size={16} /> เพิ่มรายวิชา</Button>}
      </div>

      <Card><CardContent className="pt-4">
        <div className="flex gap-2 mb-4"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><Input className="pl-9" placeholder="ค้นหา..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>{search && <Button variant="ghost" size="icon" onClick={() => { setSearch(""); setPage(1); }}><X size={16} /></Button>}</div>

        {loading ? <div className="py-12 text-center text-tu-text-muted">กำลังโหลด...</div> : (
          <>
            {activeTab === "courses" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2 font-medium">รหัสวิชา</th><th className="py-3 px-2 font-medium">ชื่อวิชา</th><th className="py-3 px-2 font-medium">หน่วยกิต</th><th className="py-3 px-2 font-medium text-right">จัดการ</th></tr></thead>
                  <tbody>{data.length === 0 ? <tr><td colSpan={4} className="py-12 text-center text-tu-text-muted">ยังไม่มีรายวิชา</td></tr> : data.map((c) => (<tr key={c.id} className="border-b border-tu-border hover:bg-tu-surface-hover"><td className="py-2.5 px-2 font-mono font-medium">{c.courseCode}</td><td className="py-2.5 px-2">{c.nameTh}</td><td className="py-2.5 px-2"><Badge variant="secondary">{c.credits} หน่วยกิต</Badge></td><td className="py-2.5 px-2 text-right"><div className="flex justify-end gap-1">{perm.academic.manage && <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil size={14} /></Button>}{perm.academic.manage && <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(c)}><Trash2 size={14} className="text-tu-error" /></Button>}</div></td></tr>))}</tbody></table>
              </div>
            )}

            {activeTab === "curriculum" && <div className="py-6 space-y-3">{["หลักสูตรนิติศาสตรบัณฑิต (น.บ.)", "หลักสูตรนิติศาสตรมหาบัณฑิต (น.ม.)", "หลักสูตรนิติศาสตรดุษฎีบัณฑิต (น.ด.)"].map((c) => (<Card key={c} className="cursor-pointer hover:shadow-md"><CardContent className="py-4 flex items-center gap-3"><BookOpen size={20} className="text-tu-primary" /><div><p className="font-medium">{c}</p><p className="text-xs text-tu-text-muted">จำนวนวิชา: 45 วิชา | นักศึกษา: 300 คน</p></div></CardContent></Card>))}</div>}

            {activeTab === "schedule" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">วัน/เวลา</th>{DAYS.map((d) => <th key={d} className="py-3 px-2 font-medium">{d}</th>)}</tr></thead>
                  <tbody>{TIMES.map((t) => (<tr key={t} className="border-b border-tu-border"><td className="py-3 px-2 font-medium">{t}</td>{DAYS.map((d) => (<td key={d} className="py-3 px-2"><div className="bg-tu-primary-soft rounded p-1.5 text-xs"><p className="font-medium text-tu-primary">น.101</p><p className="text-tu-text-muted">ห้อง 201</p></div></td>))}</tr>))}</tbody></table>
              </div>
            )}

            {activeTab === "exams" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">รหัส</th><th className="py-3 px-2">รายวิชา</th><th className="py-3 px-2">วันที่</th><th className="py-3 px-2">เวลา</th><th className="py-3 px-2">ห้องสอบ</th></tr></thead>
                  <tbody>{mockExams.map((m) => (<tr key={m.code} className="border-b border-tu-border hover:bg-tu-surface-hover"><td className="py-2.5 px-2 font-mono">{m.code}</td><td className="py-2.5 px-2">{m.name}</td><td className="py-2.5 px-2">{m.date}</td><td className="py-2.5 px-2">{m.time}</td><td className="py-2.5 px-2">{m.room}</td></tr>))}</tbody></table>
              </div>
            )}

            {activeTab === "requests" && (
              <div className="space-y-2">{[
                { id: "1", title: "คำร้องขอลาพักการศึกษา", status: "pending", date: "10 ก.ค. 2568" },
                { id: "2", title: "คำร้องขอลงทะเบียนล่าช้า", status: "approved", date: "8 ก.ค. 2568" },
                { id: "3", title: "คำร้องขอเปลี่ยนสาขา", status: "pending", date: "5 ก.ค. 2568" },
              ].map((r) => (<Card key={r.id}><CardContent className="py-4 flex items-center justify-between"><div><p className="font-medium">{r.title}</p><p className="text-xs text-tu-text-muted">{r.date}</p></div><Badge variant={r.status === "approved" ? "success" : "warning"}>{r.status === "approved" ? "อนุมัติ" : "รออนุมัติ"}</Badge></CardContent></Card>))}</div>
            )}
          </>
        )}

        {totalPages > 1 && (<div className="flex items-center justify-between pt-4"><span className="text-sm text-tu-text-muted">หน้า {page} จาก {totalPages}</span><div className="flex gap-1"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /></Button><Button variant={page === 1 ? "primary" : "outline"} size="sm" onClick={() => setPage(1)}>1</Button>{totalPages > 1 && <Button variant="outline" size="sm" onClick={() => setPage(totalPages)}>{totalPages}</Button>}<Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></Button></div></div>)}
      </CardContent></Card>

      {dialogOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDialogOpen(false)}><div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between p-4 border-b border-tu-border"><h2 className="text-lg font-semibold">{editing ? "แก้ไขรายวิชา" : "เพิ่มรายวิชา"}</h2><Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}><X size={18} /></Button></div><form onSubmit={handleSubmit} className="p-4 space-y-3"><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">รหัสวิชา <span className="text-tu-error">*</span></label><Input value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} placeholder="น.101" required disabled={!!editing} /></div><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">ชื่อวิชา <span className="text-tu-error">*</span></label><Input value={form.nameTh} onChange={(e) => setForm({ ...form, nameTh: e.target.value })} placeholder="กฎหมายแพ่ง 1" required /></div><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">หน่วยกิต</label><Input type="number" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} /></div><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>ยกเลิก</Button><Button type="submit" variant="primary" disabled={submitting}>{submitting ? "กำลังบันทึก..." : "บันทึก"}</Button></div></form></div></div>)}

      {deleteConfirm && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteConfirm(null)}><div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}><h2 className="text-lg font-semibold mb-2">ยืนยันการลบ</h2><p className="text-sm text-tu-text-muted mb-4">ต้องการลบ <strong>{deleteConfirm.courseCode}</strong> ใช่หรือไม่?</p><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setDeleteConfirm(null)}>ยกเลิก</Button><Button variant="destructive" onClick={handleDelete}>ลบ</Button></div></div></div>)}

      {toast && (<div className={cn("fixed bottom-6 right-6 z-[60] rounded-[--radius-card] border px-4 py-3 shadow-lg text-sm flex items-center gap-2", toast.type === "success" ? "bg-tu-success/10 border-tu-success/30 text-tu-success" : "bg-tu-error/10 border-tu-error/30 text-tu-error")}>{toast.type === "success" ? "✅" : "❌"} {toast.msg}<button onClick={() => setToast(null)} className="ml-2"><X size={14} /></button></div>)}
    </div>
  );
}
