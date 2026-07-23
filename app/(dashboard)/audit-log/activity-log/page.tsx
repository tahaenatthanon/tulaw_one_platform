"use client";

import { useState, useEffect, useMemo, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search, Shield, Lock, Download, ChevronLeft, ChevronRight, Eye,
  Copy, Check, X, User, Monitor, Globe, Server, Info, FileText,
  MoreHorizontal, ChevronDown, SlidersHorizontal, RefreshCw, Inbox,
  ArrowUpDown, Fingerprint, Clock, Building2, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHasPermission } from "@/hooks/use-permission";
import { JsonHighlight } from "@/components/shared/json-highlight";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar, getAvatarColor } from "@/components/shared/user-avatar";

/* ==============================================================================
   Types & Constants (preserved from original)
   ============================================================================== */

const EVENT_TYPES = [
  "ACCOUNT_UNLOCK", "AD_SYNC", "ANNOUNCEMENT_CREATED", "ANNOUNCEMENT_DELETE",
  "ANNOUNCEMENT_UPDATE", "API_KEY_CREATE", "API_KEY_DELETE",
  "API_KEY_DISABLE", "API_KEY_ROTATE", "AUDIT_EXPORT",
  "BOOKING_CANCEL", "BOOKING_CREATE",
  "BULK_ASSIGN-ROLE", "BULK_DISABLE", "BULK_ENABLE",
  "BULK_RESET_MFA", "BULK_UNLOCK",
  "CONFIG_UPDATE", "CSV_EXPORT", "CSV_IMPORT",
  "DASHBOARD_VIEW", "DOC_DELETE", "DOC_DOWNLOAD", "DOC_UPLOAD",
  "EOFFICE_APPROVE", "EOFFICE_CREATE", "EOFFICE_REJECT",
  "MFA_RESET", "PASSWORD_RESET", "PERMISSION_CHANGE",
  "PROJECT_APPROVE", "PROJECT_CREATE", "PROJECT_DELETE",
  "PROJECT_REJECT", "PROJECT_UPDATE",
  "ROLE_ASSIGN", "ROLE_CREATE",
  "ROOM_CREATE", "ROOM_DELETE", "ROOM_UPDATE",
  "TYPE_UPDATE",
  "USER_CREATE", "USER_DELETE", "USER_LOGIN", "USER_LOGIN_FAILED",
  "USER_LOGOUT", "USER_UPDATE",
];

const DEPARTMENTS = ["สำนักงานเลขานุการ", "งานบริการการศึกษา", "งานวิจัยและวิเทศสัมพันธ์", "งานเทคโนโลยีสารสนเทศ"];

interface AuditEntry {
  id: string;
  createdAt: string;
  module: string;
  action: string;
  ipAddress: string | null;
  isSuccess: boolean;
  oldValue: string | null;
  newValue: string | null;
  user: { email: string; firstNameTh: string; lastNameTh: string } | null;
}

interface ApiMeta { total: number; page: number; limit: number; }

/* ==============================================================================
   Event type config
   ============================================================================== */

