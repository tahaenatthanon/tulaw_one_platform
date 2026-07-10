"use client";

import { useState, useEffect, useCallback } from "react";
import { FlaskConical, FileText, BookOpen, Lightbulb, FileBarChart, Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useActionPermissions } from "@/hooks/use-action-permissions";

const TABS = [
  { id: "projects", label: "โครงการวิจัย", icon: FlaskConical },
  { id: "grants", label: "ทุนวิจัย", icon: FileText },
  { id: "publications", label: "ผลงานตีพิมพ์", icon: BookOpen },
  { id: "ip", label: "ทรัพย์สินทางปัญญา", icon: Lightbulb },
  { id: "reports", label: "รายงาน", icon: FileBarChart },
];

type Project = { id: string; title: string; status: string; budget: number; department?: string; createdAt: string; members?: { user: { email: string } }[] };

function fmt(n: number) { return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(n); }

const STATUS_MAP: Record<string, { label: string; color: "secondary" | "warning" | "success" | "destructive" | "info" }> = {
  planning: { label: "วางแผน", color: "secondary" }, in_progress: { label: "กำลังดำเนินการ", color: "info" },
  pending_approval: { label: "รออนุมัติ", color: "warning" }, completed: { label: "เสร็จสิ้น", color: "success" },
  open: { label: "เปิดรับ", color: "info" }, closed: { label: "ปิด", color: "secondary" },
};

const MOCK_GRANTS = [
  { id: "1", title: "ทุนวิจัยคณะนิติศาสตร์ ประจำปี 2568", source: "คณะนิติศาสตร์", amount: 500000, deadline: "30 ก.ย. 2568", status: "open" },
  { id: "2", title: "ทุนวิจัยจากสำนักงานกองทุนสนับสนุนการวิจัย", source: "สกว.", amount: 2000000, deadline: "15 ธ.ค. 2568", status: "open" },
  { id: "3", title: "ทุนพัฒนานักวิจัยรุ่นใหม่", source: "วช.", amount: 300000, deadline: "31 ส.ค. 2568", status: "open" },
];

const MOCK_PUBS = [
  { id: "1", title: "การปฏิรูปกฎหมายไทยในยุคดิจิทัล", authors: "สมชาย ใจดี", journal: "วารสารนิติศาสตร์ มธ.", year: 2568, type: "บทความ" },
  { id: "2", title: "International Law and Human Rights in Southeast Asia", authors: "สมหญิง รักเรียน", journal: "Asian Journal of Law", year: 2568, type: "นานาชาติ" },
];

