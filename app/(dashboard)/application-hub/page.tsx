"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Star, Calculator, FileText, FolderSearch, GraduationCap,
  Users2, FlaskConical, Scale, CalendarCheck, HelpCircle, Library,
  ShoppingCart, Box, FileBarChart, ArrowDownToLine, ArrowUpFromLine,
  Repeat, CheckCheck, GitBranch, ScanEye, ClipboardCheck, Clock,
  Lightbulb, MessageSquare, BookOpen, CalendarDays, Building2,
  Grid3X3, List, Wifi, Activity, Server, AlertTriangle, X, Lock, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SubModule {
  name: string; description: string; icon: React.ElementType; online: boolean;
}
interface AppGroup {
  id: string; name: string; description: string; icon: React.ElementType;
  url: string; subs: SubModule[]; online: boolean;
}

const appGroups: AppGroup[] = [
  { id: "erp", name: "ERP", description: "ระบบบริหารทรัพยากรองค์กร", icon: Calculator, url: "/application-hub/erp", online: true, subs: [
    { name: "งบประมาณ", description: "บริหารงบประมาณประจำปี", icon: Calculator, online: true },
    { name: "การเงิน", description: "ระบบการเงินและบัญชี", icon: Calculator, online: true },
    { name: "จัดซื้อจัดจ้าง", description: "บริหารงานพัสดุ", icon: ShoppingCart, online: true },
    { name: "พัสดุ", description: "จัดการครุภัณฑ์", icon: Box, online: false },
    { name: "รายงาน", description: "รายงานทางการเงิน", icon: FileBarChart, online: false },
  ]},
  { id: "e-office", name: "E-Office", description: "ระบบสารบรรณอิเล็กทรอนิกส์", icon: FileText, url: "/application-hub/e-office", online: true, subs: [
    { name: "หนังสือเข้า", description: "จัดการหนังสือรับเข้า", icon: ArrowDownToLine, online: true },
    { name: "หนังสือออก", description: "จัดการหนังสือส่งออก", icon: ArrowUpFromLine, online: true },
    { name: "หนังสือเวียน", description: "จัดการหนังสือเวียน", icon: Repeat, online: true },
    { name: "อนุมัติเอกสาร", description: "ระบบอนุมัติเวียน", icon: CheckCheck, online: true },
    { name: "การประชุม", description: "จัดการวาระประชุม", icon: Users2, online: true },
  ]},
  { id: "document-management", name: "จัดการเอกสาร", description: "ระบบจัดการเอกสาร DMS", icon: FolderSearch, url: "/application-hub/document-management", online: true, subs: [
    { name: "คลังกลาง", description: "เอกสารส่วนกลาง", icon: FolderSearch, online: true },
    { name: "คลังหน่วยงาน", description: "เอกสารภายในหน่วยงาน", icon: Building2, online: true },
    { name: "ส่วนตัว", description: "พื้นที่ส่วนบุคคล", icon: FolderSearch, online: true },
    { name: "ประวัติเวอร์ชัน", description: "ติดตามการแก้ไข", icon: GitBranch, online: true },
    { name: "ค้นหา OCR", description: "ค้นหาด้วย OCR", icon: ScanEye, online: true },
  ]},
  { id: "academic", name: "งานวิชาการ", description: "ระบบงานวิชาการ", icon: GraduationCap, url: "/application-hub/academic-management", online: true, subs: [
    { name: "หลักสูตร", description: "ข้อมูลหลักสูตร", icon: BookOpen, online: true },
    { name: "รายวิชา", description: "จัดการรายวิชา", icon: GraduationCap, online: true },
    { name: "ตารางเรียน", description: "ตารางเรียน-สอน", icon: CalendarDays, online: true },
    { name: "ตารางสอบ", description: "ตารางสอบ", icon: ClipboardCheck, online: true },
    { name: "คำร้อง", description: "คำร้องนักศึกษา", icon: FileText, online: true },
  ]},
  { id: "hr", name: "งานบุคคล", description: "ระบบบริหารทรัพยากรบุคคล", icon: Users2, url: "/application-hub/hr-management", online: true, subs: [
    { name: "บุคลากร", description: "ข้อมูลบุคลากร", icon: Users2, online: true },
    { name: "ลางาน", description: "ขอลา-อนุมัติ", icon: CalendarCheck, online: true },
    { name: "เวลาเข้างาน", description: "บันทึกเวลา", icon: Clock, online: true },
    { name: "ประเมินผล", description: "ประเมินการทำงาน", icon: ClipboardCheck, online: true },
    { name: "อบรม", description: "อบรมพัฒนา", icon: GraduationCap, online: true },
    { name: "เงินเดือน", description: "สลิปเงินเดือน", icon: Calculator, online: true },
  ]},
  { id: "research", name: "งานวิจัย", description: "ระบบบริหารงานวิจัย", icon: FlaskConical, url: "/application-hub/research-management", online: true, subs: [
    { name: "โครงการวิจัย", description: "ติดตามโครงการ", icon: FlaskConical, online: true },
    { name: "ทุนวิจัย", description: "จัดการทุน", icon: FileText, online: true },
    { name: "ผลงานตีพิมพ์", description: "รวบรวมผลงาน", icon: BookOpen, online: true },
    { name: "ทรัพย์สินทางปัญญา", description: "สิทธิบัตร", icon: Lightbulb, online: true },
    { name: "รายงาน", description: "รายงานวิจัย", icon: FileBarChart, online: true },
  ]},
  { id: "legal-clinic", name: "คลินิกกฎหมาย", description: "ระบบคลินิกกฎหมาย", icon: Scale, url: "/application-hub/legal-clinic", online: true, subs: [
    { name: "คดีความ", description: "จัดการคดี", icon: Scale, online: true },
    { name: "ทะเบียนลูกความ", description: "ข้อมูลลูกความ", icon: Users2, online: true },
    { name: "นัดหมาย", description: "นัดหมาย", icon: CalendarCheck, online: true },
    { name: "ให้คำปรึกษา", description: "บันทึกคำปรึกษา", icon: MessageSquare, online: true },
    { name: "รายงาน", description: "สถิติคลินิก", icon: FileBarChart, online: true },
  ]},
  { id: "book-meeting", name: "จองห้องประชุม", description: "ระบบจองห้องประชุม", icon: CalendarCheck, url: "/application-hub/book-meeting", online: true, subs: [
    { name: "จองห้อง", description: "จองห้องออนไลน์", icon: CalendarCheck, online: true },
    { name: "ปฏิทินการจอง", description: "ดูตารางการใช้ห้อง", icon: CalendarDays, online: true },
  ]},
  { id: "support", name: "บริการสนับสนุน", description: "Helpdesk & ห้องสมุด", icon: HelpCircle, url: "/application-hub/support-services", online: true, subs: [
    { name: "Helpdesk", description: "แจ้งปัญหา IT", icon: HelpCircle, online: true },
    { name: "ห้องสมุด", description: "สืบค้นทรัพยากร", icon: Library, online: true },
  ]},
];