const EVENT_META: Record<string, { label: string; color: string; bg: string }> = {
  DOC_UPLOAD: { label: "DOC_UPLOAD", color: "text-tu-info", bg: "bg-tu-info/10" },
  CONFIG_UPDATE: { label: "CONFIG_UPDATE", color: "text-tu-warning", bg: "bg-tu-warning/10" },
  PROJECT_APPROVE: { label: "PROJECT_APPROVE", color: "text-tu-success", bg: "bg-tu-success/10" },
  AD_SYNC: { label: "AD_SYNC", color: "text-tu-info", bg: "bg-tu-info/10" },
  USER_LOGIN: { label: "USER_LOGIN", color: "text-tu-success", bg: "bg-tu-success/10" },
  USER_LOGIN_FAILED: { label: "USER_LOGIN_FAILED", color: "text-tu-error", bg: "bg-tu-error/10" },
  DASHBOARD_VIEW: { label: "DASHBOARD_VIEW", color: "text-tu-text-muted", bg: "bg-tu-bg" },
  ROLE_CREATE: { label: "ROLE_CREATE", color: "text-tu-primary", bg: "bg-tu-primary-soft" },
  ROOM_CREATE: { label: "ROOM_CREATE", color: "text-tu-success", bg: "bg-tu-success/10" },
  ROOM_DELETE: { label: "ROOM_DELETE", color: "text-tu-error", bg: "bg-tu-error/10" },
  ROOM_UPDATE: { label: "ROOM_UPDATE", color: "text-tu-warning", bg: "bg-tu-warning/10" },
  TYPE_UPDATE: { label: "TYPE_UPDATE", color: "text-tu-info", bg: "bg-tu-info/10" },
  DOC_DOWNLOAD: { label: "DOC_DOWNLOAD", color: "text-tu-info", bg: "bg-tu-info/10" },
  PERMISSION_CHANGE: { label: "PERMISSION_CHANGE", color: "text-tu-secondary-active", bg: "bg-tu-secondary-soft" },
  USER_CREATE: { label: "USER_CREATE", color: "text-tu-success", bg: "bg-tu-success/10" },
  USER_UPDATE: { label: "USER_UPDATE", color: "text-tu-warning", bg: "bg-tu-warning/10" },
  USER_DELETE: { label: "USER_DELETE", color: "text-tu-error", bg: "bg-tu-error/10" },
  "BULK_ASSIGN-ROLE": { label: "BULK_ASSIGN_ROLE", color: "text-tu-primary", bg: "bg-tu-primary-soft" },
  BULK_ENABLE: { label: "BULK_ENABLE", color: "text-tu-success", bg: "bg-tu-success/10" },
  BULK_DISABLE: { label: "BULK_DISABLE", color: "text-tu-error", bg: "bg-tu-error/10" },
  USER_LOGOUT: { label: "USER_LOGOUT", color: "text-tu-text-muted", bg: "bg-tu-bg" },
  PROJECT_CREATE: { label: "PROJECT_CREATE", color: "text-tu-success", bg: "bg-tu-success/10" },
  PROJECT_UPDATE: { label: "PROJECT_UPDATE", color: "text-tu-warning", bg: "bg-tu-warning/10" },
  PROJECT_DELETE: { label: "PROJECT_DELETE", color: "text-tu-error", bg: "bg-tu-error/10" },
  PROJECT_REJECT: { label: "PROJECT_REJECT", color: "text-tu-error", bg: "bg-tu-error/10" },
  CSV_IMPORT: { label: "CSV_IMPORT", color: "text-tu-info", bg: "bg-tu-info/10" },
  CSV_EXPORT: { label: "CSV_EXPORT", color: "text-tu-info", bg: "bg-tu-info/10" },
  AUDIT_EXPORT: { label: "AUDIT_EXPORT", color: "text-tu-info", bg: "bg-tu-info/10" },
  ROLE_ASSIGN: { label: "ROLE_ASSIGN", color: "text-tu-primary", bg: "bg-tu-primary-soft" },
  MFA_RESET: { label: "MFA_RESET", color: "text-tu-warning", bg: "bg-tu-warning/10" },
  ACCOUNT_UNLOCK: { label: "ACCOUNT_UNLOCK", color: "text-tu-info", bg: "bg-tu-info/10" },
  ANNOUNCEMENT_CREATED: { label: "ANNOUNCEMENT_CREATED", color: "text-tu-success", bg: "bg-tu-success/10" },
  ANNOUNCEMENT_DELETE: { label: "ANNOUNCEMENT_DELETE", color: "text-tu-error", bg: "bg-tu-error/10" },
  ANNOUNCEMENT_UPDATE: { label: "ANNOUNCEMENT_UPDATE", color: "text-tu-warning", bg: "bg-tu-warning/10" },
  PASSWORD_RESET: { label: "PASSWORD_RESET", color: "text-tu-warning", bg: "bg-tu-warning/10" },
  API_KEY_CREATE: { label: "API_KEY_CREATE", color: "text-tu-success", bg: "bg-tu-success/10" },
  API_KEY_ROTATE: { label: "API_KEY_ROTATE", color: "text-tu-warning", bg: "bg-tu-warning/10" },
  API_KEY_DISABLE: { label: "API_KEY_DISABLE", color: "text-tu-error", bg: "bg-tu-error/10" },
  API_KEY_DELETE: { label: "API_KEY_DELETE", color: "text-tu-error", bg: "bg-tu-error/10" },
  BULK_UNLOCK: { label: "BULK_UNLOCK", color: "text-tu-info", bg: "bg-tu-info/10" },
  BULK_RESET_MFA: { label: "BULK_RESET_MFA", color: "text-tu-warning", bg: "bg-tu-warning/10" },
  DOC_DELETE: { label: "DOC_DELETE", color: "text-tu-error", bg: "bg-tu-error/10" },
  EOFFICE_CREATE: { label: "EOFFICE_CREATE", color: "text-tu-success", bg: "bg-tu-success/10" },
  EOFFICE_APPROVE: { label: "EOFFICE_APPROVE", color: "text-tu-success", bg: "bg-tu-success/10" },
  EOFFICE_REJECT: { label: "EOFFICE_REJECT", color: "text-tu-error", bg: "bg-tu-error/10" },
  BOOKING_CREATE: { label: "BOOKING_CREATE", color: "text-tu-success", bg: "bg-tu-success/10" },
  BOOKING_CANCEL: { label: "BOOKING_CANCEL", color: "text-tu-error", bg: "bg-tu-error/10" },
};