export default function ResearchPage() {
  const perm = useActionPermissions();
  const [activeTab, setActiveTab] = useState("projects");
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1); const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", budget: "", startDate: "", endDate: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Project | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const LIMIT = 10; const totalPages = Math.ceil(total / LIMIT);
  const showToast = (type: "success" | "error", msg: string) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) p.set("search", search);
      const res = await fetch(`/api/research?${p}`); const json = await res.json();
      if (json.success) { setData(json.data); setTotal(json.meta.total); }
    } catch { /* */ } setLoading(false);
  }, [page, search]);
  useEffect(() => { if (activeTab === "projects") fetchData(); }, [activeTab, fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.title) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) { showToast("success", "สร้างโครงการสำเร็จ"); setDialogOpen(false); fetchData(); }
    } catch { showToast("error", "เกิดข้อผิดพลาด"); }
    setSubmitting(false);
  };
  const handleStatus = async (id: string, status: string) => {
    await fetch("/api/research", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    showToast("success", "เปลี่ยนสถานะสำเร็จ"); fetchData();
  };
  const handleDelete = async () => { if (!deleteConfirm) return; await fetch(`/api/research?id=${deleteConfirm.id}`, { method: "DELETE" }); showToast("success", "ลบสำเร็จ"); setDeleteConfirm(null); fetchData(); };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-tu-text-primary flex items-center gap-2"><FlaskConical size={24} className="text-tu-primary" /> ระบบงานวิจัย</h1>
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
        <h2 className="text-lg font-semibold">{TABS.find((t) => t.id === activeTab)?.label} ({activeTab === "projects" ? total : "-"} รายการ)</h2>
        {activeTab === "projects" && perm.research.manage && <Button onClick={() => setDialogOpen(true)} variant="primary"><Plus size={16} /> โครงการใหม่</Button>}
      </div>

      <Card><CardContent className="pt-4">
        <div className="flex gap-2 mb-4"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><Input className="pl-9" placeholder="ค้นหา..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>{search && <Button variant="ghost" size="icon" onClick={() => { setSearch(""); setPage(1); }}><X size={16} /></Button>}</div>

        {activeTab === "projects" && (
          <>{loading ? <div className="py-12 text-center text-tu-text-muted">กำลังโหลด...</div> : data.length === 0 ? <div className="py-12 text-center text-tu-text-muted">ยังไม่มีโครงการวิจัย</div> :
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">ชื่อโครงการ</th><th className="py-3 px-2">สถานะ</th><th className="py-3 px-2 text-right">งบประมาณ</th><th className="py-3 px-2 text-right">จัดการ</th></tr></thead><tbody>{data.map((p) => (<tr key={p.id} className="border-b border-tu-border hover:bg-tu-surface-hover"><td className="py-2.5 px-2 font-medium">{p.title}</td><td className="py-2.5 px-2">{STATUS_MAP[p.status] ? <Badge variant={STATUS_MAP[p.status].color}>{STATUS_MAP[p.status].label}</Badge> : p.status}</td><td className="py-2.5 px-2 text-right">{fmt(Number(p.budget ?? 0))}</td><td className="py-2.5 px-2 text-right"><div className="flex justify-end gap-1">{p.status === "pending_approval" && <Button variant="ghost" size="sm" onClick={() => handleStatus(p.id, "in_progress")} className="text-tu-success text-xs">อนุมัติ</Button>}<Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(p)}><Trash2 size={14} className="text-tu-error" /></Button></div></td></tr>))}</tbody></table></div>}
          </>
        )}

        {activeTab === "grants" && (
          <div className="space-y-3">{MOCK_GRANTS.map((g) => (<Card key={g.id}><CardContent className="py-4"><div className="flex items-start justify-between"><div><h3 className="font-semibold">{g.title}</h3><p className="text-xs text-tu-text-muted">แหล่งทุน: {g.source} | หมดเขต: {g.deadline}</p></div><div className="text-right"><p className="font-bold text-tu-success">{fmt(g.amount)}</p><Badge variant="info">เปิดรับ</Badge></div></div></CardContent></Card>))}</div>
        )}

        {activeTab === "publications" && (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">ชื่อผลงาน</th><th className="py-3 px-2">ผู้แต่ง</th><th className="py-3 px-2">วารสาร</th><th className="py-3 px-2">ปี</th><th className="py-3 px-2">ประเภท</th></tr></thead><tbody>{MOCK_PUBS.map((pub) => (<tr key={pub.id} className="border-b border-tu-border hover:bg-tu-surface-hover"><td className="py-2.5 px-2 font-medium">{pub.title}</td><td className="py-2.5 px-2">{pub.authors}</td><td className="py-2.5 px-2 text-xs">{pub.journal}</td><td className="py-2.5 px-2">{pub.year}</td><td className="py-2.5 px-2"><Badge variant={pub.type === "นานาชาติ" ? "success" : "secondary"}>{pub.type}</Badge></td></tr>))}</tbody></table></div>
        )}

        {activeTab === "ip" && <div className="py-12 text-center text-tu-text-muted"><Lightbulb size={48} className="mx-auto mb-3" /><p>ทรัพย์สินทางปัญญา</p><p className="text-sm">สิทธิบัตร: 3 รายการ | อนุสิทธิบัตร: 5 รายการ | ลิขสิทธิ์: 12 รายการ</p></div>}
        {activeTab === "reports" && <div className="py-12 text-center text-tu-text-muted"><FileBarChart size={48} className="mx-auto mb-3" /><p>รายงานวิจัย</p><p className="text-sm">รายงานฉบับสมบูรณ์: 8 ฉบับ | รายงานความก้าวหน้า: 12 ฉบับ</p></div>}

        {totalPages > 1 && (<div className="flex items-center justify-between pt-4"><span className="text-sm text-tu-text-muted">หน้า {page} จาก {totalPages}</span><div className="flex gap-1"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /></Button><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></Button></div></div>)}
      </CardContent></Card>

      {dialogOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDialogOpen(false)}><div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between p-4 border-b border-tu-border"><h2 className="text-lg font-semibold">สร้างโครงการวิจัย</h2><Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}><X size={18} /></Button></div><form onSubmit={handleSubmit} className="p-4 space-y-3"><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">ชื่อโครงการ <span className="text-tu-error">*</span></label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="ชื่อโครงการวิจัย" required /></div><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">คำอธิบาย</label><textarea className="w-full rounded-[--radius-input] border border-tu-border px-3 py-2 text-sm bg-tu-surface" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">งบประมาณ</label><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">วันที่เริ่ม</label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div></div><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>ยกเลิก</Button><Button type="submit" variant="primary" disabled={submitting}>{submitting ? "กำลังบันทึก..." : "บันทึก"}</Button></div></form></div></div>)}

      {deleteConfirm && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteConfirm(null)}><div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}><h2 className="text-lg font-semibold mb-2">ยืนยันการลบ</h2><p className="text-sm text-tu-text-muted mb-4">ต้องการลบ <strong>{deleteConfirm.title}</strong> ใช่หรือไม่?</p><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setDeleteConfirm(null)}>ยกเลิก</Button><Button variant="destructive" onClick={handleDelete}>ลบ</Button></div></div></div>)}

      {toast && (<div className={cn("fixed bottom-6 right-6 z-[60] rounded-[--radius-card] border px-4 py-3 shadow-lg text-sm flex items-center gap-2", toast.type === "success" ? "bg-tu-success/10 border-tu-success/30 text-tu-success" : "bg-tu-error/10 border-tu-error/30 text-tu-error")}>{toast.type === "success" ? "✅" : "❌"} {toast.msg}<button onClick={() => setToast(null)} className="ml-2"><X size={14} /></button></div>)}
    </div>
  );
}
