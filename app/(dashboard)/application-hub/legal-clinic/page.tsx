"use client";

import { useState, useEffect, useCallback } from "react";
import { Briefcase, Users, Calendar, MessageSquare, FileBarChart, Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useActionPermissions } from "@/hooks/use-action-permissions";

const TABS = [
  { id: "cases", label: "คดีความ", icon: Briefcase },
  { id: "clients", label: "ทะเบียนลูกความ", icon: Users },
  { id: "appointments", label: "นัดหมาย", icon: Calendar },
  { id: "consultation", label: "ให้คำปรึกษา", icon: MessageSquare },
  { id: "reports", label: "รายงาน", icon: FileBarChart },
];

type Case = { id: string; title: string; status: string; description?: string; createdAt: string };
const STATUS_MAP: Record<string, { label: string; color: "secondary" | "warning" | "success" | "destructive" | "info" }> = {
  open: { label: "กำลังดำเนินการ", color: "info" }, in_progress: { label: "สืบพยาน", color: "warning" },
  pending_approval: { label: "รอคำพิพากษา", color: "secondary" }, completed: { label: "ปิดคดี", color: "success" }, closed: { label: "ถอนฟ้อง", color: "destructive" },
};

const MOCK_CLIENTS = [
  { id: "1", name: "นายสมศักดิ์ มีชัย", phone: "081-234-5678", caseCount: 2, lastVisit: "10 ก.ค. 2568" },
  { id: "2", name: "นางสาวสมศรี ใจดี", phone: "089-876-5432", caseCount: 1, lastVisit: "5 ก.ค. 2568" },
  { id: "3", name: "นายประสิทธิ์ รอบรู้", phone: "082-345-6789", caseCount: 3, lastVisit: "1 ก.ค. 2568" },
];

const MOCK_APPOINTMENTS = [
  { id: "1", client: "นายสมศักดิ์ มีชัย", date: "12 ก.ค. 2568", time: "10:00", type: "ปรึกษาคดี", status: "confirmed" },
  { id: "2", client: "นางสาวสมศรี ใจดี", date: "15 ก.ค. 2568", time: "14:00", type: "ยื่นคำให้การ", status: "pending" },
  { id: "3", client: "นายประสิทธิ์ รอบรู้", date: "18 ก.ค. 2568", time: "09:30", type: "ไกล่เกลี่ย", status: "confirmed" },
];

