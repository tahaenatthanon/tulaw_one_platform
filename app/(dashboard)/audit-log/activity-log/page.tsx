"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search, Shield, Lock, Download, Filter, ChevronLeft, ChevronRight, Eye,
  Copy, Check, X, User, Monitor, Globe, Server, Info, FileText, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useHasPermission } from "@/hooks/use-permission";
import { JsonHighlight } from "@/components/shared/json-highlight";

/* ==============================================================================
   Types
   ============================================================================== */

const EVENT_TYPES = [
  "ACCOUNT_UNLOCK", "AD_SYNC", "Announcement_Created", "Announcement_Delete",
  "Announcement_Update", "API_KEY_CREATE", "API_KEY_DELETE",
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
  "USER_CREATE", "USER_DELETE", "USER_LOGIN", "USER_LOGIN_FAILED",
  "USER_LOGOUT", "USER_UPDATE",
];

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
  Announcement_Created: { label: "Announcement_Created", color: "text-tu-success", bg: "bg-tu-success/10" },
  Announcement_Delete: { label: "Announcement_Delete", color: "text-tu-error", bg: "bg-tu-error/10" },
  Announcement_Update: { label: "Announcement_Update", color: "text-tu-warning", bg: "bg-tu-warning/10" },
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

function getEventMeta(action: string) {
  return EVENT_META[action] ?? { label: action, color: "text-tu-text-muted", bg: "bg-tu-bg" };
}

const MODULES = ["users", "settings", "projects", "documents", "auth", "dashboard", "eoffice", "erp"];