const MODULES = ["users", "settings", "projects", "documents", "auth", "dashboard", "eoffice", "erp"];

/* ==============================================================================
   UI Components
   ============================================================================== */

function ActionBadge({ action }: { action: string }) {
  const isDelete = action.endsWith("DELETE");
  const isFailed = action.endsWith("FAILED");
  const isReject = action.endsWith("REJECT");
  const isCreate = action.endsWith("CREATE");
  const isApprove = action.endsWith("APPROVE");
  const isLogin = action === "USER_LOGIN";
  const isUpdate = action.endsWith("UPDATE") || action.endsWith("CHANGE");

  const tone =
    isDelete || isFailed || isReject
      ? "border-[var(--tu-error)]/20 bg-[var(--tu-error)]/5 text-[var(--tu-error)]"
      : isCreate || isApprove || isLogin
      ? "border-[var(--tu-success)]/20 bg-[var(--tu-success)]/5 text-[var(--tu-success)]"
      : isUpdate
      ? "border-[var(--tu-warning)]/20 bg-[var(--tu-warning)]/5 text-[var(--tu-warning)]"
      : "border-[var(--tu-info)]/20 bg-[var(--tu-info)]/5 text-[var(--tu-info)]";

  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold tracking-tight", tone)}>
      {action}
    </span>
  );
}

function getUserName(u: AuditEntry["user"]) {
  if (!u) return "-";
  return u.firstNameTh + " " + u.lastNameTh;
}

function getUserEmail(u: AuditEntry["user"]) {
  if (!u) return "";
  return u.email;
}

function relTime(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "เมื่อสักครู่";
  if (s < 3600) return `${Math.floor(s / 60)} นาทีที่แล้ว`;
  if (s < 86400) return `${Math.floor(s / 3600)} ชั่วโมงที่แล้ว`;
  return `${Math.floor(s / 86400)} วันที่แล้ว`;
}

/* ==============================================================================
   Audit Detail Types (preserved)
   ============================================================================== */

interface AuditDetail {
  general: {
    logId: string; timestamp: string; eventType: string; module: string; action: string; status: string;
  };
  user: {
    userId: string; name: string; email: string; role: string; roleCode: string; department: string;
  };
  targetResource: {
    objectType: string; recordId: string;
  };
  changeHistory: {
    beforeValue: string | null; afterValue: string | null; hasChanges: boolean;
  };
  requestInfo: {
    ipAddress: string; userAgent: string; browser: string; operatingSystem: string;
    device: string; sessionId: string; requestId: string; apiEndpoint: string; httpMethod: string;
  };
  additionalInfo: {
    errorMessage: string | null; authMethod: string; duration: number | null;
    correlationId: string; statusCode: number | string;
  };
}

/* ==============================================================================
   Skeleton / Empty State
   ============================================================================== */

function SkeletonRows({ n = 8 }: { n?: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <tr key={i} className="border-t border-[var(--tu-border)]">
          {Array.from({ length: 7 }).map((__, j) => (
            <td key={j} className="px-4 py-4">
              <div className="h-3 animate-pulse rounded bg-slate-100" style={{ width: `${40 + ((i * 7 + j * 11) % 55)}%` }} />
            </td>
          ))}
          <td className="px-4 py-4">
            <div className="ml-auto h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
          </td>
        </tr>
      ))}
    </>
  );
}

