"use client";

import { useState, useEffect, Suspense } from "react";
import useSWR from "swr";
import { swrFetcher } from "@/lib/fetcher";
import {
  Search, Star, Calculator, FileText, FolderSearch, GraduationCap,
  Users2, Grid3X3, List, Wifi, Activity, Server, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHasPermission, useHasMinRoleLevel } from "@/hooks/use-permission";
import { useUrlState } from "@/hooks/use-url-state";

interface AppGroup {
  id: string; name: string; description: string; icon: React.ElementType;
}

type AppStatus = "online" | "maintenance" | "offline";

interface AppWithStatus extends AppGroup {
  status: AppStatus;
}

const appGroups: AppGroup[] = [
  { id: "erp", name: "ERP", description: "ระบบบริหารทรัพยากรองค์กร", icon: Calculator },
  { id: "e-office", name: "E-Office", description: "ระบบสารบรรณอิเล็กทรอนิกส์", icon: FileText },
  { id: "document-management", name: "จัดการเอกสาร", description: "ระบบจัดการเอกสาร", icon: FolderSearch },
  { id: "academic", name: "งานวิชาการ", description: "ระบบงานวิชาการ", icon: GraduationCap },
  { id: "hr", name: "งานบุคคล", description: "ระบบบริหารทรัพยากรบุคคล", icon: Users2 },
];

/* ==============================================================================
   StatCard Component
   ============================================================================== */

function StatCard({ icon: Icon, label, value, color, bg }: {
  icon: React.ElementType; label: string; value: number; color: string; bg: string;
}) {
  return (
    <div className="bg-tu-surface rounded-2xl border border-tu-border shadow-sm p-5 hover:shadow-md hover:scale-[1.02] transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:scale-100">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-tu-text-muted">{label}</p>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", bg)}>
          <Icon size={20} className={color} />
        </div>
      </div>
      <p className="text-4xl font-bold text-tu-text-primary tabular-nums">{value.toLocaleString("th-TH")}</p>
    </div>
  );
}

function ApplicationHubContent() {
  const [search, setSearch] = useUrlState("search", "");
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set<string>();
    try { return new Set(JSON.parse(localStorage.getItem("hub_pinned") || "[]")); }
    catch { return new Set<string>(); }
  });
  const [viewMode, setViewMode] = useUrlState<"grid" | "list">("view", "grid");

  useEffect(() => {
    localStorage.setItem("hub_pinned", JSON.stringify(Array.from(pinnedIds)));
  }, [pinnedIds]);

  const canView = {
    erp: useHasPermission("ERP_VIEW"),
    "e-office": useHasPermission("E_OFFICE_VIEW"),
    "document-management": useHasPermission("DOCUMENT_MANAGEMENT_VIEW"),
    academic: useHasPermission("ACADEMIC_VIEW"),
    hr: useHasPermission("HR_VIEW"),
  };

  const canPin = useHasMinRoleLevel(30); // Viewer (level 10) cannot pin

  // Fetch app statuses from Settings API (real-time) — match by name
  const { data: appsData } = useSWR("/api/settings/app-status", swrFetcher);
  const statusMap = new Map<string, AppStatus>(
    (Array.isArray(appsData) ? appsData : []).map((a: { name: string; status: string }) => [a.name, a.status as AppStatus])
  );

  // Merge appGroups with real status from API — fallback to "online" if not loaded
  const apps: AppWithStatus[] = appGroups.map(a => ({
    ...a,
    status: (statusMap.get(a.name) as AppStatus) || "online",
  }));

  const visibleApps: AppWithStatus[] = apps.filter((a) => canView[a.id as keyof typeof canView]);
  const searchLower = search.toLowerCase();
  const filtered: AppWithStatus[] = search === ""
    ? visibleApps
    : visibleApps.filter(function (a) {
        return a.name.toLowerCase().includes(searchLower) || a.description.toLowerCase().includes(searchLower);
      });
  const pinnedApps: AppWithStatus[] = filtered.filter((a) => pinnedIds.has(a.id));
  const unpinnedApps: AppWithStatus[] = filtered.filter((a) => !pinnedIds.has(a.id));
  if (!canView) return null; // satisfy lint for hook order

  const onlineCount = visibleApps.filter(a => a.status === "online").length;
  const onlinePercent = visibleApps.length > 0 ? Math.round((onlineCount / visibleApps.length) * 100) : 0;
  const maintenanceCount = visibleApps.filter(a => a.status !== "online").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div><h1 className="text-2xl font-semibold text-tu-text-primary">Application Hub</h1><p className="text-tu-text-muted text-sm mt-1">รวมระบบงานทั้งหมดของคณะนิติศาสตร์ไว้ในจุดเดียว</p></div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Server} label="ระบบทั้งหมด" value={visibleApps.length} color="text-tu-primary" bg="bg-tu-primary-soft" />
        <StatCard icon={Wifi} label="กำลังออนไลน์" value={onlineCount} color="text-tu-info" bg="bg-tu-info/10" />
        <StatCard icon={Activity} label="อัตราออนไลน์" value={onlinePercent} color="text-tu-success" bg="bg-tu-success/10" />
        <StatCard icon={AlertTriangle} label="บำรุงรักษา" value={maintenanceCount} color="text-tu-warning" bg="bg-tu-warning/10" />
      </div>

      {/* Search + Grid/List Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาแอปพลิเคชัน..." className="w-full rounded-xl border border-tu-border bg-tu-surface pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-tu-border-focus/20 outline-none transition" /></div>
        <div className="inline-flex p-1 rounded-xl bg-tu-bg/70 border border-tu-border shrink-0">
          <button onClick={() => setViewMode("grid")} className={cn("px-4 h-9 rounded-lg text-[12.5px] font-medium transition-all flex items-center gap-1.5", viewMode === "grid" ? "bg-tu-primary text-white shadow-sm" : "text-tu-text-muted hover:text-tu-text-primary")}><Grid3X3 size={14} />Grid</button>
          <button onClick={() => setViewMode("list")} className={cn("px-4 h-9 rounded-lg text-[12.5px] font-medium transition-all flex items-center gap-1.5", viewMode === "list" ? "bg-tu-primary text-white shadow-sm" : "text-tu-text-muted hover:text-tu-text-primary")}><List size={14} />List</button>
        </div>
      </div>

      {/* Pinned */}
      {pinnedApps.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-tu-text-secondary mb-3 flex items-center gap-2"><Star size={16} className="text-tu-secondary" />ปักหมุด</h2>
          <div className={cn(viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" : "space-y-2")}>
            {pinnedApps.map((a) => <AppCard key={a.id} app={a} viewMode={viewMode} isPinned onTogglePin={() => setPinnedIds(prev => { const n = new Set(prev); n.has(a.id) ? n.delete(a.id) : n.add(a.id); return n; })} canPin={canPin} />)}
          </div>
        </div>
      )}

      {/* All Apps */}
      <div>
        {pinnedApps.length > 0 && <h2 className="text-sm font-semibold text-tu-text-secondary mb-3">ระบบงานทั้งหมด</h2>}
        {unpinnedApps.length === 0 && pinnedApps.length === 0 ? (
          <div className="text-center py-16 text-tu-text-muted"><Search size={48} className="mx-auto mb-3 opacity-30" /><p>ไม่พบ</p></div>
        ) : (
          <div className={cn(viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" : "space-y-2")}>
            {unpinnedApps.map((a) => <AppCard key={a.id} app={a} viewMode={viewMode} isPinned={false} onTogglePin={() => setPinnedIds(prev => { const n = new Set(prev); n.has(a.id) ? n.delete(a.id) : n.add(a.id); return n; })} canPin={canPin} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicationHubPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-6 animate-pulse">
          <div className="h-8 w-64 bg-tu-surface rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-tu-surface rounded-[--radius-card] border border-tu-border" />
            ))}
          </div>
          <div className="h-10 w-full max-w-sm bg-tu-surface rounded-[--radius-input] border border-tu-border" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-48 bg-tu-surface rounded-[--radius-card] border border-tu-border" />
            ))}
          </div>
        </div>
      }
    >
      <ApplicationHubContent />
    </Suspense>
  );
}

