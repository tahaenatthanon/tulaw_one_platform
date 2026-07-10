"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Repeat, CheckCheck, Users, Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, FileText, CheckCircle, Clock, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useActionPermissions } from "@/hooks/use-action-permissions";

type EofficeDoc = { id: string; docNo: string; title: string; secretLevel: string; urgentLevel: string; status: string; docType: string; createdAt: string };
const SECRET_MAP: Record<string, { label: string; color: "secondary" | "warning" | "destructive" | "info" | "success" }> = { normal: { label: "ปกติ", color: "success" }, confidential: { label: "ลับ", color: "warning" }, secret: { label: "ลับมาก", color: "destructive" }, topsecret: { label: "ลับที่สุด", color: "destructive" } };
const STATUS_MAP: Record<string, { label: string; color: "secondary" | "warning" | "success" | "destructive" | "info" }> = { draft: { label: "ร่าง", color: "secondary" }, pending: { label: "รอดำเนินการ", color: "warning" }, approved: { label: "อนุมัติแล้ว", color: "success" }, rejected: { label: "ปฏิเสธ", color: "destructive" }, received: { label: "รับแล้ว", color: "info" }, signed: { label: "ลงนามแล้ว", color: "success" } };
const DOC_TYPES: Record<string, string> = { incoming: "หนังสือเข้า", outgoing: "หนังสือออก", circular: "หนังสือเวียน", approval: "ขออนุมัติ", meeting: "การประชุม" };
const TABS = [
  { id: "incoming", label: "หนังสือเข้า", icon: ArrowDownToLine },
  { id: "outgoing", label: "หนังสือออก", icon: ArrowUpFromLine },
  { id: "circular", label: "หนังสือเวียน", icon: Repeat },
  { id: "approval", label: "อนุมัติ", icon: CheckCheck },
  { id: "meetings", label: "การประชุม", icon: Users },
];

