"use client";

import { useState, useRef } from "react";
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
import { ROLE_LEVELS, type RoleCode } from "@/lib/permissions";

/* ==============================================================================
   Types
   ============================================================================== */

type PoolId = "central" | "department" | "personal";

interface DocumentItem {
  id: string; title: string; pool: PoolId; department: string;
  uploadedBy: string; date: string; size: string; type: string;
  fileSize?: number; ownerUserId?: string;
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

/* ==============================================================================
   Helpers
   ============================================================================== */

function getAvailablePools(roles: RoleCode[], _departmentId: number | null): PoolId[] {
  const maxLevel = Math.max(0, ...roles.map((r) => ROLE_LEVELS[r] ?? 0));
  if (maxLevel >= 70) return ["central", "department", "personal"];
  if (maxLevel >= 50) return ["central", "department", "personal"];
  return ["central", "personal"];
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
  const [search, setSearch] = useUrlState<string>("search", "");
  const [poolParam, setPoolParam] = useUrlState("pool", "");
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const pool: PoolId | null = (POOL_TABS.some(t => t.id === (poolParam as string)) ? (poolParam as PoolId) : null);
  const setPool = (p: PoolId | null) => setPoolParam(p ?? "" as string);
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadPool, setUploadPool] = useState("personal");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: apiDocs, isLoading, mutate } = useSWR("/api/documents", swrFetcher, { refreshInterval: 15000 });
  const docs: DocumentItem[] = Array.isArray(apiDocs) ? (apiDocs as DocumentItem[]) : [];
  const canUpload = useHasPermission("DOCUMENTS_UPLOAD");
  const canDelete = useHasPermission("DOCUMENTS_DELETE");

  const { data: session } = useSession();
  const roles: RoleCode[] = (session?.user as { roles?: RoleCode[] })?.roles ?? (["user"] as RoleCode[]);
  const userId = (session?.user as { id?: string })?.id ?? "";
  const departmentId = (session?.user as { departmentId?: number | null })?.departmentId ?? null;
  const maxLevel = Math.max(0, ...roles.map((r) => ROLE_LEVELS[r] ?? 0));
  const availablePools = getAvailablePools(roles, departmentId);
  const displayTabs = POOL_TABS.filter(t => t.id === null || availablePools.includes(t.id));

  const handleDelete = async (id: string, title: string, docPool: PoolId) => {
    if (maxLevel < 50 && docPool !== "personal") {
      alert("คุณสามารถลบได้เฉพาะเอกสารใน Personal Pool เท่านั้น");
      return;
    }
    if (!confirm(`ยืนยันลบเอกสาร "${title}"?`)) return;
    setDeleting(id);
    try {
      await fetchApi(`/api/documents?id=${id}`, { method: "DELETE" });
      await mutate();
    } catch { /* fallback */ }
    setDeleting(null);
  };

  const handleDownload = async (id: string) => {
    window.open(`/api/documents/download?id=${id}`, "_blank");
  };

  const totalSize = docs.reduce((s, d) => {
    const bytes = d.fileSize || 0;
    return s + bytes;
  }, 0);
  const usedGB = totalSize / (1024 * 1024 * 1024);
  const pct = Math.min(100, Math.round((usedGB / QUOTA_GB) * 100));

  const filtered = docs.filter((d: DocumentItem) =>
    d.title.toLowerCase().includes(search.toLowerCase()) &&
    (!pool || d.pool === pool)
  );

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg"];
    if (!allowed.includes(uploadFile.type)) { alert("เฉพาะ PDF, XLSX, PPTX, DOCX, PNG, JPG เท่านั้น"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", uploadFile.name);
      formData.append("poolType", maxLevel >= 50 ? uploadPool : "personal");
      await fetch("/api/documents", { method: "POST", body: formData });
      await mutate();
    } catch (e) {
      console.error("[handleUploadSubmit]", e);
    }
    setUploading(false);
    setUploadModal(false);
    setUploadFile(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-tu-text-primary">Document</h1>
          <p className="text-tu-text-muted text-sm mt-1">ระบบจัดการเอกสาร 3 ระดับ · รองรับ PDF, XLSX, PPTX, DOCX, PNG, JPG</p>
        </div>
        {canUpload && (
          <button onClick={() => { setUploadModal(true); setUploadFile(null); }} className="inline-flex items-center gap-2 rounded-[--radius-btn] bg-tu-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors">
            <Upload size={18} />อัปโหลดเอกสาร
          </button>
        )}
      </div>

      {/* Storage Progress Bar */}
      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tu-primary-soft"><HardDrive size={20} className="text-tu-primary" /></div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-tu-text-primary">พื้นที่เก็บข้อมูล</span>
              <span className="text-xs text-tu-text-muted">{usedGB.toFixed(2)} GB / {QUOTA_GB} GB</span>
            </div>
            <div className="h-3 rounded-full bg-tu-bg overflow-hidden">
              <div className={cn("h-full rounded-full transition-all", pct > 80 ? "bg-tu-error" : pct > 50 ? "bg-tu-secondary" : "bg-tu-primary")} style={{ width: `${pct}%` }} />
            </div>
          </div>
          <Badge variant={pct > 80 ? "destructive" : "success"}>{pct}%</Badge>
        </div>
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
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-tu-text-muted"><p>กำลังโหลด...</p></td></tr>
            ) : filtered.length === 0 ? (
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
                    <Button variant="ghost" size="icon" title="ดาวน์โหลด" onClick={() => handleDownload(doc.id)}><Download size={16} /></Button>
                    {canDelete && doc.ownerUserId === userId && (
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

      {/* Upload Modal */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { if (!uploading) { setUploadModal(false); setUploadFile(null); } }}>
          <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-tu-text-primary mb-5">อัปโหลดเอกสาร</h2>

            {/* Pool selector */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">เลือก Pool</label>
              <select
                value={uploadPool}
                onChange={e => setUploadPool(e.target.value)}
                disabled={maxLevel < 50}
                className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none"
              >
                {availablePools.map(p => (
                  <option key={p} value={p}>{p === "central" ? "Central Pool" : p === "department" ? "Department Pool" : "Personal Pool"}</option>
                ))}
              </select>
              {maxLevel < 50 && <p className="text-[10px] text-tu-text-muted mt-1">ผู้ใช้ทั่วไปอัปโหลดได้เฉพาะ Personal Pool</p>}
            </div>

            {/* Drag & drop area */}
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                dragOver ? "border-tu-primary bg-tu-primary-soft" : "border-tu-border hover:border-tu-primary/50 hover:bg-tu-bg/50",
                uploadFile ? "border-tu-success bg-tu-success/5" : ""
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) setUploadFile(file);
              }}
            >
              {uploadFile ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText size={32} className="text-tu-success" />
                  <span className="text-sm font-medium text-tu-text-primary">{uploadFile.name}</span>
                  <span className="text-xs text-tu-text-muted">{(uploadFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={32} className="text-tu-text-muted" />
                  <span className="text-sm text-tu-text-secondary">คลิกหรือลากไฟล์มาวางที่นี่</span>
                  <span className="text-xs text-tu-text-muted">PDF, XLSX, PPTX, DOCX, PNG, JPG</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.xlsx,.pptx,.docx,.png,.jpg"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) setUploadFile(f); }}
            />

            <div className="flex gap-2 mt-5 justify-end">
              <button onClick={() => { setUploadModal(false); setUploadFile(null); }} disabled={uploading}
                className="rounded-[--radius-btn] border border-tu-border px-4 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">
                ยกเลิก
              </button>
              <button onClick={handleUploadSubmit} disabled={!uploadFile || uploading}
                className="rounded-[--radius-btn] bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {uploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
