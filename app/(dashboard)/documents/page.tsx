"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import {
  FolderOpen, Upload, Search, FileText, Download, HardDrive,
  Building2, User, Globe, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { swrFetcher, fetchApi } from "@/lib/fetcher";
import { useUrlState } from "@/hooks/use-url-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHasPermission } from "@/hooks/use-permission";

/* ==============================================================================
   Types
   ============================================================================== */

type PoolId = "central" | "department" | "personal";

interface Document {
  id: string; title: string; pool: PoolId; department: string;
  uploadedBy: string; date: string; size: string; type: string;
}

/* ==============================================================================
   Constants
   ============================================================================== */

const QUOTA_GB = 5;

const POOL_TABS: { id: PoolId | null; label: string; icon: typeof FolderOpen }[] = [
  { id: null, label: "ทั้งหมด", icon: FolderOpen },
  { id: "central", label: "Central Pool", icon: Globe },
  { id: "department", label: "Department Pool", icon: Building2 },
  { id: "personal", label: "Personal Pool", icon: User },
];

const MOCK_DOCS: Document[] = [
  { id: "1", title: "ระเบียบการลงทะเบียนเรียน 2568", pool: "central", department: "ฝ่ายวิชาการ", uploadedBy: "สมชาย ใจดี", date: "2025-07-05 14:30", size: "2.4 MB", type: "PDF" },
  { id: "2", title: "คู่มืออาจารย์ที่ปรึกษา", pool: "department", department: "ฝ่ายวิชาการ", uploadedBy: "สมศรี รักเรียน", date: "2025-07-03 09:15", size: "1.1 MB", type: "DOCX" },
  { id: "3", title: "รายงานการประชุม มิ.ย. 68", pool: "department", department: "สำนักงานคณะ", uploadedBy: "วิชัย วงศ์วิเศษ", date: "2025-07-01 16:00", size: "0.8 MB", type: "XLSX" },
  { id: "4", title: "บันทึกส่วนตัว", pool: "personal", department: "-", uploadedBy: "นภา มั่นคง", date: "2025-06-28 11:20", size: "0.3 MB", type: "PDF" },
  { id: "5", title: "แผนปฏิบัติการประจำปี 2568", pool: "central", department: "สำนักงานคณะ", uploadedBy: "ธนา รักษาดี", date: "2025-06-20 08:45", size: "3.2 MB", type: "PPTX" },
  { id: "6", title: "Template หนังสือราชการ", pool: "central", department: "สำนักงานคณะ", uploadedBy: "พิมใจ นิติศาสตร์", date: "2025-06-18 13:10", size: "0.5 MB", type: "DOCX" },
  { id: "7", title: "รายงานวิจัยกฎหมายสิ่งแวดล้อม", pool: "central", department: "งานวิจัย", uploadedBy: "สมชาย ใจดี", date: "2025-06-15 10:00", size: "4.1 MB", type: "PDF" },
  { id: "8", title: "บันทึกข้อความประชุมวิชาการ", pool: "personal", department: "-", uploadedBy: "นภา มั่นคง", date: "2025-06-12 15:30", size: "1.8 MB", type: "PNG" },
  { id: "9", title: "ประเมินผลการสอน 1-2568", pool: "department", department: "ฝ่ายวิชาการ", uploadedBy: "สมศรี รักเรียน", date: "2025-06-10 09:00", size: "0.9 MB", type: "XLSX" },
  { id: "10", title: "ข้อบังคับคณะนิติศาสตร์ 2568", pool: "central", department: "สำนักงานคณะ", uploadedBy: "วิชัย วงศ์วิเศษ", date: "2025-06-05 14:00", size: "1.5 MB", type: "PDF" },
  { id: "11", title: "สัญญาจ้างอาจารย์พิเศษ", pool: "department", department: "สำนักงานคณะ", uploadedBy: "ธนา รักษาดี", date: "2025-06-01 11:00", size: "0.6 MB", type: "DOCX" },
  { id: "12", title: "รูปถ่ายกิจกรรมรับน้อง", pool: "personal", department: "-", uploadedBy: "นภา มั่นคง", date: "2025-05-28 16:45", size: "3.5 MB", type: "JPG" },
];

/* ==============================================================================
   Helpers
   ============================================================================== */

function getAvailablePools(roles: string[]): PoolId[] {
  const isAdmin = roles.includes("super_admin") || roles.includes("system_admin") || roles.includes("dept_admin");
  return isAdmin ? ["central", "department", "personal"] : ["central", "personal"];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }) + " " +
    d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

/* ==============================================================================
   Main Page
   ============================================================================== */

