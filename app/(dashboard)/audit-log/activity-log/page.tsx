"use client";

import { useState, useMemo, useEffect } from "react";
import { useUrlState } from "@/hooks/use-url-state";
import { Search, Shield, Lock, Download, Filter, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useHasPermission } from "@/hooks/use-permission";

/* ==============================================================================
   Types
   ============================================================================== */

const EVENT_TYPES = [
  "DOC_UPLOAD", "CONFIG_UPDATE", "PROJECT_APPROVE", "AD_SYNC",
  "USER_LOGIN", "USER_LOGIN_FAILED", "DASHBOARD_VIEW", "ROLE_CREATE",
  "DOC_DOWNLOAD", "PERMISSION_CHANGE",
] as const;
type EventType = (typeof EVENT_TYPES)[number];

interface AuditEntry {
  id: string; timestamp: string; user: string; eventType: EventType;
  detail: string; ip: string; role: string;
}

/* ==============================================================================
   Event type config
   ============================================================================== */

const EVENT_META: Record<EventType, { label: string; color: string; bg: string }> = {
  DOC_UPLOAD: { label: "DOC_UPLOAD", color: "text-tu-info", bg: "bg-tu-info/10" },
  CONFIG_UPDATE: { label: "CONFIG_UPDATE", color: "text-tu-warning", bg: "bg-tu-warning/10" },
  PROJECT_APPROVE: { label: "PROJECT_APPROVE", color: "text-tu-success", bg: "bg-tu-success/10" },
  AD_SYNC: { label: "AD_SYNC", color: "text-tu-info", bg: "bg-tu-info/10" },
  USER_LOGIN: { label: "USER_LOGIN", color: "text-tu-success", bg: "bg-tu-success/10" },
  USER_LOGIN_FAILED: { label: "USER_LOGIN_FAILED", color: "text-tu-error", bg: "bg-tu-error/10" },
  DASHBOARD_VIEW: { label: "DASHBOARD_VIEW", color: "text-tu-text-muted", bg: "bg-tu-bg" },
  ROLE_CREATE: { label: "ROLE_CREATE", color: "text-tu-primary", bg: "bg-tu-primary-soft" },
  DOC_DOWNLOAD: { label: "DOC_DOWNLOAD", color: "text-tu-info", bg: "bg-tu-info/10" },
  PERMISSION_CHANGE: { label: "PERMISSION_CHANGE", color: "text-tu-secondary-active", bg: "bg-tu-secondary-soft" },
};

/* ==============================================================================
   Mock Data
   ============================================================================== */

const USERS = [
  { name: "ผู้ดูแล ระบบ", role: "Super Admin" },
  { name: "สมชาย ใจดี", role: "System Admin" },
  { name: "สมศรี รักเรียน", role: "Dean" },
  { name: "วิชัย มั่นคง", role: "Dept Admin" },
  { name: "นภา สดใส", role: "User" },
  { name: "ธนา ปัญญา", role: "Viewer" },
  { name: "พิมพ์ใจ นิติศาสตร์", role: "Dept Admin" },
  { name: "สมหมาย แก้วดี", role: "User" },
];