export default function EofficePage() {
  const perm = useActionPermissions();
  const [activeTab, setActiveTab] = useState("incoming");
  const [data, setData] = useState<EofficeDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ docNo: "", title: "", secretLevel: "normal", urgentLevel: "normal", docType: "incoming" });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<EofficeDoc | null>(null);
  const [detailDoc, setDetailDoc] = useState<EofficeDoc | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const LIMIT = 10;
  const totalPages = Math.ceil(total / LIMIT);

  const showToast = (type: "success" | "error", msg: string) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set("search", search);
      const res = await fetch(`/api/eoffice?${params}`);
      const json = await res.json();
      if (json.success) { setData(json.data); setTotal(json.meta.total); }
    } catch { /* silent */ }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setForm({ docNo: "", title: "", secretLevel: "normal", urgentLevel: "normal", docType: activeTab }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.docNo || !form.title) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/eoffice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) { showToast("success", "บันทึกเอกสารสำเร็จ"); setDialogOpen(false); fetchData(); } else { showToast("error", json.error?.message ?? "เกิดข้อผิดพลาด"); }
    } catch { showToast("error", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"); }
    setSubmitting(false);
  };

  const handleStatus = async (id: string, status: string) => {
    const res = await fetch("/api/eoffice", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    const json = await res.json();
    if (json.success) { showToast("success", "เปลี่ยนสถานะสำเร็จ"); fetchData(); } else { showToast("error", json.error?.message ?? "ไม่มีสิทธิ์"); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const res = await fetch(`/api/eoffice?id=${deleteConfirm.id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { showToast("success", "ลบเอกสารสำเร็จ"); setDeleteConfirm(null); fetchData(); }
  };

  const filtered = data.filter((d) => d.docType === activeTab || (activeTab === "approval" && d.docType === "approval") || (activeTab === "meetings" && d.docType === "meeting"));
  const displayed = loading ? [] : filtered;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-tu-text-primary flex items-center gap-2"><FileText size={24} className="text-tu-primary" /> E-Office — ระบบสารบรรณอิเล็กทรอนิกส์</h1>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {TABS.map((tab) => {
          const count = data.filter((d) => d.docType === tab.id || (tab.id === "approval" && d.docType === "approval") || (tab.id === "meetings" && d.docType === "meeting")).length;
          return (
            <Card key={tab.id} className={cn("cursor-pointer hover:shadow-md transition-shadow", activeTab === tab.id && "ring-2 ring-tu-primary")} onClick={() => setActiveTab(tab.id)}>
              <CardContent className="pt-4 text-center">
                <tab.icon size={20} className={cn("mx-auto mb-1", activeTab === tab.id ? "text-tu-primary" : "text-tu-text-muted")} />
                <p className="text-xs font-medium text-tu-text-secondary">{tab.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">{TABS.find((t) => t.id === activeTab)?.label} ({total} รายการ)</h2>
        {perm.eoffice.create && <Button onClick={openCreate} variant="primary"><Plus size={16} /> เพิ่มเอกสาร</Button>}
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><Input className="pl-9" placeholder="ค้นหาเลขที่หรือหัวเรื่อง..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
            {search && <Button variant="ghost" size="icon" onClick={() => { setSearch(""); setPage(1); }}><X size={16} /></Button>}
          </div>

          {loading ? <div className="py-12 text-center text-tu-text-muted text-sm">กำลังโหลด...</div> : displayed.length === 0 ? <div className="py-12 text-center text-tu-text-muted text-sm">{search ? "ไม่พบข้อมูล" : "ยังไม่มีเอกสาร"}</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-tu-border text-left text-tu-text-muted">
                  <th className="py-3 px-2 font-medium">เลขที่</th><th className="py-3 px-2 font-medium">หัวเรื่อง</th><th className="py-3 px-2 font-medium">ประเภท</th><th className="py-3 px-2 font-medium">ชั้นความลับ</th><th className="py-3 px-2 font-medium">ความเร่งด่วน</th><th className="py-3 px-2 font-medium">สถานะ</th><th className="py-3 px-2 font-medium text-right">จัดการ</th>
                </tr></thead>
                <tbody>
                  {displayed.map((d) => (
                    <tr key={d.id} className="border-b border-tu-border hover:bg-tu-surface-hover">
                      <td className="py-2.5 px-2 font-mono font-medium">{d.docNo}</td>
                      <td className="py-2.5 px-2 max-w-[200px] truncate">{d.title}</td>
                      <td className="py-2.5 px-2"><Badge variant="secondary">{DOC_TYPES[d.docType] ?? d.docType}</Badge></td>
                      <td className="py-2.5 px-2">{SECRET_MAP[d.secretLevel] ? <Badge variant={SECRET_MAP[d.secretLevel].color}>{SECRET_MAP[d.secretLevel].label}</Badge> : d.secretLevel}</td>
                      <td className="py-2.5 px-2"><Badge variant={d.urgentLevel === "urgent" ? "destructive" : d.urgentLevel === "high" ? "warning" : "secondary"}>{d.urgentLevel === "urgent" ? "ด่วนที่สุด" : d.urgentLevel === "high" ? "ด่วน" : "ปกติ"}</Badge></td>
                      <td className="py-2.5 px-2">{STATUS_MAP[d.status] ? <Badge variant={STATUS_MAP[d.status].color}>{STATUS_MAP[d.status].label}</Badge> : d.status}</td>
                      <td className="py-2.5 px-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setDetailDoc(d)} title="ดูรายละเอียด"><Eye size={14} /></Button>
                          {perm.eoffice.approve && d.status === "pending" && <><Button variant="ghost" size="icon" onClick={() => handleStatus(d.id, "approved")} title="อนุมัติ"><CheckCircle size={14} className="text-tu-success" /></Button><Button variant="ghost" size="icon" onClick={() => handleStatus(d.id, "rejected")} title="ปฏิเสธ"><X size={14} className="text-tu-error" /></Button></>}
                          {perm.eoffice.create && d.status === "draft" && <Button variant="ghost" size="icon" onClick={() => handleStatus(d.id, "pending")} title="ส่งอนุมัติ"><Clock size={14} className="text-tu-info" /></Button>}
                          {perm.eoffice.manage && <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(d)}><Trash2 size={14} className="text-tu-error" /></Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-tu-text-muted">หน้า {page} จาก {totalPages}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /></Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1).map((p, idx, arr) => (
                  <span key={p}>{idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-tu-text-muted">...</span>}<Button variant={p === page ? "primary" : "outline"} size="sm" onClick={() => setPage(p)}>{p}</Button></span>
                ))}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDialogOpen(false)}>
          <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-tu-border"><h2 className="text-lg font-semibold">สร้างเอกสาร</h2><Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}><X size={18} /></Button></div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-tu-text-secondary mb-1">เลขที่เอกสาร <span className="text-tu-error">*</span></label><Input value={form.docNo} onChange={(e) => setForm({ ...form, docNo: e.target.value })} placeholder="ศธ 0517.10/..." required /></div>
                <div><label className="block text-sm font-medium text-tu-text-secondary mb-1">ประเภท</label><select className="w-full rounded-[--radius-input] border border-tu-border px-3 py-2 text-sm bg-tu-surface" value={form.docType} onChange={(e) => setForm({ ...form, docType: e.target.value })}>{Object.entries(DOC_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium text-tu-text-secondary mb-1">หัวเรื่อง <span className="text-tu-error">*</span></label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="หัวเรื่องเอกสาร" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-tu-text-secondary mb-1">ชั้นความลับ</label><select className="w-full rounded-[--radius-input] border border-tu-border px-3 py-2 text-sm bg-tu-surface" value={form.secretLevel} onChange={(e) => setForm({ ...form, secretLevel: e.target.value })}>{Object.entries(SECRET_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-tu-text-secondary mb-1">ความเร่งด่วน</label><select className="w-full rounded-[--radius-input] border border-tu-border px-3 py-2 text-sm bg-tu-surface" value={form.urgentLevel} onChange={(e) => setForm({ ...form, urgentLevel: e.target.value })}><option value="normal">ปกติ</option><option value="high">ด่วน</option><option value="urgent">ด่วนที่สุด</option></select></div>
              </div>
              <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>ยกเลิก</Button><Button type="submit" variant="primary" disabled={submitting}>{submitting ? "กำลังบันทึก..." : "บันทึก"}</Button></div>
            </form>
          </div>
        </div>
      )}

      {detailDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDetailDoc(null)}>
          <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">รายละเอียดเอกสาร</h2><Button variant="ghost" size="icon" onClick={() => setDetailDoc(null)}><X size={18} /></Button></div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-tu-text-muted">เลขที่</span><span className="font-medium font-mono">{detailDoc.docNo}</span></div>
              <div className="flex justify-between"><span className="text-tu-text-muted">หัวเรื่อง</span><span className="font-medium">{detailDoc.title}</span></div>
              <div className="flex justify-between"><span className="text-tu-text-muted">ประเภท</span><Badge variant="secondary">{DOC_TYPES[detailDoc.docType] ?? detailDoc.docType}</Badge></div>
              <div className="flex justify-between"><span className="text-tu-text-muted">ชั้นความลับ</span>{SECRET_MAP[detailDoc.secretLevel] ? <Badge variant={SECRET_MAP[detailDoc.secretLevel].color}>{SECRET_MAP[detailDoc.secretLevel].label}</Badge> : <span>{detailDoc.secretLevel}</span>}</div>
              <div className="flex justify-between"><span className="text-tu-text-muted">สถานะ</span>{STATUS_MAP[detailDoc.status] ? <Badge variant={STATUS_MAP[detailDoc.status].color}>{STATUS_MAP[detailDoc.status].label}</Badge> : <span>{detailDoc.status}</span>}</div>
            </div>
            <div className="flex justify-end mt-4"><Button variant="secondary" onClick={() => setDetailDoc(null)}>ปิด</Button></div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">ยืนยันการลบ</h2><p className="text-sm text-tu-text-muted mb-4">ต้องการลบเอกสาร <strong>{deleteConfirm.docNo}</strong> ใช่หรือไม่?</p>
            <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setDeleteConfirm(null)}>ยกเลิก</Button><Button variant="destructive" onClick={handleDelete}>ลบ</Button></div>
          </div>
        </div>
      )}

      {toast && (
        <div className={cn("fixed bottom-6 right-6 z-[60] rounded-[--radius-card] border px-4 py-3 shadow-lg text-sm flex items-center gap-2", toast.type === "success" ? "bg-tu-success/10 border-tu-success/30 text-tu-success" : "bg-tu-error/10 border-tu-error/30 text-tu-error")}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}<button onClick={() => setToast(null)} className="ml-2"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}