function EmptyState({ kind, onReset }: { kind: "empty" | "no-results"; onReset?: () => void }) {
  const isEmpty = kind === "empty";
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--tu-primary-soft)] text-[var(--tu-primary)]">
        {isEmpty ? <Inbox size={26} /> : <Search size={26} />}
      </div>
      <h3 className="mt-4 text-base font-semibold text-[var(--tu-text-primary)]">
        {isEmpty ? "ยังไม่มี Audit Log" : "ไม่พบผลการค้นหา"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-[var(--tu-text-muted)]">
        {isEmpty
          ? "เมื่อมีผู้ใช้งานทำกิจกรรมในระบบ รายการจะแสดงที่นี่โดยอัตโนมัติ"
          : "ลองปรับคำค้นหาหรือรีเซ็ตตัวกรองเพื่อดูผลลัพธ์อื่น ๆ"}
      </p>
      {!isEmpty && onReset && (
        <button onClick={onReset} className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--tu-primary)] px-3 text-sm font-medium text-white">
          <RefreshCw size={14} /> รีเซ็ตตัวกรอง
        </button>
      )}
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setOk(true); setTimeout(() => setOk(false), 1000); }}
      className="rounded-md p-1 text-[var(--tu-text-muted)] hover:text-[var(--tu-primary)]"
      title="คัดลอก"
    >
      {ok ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

/* ==============================================================================
   Row Actions (More Menu)
   ============================================================================== */

function RowActions({ row, onView, onCopy, onExport }: {
  row: AuditEntry; onView: () => void; onCopy: () => void; onExport: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function handleToggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.right - 208 });
    }
    setOpen((v) => !v);
  }

  return (
    <>
      <button ref={btnRef} type="button" onClick={handleToggle} className="grid h-8 w-8 place-items-center rounded-lg text-[var(--tu-text-muted)] hover:bg-[var(--tu-primary-soft)] hover:text-[var(--tu-primary)] transition-colors" title="More">
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div ref={menuRef} className="fixed z-50 w-52 overflow-hidden rounded-xl border border-[var(--tu-border)] bg-white shadow-xl py-1.5"
             style={{ top: pos.top, left: Math.min(pos.left, window.innerWidth - 220) }}>
          <MenuItem icon={<Eye size={14} />} label="ดูรายละเอียด" onClick={() => { setOpen(false); onView(); }} />
          <MenuItem icon={<Copy size={14} />} label="คัดลอก Log ID" onClick={() => { setOpen(false); onCopy(); }} sub={row.id} />
          <MenuItem icon={<Download size={14} />} label="Export รายการนี้" onClick={() => { setOpen(false); onExport(); }} />
        </div>
      )}
    </>
  );
}

function MenuItem({ icon, label, sub, onClick }: { icon: React.ReactNode; label: string; sub?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-[var(--tu-text-primary)] hover:bg-slate-50 transition-colors">
      <span className="text-[var(--tu-text-muted)]">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block leading-tight">{label}</span>
        {sub && <span className="block truncate font-mono text-[10.5px] text-[var(--tu-text-muted)]">{sub}</span>}
      </span>
    </button>
  );
}

/* ==============================================================================
   Sort Header
   ============================================================================== */

function SortHeader({ label, k, sortBy, sortDir, setSort }: {
  label: string; k: string; sortBy: string; sortDir: string;
  setSort: (by: string, dir: string) => void;
}) {
  const active = sortBy === k;
  return (
    <th className="select-none px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--tu-text-muted)]">
      <button
        onClick={() => setSort(k, active && sortDir === "asc" ? "desc" : "asc")}
        className="inline-flex items-center gap-1.5"
      >
        <span className={active ? "text-[var(--tu-primary)]" : ""}>{label}</span>
        {active
          ? <span className="text-[var(--tu-primary)]">{sortDir === "asc" ? "↑" : "↓"}</span>
          : <ArrowUpDown size={12} className="opacity-40" />
        }
      </button>
    </th>
  );
}

/* ==============================================================================
   Detail Drawer
   ============================================================================== */

function DetailDrawer({ detail, detailId, onClose, formatDate }: {
  detail: AuditDetail | null; detailId: string | null; onClose: () => void; formatDate: (d: string) => string;
}) {
  const open = !!detail && !!detailId;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={cn("fixed inset-0 z-40", open ? "pointer-events-auto" : "pointer-events-none")}>
      <div onClick={onClose} className={cn("absolute inset-0 transition-opacity", open ? "opacity-100" : "opacity-0")}
           style={{ background: "rgba(15,17,21,0.35)" }} />
      <aside className={cn(
        "absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col bg-[var(--tu-surface)] shadow-2xl transition-transform",
        open ? "translate-x-0" : "translate-x-full"
      )}>
        {detail && <DrawerBody detail={detail} onClose={onClose} formatDate={formatDate} />}
      </aside>
    </div>
  );
}