const DETAILS: Record<EventType, string[]> = {
  DOC_UPLOAD: ["อัปโหลด ระเบียบการลงทะเบียน 2568.pdf", "อัปโหลด คู่มืออาจารย์.docx", "อัปโหลด รายงานการประชุม.xlsx", "อัปโหลด แผนปฏิบัติการ.pptx"],
  CONFIG_UPDATE: ["เปลี่ยนค่า Session Timeout เป็น 30 นาที", "อัปเดต MFA บังคับสำหรับ Admin+", "ปรับ JWT Expiry เป็น 24 ชั่วโมง", "เปลี่ยน System Branding โลโก้ใหม่"],
  PROJECT_APPROVE: ["อนุมัติโครงการ พัฒนาระบบฐานข้อมูลกฎหมาย", "อนุมัติโครงการ สัมมนากฎหมายระหว่างประเทศ", "อนุมัติโครงการ จัดทำรายงานประจำปี 2568"],
  AD_SYNC: ["ซิงค์ AD สำเร็จ — 250 users", "ซิงค์ AD สำเร็จ — 248 users", "ซิงค์ AD — เพิ่ม 2 users ใหม่"],
  USER_LOGIN: ["เข้าสู่ระบบสำเร็จ", "เข้าสู่ระบบผ่าน SSO", "เข้าสู่ระบบผ่าน Credentials"],
  USER_LOGIN_FAILED: ["รหัสผ่านไม่ถูกต้อง", "บัญชีถูกล็อค", "MFA ไม่ผ่าน"],
  DASHBOARD_VIEW: ["ดู Dashboard Overview", "ดู Dashboard การจองห้องประชุม", "ดู Dashboard แยกรายฝ่าย"],
  ROLE_CREATE: ["สร้างบทบาท Dept Admin ให้ วิชัย มั่นคง", "สร้างบทบาท User ให้ นภา สดใส", "สร้างบทบาท Viewer ให้ ธนา ปัญญา"],
  DOC_DOWNLOAD: ["ดาวน์โหลด ระเบียบการลงทะเบียน.pdf", "ดาวน์โหลด คู่มืออาจารย์.docx", "ดาวน์โหลด แผนปฏิบัติการ.pptx"],
  PERMISSION_CHANGE: ["เพิ่มสิทธิ์ DOCUMENTS_UPLOAD", "ลบสิทธิ์ PROJECTS_APPROVE", "เปลี่ยนสิทธิ์ BOOK_MEETING_VIEW"],
};

const IPS = ["10.0.0.1", "10.0.0.55", "192.168.1.100", "172.16.0.23", "10.0.0.88", "192.168.1.50", "10.0.0.12", "172.16.0.45"];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const generateLogs = (count: number): AuditEntry[] => {
  const logs: AuditEntry[] = [];
  const base = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(base); d.setMinutes(d.getMinutes() - i * 12);
    const eventType = EVENT_TYPES[i % EVENT_TYPES.length];
    const u = USERS[i % USERS.length];
    logs.push({
      id: String(i + 1),
      timestamp: d.toISOString().slice(0, 10) + " " + d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      user: u.name, eventType, detail: rand(DETAILS[eventType]), ip: rand(IPS), role: u.role,
    });
  }
  return logs;
};

const MOCK_LOGS = generateLogs(120);
const PAGE_SIZE = 20;

/* ==============================================================================
   Pagination Helpers
   ============================================================================== */

function getPageNumbers(page: number, totalPages: number): number[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, -1, totalPages];
  if (page >= totalPages - 3) return [1, -1, ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)];
  return [1, -1, page - 1, page, page + 1, -1, totalPages];
}

/* ==============================================================================
   Main Page
   ============================================================================== */