/* ==============================================================================
   AppCard — Grid / List
   ============================================================================== */

function statusConfig(status: AppStatus) {
  return {
    online: { dot: "bg-tu-success", label: "Online", color: "text-tu-success" },
    maintenance: { dot: "bg-tu-warning animate-pulse", label: "Maintenance", color: "text-tu-warning" },
    offline: { dot: "bg-tu-error", label: "Offline", color: "text-tu-error" },
  }[status] ?? { dot: "bg-tu-success", label: "Online", color: "text-tu-success" };
}

function AppCard({ app, viewMode, isPinned, onTogglePin, canPin }: {
  app: AppWithStatus; viewMode: "grid" | "list"; isPinned: boolean; onTogglePin: () => void; canPin: boolean;
}) {
  const s = statusConfig(app.status);

  if (viewMode === "list") {
    return (
      <div className="group bg-tu-surface rounded-2xl border border-tu-border shadow-sm hover:shadow-md transition-all duration-200 motion-reduce:transition-none">
        <div className="flex items-center gap-4 p-4">
          <div className="relative shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-tu-primary-soft"><app.icon size={20} className="text-tu-primary" /></div>
            <span className={cn("absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-tu-surface", s.dot)} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-tu-text-primary">{app.name}</span>
            <p className="text-xs text-tu-text-muted">{app.description}</p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className={cn("text-xs font-medium", s.color)}>● {s.label}</span>
            {canPin && (
              <button onClick={(e) => { e.stopPropagation(); onTogglePin(); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-tu-text-muted hover:text-tu-secondary hover:bg-tu-secondary-soft transition-all">
                <Star size={14} className={isPinned ? "fill-tu-secondary text-tu-secondary" : ""} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-tu-surface rounded-2xl border border-tu-border shadow-sm p-5 hover:shadow-md hover:scale-[1.02] transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:scale-100 flex flex-col items-center text-center">
      {canPin && (
        <button onClick={(e) => { e.stopPropagation(); onTogglePin(); }} className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-tu-text-muted hover:text-tu-secondary hover:bg-tu-secondary-soft transition-all">
          <Star size={14} className={isPinned ? "fill-tu-secondary text-tu-secondary" : ""} />
        </button>
      )}

      <div className="relative mb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tu-primary-soft">
          <app.icon size={28} className="text-tu-primary" />
        </div>
        <span className={cn("absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-tu-surface", s.dot)} />
      </div>

      <h3 className="text-sm font-semibold text-tu-text-primary mb-1">{app.name}</h3>
      <p className="text-xs text-tu-text-muted mb-3">{app.description}</p>
      <span className={cn("text-xs font-medium", s.color)}>● {s.label}</span>
    </div>
  );
}