function DrawerBody({ detail, onClose, formatDate }: {
  detail: AuditDetail; onClose: () => void; formatDate: (d: string) => string;
}) {
  const statusOk = detail.general.status === "Success";

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[var(--tu-border)] p-5 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ActionBadge action={detail.general.eventType} />
            <span className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
              statusOk ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-rose-200"
            )}>
              <span className={cn("h-1.5 w-1.5 rounded-full", statusOk ? "bg-emerald-600" : "bg-rose-600")} />
              {detail.general.status}
            </span>
          </div>
          <h2 className="mt-2 truncate text-lg font-semibold text-[var(--tu-text-primary)]">
            {detail.targetResource.recordId !== "N/A" ? detail.targetResource.recordId : detail.general.logId}
          </h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--tu-text-muted)]">
            <Fingerprint size={12} /> <span className="font-mono">{detail.general.logId}</span>
            <CopyButton value={detail.general.logId} />
          </p>
        </div>
        <button onClick={onClose} className="rounded-lg p-2 text-[var(--tu-text-muted)] hover:bg-slate-100" title="ปิด">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {/* Timeline */}
        <h3 className="mb-2 mt-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--tu-text-muted)]">
          <Clock size={14} />Timeline
        </h3>
        <ol className="mb-6 space-y-3 border-l border-[var(--tu-border)] pl-4">
          <TLItem color="bg-[var(--tu-info)]" title="Request received" time={detail.general.timestamp} formatDate={formatDate} />
          <TLItem color={statusOk ? "bg-[var(--tu-success)]" : "bg-[var(--tu-error)]"} title={statusOk ? "Executed successfully" : "Execution failed"} time={detail.general.timestamp} formatDate={formatDate} error={detail.additionalInfo.errorMessage} />
          <TLItem color="bg-[var(--tu-text-muted)]" title="Audit persisted (immutable)" time={detail.general.timestamp} formatDate={formatDate} />
        </ol>

        {/* General */}
        <h3 className="mb-2 mt-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--tu-text-muted)]">
          <Info size={14} />ข้อมูลทั่วไป
        </h3>
        <div className="mb-6 divide-y overflow-hidden rounded-xl border border-[var(--tu-border)]">
          <KV label="วันที่/เวลา" value={<span>{formatDate(detail.general.timestamp)} <span className="text-[var(--tu-text-muted)]">· {relTime(detail.general.timestamp)}</span></span>} />
          <KV label="Module" value={<span className="font-mono">{detail.general.module}</span>} />
          <KV label="Action" value={<ActionBadge action={detail.general.eventType} />} />
          <KV label="Resource" value={<span className="font-mono">{detail.targetResource.recordId}</span>} />
          <KV label="Result" value={
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset", statusOk ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-rose-200")}>
              <span className={cn("h-1.5 w-1.5 rounded-full", statusOk ? "bg-emerald-600" : "bg-rose-600")} />
              {detail.general.status}
            </span>} />
          {detail.additionalInfo.errorMessage && (
            <KV label="Error" value={
              <span className="inline-flex items-start gap-1.5 text-[var(--tu-error)]">
                <AlertCircle size={14} className="mt-0.5" />{detail.additionalInfo.errorMessage}
              </span>} />
          )}
        </div>

        {/* User */}
        <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--tu-text-muted)]">
          <User size={14} />ผู้ใช้งาน
        </h3>
        <div className="mb-6 divide-y overflow-hidden rounded-xl border border-[var(--tu-border)]">
          <KV label="ชื่อ" value={detail.user.name} />
          <KV label="อีเมล" value={<span className="font-mono">{detail.user.email}</span>} />
          <KV label="Role" value={detail.user.role} />
          <KV label="Department" value={<span className="inline-flex items-center gap-1.5"><Building2 size={12} className="text-[var(--tu-text-muted)]" />{detail.user.department}</span>} />
        </div>

        {/* Request info */}
        <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--tu-text-muted)]">
          <Server size={14} />ข้อมูลคำขอ
        </h3>
        <div className="mb-6 divide-y overflow-hidden rounded-xl border border-[var(--tu-border)]">
          <KV label="IP Address" value={<span className="font-mono">{detail.requestInfo.ipAddress}</span>} copy />
          <KV label="Browser" value={<span className="inline-flex items-center gap-1.5"><Globe size={12} className="text-[var(--tu-text-muted)]" />{detail.requestInfo.browser}</span>} />
          <KV label="Operating System" value={<span className="inline-flex items-center gap-1.5"><Monitor size={12} className="text-[var(--tu-text-muted)]" />{detail.requestInfo.operatingSystem}</span>} />
          <KV label="Session ID" value={<span className="font-mono">{detail.requestInfo.sessionId}</span>} copy />
          <KV label="Request ID" value={<span className="font-mono">{detail.requestInfo.requestId}</span>} copy />
        </div>

        {/* Before / After */}
        {(detail.changeHistory.beforeValue != null || detail.changeHistory.afterValue != null) && (
          <>
            <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--tu-text-muted)]">
              <FileText size={14} />Before / After Changes
            </h3>
            <div className="mb-6 grid grid-cols-1 gap-3">
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--tu-text-muted)]">Before</p>
                <div className="rounded-xl border border-[var(--tu-border)] bg-slate-50 p-3">
                  {detail.changeHistory.beforeValue != null
                    ? <JsonHighlight data={detail.changeHistory.beforeValue} />
                    : <span className="text-sm text-[var(--tu-text-muted)] italic">No data</span>}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--tu-text-muted)]">After</p>
                <div className="rounded-xl border border-[var(--tu-border)] bg-slate-50 p-3">
                  {detail.changeHistory.afterValue != null
                    ? <JsonHighlight data={detail.changeHistory.afterValue} />
                    : <span className="text-sm text-[var(--tu-text-muted)] italic">No data</span>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function TLItem({ color, title, time, formatDate, error }: {
  color: string; title: string; time: string; formatDate: (d: string) => string; error?: string | null;
}) {
  return (
    <li className="relative">
      <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${color}`} />
      <div className="text-sm font-medium text-[var(--tu-text-primary)]">{title}</div>
      <div className="text-[11px] text-[var(--tu-text-muted)]">{formatDate(time)}</div>
      {error && <div className="mt-1 text-[12px] text-[var(--tu-error)]">{error}</div>}
    </li>
  );
}

function KV({ label, value, copy }: { label: string; value: React.ReactNode; copy?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2.5">
      <div className="text-[12px] text-[var(--tu-text-muted)] shrink-0">{label}</div>
      <div className="flex min-w-0 items-center gap-1.5 text-right text-[13px] text-[var(--tu-text-primary)]">
        <div className="min-w-0 truncate">{value}</div>
        {copy && typeof value === "string" && <CopyButton value={value as string} />}
      </div>
    </div>
  );
}

/* ==============================================================================
   Main Page
   ============================================================================== */

export default function ActivityLogPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--tu-text-muted)]">Loading...</div>}>
      <ActivityLogContent />
    </Suspense>
  );
}

function ActivityLogContent() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("userId") ?? "";

  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("");
  const [userFilter, setUserFilter] = useState(initialUserId);
  const [moduleFilter, setModuleFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AuditDetail | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const limit = 20;
  const canExport = useHasPermission("AUDIT_LOG_EXPORT");

  const activeFilterCount = (dateFrom ? 1 : 0) + (dateTo ? 1 : 0) + (userFilter ? 1 : 0) + (eventType ? 1 : 0) + (moduleFilter ? 1 : 0);

  function resetFilters() {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setUserFilter("");
    setEventType("");
    setModuleFilter("");
  }

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);
      if (eventType) params.set("eventType", eventType);
      if (userFilter) params.set("userId", userFilter);
      if (moduleFilter) params.set("module", moduleFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      params.set("sortBy", sortBy);
      params.set("sortDir", sortDir);

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Error");
      setLogs(json.data as AuditEntry[]);
      setTotal((json.meta as ApiMeta)?.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading audit logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { setPage(1); }, [search, eventType, userFilter, moduleFilter, dateFrom, dateTo]);
  useEffect(() => { fetchLogs(); }, [page, search, eventType, userFilter, moduleFilter, dateFrom, dateTo, sortBy, sortDir]);

  async function viewDetail(id: string) {
    setDetailId(id);
    setDetail(null);
    try {
      const res = await fetch(`/api/audit-logs/${id}`);
      const json = await res.json();
      if (json.success) setDetail(json.data as AuditDetail);
    } catch { setDetail(null); }
  }

  function handleExportSingle(id: string) {
    window.open(`/api/audit-logs?format=csv&search=${id}`, "_blank");
  }

  function handleExport(format: string) {
    const params = new URLSearchParams();
    if (eventType) params.set("eventType", eventType);
    if (userFilter) params.set("userId", userFilter);
    if (moduleFilter) params.set("module", moduleFilter);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    params.set("format", format);
    window.open(`/api/audit-logs?${params.toString()}`, "_blank");
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, -1, totalPages];
    if (page >= totalPages - 3) return [1, -1, ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)];
    return [1, -1, page - 1, page, page + 1, -1, totalPages];
  }, [page, totalPages]);

  function formatDate(d: string) {
    const dt = new Date(d);
    return dt.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" }) + " " +
      dt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function handleSort(k: string, dir: string) {
    setSortBy(k);
    setSortDir(dir);
  }

  return (
    <div className="min-h-screen bg-[var(--tu-bg)]">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        {/* Page header */}
        <header className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <h1 className="mt-2 text-[22px] font-semibold tracking-tight text-[var(--tu-text-primary)] sm:text-[26px]">
              Audit Log
            </h1>
            <p className="mt-1 text-sm text-[var(--tu-text-muted)]">
              บันทึกกิจกรรมทั้งหมดของระบบ · Append-only · ไม่สามารถแก้ไขหรือลบได้
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--tu-primary-soft)] px-3 text-xs font-semibold text-[var(--tu-primary)]">
              <Lock size={12} /> Immutable
            </span>
            {canExport && (
              <>
                <button onClick={() => handleExport("csv")} className="inline-flex items-center gap-2 rounded-lg border border-[var(--tu-border)] bg-[var(--tu-surface)] px-3.5 py-2 text-sm font-medium text-[var(--tu-text-secondary)] shadow-sm hover:bg-[var(--tu-surface-hover)] transition-all">
                  <Download size={16} />CSV
                </button>
                <button onClick={() => handleExport("xlsx")} className="inline-flex items-center gap-2 rounded-lg border border-[var(--tu-border)] bg-[var(--tu-surface)] px-3.5 py-2 text-sm font-medium text-[var(--tu-text-secondary)] shadow-sm hover:bg-[var(--tu-surface-hover)] transition-all">
                  <Download size={16} />Excel
                </button>
              </>
            )}
          </div>
        </header>

        {/* Immutability note */}
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[var(--tu-border)] bg-[var(--tu-surface)] p-3 text-[12.5px] text-[var(--tu-text-secondary)]">
          <Shield size={16} className="text-[var(--tu-primary)] mt-0.5 shrink-0" />
          <span>Audit Log ทั้งหมดเป็นแบบ append-only และไม่สามารถแก้ไขหรือลบได้ แม้กระทั่งสิทธิ์ Super Admin</span>
        </div>

        {/* Search + Filter Bar */}
        <div className="mb-5 rounded-2xl border border-[var(--tu-border)] bg-[var(--tu-surface)] shadow-sm">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tu-text-muted)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาผู้ใช้งาน, Action, Module, Resource หรือ IP Address..."
                className="h-10 w-full rounded-xl border border-[var(--tu-border)] bg-[var(--tu-surface)] pl-9 pr-9 text-sm text-[var(--tu-text-primary)] placeholder:text-[var(--tu-text-muted)] outline-none transition focus:border-[var(--tu-primary)]"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)]" title="ล้างการค้นหา">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition",
                  filterOpen
                    ? "border-[var(--tu-primary)] bg-[var(--tu-surface)] text-[var(--tu-primary)]"
                    : "border-[var(--tu-border)] bg-[var(--tu-surface)] text-[var(--tu-text-secondary)]"
                )}
              >
                <SlidersHorizontal size={16} />
                Advanced Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--tu-primary)] px-1.5 text-[11px] font-semibold text-white">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown size={14} className={cn("transition-transform", filterOpen && "rotate-180")} />
              </button>
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)]">
                  <RefreshCw size={14} />
                  รีเซ็ต
                </button>
              )}
            </div>
          </div>

          {filterOpen && (
            <div className="border-t border-[var(--tu-border)] px-4 pb-4 pt-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                <FilterField label="ตั้งแต่วันที่">
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[var(--tu-border)] bg-[var(--tu-surface)] px-3 text-sm text-[var(--tu-text-primary)] outline-none focus:border-[var(--tu-primary)]" />
                </FilterField>
                <FilterField label="ถึงวันที่">
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[var(--tu-border)] bg-[var(--tu-surface)] px-3 text-sm text-[var(--tu-text-primary)] outline-none focus:border-[var(--tu-primary)]" />
                </FilterField>
                <FilterField label="ผู้ใช้งาน">
                  <input type="text" value={userFilter} onChange={(e) => setUserFilter(e.target.value)} placeholder="ชื่อหรืออีเมล"
                    className="h-9 w-full rounded-lg border border-[var(--tu-border)] bg-[var(--tu-surface)] px-3 text-sm text-[var(--tu-text-primary)] outline-none focus:border-[var(--tu-primary)]" />
                </FilterField>
                <FilterField label="Module">
                  <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[var(--tu-border)] bg-[var(--tu-surface)] px-2 text-sm text-[var(--tu-text-primary)] outline-none focus:border-[var(--tu-primary)]">
                    <option value="">ทั้งหมด</option>
                    {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </FilterField>
                <FilterField label="Action">
                  <select value={eventType} onChange={(e) => setEventType(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[var(--tu-border)] bg-[var(--tu-surface)] px-2 text-sm text-[var(--tu-text-primary)] outline-none focus:border-[var(--tu-primary)]">
                    <option value="">ทั้งหมด</option>
                    {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FilterField>
                <FilterField label="Department">
                  <select value="" onChange={() => {}}
                    className="h-9 w-full rounded-lg border border-[var(--tu-border)] bg-[var(--tu-surface)] px-2 text-sm text-[var(--tu-text-primary)] outline-none focus:border-[var(--tu-primary)]">
                    <option value="">ทั้งหมด</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </FilterField>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-[var(--tu-error)]/20 bg-[var(--tu-error)]/5 px-4 py-3 text-sm text-[var(--tu-error)]">
            {error}
            <button onClick={fetchLogs} className="ml-3 underline text-xs">Retry</button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-[var(--tu-border)] bg-[var(--tu-surface)] shadow-sm">
          <div className="max-h-[640px] overflow-auto">
            <table className="w-full min-w-[900px] border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
                <tr>
                  <SortHeader label="วันที่/เวลา" k="createdAt" sortBy={sortBy} sortDir={sortDir} setSort={handleSort} />
                  <SortHeader label="ผู้ใช้งาน" k="user" sortBy={sortBy} sortDir={sortDir} setSort={handleSort} />
                  <SortHeader label="Module" k="module" sortBy={sortBy} sortDir={sortDir} setSort={handleSort} />
                  <SortHeader label="Action" k="action" sortBy={sortBy} sortDir={sortDir} setSort={handleSort} />
                  <th className="select-none px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--tu-text-muted)]">Resource</th>
                  <th className="select-none px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--tu-text-muted)]">IP Address</th>
                  <SortHeader label="Status" k="status" sortBy={sortBy} sortDir={sortDir} setSort={handleSort} />
                  <th className="select-none px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--tu-text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows n={8} />
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-0 py-0">
                      <EmptyState
                        kind={search || activeFilterCount ? "no-results" : "empty"}
                        onReset={resetFilters}
                      />
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-t border-[var(--tu-border)] transition-colors hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-4 py-3.5 text-[13px] text-[var(--tu-text-primary)]">
                        <div className="font-medium">{formatDate(log.createdAt)}</div>
                        <div className="text-[11px] text-[var(--tu-text-muted)]">{relTime(log.createdAt)}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar name={getUserName(log.user)} color={getAvatarColor(log.user?.email ?? log.id)} size={32} />
                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-medium text-[var(--tu-text-primary)]">{getUserName(log.user)}</div>
                            <div className="truncate font-mono text-[11px] text-[var(--tu-text-muted)]">{getUserEmail(log.user)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[12.5px] text-[var(--tu-text-secondary)]">{log.module}</td>
                      <td className="px-4 py-3.5"><ActionBadge action={log.action} /></td>
                      <td className="px-4 py-3.5 font-mono text-[12.5px] text-[var(--tu-text-secondary)]">{log.module}/{log.id.slice(0, 8)}</td>
                      <td className="px-4 py-3.5 font-mono text-[12.5px] text-[var(--tu-text-secondary)]">{log.ipAddress ?? "-"}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={log.isSuccess ? "ACTIVE" : "INACTIVE"} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end">
                          <RowActions
                            row={log}
                            onView={() => viewDetail(log.id)}
                            onCopy={() => navigator.clipboard.writeText(log.id)}
                            onExport={() => handleExportSingle(log.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && total > limit && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--tu-border)] bg-[var(--tu-surface)] px-4 py-3 sm:flex-row">
              <p className="text-[12.5px] text-[var(--tu-text-muted)]">
                แสดง <span className="font-semibold text-[var(--tu-text-primary)]">{(page - 1) * limit + 1}-{Math.min(page * limit, total)}</span> จาก{" "}
                <span className="font-semibold text-[var(--tu-text-primary)]">{total}</span> รายการ
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--tu-border)] bg-[var(--tu-surface)] text-[var(--tu-text-secondary)] hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronLeft size={14} />
                </button>
                {pageNumbers.map((n, i) =>
                  n === -1 ? (
                    <span key={`e${i}`} className="px-2 text-sm text-[var(--tu-text-muted)]">…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={cn("h-8 min-w-8 rounded-lg px-2 text-[12.5px] font-medium transition-colors",
                        n === page
                          ? "bg-[var(--tu-primary)] text-white"
                          : "border border-[var(--tu-border)] text-[var(--tu-text-secondary)] hover:bg-slate-50"
                      )}
                    >
                      {n}
                    </button>
                  )
                )}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--tu-border)] bg-[var(--tu-surface)] text-[var(--tu-text-secondary)] hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Drawer */}
        <DetailDrawer detail={detail} detailId={detailId} onClose={() => setDetailId(null)} formatDate={formatDate} />
      </div>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--tu-text-muted)]">{label}</label>
      {children}
    </div>
  );
}
