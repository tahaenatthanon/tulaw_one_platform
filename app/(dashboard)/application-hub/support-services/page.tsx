"use client";

import { useState, useEffect, useCallback } from "react";
import { HelpCircle, Library, Plus, Search, X, ChevronLeft, ChevronRight, MessageSquare, Clock, AlertCircle, CheckCircle, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useActionPermissions } from "@/hooks/use-action-permissions";

const TABS = [
  { id: "helpdesk", label: "Helpdesk", icon: HelpCircle },
  { id: "library", label: "ห้องสมุด", icon: Library },
];

type Ticket = { id: string; title: string; description: string; priority: string; category: string; status: string; createdAt: string; requester?: { email: string; firstName?: string } };

const PRIORITY_MAP: Record<string, { label: string; color: "destructive" | "warning" | "info" | "secondary" }> = {
  critical: { label: "วิกฤติ", color: "destructive" }, high: { label: "สูง", color: "warning" }, medium: { label: "ปานกลาง", color: "info" }, low: { label: "ต่ำ", color: "secondary" },
};
const STATUS_MAP: Record<string, { label: string; color: "warning" | "info" | "success" | "secondary" }> = {
  open: { label: "เปิด", color: "warning" }, in_progress: { label: "กำลังดำเนินการ", color: "info" }, resolved: { label: "แก้ไขแล้ว", color: "success" }, closed: { label: "ปิด", color: "secondary" },
};

const LIBRARY_BOOKS = [
  { id: "1", title: "ประมวลกฎหมายแพ่งและพาณิชย์ 2568", author: "คณะนิติศาสตร์", year: 2568, category: "กฎหมายแพ่ง", available: true },
  { id: "2", title: "กฎหมายอาญาภาคความผิด", author: "รศ.ดร.สมชาย", year: 2567, category: "กฎหมายอาญา", available: false },
  { id: "3", title: "Constitutional Law in Asia", author: "Various", year: 2566, category: "กฎหมายมหาชน", available: true },
  { id: "4", title: "กฎหมายระหว่างประเทศแผนกคดีเมือง", author: "ผศ.สมหญิง", year: 2568, category: "ระหว่างประเทศ", available: true },
];