export default function ApplicationHubPage() {
  const [search, setSearch] = useState("");
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set<string>();
    try { return new Set(JSON.parse(localStorage.getItem("hub_pinned") || "[]")); }
    catch { return new Set<string>(); }
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [authStep, setAuthStep] = useState<{ app: AppGroup; step: "auth" | "modal" } | null>(null);

  // Persist to localStorage whenever pinnedIds change
  useEffect(() => {
    localStorage.setItem("hub_pinned", JSON.stringify(Array.from(pinnedIds)));
  }, [pinnedIds]);

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);
  const filtered = appGroups.filter((a) => search === "" || a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()) || a.subs.some((s) => s.name.toLowerCase().includes(search.toLowerCase())));
  const pinnedApps = filtered.filter((a) => pinnedIds.has(a.id));
  const unpinnedApps = filtered.filter((a) => !pinnedIds.has(a.id));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-semibold text-tu-text-primary">ศูนย์กลางแอปพลิเคชัน</h1><p className="text-tu-text-muted text-sm mt-1">รวมทุกระบบของคณะนิติศาสตร์ไว้ในที่เดียว</p></div>
        <div className="flex items-center gap-1 bg-tu-surface border border-tu-border rounded-lg p-1">
          <button onClick={() => setViewMode("grid")} className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors", viewMode === "grid" ? "bg-tu-primary text-white shadow-sm" : "text-tu-text-secondary")}><Grid3X3 size={14} />Grid</button>
          <button onClick={() => setViewMode("list")} className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors", viewMode === "list" ? "bg-tu-primary text-white shadow-sm" : "text-tu-text-secondary")}><List size={14} />List</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "ระบบทั้งหมด", value: "9", sub: "40 โมดูลย่อย", icon: Server, c: "text-tu-primary", b: "bg-tu-primary-soft" },
          { label: "Active Users", value: "24", sub: "วันนี้", icon: Activity, c: "text-tu-success", b: "bg-tu-success/10" },
          { label: "ระบบออนไลน์", value: "8", sub: "89%", icon: Wifi, c: "text-tu-info", b: "bg-tu-info/10" },
          { label: "บำรุงรักษา", value: "1", sub: "ERP (asset)", icon: AlertTriangle, c: "text-tu-warning", b: "bg-tu-warning/10" },
        ].map((s) => (
          <div key={s.label} className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.b}`}><s.icon size={20} className={s.c} /></div>
            <div><p className="text-lg font-bold text-tu-text-primary">{s.value}</p><p className="text-xs text-tu-text-muted">{s.label}<span className="text-tu-text-muted/60 ml-1">({s.sub})</span></p></div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาแอปพลิเคชัน..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-tu-border-focus/20 outline-none transition" /></div>

      {/* Pinned */}
      {pinnedApps.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-tu-text-secondary mb-3 flex items-center gap-2"><Star size={16} className="text-tu-secondary" />ปักหมุด</h2>
          <div className={cn(viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" : "space-y-2")}>
            {pinnedApps.map((a) => <AppGroupCard key={a.id} app={a} viewMode={viewMode} isPinned onTogglePin={() => togglePin(a.id)} onOpen={() => setAuthStep({ app: a, step: "auth" })} />)}
          </div>
        </div>
      )}

      {/* All */}
      <div>
        {pinnedApps.length > 0 && <h2 className="text-sm font-semibold text-tu-text-secondary mb-3">แอปพลิเคชันทั้งหมด</h2>}
        {unpinnedApps.length === 0 && pinnedApps.length === 0 ? (
          <div className="text-center py-16 text-tu-text-muted"><Search size={48} className="mx-auto mb-3 opacity-30" /><p>ไม่พบ</p></div>
        ) : (
          <div className={cn(viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" : "space-y-2")}>
            {unpinnedApps.map((a) => <AppGroupCard key={a.id} app={a} viewMode={viewMode} isPinned={false} onTogglePin={() => togglePin(a.id)} onOpen={() => setAuthStep({ app: a, step: "auth" })} />)}
          </div>
        )}
      </div>

      {/* Auth + Modal */}
      {authStep && authStep.step === "auth" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setAuthStep(null)}>
          <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border shadow-xl w-full max-w-sm p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-tu-primary-soft">
                <authStep.app.icon size={28} className="text-tu-primary" />
              </div>
              <h2 className="text-lg font-semibold text-tu-text-primary">{authStep.app.name}</h2>
              <p className="text-xs text-tu-text-muted mt-1">Sign in to access {authStep.app.subs.length} modules</p>
            </div>
            <div className="bg-tu-info/5 border border-tu-info/10 rounded-lg p-3 text-xs text-tu-text-secondary">
              <p className="font-medium text-tu-info mb-1">Authentication Required</p>
              <p>Enter credentials to unlock {authStep.app.name} and its sub-modules.</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setAuthStep({ app: authStep.app, step: "modal" }); }} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-tu-text-secondary mb-1">Username</label>
                <input type="text" required defaultValue="admin@tulaw.ac.th" placeholder="enter username" className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:ring-2 focus:ring-tu-border-focus/20 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-tu-text-secondary mb-1">Password</label>
                <input type="password" required defaultValue="TuLaw@2026!" placeholder="••••••••" className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:ring-2 focus:ring-tu-border-focus/20 outline-none" />
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 w-full rounded-[--radius-btn] bg-tu-primary px-4 py-2.5 text-sm font-medium text-tu-text-inverse hover:bg-tu-primary-hover transition-colors">
                <Lock size={16} />Sign In<ArrowRight size={16} />
              </button>
            </form>
            <div className="flex justify-between">
              <button onClick={() => setAuthStep(null)} className="text-xs text-tu-text-muted hover:text-tu-text-secondary">Cancel</button>
              <span className="text-[10px] text-tu-text-muted">TULAW ONE PLATFORM SSO</span>
            </div>
          </div>
        </div>
      )}

      {authStep && authStep.step === "modal" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setAuthStep(null)}>
          <div className="bg-tu-surface rounded-xl border border-tu-border shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-5 border-b border-tu-border shrink-0">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tu-primary-soft"><authStep.app.icon size={24} className="text-tu-primary" /></div>
                <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-tu-surface ${authStep.app.online ? "bg-tu-success" : "bg-tu-warning"}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-tu-text-primary">{authStep.app.name}</h3>
                <p className="text-sm text-tu-text-muted">{authStep.app.description}</p>
              </div>
              <button onClick={() => setAuthStep(null)} className="p-1.5 rounded-lg hover:bg-tu-surface-hover text-tu-text-muted"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2">
              {authStep.app.subs.map((sub) => (
                <a key={sub.name} href={authStep.app.url} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-tu-border hover:bg-tu-bg hover:border-tu-primary/30 transition-all cursor-pointer group">
                  <div className="relative shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-tu-primary-soft"><sub.icon size={18} className="text-tu-primary" /></div>
                    <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-tu-surface ${sub.online ? "bg-tu-success" : "bg-tu-warning"}`} />
                  </div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-tu-text-primary">{sub.name}</p><p className="text-xs text-tu-text-muted">{sub.description}</p></div>
                  <Badge variant={sub.online ? "success" : "warning"} className="text-[10px] shrink-0">{sub.online ? "Online" : "Maintenance"}</Badge>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppGroupCard({ app, viewMode, isPinned, onTogglePin, onOpen }: { app: AppGroup; viewMode: "grid" | "list"; isPinned: boolean; onTogglePin: () => void; onOpen: () => void }) {
  if (viewMode === "list") {
    return (
      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border hover:border-tu-primary/30 transition-all cursor-pointer" onClick={onOpen}>
        <div className="flex items-center gap-3 p-4">
          <div className="relative shrink-0"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tu-primary-soft"><app.icon size={20} className="text-tu-primary" /></div><span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-tu-surface ${app.online ? "bg-tu-success" : "bg-tu-warning"}`} /></div>
          <div className="flex-1 min-w-0"><span className="text-sm font-semibold text-tu-text-primary">{app.name}</span><p className="text-xs text-tu-text-muted">{app.description}</p></div>
          <button onClick={(e) => { e.stopPropagation(); onTogglePin(); }} className="p-1.5 rounded-md text-tu-text-muted hover:text-tu-secondary hover:bg-tu-secondary-soft"><Star size={14} className={isPinned ? "fill-tu-secondary text-tu-secondary" : ""} /></button>
        </div>
      </div>
    );
  }
  return (
    <div className="group bg-tu-surface rounded-[--radius-card] border border-tu-border p-4 hover:shadow-md hover:border-tu-primary/30 transition-all cursor-pointer" onClick={onOpen}>
      <div className="flex items-start gap-3 mb-2">
        <div className="relative"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tu-primary-soft"><app.icon size={20} className="text-tu-primary" /></div><span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-tu-surface ${app.online ? "bg-tu-success" : "bg-tu-warning"}`} /></div>
        <div className="flex-1 min-w-0"><h3 className="text-sm font-semibold text-tu-text-primary">{app.name}</h3><p className="text-xs text-tu-text-muted mt-0.5">{app.description}</p></div>
        <button onClick={(e) => { e.stopPropagation(); onTogglePin(); }} className="p-1 rounded-md text-tu-text-muted hover:text-tu-secondary hover:bg-tu-secondary-soft shrink-0"><Star size={14} className={isPinned ? "fill-tu-secondary text-tu-secondary" : ""} /></button>
      </div>
      <div className="flex flex-wrap gap-1 mb-1">
        {app.subs.slice(0, 5).map((s) => (<span key={s.name} className="text-[10px] px-1.5 py-0.5 rounded-full bg-tu-bg text-tu-text-secondary">{s.name}</span>))}
        {app.subs.length > 5 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-tu-bg text-tu-text-muted">+{app.subs.length - 5}</span>}
      </div>
    </div>
  );
}
