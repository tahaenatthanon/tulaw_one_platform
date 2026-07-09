"use client";

import { useState } from "react";
import { FolderOpen, Upload, Search, FileText, Download, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHasPermission } from "@/hooks/use-permission";

const QUOTA_GB = 5;
const USED_GB = 2.1;

const mockDocs = [
  { id: "1", title: "ระเบียบการลงทะเบียนเรียน 2568", pool: "central", department: "ฝ่ายวิชาการ", uploadedBy: "สมชาย", date: "2025-07-05", size: "2.4 MB", type: "PDF" },
  { id: "2", title: "คู่มืออาจารย์ที่ปรึกษา", pool: "dept", department: "ฝ่ายวิชาการ", uploadedBy: "สมศรี", date: "2025-07-03", size: "1.1 MB", type: "DOCX" },
  { id: "3", title: "รายงานการประชุม มิ.ย. 68", pool: "dept", department: "สำนักงานคณะ", uploadedBy: "ผู้ดูแล", date: "2025-07-01", size: "0.8 MB", type: "XLSX" },
  { id: "4", title: "บันทึกส่วนตัว", pool: "personal", department: "-", uploadedBy: "ผู้ดูแล", date: "2025-06-28", size: "0.3 MB", type: "PDF" },
  { id: "5", title: "แผนปฏิบัติการประจำปี 2568", pool: "central", department: "สำนักงานคณะ", uploadedBy: "วิชัย", date: "2025-06-20", size: "3.2 MB", type: "PPTX" },
];

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [pool, setPool] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const canUpload = useHasPermission("DOCUMENTS_UPLOAD");

  const filtered = mockDocs.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()) && (!pool || d.pool === pool));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg"];
    if (!allowed.includes(file.type)) { alert("เฉพาะ PDF, XLSX, PPTX, DOCX, PNG, JPG เท่านั้น"); return; }
    setUploading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setUploading(false);
    alert(`อัปโหลด "${file.name}" สำเร็จ`);
    e.target.value = "";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-tu-text-primary">เอกสาร</h1>
          <p className="text-tu-text-muted text-sm mt-1">ระบบจัดการเอกสาร 3 ระดับ · รองรับ PDF, XLSX, PPTX, DOCX, PNG, JPG</p>
        </div>
        {canUpload && (
          <label className="inline-flex items-center gap-2 rounded-[--radius-btn] bg-tu-primary px-4 py-2.5 text-sm font-medium text-tu-text-inverse hover:bg-tu-primary-hover transition-colors cursor-pointer">
            <Upload size={18} />{uploading ? "กำลังอัปโหลด..." : "อัปโหลดเอกสาร"}
            <input type="file" accept=".pdf,.xlsx,.pptx,.docx,.png,.jpg" onChange={handleUpload} className="hidden" />
          </label>
        )}
      </div>

      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tu-primary-soft"><HardDrive size={20} className="text-tu-primary" /></div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-tu-text-primary">พื้นที่เก็บข้อมูล</span>
              <span className="text-xs text-tu-text-muted">{USED_GB} GB / {QUOTA_GB} GB</span>
            </div>
            <div className="h-3 rounded-full bg-tu-bg overflow-hidden">
              <div className="h-full rounded-full bg-tu-primary transition-all" style={{ width: `${(USED_GB / QUOTA_GB) * 100}%` }} />
            </div>
          </div>
          <Badge variant={USED_GB / QUOTA_GB > 0.8 ? "destructive" : "success"}>{Math.round((USED_GB / QUOTA_GB) * 100)}%</Badge>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาเอกสาร..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface pl-9 pr-4 py-2.5 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none transition" />
        </div>
        <div className="flex gap-2">
          {[{ v: null, l: "ทั้งหมด" }, { v: "central", l: "คลังกลาง" }, { v: "dept", l: "หน่วยงาน" }, { v: "personal", l: "ส่วนตัว" }].map((f) => (
            <button key={f.l} onClick={() => setPool(f.v)} className={cn("rounded-full px-3 py-1.5 text-xs font-medium transition-colors", pool === f.v ? "bg-tu-primary text-white" : "bg-tu-surface border border-tu-border text-tu-text-secondary hover:bg-tu-surface-hover")}>{f.l}</button>
          ))}
        </div>
      </div>

      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-tu-bg border-b border-tu-border text-left"><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">ชื่อเอกสาร</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden sm:table-cell">ประเภท</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden md:table-cell">ผู้อัปโหลด</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden lg:table-cell">วันที่</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">ขนาด</th><th className="px-4 py-3"></th></tr></thead>
          <tbody className="divide-y divide-tu-border">
            {filtered.map((doc) => (
              <tr key={doc.id} className="hover:bg-tu-surface-hover transition-colors">
                <td className="px-4 py-3"><div className="flex items-center gap-2"><FileText size={16} className="text-tu-text-muted shrink-0" /><span className="text-sm font-medium text-tu-text-primary">{doc.title}</span></div></td>
                <td className="px-4 py-3 hidden sm:table-cell"><Badge variant="outline" className="text-[10px]">{doc.type}</Badge></td>
                <td className="px-4 py-3 text-sm text-tu-text-secondary hidden md:table-cell">{doc.uploadedBy}</td>
                <td className="px-4 py-3 text-sm text-tu-text-muted hidden lg:table-cell">{doc.date}</td>
                <td className="px-4 py-3 text-sm text-tu-text-secondary">{doc.size}</td>
                <td className="px-4 py-3 text-right"><Button variant="ghost" size="icon" title="ดาวน์โหลด"><Download size={16} /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