export default function SupportPage() {
  const perm = useActionPermissions();
  const [activeTab, setActiveTab] = useState("helpdesk");
  const [data, setData] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1); const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", category: "general" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const LIMIT = 10; const totalPages = Math.ceil(total / LIMIT);
  const showToast = (type: "success" | "error", msg: string) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) p.set("search", search);
      const res = await fetch(`/api/helpdesk?${p}`); const json = await res.json();
      if (json.success) { setData(json.data); setTotal(json.meta.total); }
    } catch { /* */ } setLoading(false);
  }, [page, search]);
  useEffect(() => { if (activeTab === "helpdesk") fetchData(); }, [activeTab, fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.title || !form.description) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/helpdesk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) { showToast("success", "แจ้งปัญหาสำเร็จ"); setDialogOpen(false); fetchData(); }
    } catch { showToast("error", "เกิดข้อผิดพลาด"); }
    setSubmitting(false);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-tu-text-primary flex items-center gap-2"><HelpCircle size={24} className="text-tu-primary" /> บริการสนับสนุน</h1>

      <div className="grid grid-cols-2 gap-2">
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
        <h2 className="text-lg font-semibold">{activeTab === "helpdesk" ? "แจ้งปัญหาการใช้งาน" : "ค้นหาทรัพยากรห้องสมุด"} ({activeTab === "helpdesk" ? total : "-"} รายการ)</h2>
        {activeTab === "helpdesk" && perm.support.view && <Button onClick={() => setDialogOpen(true)} variant="primary"><Plus size={16} /> แจ้งปัญหา</Button>}
      </div>

      <Card><CardContent className="pt-4">
        <div className="flex gap-2 mb-4"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><Input className="pl-9" placeholder="ค้นหา..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>{search && <Button variant="ghost" size="icon" onClick={() => { setSearch(""); setPage(1); }}><X size={16} /></Button>}</div>

        {activeTab === "helpdesk" && (
          <>{loading ? <div className="py-12 text-center text-tu-text-muted">กำลังโหลด...</div> : data.length === 0 ? <div className="py-12 text-center text-tu-text-muted"><HelpCircle size={48} className="mx-auto mb-3 text-tu-text-muted" /><p>ไม่มีรายการแจ้งปัญหา</p><Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>แจ้งปัญหาใหม่</Button></div> :
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">หัวข้อ</th><th className="py-3 px-2">ประเภท</th><th className="py-3 px-2">ความสำคัญ</th><th className="py-3 px-2">สถานะ</th><th className="py-3 px-2">วันที่</th></tr></thead><tbody>{data.map((t) => (<tr key={t.id} className="border-b border-tu-border hover:bg-tu-surface-hover"><td className="py-2.5 px-2 font-medium">{t.title}</td><td className="py-2.5 px-2"><Badge variant="secondary">{t.category}</Badge></td><td className="py-2.5 px-2">{PRIORITY_MAP[t.priority] ? <Badge variant={PRIORITY_MAP[t.priority].color}>{PRIORITY_MAP[t.priority].label}</Badge> : t.priority}</td><td className="py-2.5 px-2">{STATUS_MAP[t.status] ? <Badge variant={STATUS_MAP[t.status].color}>{STATUS_MAP[t.status].label}</Badge> : t.status}</td><td className="py-2.5 px-2 text-xs">{new Date(t.createdAt).toLocaleDateString("th-TH")}</td></tr>))}</tbody></table></div>}
          </>
        )}

        {activeTab === "library" && (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">ชื่อหนังสือ</th><th className="py-3 px-2">ผู้แต่ง</th><th className="py-3 px-2">ปี</th><th className="py-3 px-2">หมวดหมู่</th><th className="py-3 px-2">สถานะ</th></tr></thead><tbody>{LIBRARY_BOOKS.filter((b) => !search || b.title.includes(search)).map((b) => (<tr key={b.id} className="border-b border-tu-border hover:bg-tu-surface-hover"><td className="py-2.5 px-2 font-medium">{b.title}</td><td className="py-2.5 px-2">{b.author}</td><td className="py-2.5 px-2">{b.year}</td><td className="py-2.5 px-2"><Badge variant="secondary">{b.category}</Badge></td><td className="py-2.5 px-2"><Badge variant={b.available ? "success" : "warning"}>{b.available ? "พร้อมให้ยืม" : "ถูกยืมแล้ว"}</Badge></td></tr>))}</tbody></table></div>
        )}

        {totalPages > 1 && (<div className="flex items-center justify-between pt-4"><span className="text-sm text-tu-text-muted">หน้า {page} จาก {totalPages}</span><div className="flex gap-1"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /></Button><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></Button></div></div>)}
      </CardContent></Card>

      {dialogOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDialogOpen(false)}><div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between p-4 border-b border-tu-border"><h2 className="text-lg font-semibold">แจ้งปัญหา</h2><Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}><X size={18} /></Button></div><form onSubmit={handleSubmit} className="p-4 space-y-3"><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">หัวข้อ <span className="text-tu-error">*</span></label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="หัวข้อปัญหา" required /></div><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">รายละเอียด <span className="text-tu-error">*</span></label><textarea className="w-full rounded-[--radius-input] border border-tu-border px-3 py-2 text-sm bg-tu-surface" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="อธิบายรายละเอียดปัญหา..." required /></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">ความสำคัญ</label><select className="w-full rounded-[--radius-input] border border-tu-border px-3 py-2 text-sm bg-tu-surface" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">ต่ำ</option><option value="medium">ปานกลาง</option><option value="high">สูง</option><option value="critical">วิกฤติ</option></select></div><div><label className="block text-sm font-medium text-tu-text-secondary mb-1">หมวดหมู่</label><select className="w-full rounded-[--radius-input] border border-tu-border px-3 py-2 text-sm bg-tu-surface" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="general">ทั่วไป</option><option value="it">IT/ระบบ</option><option value="facility">อาคารสถานที่</option><option value="hr">บุคคล</option></select></div></div><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>ยกเลิก</Button><Button type="submit" variant="primary" disabled={submitting}>{submitting ? "กำลังส่ง..." : "ส่ง"}</Button></div></form></div></div>)}

      {toast && (<div className={cn("fixed bottom-6 right-6 z-[60] rounded-[--radius-card] border px-4 py-3 shadow-lg text-sm flex items-center gap-2", toast.type === "success" ? "bg-tu-success/10 border-tu-success/30 text-tu-success" : "bg-tu-error/10 border-tu-error/30 text-tu-error")}>{toast.type === "success" ? "✅" : "❌"} {toast.msg}<button onClick={() => setToast(null)} className="ml-2"><X size={14} /></button></div>)}
    </div>
  );
}