/* ==============================================================================
   Audit Detail Types
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
   Main Page
   ============================================================================== */

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AuditDetail | null>(null);

  const limit = 20;
  const canExport = useHasPermission("AUDIT_LOG_EXPORT");

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

  // Copy handler
  function handleCopy(value: string) {
    navigator.clipboard.writeText(value);
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

  function getUserName(u: AuditEntry["user"]) {
    if (!u) return "-";
    return u.firstNameTh + " " + u.lastNameTh;
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-tu-text-primary">Audit Log</h1>
          <p className="text-tu-text-muted text-sm mt-1">System Activity Log</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="gap-1.5 h-8"><Lock size={12} />Immutable</Badge>
          {canExport && (
            <>
              <button onClick={() => handleExport("csv")} className="flex items-center gap-1.5 rounded-[--radius-btn] border border-tu-border px-3 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">
                <Download size={16} />CSV
              </button>
              <button onClick={() => handleExport("xlsx")} className="flex items-center gap-1.5 rounded-[--radius-btn] border border-tu-border px-3 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">
                <Download size={16} />Excel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 bg-tu-error/5 border border-tu-error/10 rounded-[--radius-card] p-4 text-sm">
        <Shield size={20} className="text-tu-error shrink-0" />
        <div>
          <p className="font-semibold text-tu-text-primary">Immutable Audit Log</p>
          <p className="text-tu-text-muted text-xs">All records are append-only and cannot be modified or deleted by any user including Super Admin.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-tu-text-secondary"><Filter size={14} />Filters</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-medium text-tu-text-muted mb-1">Date From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-xs outline-none focus:border-tu-border-focus" />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-tu-text-muted mb-1">Date To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-xs outline-none focus:border-tu-border-focus" />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-tu-text-muted mb-1">Event Type</label>
            <select value={eventType} onChange={e => setEventType(e.target.value)} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-xs outline-none focus:border-tu-border-focus">
              <option value="">All</option>
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-tu-text-muted mb-1">Module</label>
            <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-xs outline-none focus:border-tu-border-focus">
              <option value="">All</option>
              {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-medium text-tu-text-muted mb-1">User</label>
            <input type="text" value={userFilter} onChange={e => setUserFilter(e.target.value)} placeholder="Search user..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-xs outline-none focus:border-tu-border-focus" />
          </div>
          <div className="relative">
            <label className="block text-[10px] font-medium text-tu-text-muted mb-1">Search</label>
            <Search size={14} className="absolute left-3 top-[30px] text-tu-text-muted" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search all..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface pl-8 pr-3 py-2 text-xs outline-none focus:border-tu-border-focus" />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-tu-error/5 border border-tu-error/10 rounded-[--radius-card] p-3 text-sm text-tu-error">
          {error}
          <button onClick={fetchLogs} className="ml-3 underline text-xs">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border overflow-auto">
        <table className="w-full min-w-[750px]">
          <thead>
            <tr className="bg-tu-bg border-b border-tu-border text-left">
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase cursor-pointer select-none" onClick={() => { if (sortBy === "createdAt") setSortDir(sortDir === "desc" ? "asc" : "desc"); else { setSortBy("createdAt"); setSortDir("desc"); }}}>
                Timestamp {sortBy === "createdAt" ? (sortDir === "desc" ? "\u2193" : "\u2191") : ""}
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">User</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase cursor-pointer select-none" onClick={() => { if (sortBy === "action") setSortDir(sortDir === "desc" ? "asc" : "desc"); else { setSortBy("action"); setSortDir("desc"); }}}>
                Event {sortBy === "action" ? (sortDir === "desc" ? "\u2193" : "\u2191") : ""}
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">Module</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden md:table-cell">IP</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tu-border">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-tu-text-muted">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-tu-text-muted"><Shield size={40} className="mx-auto mb-3 opacity-20" /><p>No entries found</p></td></tr>
            ) : logs.map(log => {
              const meta = getEventMeta(log.action);
              return (
                <tr key={log.id} className="hover:bg-tu-surface-hover transition-colors">
                  <td className="px-4 py-3 text-xs text-tu-text-muted whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-tu-text-primary">{getUserName(log.user)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium", meta.bg, meta.color)}>{meta.label}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-tu-text-secondary">{log.module}</td>
                  <td className="px-4 py-3 text-xs text-tu-text-muted font-mono hidden md:table-cell">{log.ipAddress ?? "-"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => viewDetail(log.id)} className="p-1 hover:bg-tu-surface-hover rounded"><Eye size={14} className="text-tu-text-secondary" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-tu-text-muted">Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} entries</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="p-1.5 rounded-md text-tu-text-muted hover:bg-tu-surface-hover disabled:opacity-30"><ChevronLeft size={16} /></button>
            {pageNumbers.map((n, i) => n === -1 ? <span key={`e${i}`} className="px-1 text-tu-text-muted">&hellip;</span> : <button key={n} onClick={() => setPage(n)} className={cn("px-2.5 py-1 rounded text-xs font-medium transition-colors", n === page ? "bg-tu-primary text-white" : "text-tu-text-secondary hover:bg-tu-surface-hover")}>{n}</button>)}
            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="p-1.5 rounded-md text-tu-text-muted hover:bg-tu-surface-hover disabled:opacity-30"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* Detail Drawer — Structured 6 Sections */}
      {detailId && detail && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setDetailId(null)} />
          <div className="fixed right-0 top-0 h-full w-full sm:w-[480px] lg:w-[640px] max-w-[100vw] bg-white shadow-xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-tu-border shrink-0">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-tu-primary" />
                <h3 className="text-base font-semibold text-tu-text-primary">Audit Log Detail</h3>
              </div>
              <button onClick={() => setDetailId(null)} className="rounded-md p-1 hover:bg-tu-surface-hover">
                <X size={18} className="text-tu-text-secondary" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto divide-y divide-tu-border">
              {/* Section 1: General Information */}
              <Section title="General Information" icon={Info}>
                <Field label="Log ID" value={detail.general.logId} mono />
                <Field label="Timestamp" value={formatDate(detail.general.timestamp)} />
                <Field label="Event Type" value={detail.general.eventType} badge={getEventMeta(detail.general.eventType)} />
                <Field label="Module" value={detail.general.module} />
                <Field label="Action" value={detail.general.action} />
                <Field label="Status" value={detail.general.status}
                  badge={detail.general.status === "Success"
                    ? { label: "Success", color: "text-tu-success", bg: "bg-tu-success/10" }
                    : { label: "Failed", color: "text-tu-error", bg: "bg-tu-error/10" }
                  } />
              </Section>

              {/* Section 2: User Information */}
              <Section title="User Information" icon={User}>
                <Field label="Name" value={detail.user.name} />
                <Field label="User ID" value={detail.user.userId} mono />
                <Field label="Email" value={detail.user.email} />
                <Field label="Role" value={detail.user.role} badge={detail.user.role !== "N/A" ? { label: detail.user.role, color: "text-tu-primary", bg: "bg-tu-primary-soft" } : undefined} />
                <Field label="Department" value={detail.user.department} />
              </Section>

              {/* Section 3: Target Resource */}
              <Section title="Target Resource" icon={FileText}>
                <Field label="Object Type" value={detail.targetResource.objectType} />
                <Field label="Record ID" value={detail.targetResource.recordId} mono />
              </Section>

              {/* Section 4: Change History */}
              <Section title="Change History" icon={Activity}>
                {detail.changeHistory.hasChanges ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <JsonHighlight data={detail.changeHistory.beforeValue} label="Before Value" />
                    <JsonHighlight data={detail.changeHistory.afterValue} label="After Value" />
                  </div>
                ) : (
                  <div className="rounded-lg bg-tu-bg border border-tu-border px-4 py-3 text-sm text-tu-text-muted italic">
                    N/A — No data changes (e.g., Login, Logout, View)
                  </div>
                )}
              </Section>

              {/* Section 5: Request Information */}
              <Section title="Request Information" icon={Monitor}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  <Field label="IP Address" value={detail.requestInfo.ipAddress} mono />
                  <Field label="Browser" value={detail.requestInfo.browser} />
                  <Field label="Operating System" value={detail.requestInfo.operatingSystem} />
                  <Field label="Device" value={detail.requestInfo.device} />
                  <Field label="Session ID" value={detail.requestInfo.sessionId} mono />
                  <Field label="Request ID" value={detail.requestInfo.requestId} mono />
                  <Field label="API Endpoint" value={detail.requestInfo.apiEndpoint} mono />
                  <Field label="HTTP Method" value={detail.requestInfo.httpMethod} />
                </div>
              </Section>

              {/* Section 6: Additional Information */}
              <Section title="Additional Information" icon={Server}>
                {detail.additionalInfo.errorMessage && (
                  <div className="col-span-2 mb-3">
                    <Field label="Error Message" value={detail.additionalInfo.errorMessage} />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  <Field label="Auth Method" value={detail.additionalInfo.authMethod}
                    badge={detail.additionalInfo.authMethod === "LDAP"
                      ? { label: "LDAP", color: "text-tu-info", bg: "bg-tu-info/10" }
                      : { label: "Local", color: "text-tu-warning", bg: "bg-tu-warning/10" }
                    } />
                  <Field label="Status Code" value={String(detail.additionalInfo.statusCode)} />
                  <Field label="Duration" value={detail.additionalInfo.duration ? `${detail.additionalInfo.duration}ms` : "N/A"} />
                  <Field label="Correlation ID" value={detail.additionalInfo.correlationId} mono />
                </div>
              </Section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Activity; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-tu-primary" />
        <h4 className="text-sm font-semibold text-tu-text-primary">{title}</h4>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, value, mono, badge, onCopy }: {
  label: string; value: string; mono?: boolean;
  badge?: { label: string; color: string; bg: string };
  onCopy?: () => void;
}) {
  return (
    <div>
      <dt className="text-[10px] font-medium text-tu-text-muted uppercase tracking-wider mb-0.5">{label}</dt>
      <dd className="flex items-center gap-1.5 text-sm text-tu-text-primary">
        {badge ? (
          <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", badge.bg, badge.color)}>
            {badge.label}
          </span>
        ) : value === "N/A" ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-tu-text-muted/10 text-tu-text-muted">N/A</span>
        ) : (
          <span className={cn("break-all", mono && "font-mono text-xs")}>{value}</span>
        )}
        {value !== "N/A" && !badge && (
          <button onClick={() => navigator.clipboard.writeText(value)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-tu-surface-hover transition-all shrink-0" title="Copy">
            <Copy size={12} className="text-tu-text-muted" />
          </button>
        )}
      </dd>
    </div>
  );
}
