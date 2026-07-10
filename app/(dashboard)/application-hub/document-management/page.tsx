"use client";

import { useState, useEffect, useCallback } from "react";
import { FolderOpen, Building2, User, GitBranch, ScanEye, Plus, Trash2, Search, X, ChevronLeft, ChevronRight, Download, Upload, Eye, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useActionPermissions } from "@/hooks/use-action-permissions";

const TABS = [
  { id: "central", label: "คลังกลาง", icon: FolderOpen },
  { id: "dept", label: "คลังหน่วยงาน", icon: Building2 },
  { id: "personal", label: "ส่วนตัว", icon: User },
  { id: "version", label: "ประวัติเวอร์ชัน", icon: GitBranch },
  { id: "ocr", label: "ค้นหา OCR", icon: ScanEye },
];

type Doc = { id: string; title: string; pool: string; department: string; uploadedBy: string; date: string; size: string; type: string };

function formatDate(d: string) { return new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }); }

export default function DmsPage() {
  const perm = useActionPermissions();
  const [activeTab, setActiveTab] = useState("central");
  const [data, setData] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [form, setForm] = useState({ title: "", poolType: "personal", fileName: "", fileSize: 0, mimeType: "application/pdf", path: "/uploads" });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Doc | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const LIMIT = 10;
  const totalPages = Math.ceil(total / LIMIT);

  const showToast = (type: "success" | "error", msg: string) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set("search", search);
      if (activeTab !== "version" && activeTab !== "ocr") params.set("pool", activeTab);
      const res = await fetch(`/api/documents?${params}`);
      const json = await res.json();
      if (json.success) { setData(json.data); setTotal(json.meta.total); }
    } catch { /* silent */ }
    setLoading(false);
  }, [page, search, activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, poolType: activeTab }) });
      const json = await res.json();
      if (json.success) { showToast("success", "อัปโหลดเอกสารสำเร็จ"); setUploadDialog(false); fetchData(); } else { showToast("error", json.error?.message ?? "เกิดข้อผิดพลาด"); }
    } catch { showToast("error", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"); }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const res = await fetch(`/api/documents?id=${deleteConfirm.id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { showToast("success", "✅ ลบเอกสารสำเร็จ"); setDeleteConfirm(null); fetchData(); }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-tu-text-primary flex items-center gap-2"><FolderOpen size={24} className="text-tu-primary" /> ระบบจัดการเอกสาร (DMS)</h1>

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
        <h2 className="text-lg font-semibold">{TABS.find((t) => t.id === activeTab)?.label} ({total} รายการ)</h2>
        {activeTab !== "version" && activeTab !== "ocr" && perm.docMgmt.upload && <Button onClick={() => setUploadDialog(true)} variant="primary"><Upload size={16} /> อัปโหลด</Button>}
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><Input className="pl-9" placeholder="ค้นหาชื่อเอกสาร..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
            {search && <Button variant="ghost" size="icon" onClick={() => { setSearch(""); setPage(1); }}><X size={16} /></Button>}
          </div>

          {loading ? <div className="py-12 text-center text-tu-text-muted text-sm">กำลังโหลด...</div> : data.length === 0 ? <div className="py-12 text-center text-tu-text-muted text-sm">{search ? "ไม่พบข้อมูล" : activeTab === "ocr" ? "ค้นหาด้วย OCR — อัปโหลดรูปภาพเพื่อค้นหาข้อความในเอกสาร" : activeTab === "version" ? "เลือกเอกสารเพื่อดูประวัติเวอร์ชัน" : "ยังไม่มีเอกสาร"}</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-tu-border text-left text-tu-text-muted">
                  <th className="py-3 px-2 font-medium">ชื่อเอกสาร</th><th className="py-3 px-2 font-medium">คลัง</th><th className="py-3 px-2 font-medium">หน่วยงาน</th><th className="py-3 px-2 font-medium">อัปโหลดโดย</th><th className="py-3 px-2 font-medium">วันที่</th><th className="py-3 px-2 font-medium">ขนาด</th><th className="py-3 px-2 font-medium">ประเภท</th><th className="py-3 px-2 font-medium text-right">จัดการ</th>
                </tr></thead>
                <tbody>
                  {data.map((d) => (
                    <tr key={d.id} className="border-b border-tu-border hover:bg-tu-surface-hover">
                      <td className="py-2.5 px-2 font-medium">{d.title}</td>
                      <td className="py-2.5 px-2"><Badge variant={d.pool === "central" ? "success" : d.pool === "dept" ? "info" : "secondary"}>{d.pool === "central" ? "กลาง" : d.pool === "dept" ? "หน่วยงาน" : "ส่วนตัว"}</Badge></td>
                      <td className="py-2.5 px-2">{d.department}</td>
                      <td className="py-2.5 px-2 text-xs">{d.uploadedBy}</td>
                      <td className="py-2.5 px-2 text-xs">{formatDate(d.date)}</td>
                      <td className="py-2.5 px-2 text-xs">{d.size}</td>
                      <td className="py-2.5 px-2"><Badge variant="outline">{d.type}</Badge></td>
                      <td className="py-2.5 px-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="ดาวน์โหลด"><Download size={14} /></Button>
                          {perm.docMgmt.manage && <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(d)}><Trash2 size={14} className="text-tu-error" /></Button>}
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
                <Button variant={page === 1 ? "primary" : "outline"} size="sm" onClick={() => setPage(1)}>1</Button>
                {totalPages > 1 && <><span className="px-1 text-tu-text-muted">...</span><Button variant="outline" size="sm" onClick={() => setPage(totalPages)}>{totalPages}</Button></>}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setUploadDialog(false)}>
          <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-tu-border"><h2 className="text-lg font-semibold">อัปโหลดเอกสาร</h2><Button variant="ghost" size="icon" onClick={() => setUploadDialog(false)}><X size={18} /></Button></div>
            <form onSubmit={handleUpload} className="p-4 space-y-3">
              <div><label className="block text-sm font-medium text-tu-text-secondary mb-1">ชื่อเอกสาร <span className="text-tu-error">*</span></label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="ชื่อเอกสาร" required /></div>
              <div><label className="block text-sm font-medium text-tu-text-secondary mb-1">ชื่อไฟล์</label><Input value={form.fileName} onChange={(e) => setForm({ ...form, fileName: e.target.value })} placeholder="document.pdf" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-tu-text-secondary mb-1">ขนาด (bytes)</label><Input type="number" value={form.fileSize} onChange={(e) => setForm({ ...form, fileSize: Number(e.target.value) })} /></div>
                <div><label className="block text-sm font-medium text-tu-text-secondary mb-1">ประเภท</label><select className="w-full rounded-[--radius-input] border border-tu-border px-3 py-2 text-sm bg-tu-surface" value={form.mimeType} onChange={(e) => setForm({ ...form, mimeType: e.target.value })}><option value="application/pdf">PDF</option><option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX</option><option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">XLSX</option><option value="image/png">PNG</option><option value="image/jpeg">JPG</option></select></div>
              </div>
              <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setUploadDialog(false)}>ยกเลิก</Button><Button type="submit" variant="primary" disabled={submitting}>{submitting ? "กำลังอัปโหลด..." : "อัปโหลด"}</Button></div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">ยืนยันการลบ</h2><p className="text-sm text-tu-text-muted mb-4">ต้องการลบ <strong>{deleteConfirm.title}</strong> ใช่หรือไม่?</p>
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