export default function DocumentsPage() {
  const [search, setSearch] = useUrlState("search", "");
  const [poolParam, setPoolParam] = useUrlState("pool", "");
  const pool: PoolId | null = (POOL_TABS.some(t => t.id === poolParam) ? poolParam : null) as PoolId | null;
  const setPool = (p: PoolId | null) => setPoolParam(p ?? "");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch from API, fallback to mock
  const { data: apiDocs, isLoading, mutate } = useSWR("/api/documents", swrFetcher<Document[]>);
  const docs: Document[] = (apiDocs as unknown as Document[])?.length ? (apiDocs as unknown as Document[]) : MOCK_DOCS;
  const canUpload = useHasPermission("DOCUMENTS_UPLOAD");
  const canDelete = useHasPermission("DOCUMENTS_DELETE");

  const { data: session } = useSession();
  const roles: string[] = (session?.user as { roles?: string[] })?.roles ?? ["user"];
  const availablePools = getAvailablePools(roles);
  const displayTabs = POOL_TABS.filter(t => t.id === null || availablePools.includes(t.id));

  // Calculate storage
  const handleDelete = async (id: string, title: string, docPool: PoolId) => {
    // User (not admin) can only delete from personal pool
    const canDel = useHasPermission("DOCUMENTS_DELETE");
    if (canDel && docPool !== "personal" && !roles.some(r => ["super_admin", "system_admin", "dept_admin"].includes(r))) {
      alert("คุณสามารถลบได้เฉพาะเอกสารใน Personal Pool เท่านั้น");
      return;
    }
    if (!confirm(`ยืนยันลบเอกสาร "${title}"?`)) return;
    setDeleting(id);
    try {
      await fetchApi(`/api/documents?id=${id}`, { method: "DELETE" });
      mutate();
    } catch { /* fallback */ }
    setDeleting(null);
  };

  const totalSize = docs.reduce((s, d) => {
    const mb = parseFloat(d.size);
    return s + (isNaN(mb) ? 0 : mb);
  }, 0);
  const usedGB = totalSize / 1024;
  const pct = Math.min(100, Math.round((usedGB / QUOTA_GB) * 100));

  const filtered = docs.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) &&
    (!pool || d.pool === pool)
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg"];
    if (!allowed.includes(file.type)) { alert("เฉพาะ PDF, XLSX, PPTX, DOCX, PNG, JPG เท่านั้น"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);
      formData.append("poolType", pool ?? "personal");
      await fetch("/api/documents", { method: "POST", body: formData });
      mutate();
    } catch { /* fallback */ }
    setUploading(false);
    alert(`อัปโหลด "${file.name}" สำเร็จ`);
    e.target.value = "";
  };

  const canAccessPool = (docPool: PoolId) => availablePools.includes(docPool);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-tu-text-primary">Document</h1>
          <p className="text-tu-text-muted text-sm mt-1">ระบบจัดการเอกสาร 3 ระดับ · รองรับ PDF, XLSX, PPTX, DOCX, PNG, JPG</p>
        </div>
        {canUpload && (
          <label className="inline-flex items-center gap-2 rounded-[--radius-btn] bg-tu-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors cursor-pointer">
            <Upload size={18} />{uploading ? "กำลังอัปโหลด..." : "อัปโหลดเอกสาร"}
            <input type="file" accept=".pdf,.xlsx,.pptx,.docx,.png,.jpg" onChange={handleUpload} className="hidden" />
          </label>
        )}
      </div>

      {/* Storage Progress Bar */}
      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tu-primary-soft"><HardDrive size={20} className="text-tu-primary" /></div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-tu-text-primary">พื้นที่เก็บข้อมูล</span>
              <span className="text-xs text-tu-text-muted">{usedGB.toFixed(1)} GB / {QUOTA_GB} GB</span>
            </div>
            <div className="h-3 rounded-full bg-tu-bg overflow-hidden">
              <div className={cn("h-full rounded-full transition-all", pct > 80 ? "bg-tu-error" : pct > 50 ? "bg-tu-secondary" : "bg-tu-primary")} style={{ width: `${pct}%` }} />
            </div>
          </div>
          <Badge variant={pct > 80 ? "destructive" : "success"}>{pct}%</Badge>
        </div>
        {/* Audit trail note */}
        <p className="text-[10px] text-tu-text-muted text-right">
          🛡 Audit Trail: ทุกการเข้าถึงและแก้ไขเอกสารถูกบันทึก — {filtered.length} รายการที่คุณเข้าถึงได้
        </p>
      </div>

      {/* Search bar */}
      <div className="relative"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาเอกสาร..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface pl-9 pr-4 py-2.5 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none transition" /></div>

      {/* Pool Tabs */}
      <div className="flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5 w-fit">
        {displayTabs.map(tab => (
          <button key={tab.label} onClick={() => setPool(tab.id)}
            className={cn("flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              pool === tab.id ? "bg-tu-primary text-white shadow-sm" : "text-tu-text-secondary hover:text-tu-text-primary")}>
            <tab.icon size={14} />{tab.label}
          </button>
        ))}
      </div>

      {/* Document Table */}
      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-tu-bg border-b border-tu-border text-left">
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">ชื่อไฟล์</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden sm:table-cell">ประเภท</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden md:table-cell">ขนาด</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden lg:table-cell">ผู้อัปโหลด</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">แก้ไขล่าสุด</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tu-border">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-tu-text-muted"><FileText size={40} className="mx-auto mb-3 opacity-20" /><p>ไม่พบเอกสาร</p></td></tr>
            ) : filtered.map((doc) => (
              <tr key={doc.id} className="hover:bg-tu-surface-hover transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-tu-text-muted shrink-0" />
                    <span className="text-sm font-medium text-tu-text-primary">{doc.title}</span>
                    <Badge variant="outline" className="text-[9px]">{doc.pool === "central" ? "Central" : doc.pool === "department" ? "Dept" : "Personal"}</Badge>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell"><Badge variant="outline" className="text-[10px]">{doc.type}</Badge></td>
                <td className="px-4 py-3 text-sm text-tu-text-secondary hidden md:table-cell">{doc.size}</td>
                <td className="px-4 py-3 text-sm text-tu-text-secondary hidden lg:table-cell">{doc.uploadedBy}</td>
                <td className="px-4 py-3 text-xs text-tu-text-muted">{formatDate(doc.date)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" title="ดาวน์โหลด"><Download size={16} /></Button>
                    {canDelete && (
                      <Button variant="ghost" size="icon" title="ลบ" onClick={() => handleDelete(doc.id, doc.title, doc.pool)} disabled={deleting === doc.id}>
                        <Trash2 size={16} className={deleting === doc.id ? "animate-spin text-tu-text-muted" : "text-tu-error hover:text-tu-error/80"} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