export default function ActivityLogPage() {
  const [search, setSearch] = useUrlState("search", "");
  const [typeFilter, setTypeFilter] = useUrlState("action", "");
  const [userFilter, setUserFilter] = useUrlState("user", "");
  const [ipFilter, setIpFilter] = useUrlState("ip", "");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const canExport = useHasPermission("AUDIT_LOG_EXPORT");

  const filtered = useMemo(() => MOCK_LOGS.filter(l => {
    if (search && !l.user.includes(search) && !l.detail.toLowerCase().includes(search.toLowerCase()) && !l.eventType.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && l.eventType !== typeFilter) return false;
    if (userFilter && l.user !== userFilter) return false;
    if (ipFilter && l.ip !== ipFilter) return false;
    if (dateFrom && l.timestamp.slice(0, 10) < dateFrom) return false;
    if (dateTo && l.timestamp.slice(0, 10) > dateTo) return false;
    return true;
  }), [search, typeFilter, userFilter, ipFilter, dateFrom, dateTo]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, typeFilter, userFilter, ipFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExportCSV = () => {
    const headers = ["Timestamp", "User", "EventType", "Detail", "IP", "Role"];
    const rows = filtered.map(l => [l.timestamp, l.user, l.eventType, `"${l.detail}"`, l.ip, l.role].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "audit-log-export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-xl font-semibold text-tu-text-primary">Audit Log</h1><p className="text-tu-text-muted text-sm mt-1">บันทึกทั้งหมด — {filtered.length} รายการ</p></div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="gap-1.5 h-8"><Lock size={12} />Immutable</Badge>
          {canExport && <button onClick={handleExportCSV} className="flex items-center gap-1.5 rounded-[--radius-btn] border border-tu-border px-3 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors"><Download size={16} />Export CSV</button>}
        </div>
      </div>

      <div className="flex items-center gap-3 bg-tu-error/5 border border-tu-error/10 rounded-[--radius-card] p-4 text-sm">
        <Shield size={20} className="text-tu-error shrink-0" />
        <div><p className="font-semibold text-tu-text-primary">Immutable Audit Log</p><p className="text-tu-text-muted text-xs">ข้อมูลทั้งหมดถูกบันทึกแบบ Append-Only — ไม่สามารถแก้ไข ลบ หรือเปลี่ยนแปลงได้ ไม่ว่าจะเป็นผู้ใช้ระดับใดรวมถึง Super Admin บันทึกนี้เก็บไว้ไม่น้อยกว่า 1 ปี</p></div>
      </div>

      {/* Filters */}
      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-tu-text-secondary"><Filter size={14} />ตัวกรอง</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div><label className="block text-[10px] font-medium text-tu-text-muted mb-1">วันที่เริ่ม</label><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-xs outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div>
          <div><label className="block text-[10px] font-medium text-tu-text-muted mb-1">วันที่สิ้นสุด</label><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-xs outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div>
          <div><label className="block text-[10px] font-medium text-tu-text-muted mb-1">ประเภทเหตุการณ์</label><select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-xs outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20"><option value="">ทั้งหมด</option>{EVENT_TYPES.map(t => <option key={t} value={t}>{EVENT_META[t].label}</option>)}</select></div>
          <div><label className="block text-[10px] font-medium text-tu-text-muted mb-1">IP Address</label><input type="text" value={ipFilter} onChange={e => setIpFilter(e.target.value)} placeholder="เช่น 10.0.0.55" className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-xs outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="block text-[10px] font-medium text-tu-text-muted mb-1">ผู้ใช้</label><input type="text" value={userFilter} onChange={e => setUserFilter(e.target.value)} placeholder="ค้นหาผู้ใช้..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-xs outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div>
          <div className="relative"><label className="block text-[10px] font-medium text-tu-text-muted mb-1">ค้นหา</label><Search size={14} className="absolute left-3 top-[30px] text-tu-text-muted" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาทุกอย่าง..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface pl-8 pr-3 py-2 text-xs outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border overflow-auto">
        <table className="w-full min-w-[750px]">
          <thead><tr className="bg-tu-bg border-b border-tu-border text-left"><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">Timestamp</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">ผู้ใช้</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">ประเภท</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">รายละเอียด</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden md:table-cell">IP Address</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden lg:table-cell">บทบาท</th></tr></thead>
          <tbody className="divide-y divide-tu-border">
            {paged.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-tu-text-muted"><Shield size={40} className="mx-auto mb-3 opacity-20" /><p>ไม่พบบันทึก</p></td></tr>
            ) : paged.map(log => {
              const meta = EVENT_META[log.eventType];
              return (
                <tr key={log.id} className="hover:bg-tu-surface-hover transition-colors">
                  <td className="px-4 py-3 text-xs text-tu-text-muted whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-4 py-3 text-sm font-medium text-tu-text-primary">{log.user}</td>
                  <td className="px-4 py-3"><span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium", meta.bg, meta.color)}>{meta.label}</span></td>
                  <td className="px-4 py-3 text-sm text-tu-text-secondary max-w-[250px] truncate">{log.detail}</td>
                  <td className="px-4 py-3 text-xs text-tu-text-muted font-mono hidden md:table-cell">{log.ip}</td>
                  <td className="px-4 py-3 text-xs text-tu-text-muted hidden lg:table-cell">{log.role}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-tu-text-muted">
            แสดง {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} จาก {filtered.length} รายการ
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="p-1.5 rounded-md text-tu-text-muted hover:bg-tu-surface-hover disabled:opacity-30"><ChevronLeft size={16} /></button>
            {getPageNumbers(page, totalPages).map((n, i) =>
              n === -1 ? <span key={`e${i}`} className="px-1 text-tu-text-muted">…</span> :
              <button key={n} onClick={() => setPage(n)} className={cn("px-2.5 py-1 rounded text-xs font-medium transition-colors", n === page ? "bg-tu-primary text-white" : "text-tu-text-secondary hover:bg-tu-surface-hover")}>{n}</button>
            )}
            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="p-1.5 rounded-md text-tu-text-muted hover:bg-tu-surface-hover disabled:opacity-30"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