export default function LegalClinicPage() {
  const perm = useActionPermissions();
  const [activeTab, setActiveTab] = useState("cases");
  const [data, setData] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1); const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Case | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const LIMIT = 10; const totalPages = Math.ceil(total / LIMIT);
  const showToast = (type: "success" | "error", msg: string) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) p.set("search", search);
      const res = await fetch(`/api/legal-clinic?${p}`); const json = await res.json();
      if (json.success) { setData(json.data); setTotal(json.meta.total); }
    } catch { /* */ } setLoading(false);
  }, [page, search]);
  useEffect(() => { if (activeTab === "cases") fetchData(); }, [activeTab, fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.title) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/legal-clinic", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) { showToast("success", "เปิดคดีสำเร็จ"); setDialogOpen(false); fetchData(); }
    } catch { showToast("error", "เกิดข้อผิดพลาด"); }
    setSubmitting(false);
  };
  const handleStatus = async (id: string, status: string) => {
    await fetch("/api/legal-clinic", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    showToast("success", "เปลี่ยนสถานะสำเร็จ"); fetchData();
  };
  const handleDelete = async () => { if (!deleteConfirm) return; await fetch(`/api/legal-clinic?id=${deleteConfirm.id}`, { method: "DELETE" }); showToast("success", "ลบสำเร็จ"); setDeleteConfirm(null); fetchData(); };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-tu-text-primary flex items-center gap-2"><Briefcase size={24} className="text-tu-primary" /> คลินิกกฎหมาย</h1>
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
        <h2 className="text-lg font-semibold">{TABS.find((t) => t.id === activeTab)?.label} ({activeTab === "cases" ? total : "-"} รายการ)</h2>
        {activeTab === "cases" && perm.legalClinic.manage && <Button onClick={() => setDialogOpen(true)} variant="primary"><Plus size={16} /> เปิดคดีใหม่</Button>}
      </div>

      <Card><CardContent className="pt-4">
        <div className="flex gap-2 mb-4"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><Input className="pl-9" placeholder="ค้นหา..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>{search && <Button variant="ghost" size="icon" onClick={() => { setSearch(""); setPage(1); }}><X size={16} /></Button>}</div>

        {activeTab === "cases" && (
          <>{loading ? <div className="py-12 text-center text-tu-text-muted">กำลังโหลด...</div> : data.length === 0 ? <div className="py-12 text-center text-tu-text-muted">ไม่มีคดีความ</div> :
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">ชื่อคดี</th><th className="py-3 px-2">สถานะ</th><th className="py-3 px-2 text-right">จัดการ</th></tr></thead><tbody>{data.map((c) => (<tr key={c.id} className="border-b border-tu-border hover:bg-tu-surface-hover"><td className="py-2.5 px-2 font-medium">{c.title}</td><td className="py-2.5 px-2">{STATUS_MAP[c.status] ? <Badge variant={STATUS_MAP[c.status].color}>{STATUS_MAP[c.status].label}</Badge> : c.status}</td><td className="py-2.5 px-2 text-right"><div className="flex justify-end gap-1">{c.status === "open" && <Button variant="ghost" size="sm" onClick={() => handleStatus(c.id, "in_progress")} className="text-tu-info text-xs">สืบพยาน</Button>}{c.status === "in_progress" && <Button variant="ghost" size="sm" onClick={() => handleStatus(c.id, "completed")} className="text-tu-success text-xs">ปิดคดี</Button>}<Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(c)}><Trash2 size={14} className="text-tu-error" /></Button></div></td></tr>))}</tbody></table></div>}
          </>
        )}

        {activeTab === "clients" && (
          <div className="space-y-2">{MOCK_CLIENTS.map((c) => (<Card key={c.id}><CardContent className="py-4"><div className="flex items-center justify-between"><div><p className="font-semibold">{c.name}</p><p className="text-xs text-tu-text-muted flex items-center gap-1"><Phone size={12} />{c.phone} | <MapPin size={12} />เข้าเยี่ยมล่าสุด {c.lastVisit}</p></div><Badge variant="info">{c.caseCount} คดี</Badge></div></CardContent></Card>))}</div>
        )}

        {activeTab === "appointments" && (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">ลูกความ</th><th className="py-3 px-2">วันที่</th><th className="py-3 px-2">เวลา</th><th className="py-3 px-2">ประเภท</th><th className="py-3 px-2">สถานะ</th></tr></thead><tbody>{MOCK_APPOINTMENTS.map((a) => (<tr key={a.id} className="border-b border-tu-border"><td className="py-2.5 px-2">{a.client}</td><td className="py-2.5 px-2">{a.date}</td><td className="py-2.5 px-2">{a.time}</td><td className="py-2.5 px-2"><Badge variant="secondary">{a.type}</Badge></td><td className="py-2.5 px-2"><Badge variant={a.status === "confirmed" ? "success" : "warning"}>{a.status === "confirmed" ? "ยืนยัน" : "รอยืนยัน"}</Badge></td></tr>))}</tbody></table></div>
        )}

        {activeTab === "consultation" && <div className="py-12 text-center text-tu-text-muted"><MessageSquare size={48} className="mx-auto mb-3" /><p>ให้คำปรึกษากฎหมาย</p><p className="text-sm">คำปรึกษาวันนี้: 5 รายการ | รอให้คำปรึกษา: 12 รายการ | เสร็จสิ้น: 89 รายการ</p><Button variant="outline" className="mt-4">บันทึกคำปรึกษา</Button></div>}

        {activeTab === "reports" && <div className="py-12 text-center text-tu-text-muted"><FileBarChart size={48} className="mx-auto mb-3" /><p>รายงานคดี</p><div className="grid grid-cols-3 gap-3 mt-4 max-w-md mx-auto"><Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-tu-primary">{total}</p><p className="text-xs text-tu-text-muted">คดีทั้งหมด</p></CardContent></Card><Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-tu-info">5</p><p className="text-xs text-tu-text-muted">กำลังดำเนินการ</p></CardContent></Card><Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-tu-success">8</p><p className="text-xs text-tu-text-muted">ปิดคดี</p></CardContent></Card></div></div>}

        {totalPages > 1 && (<div className="flex items-center justify-between pt-4"><span className="text-sm text-tu-text-muted">หน้า {page} จาก {totalPages}</span><div className="flex gap-1"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /></Button><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></Button></div></div>)}
      </CardContent></Card>

      {dialogOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDialogOpen(false)}><div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between p-4 border-b border-tu-border"><h2 className="text-lg font-semibold">เปิดคดีใหม่</h2><Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}><X size={18} /></Button></div><form onSubmit={handleSubmit} className="p-4 space-y-3"><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">ชื่อคดี <span className="text-tu-error">*</span></label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="คดีหมายเลขดำที่..." required /></div><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">คำอธิบาย</label><textarea className="w-full rounded-[--radius-input] border border-tu-border px-3 py-2 text-sm bg-tu-surface" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>ยกเลิก</Button><Button type="submit" variant="primary" disabled={submitting}>{submitting ? "กำลังบันทึก..." : "เปิดคดี"}</Button></div></form></div></div>)}

      {deleteConfirm && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteConfirm(null)}><div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}><h2 className="text-lg font-semibold mb-2">ยืนยันการลบ</h2><p className="text-sm text-tu-text-muted mb-4">ต้องการลบคดี <strong>{deleteConfirm.title}</strong> ใช่หรือไม่?</p><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setDeleteConfirm(null)}>ยกเลิก</Button><Button variant="destructive" onClick={handleDelete}>ลบ</Button></div></div></div>)}

      {toast && (<div className={cn("fixed bottom-6 right-6 z-[60] rounded-[--radius-card] border px-4 py-3 shadow-lg text-sm flex items-center gap-2", toast.type === "success" ? "bg-tu-success/10 border-tu-success/30 text-tu-success" : "bg-tu-error/10 border-tu-error/30 text-tu-error")}>{toast.type === "success" ? "✅" : "❌"} {toast.msg}<button onClick={() => setToast(null)} className="ml-2"><X size={14} /></button></div>)}
    </div>
  );
}
