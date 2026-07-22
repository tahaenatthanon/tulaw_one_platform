"use client";

import { useState } from "react";
import { Download, FileText, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExportLogsPage() {
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "", eventType: "", user: "", ip: "" });

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-xl font-semibold text-tu-text-primary">ส่งออกบันทึก</h1><p className="text-tu-text-muted text-sm mt-1">ส่งออกข้อมูลในรูปแบบ CSV พร้อมตัวกรอง</p></div>

      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-tu-text-primary flex items-center gap-2"><Filter size={16} className="text-tu-primary" />ตัวกรอง</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "วันที่เริ่มต้น", key: "dateFrom", type: "date" },
            { label: "วันที่สิ้นสุด", key: "dateTo", type: "date" },
            { label: "ประเภทเหตุการณ์", key: "eventType", type: "select", options: ["", "AD_SYNC", "CONFIG_UPDATE", "DOC_DELETE", "DOC_DOWNLOAD", "DOC_UPLOAD", "PROJECT_APPROVE", "ROLE_CREATE", "USER_LOGIN", "USER_LOGIN_FAILED"], labels: ["ทั้งหมด", "ซิงค์ AD", "แก้ไขตั้งค่า", "ลบเอกสาร", "ดาวน์โหลดเอกสาร", "อัปโหลดเอกสาร", "อนุมัติโครงการ", "สร้างบทบาท", "เข้าสู่ระบบ", "เข้าสู่ระบบล้มเหลว"] },
            { label: "ชื่อผู้ใช้", key: "user", type: "text", placeholder: "ค้นหาผู้ใช้..." },
            { label: "IP Address", key: "ip", type: "text", placeholder: "เช่น 192.168.1.1" },
          ].map((f) => (
            <div key={f.key}><label className="block text-xs font-medium text-tu-text-secondary mb-1">{f.label}</label>
              {f.type === "select" ? (
                <select value={(filters as Record<string, string>)[f.key]} onChange={(e) => setFilters({ ...filters, [f.key]: e.target.value })} className="w-full rounded-[--radius-input] border border-tu-border px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none">
                  {f.options!.map((opt, i) => <option key={opt} value={opt}>{(f as { labels: string[] }).labels?.[i] ?? opt}</option>)}
                </select>
              ) : (
                <input type={f.type} value={(filters as Record<string, string>)[f.key]} onChange={(e) => setFilters({ ...filters, [f.key]: e.target.value })} placeholder={(f as { placeholder?: string }).placeholder} className="w-full rounded-[--radius-input] border border-tu-border px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" />
              )}
            </div>
          ))}
        </div>
        <Button className="gap-2"><Download size={16} />ดาวน์โหลด CSV (ตามตัวกรอง)</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["บันทึกกิจกรรม", "ประวัติการเข้าสู่ระบบ"].map((t) => (
          <div key={t} className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5">
            <div className="flex items-center gap-3 mb-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tu-primary-soft"><FileText size={20} className="text-tu-primary" /></div><div><h3 className="text-sm font-semibold text-tu-text-primary">{t}</h3><p className="text-xs text-tu-text-muted">CSV</p></div></div>
            <Button variant="outline" className="w-full gap-2"><Download size={16} />ดาวน์โหลด</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
