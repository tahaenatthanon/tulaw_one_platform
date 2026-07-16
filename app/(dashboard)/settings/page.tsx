"use client";

import { useState, useEffect, Suspense } from "react";
import useSWR from "swr";
import {
  ShieldCheck, Key, Palette, HardDrive, Settings,
  Plus, X, Trash2, Save, CheckCircle, Copy, Database, Plug, AlertTriangle,
  Building2, Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { swrFetcher, fetchApi } from "@/lib/fetcher";
import { useUrlState } from "@/hooks/use-url-state";

/* ==============================================================================
   Types
   ============================================================================== */

type TabId = "auth" | "sso" | "branding" | "storage" | "api-keys" | "categories" | "rooms" | "app-status";

interface Category { id: string; name: string; color: string; }

interface AuthSettings { sessionTimeout: string; jwtExpiry: string; maxLoginAttempts: string; mfaEnforced: boolean; }
interface SsoSettings { ldapUrl: string; baseDn: string; domain: string; syncInterval: string; enabled: boolean; }
interface BrandingSettings { name: string; color: string; }
interface StorageSettings { quota: string; fileTypes: string[]; projectTypes: string[]; annCats: Category[]; projCats: Category[]; }
interface ApiKey { id: string; name: string; key: string; permissions: string; createdAt: string; lastUsed: string; }

const TABS: { id: TabId; label: string; icon: typeof Settings }[] = [
  { id: "auth", label: "Authentication", icon: ShieldCheck },
  { id: "sso", label: "SSO / LDAP", icon: Key },
  { id: "branding", label: "UI Branding", icon: Palette },
  { id: "storage", label: "Storage & Projects", icon: HardDrive },
  { id: "api-keys", label: "API Keys", icon: Plug },
  { id: "categories", label: "Categories", icon: Database },
  { id: "rooms", label: "Meeting Rooms", icon: Building2 },
  { id: "app-status", label: "App Status", icon: Monitor },
];

const BRAND_COLORS = ["#A31D1D", "#FDB813", "#2563EB", "#16A34A", "#DC2626", "#7C3AED", "#DB2777", "#0284C7"];

const DEFAULT_AUTH: AuthSettings = { sessionTimeout: "28800", jwtExpiry: "3600", maxLoginAttempts: "5", mfaEnforced: true };
const DEFAULT_SSO: SsoSettings = { ldapUrl: "ldap://dc.tulaw.ac.th:389", baseDn: "DC=tulaw,DC=ac,DC=th", domain: "tulaw.ac.th", syncInterval: "15", enabled: true };
const DEFAULT_BRANDING: BrandingSettings = { name: "TULAW ONE", color: "#A31D1D" };
const DEFAULT_STORAGE: StorageSettings = {
  quota: "5", fileTypes: ["PDF", "XLSX", "PPTX", "DOCX", "PNG", "JPG"],
  projectTypes: ["วิชาการ", "หลักสูตร", "สัมมนา", "วิจัย", "IT", "งบประมาณ"],
  annCats: [
    { id: "a1", name: "ประกาศด่วน", color: "#DC2626" }, { id: "a2", name: "เชิญชวน", color: "#F59E0B" },
    { id: "a3", name: "ประกาศผล", color: "#2563EB" }, { id: "a4", name: "นโยบาย", color: "#7C3AED" }, { id: "a5", name: "ทั่วไป", color: "#6B7280" },
  ],
  projCats: [
    { id: "p1", name: "วิชาการ", color: "#A31D1D" }, { id: "p2", name: "หลักสูตร", color: "#2563EB" },
    { id: "p3", name: "สัมมนา", color: "#16A34A" }, { id: "p4", name: "วิจัย", color: "#7C3AED" },
    { id: "p5", name: "IT", color: "#0284C7" }, { id: "p6", name: "งบประมาณ", color: "#F59E0B" },
  ],
};

/* ==============================================================================
   Branding — Apply CSS variables to DOM (system-wide, real-time)
   ============================================================================== */

function applyBranding(branding: BrandingSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (branding.color) {
    root.style.setProperty("--tu-primary", branding.color);
    root.style.setProperty("--tu-primary-hover", darkenHex(branding.color, 30));
    root.style.setProperty("--tu-primary-active", darkenHex(branding.color, 50));
    root.style.setProperty("--tu-primary-soft", lightenHex(branding.color));
  }
}

function darkenHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((num >> 16) & 0xFF) - amount);
  const g = Math.max(0, ((num >> 8) & 0xFF) - amount);
  const b = Math.max(0, (num & 0xFF) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function lightenHex(hex: string): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xFF) + 60);
  const g = Math.min(255, ((num >> 8) & 0xFF) + 60);
  const b = Math.min(255, (num & 0xFF) + 60);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/* ==============================================================================
   Auth Tab
   ============================================================================== */

function AuthTab({ form, onChange }: { form: AuthSettings; onChange: (f: AuthSettings) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-tu-text-primary block mb-1">Session Timeout (วินาที)</label>
        <input type="number" value={form.sessionTimeout} onChange={e => onChange({ ...form, sessionTimeout: e.target.value })} placeholder="28800" className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm w-full outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
      </div>
      <div>
        <label className="text-sm font-medium text-tu-text-primary block mb-1">JWT Token Expiry (วินาที)</label>
        <input type="number" value={form.jwtExpiry} onChange={e => onChange({ ...form, jwtExpiry: e.target.value })} placeholder="3600" className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm w-full outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
      </div>
      <div>
        <label className="text-sm font-medium text-tu-text-primary block mb-1">จำนวนครั้งล็อกอินสูงสุดก่อนล็อกบัญชี</label>
        <input type="number" value={form.maxLoginAttempts} onChange={e => onChange({ ...form, maxLoginAttempts: e.target.value })} min={1} max={20} className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm w-32 outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={form.mfaEnforced} onChange={e => onChange({ ...form, mfaEnforced: e.target.checked })} className="rounded border-tu-border text-tu-primary focus:ring-tu-primary w-4 h-4" />
        <div><span className="text-sm font-medium text-tu-text-primary">บังคับใช้ MFA สำหรับ Admin ขึ้นไป</span><p className="text-xs text-tu-text-muted">บังคับให้ Super Admin, System Admin ต้องยืนยันตัวตน 2 ขั้นตอน</p></div>
      </label>
    </div>
  );
}

/* ==============================================================================
   SSO Tab
   ============================================================================== */

function SsoTab({ form, onChange }: { form: SsoSettings; onChange: (f: SsoSettings) => void }) {
  return (
    <div className="space-y-5">
      <div><label className="text-sm font-medium text-tu-text-primary block mb-1">LDAP URL</label><input type="text" value={form.ldapUrl} onChange={e => onChange({ ...form, ldapUrl: e.target.value })} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div>
      <div><label className="text-sm font-medium text-tu-text-primary block mb-1">Base DN</label><input type="text" value={form.baseDn} onChange={e => onChange({ ...form, baseDn: e.target.value })} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div>
      <div><label className="text-sm font-medium text-tu-text-primary block mb-1">Domain</label><input type="text" value={form.domain} onChange={e => onChange({ ...form, domain: e.target.value })} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div>
      <div><label className="text-sm font-medium text-tu-text-primary block mb-1">Sync Interval (นาที)</label><input type="number" value={form.syncInterval} onChange={e => onChange({ ...form, syncInterval: e.target.value })} min={1} max={120} className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm w-32 outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div>
      <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.enabled} onChange={e => onChange({ ...form, enabled: e.target.checked })} className="rounded border-tu-border text-tu-primary focus:ring-tu-primary w-4 h-4" /><span className="text-sm font-medium text-tu-text-primary">เปิดใช้งาน Active Directory Sync</span></label>
    </div>
  );
}

/* ==============================================================================
   Branding Tab
   ============================================================================== */

function BrandingTab({ form, onChange }: { form: BrandingSettings; onChange: (f: BrandingSettings) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-tu-text-primary block mb-1">Logo</label>
        <div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-xl bg-tu-primary text-white font-bold text-lg">มธ</div><div><p className="text-xs text-tu-text-muted mb-2">ขนาดแนะนำ: 512×512 px, PNG</p><button className="rounded-[--radius-btn] border border-tu-border px-3 py-1.5 text-xs font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">อัปโหลดโลโก้ใหม่</button></div></div>
      </div>
      <div><label className="text-sm font-medium text-tu-text-primary block mb-1">ชื่อระบบ</label><input type="text" value={form.name} onChange={e => onChange({ ...form, name: e.target.value })} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div>
      <div>
        <label className="text-sm font-medium text-tu-text-primary block mb-1">สีธีมหลัก</label>
        <div className="flex items-center gap-3"><input type="color" value={form.color} onChange={e => onChange({ ...form, color: e.target.value })} className="h-10 w-16 rounded-lg border border-tu-border cursor-pointer" /><div className="flex flex-wrap gap-2">{BRAND_COLORS.map(c => (<button key={c} onClick={() => onChange({ ...form, color: c })} className={cn("h-7 w-7 rounded-full border-2 transition-all", c === form.color ? "border-tu-text-primary scale-110" : "border-transparent")} style={{ backgroundColor: c }} />))}</div></div>
        <div className="mt-3 flex gap-2"><div className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: form.color }}>Primary Button</div><div className="rounded-lg border px-4 py-2 text-sm font-medium" style={{ borderColor: form.color, color: form.color }}>Outline Button</div></div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Storage Tab
   ============================================================================== */

function StorageSettingsTab({ form, onChange }: { form: StorageSettings; onChange: (f: StorageSettings) => void }) {
  const [newType, setNewType] = useState("");
  const addFileType = () => { if (newType.trim() && !form.fileTypes.includes(newType.trim().toUpperCase())) { onChange({ ...form, fileTypes: [...form.fileTypes, newType.trim().toUpperCase()] }); setNewType(""); } };
  const removeFileType = (t: string) => onChange({ ...form, fileTypes: form.fileTypes.filter(x => x !== t) });
  return (
    <div className="space-y-6">
      <div><h3 className="text-sm font-semibold text-tu-text-primary mb-3">Storage Quota</h3><div className="flex items-center gap-3"><label className="text-sm text-tu-text-secondary">ขนาดสูงสุดต่อผู้ใช้:</label><input type="number" value={form.quota} onChange={e => onChange({ ...form, quota: e.target.value })} min={1} max={100} className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm w-24 outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /><span className="text-sm text-tu-text-secondary">GB</span></div></div>
      <div><h3 className="text-sm font-semibold text-tu-text-primary mb-3">ประเภทไฟล์ที่อนุญาต</h3><div className="flex flex-wrap gap-2 mb-3">{form.fileTypes.map(t => <span key={t} className="inline-flex items-center gap-1 rounded-full bg-tu-primary-soft px-3 py-1 text-xs font-medium text-tu-primary">{t}<button onClick={() => removeFileType(t)} className="ml-1 hover:text-tu-error"><X size={12} /></button></span>)}</div><div className="flex gap-2"><input type="text" value={newType} onChange={e => setNewType(e.target.value)} onKeyDown={e => e.key === "Enter" && addFileType()} placeholder="เพิ่มประเภทไฟล์..." className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm flex-1 outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /><button onClick={addFileType} className="rounded-[--radius-btn] bg-tu-primary px-3 py-2 text-xs font-medium text-white hover:bg-tu-primary-hover transition-colors"><Plus size={14} />เพิ่ม</button></div></div>
    </div>
  );
}

/* ==============================================================================
   API Keys Tab (connected to real API)
   ============================================================================== */

function ApiKeysTabWrapper() {
  const { data, mutate } = useSWR("/api/settings", swrFetcher);
  const settings = (data || {}) as Record<string, Record<string, unknown>>;
  const keys = (settings.apiKeys || []) as unknown as ApiKey[];
  return <ApiKeysTab keys={keys} onUpdate={(k) => {}} />;
}

/* ==============================================================================
   Categories Tab Wrapper
   ============================================================================== */

function CategoriesTabWrapper({ annCats, projCats, onChange }: {
  annCats: Category[]; projCats: Category[];
  onChange: (ann: Category[], proj: Category[]) => void;
}) {
  return <CategoriesTab annCats={annCats} projCats={projCats} onAnnsChange={(a) => onChange(a, projCats)} onProjsChange={(p) => onChange(annCats, p)} />;
}

/* ==============================================================================
   Meeting Rooms Tab (connected to real API)
   ============================================================================== */

function MeetingRoomsTab() {
  const { data: roomsData, mutate } = useSWR("/api/settings/meeting-rooms", swrFetcher);
  const rooms = (Array.isArray(roomsData) ? roomsData : []) as Array<{ id: string; name: string; capacity: number }>;
  const [newName, setNewName] = useState("");
  const [newCap, setNewCap] = useState("10");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCap, setEditCap] = useState("");

  const addRoom = async () => {
    if (!newName.trim()) return;
    await fetchApi("/api/settings/meeting-rooms", { method: "POST", body: JSON.stringify({ name: newName, capacity: parseInt(newCap) || 10 }) });
    await mutate();
    setNewName(""); setNewCap("10");
  };

  const updateRoom = async (id: string) => {
    await fetchApi("/api/settings/meeting-rooms", { method: "PUT", body: JSON.stringify({ id, name: editName, capacity: parseInt(editCap) || 10 }) });
    await mutate();
    setEditId(null);
  };

  const deleteRoom = async (id: string) => {
    if (!confirm("ยืนยันลบห้องประชุม?")) return;
    await fetchApi(`/api/settings/meeting-rooms?id=${id}`, { method: "DELETE" });
    await mutate();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-tu-text-secondary">จัดการห้องประชุมที่ใช้ใน Book Meeting ทั้งหมด {rooms.length} ห้อง</p>
      <div className="flex gap-2">
        <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="ชื่อห้อง..." className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm flex-1 outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
        <input type="number" value={newCap} onChange={e => setNewCap(e.target.value)} min={1} className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm w-20 outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
        <button onClick={addRoom} className="rounded-[--radius-btn] bg-tu-primary px-3 py-2 text-xs font-medium text-white hover:bg-tu-primary-hover"><Plus size={14} />เพิ่ม</button>
      </div>
      <div className="space-y-2">
        {rooms.map(room => (
          <div key={room.id} className="flex items-center gap-3 p-3 rounded-lg border border-tu-border bg-tu-bg">
            {editId === room.id ? (
              <>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="rounded-[--radius-input] border border-tu-border px-2 py-1 text-sm flex-1 outline-none" />
                <input type="number" value={editCap} onChange={e => setEditCap(e.target.value)} className="rounded-[--radius-input] border border-tu-border px-2 py-1 text-sm w-16 outline-none" />
                <button onClick={() => updateRoom(room.id)} className="text-xs text-tu-success hover:underline">บันทึก</button>
                <button onClick={() => setEditId(null)} className="text-xs text-tu-text-muted hover:underline">ยกเลิก</button>
              </>
            ) : (
              <>
                <Building2 size={16} className="text-tu-text-muted shrink-0" />
                <span className="text-sm text-tu-text-primary flex-1">{room.name}</span>
                <span className="text-xs text-tu-text-muted">{room.capacity} คน</span>
                <button onClick={() => { setEditId(room.id); setEditName(room.name); setEditCap(String(room.capacity)); }} className="text-xs text-tu-text-secondary hover:text-tu-primary">แก้ไข</button>
                <button onClick={() => deleteRoom(room.id)} className="text-xs text-tu-error hover:underline">ลบ</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==============================================================================
   App Status Tab
   ============================================================================== */

function AppStatusTab() {
  const { data, mutate } = useSWR("/api/settings/app-status", swrFetcher);
  const apps = (Array.isArray(data) ? data : []) as Array<{ id: string; name: string; status: string; category?: { name: string } }>;
  const STATUS_OPTIONS = ["online", "offline", "maintenance"];

  const updateStatus = async (id: string, status: string) => {
    await fetchApi("/api/settings/app-status", { method: "PUT", body: JSON.stringify({ id, status }) });
    await mutate();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-tu-text-secondary">ปรับสถานะ Application ที่แสดงใน Application Hub</p>
      <div className="space-y-2">
        {apps.map(app => (
          <div key={app.id} className="flex items-center gap-3 p-3 rounded-lg border border-tu-border bg-tu-bg">
            <Monitor size={16} className="text-tu-text-muted shrink-0" />
            <span className="text-sm text-tu-text-primary flex-1">{app.name}</span>
            <span className="text-xs text-tu-text-muted">{app.category?.name || "-"}</span>
            <select value={app.status} onChange={e => updateStatus(app.id, e.target.value)}
              className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-2 py-1 text-xs outline-none">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === "online" ? "🟢 Online" : s === "offline" ? "🔴 Offline" : "🟡 Maintenance"}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==============================================================================
   API Keys Tab
   ============================================================================== */

function ApiKeysTab({ keys, onUpdate }: { keys: ApiKey[]; onUpdate: (k: ApiKey[]) => void }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPerms, setNewPerms] = useState("read:docs, read:announcements");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCreate = () => { if (!newName.trim()) return; const k: ApiKey = { id: String(Date.now()), name: newName.trim(), key: "top_sk_" + Math.random().toString(36).slice(2, 10) + "..." + Math.random().toString(36).slice(2, 6), permissions: newPerms, createdAt: new Date().toISOString().slice(0, 10), lastUsed: "-" }; onUpdate([k, ...keys]); setNewName(""); setNewPerms("read:docs, read:announcements"); setCreateOpen(false); };
  const handleCopy = (key: string, id: string) => { navigator.clipboard.writeText(key); setCopiedId(id); setTimeout(() => setCopiedId(null), 1500); };
  const handleRevoke = (id: string) => onUpdate(keys.filter(k => k.id !== id));
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><p className="text-sm text-tu-text-secondary">จัดการ API Key สำหรับเชื่อมต่อระบบภายนอก {keys.length} รายการ</p><button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 rounded-[--radius-btn] bg-tu-primary px-3 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors"><Plus size={16} />สร้าง API Key</button></div>
      {createOpen && (<div className="bg-tu-surface border border-tu-border rounded-lg p-4 space-y-3"><h3 className="text-sm font-semibold text-tu-text-primary">สร้าง API Key ใหม่</h3><div><input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="ชื่อ API Key..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div><div><input type="text" value={newPerms} onChange={e => setNewPerms(e.target.value)} placeholder="Permissions (comma-separated)" className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div><div className="flex gap-2"><button onClick={() => setCreateOpen(false)} className="rounded-[--radius-btn] border border-tu-border px-3 py-2 text-xs font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">ยกเลิก</button><button onClick={handleCreate} disabled={!newName.trim()} className="rounded-[--radius-btn] bg-tu-primary px-3 py-2 text-xs font-medium text-white hover:bg-tu-primary-hover transition-colors disabled:opacity-50">สร้าง</button></div></div>)}
      <div className="space-y-3">{keys.map(k => (<div key={k.id} className="bg-tu-surface border border-tu-border rounded-lg p-4"><div className="flex items-center justify-between mb-2"><h4 className="text-sm font-semibold text-tu-text-primary">{k.name}</h4><div className="flex items-center gap-1"><button onClick={() => handleCopy(k.key, k.id)} className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">{copiedId === k.id ? <><CheckCircle size={12} className="text-tu-success" />คัดลอกแล้ว</> : <><Copy size={12} />คัดลอก</>}</button><button onClick={() => handleRevoke(k.id)} className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-tu-error hover:bg-tu-error/10 transition-colors"><Trash2 size={12} />เพิกถอน</button></div></div><div className="flex items-center gap-3 text-xs text-tu-text-muted"><code className="bg-tu-bg px-2 py-0.5 rounded text-[11px]">{k.key}</code><span>Permissions: <span className="text-tu-text-secondary font-medium">{k.permissions}</span></span></div><p className="text-[10px] text-tu-text-muted mt-2 flex items-center gap-3"><span>สร้าง: {k.createdAt}</span><span>ใช้ล่าสุด: {k.lastUsed}</span></p></div>))}</div>
    </div>
  );
}

/* ==============================================================================
   Categories Tab — side by side in 2 boxes
   ============================================================================== */

function CategoriesTab({ annCats, projCats, onAnnsChange, onProjsChange }: {
  annCats: Category[]; projCats: Category[];
  onAnnsChange: (c: Category[]) => void; onProjsChange: (c: Category[]) => void;
}) {
  const [newAnn, setNewAnn] = useState(""); const [newAnnColor, setNewAnnColor] = useState("#A31D1D");
  const [newProj, setNewProj] = useState(""); const [newProjColor, setNewProjColor] = useState("#6B7280");

  const addAnn = () => { if (newAnn.trim()) { onAnnsChange([...annCats, { id: String(Date.now()), name: newAnn.trim(), color: newAnnColor }]); setNewAnn(""); } };
  const editAnnName = (id: string, name: string) => onAnnsChange(annCats.map(x => x.id === id ? { ...x, name } : x));
  const editAnnColor = (id: string, color: string) => onAnnsChange(annCats.map(x => x.id === id ? { ...x, color } : x));
  const removeAnn = (id: string) => onAnnsChange(annCats.filter(x => x.id !== id));
  const addProj = () => { if (newProj.trim()) { onProjsChange([...projCats, { id: String(Date.now()), name: newProj.trim(), color: newProjColor }]); setNewProj(""); } };
  const editProjName = (id: string, name: string) => onProjsChange(projCats.map(x => x.id === id ? { ...x, name } : x));
  const editProjColor = (id: string, color: string) => onProjsChange(projCats.map(x => x.id === id ? { ...x, color } : x));
  const removeProj = (id: string) => onProjsChange(projCats.filter(x => x.id !== id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-tu-bg border border-tu-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-tu-text-primary mb-3">หมวดหมู่ประกาศ</h3>
        <div className="space-y-2 mb-3">
          {annCats.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg bg-tu-surface">
              <input type="text" value={c.name} onChange={e => editAnnName(c.id, e.target.value)} className="bg-transparent text-sm text-tu-text-primary flex-1 outline-none" />
              <input type="color" value={c.color} onChange={e => editAnnColor(c.id, e.target.value)} className="h-6 w-8 rounded border border-tu-border cursor-pointer shrink-0" />
              <button onClick={() => removeAnn(c.id)} className="p-1 rounded-md text-tu-text-muted hover:text-tu-error hover:bg-tu-error/10 transition-colors shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2"><input type="text" value={newAnn} onChange={e => setNewAnn(e.target.value)} onKeyDown={e => e.key === "Enter" && addAnn()} placeholder="เพิ่มหมวดหมู่..." className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm flex-1 outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /><input type="color" value={newAnnColor} onChange={e => setNewAnnColor(e.target.value)} className="h-9 w-10 rounded border border-tu-border cursor-pointer shrink-0" /><button onClick={addAnn} className="rounded-[--radius-btn] bg-tu-primary px-3 py-2 text-xs font-medium text-white hover:bg-tu-primary-hover transition-colors shrink-0"><Plus size={14} /></button></div>
      </div>
      <div className="bg-tu-bg border border-tu-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-tu-text-primary mb-3">หมวดหมู่โครงการ</h3>
        <div className="space-y-2 mb-3">
          {projCats.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg bg-tu-surface">
              <input type="text" value={c.name} onChange={e => editProjName(c.id, e.target.value)} className="bg-transparent text-sm text-tu-text-primary flex-1 outline-none" />
              <input type="color" value={c.color} onChange={e => editProjColor(c.id, e.target.value)} className="h-6 w-8 rounded border border-tu-border cursor-pointer shrink-0" />
              <button onClick={() => removeProj(c.id)} className="p-1 rounded-md text-tu-text-muted hover:text-tu-error hover:bg-tu-error/10 transition-colors shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2"><input type="text" value={newProj} onChange={e => setNewProj(e.target.value)} onKeyDown={e => e.key === "Enter" && addProj()} placeholder="เพิ่มหมวดหมู่โครงการ..." className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm flex-1 outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /><input type="color" value={newProjColor} onChange={e => setNewProjColor(e.target.value)} className="h-9 w-10 rounded border border-tu-border cursor-pointer shrink-0" /><button onClick={addProj} className="rounded-[--radius-btn] bg-tu-primary px-3 py-2 text-xs font-medium text-white hover:bg-tu-primary-hover transition-colors shrink-0"><Plus size={14} /></button></div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Main Page
   ============================================================================== */

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-tu-text-muted">Loading...</div>}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const [activeTab, setActiveTab] = useUrlState<TabId>("tab", "auth");

  const { data: settingsData, mutate } = useSWR("/api/settings", swrFetcher);
  const settings = (settingsData || {}) as Record<string, Record<string, unknown>>;

  // Form state — initialized from defaults, synced from API on first load
  const [authForm, setAuthForm] = useState<AuthSettings>(DEFAULT_AUTH);
  const [ssoForm, setSsoForm] = useState<SsoSettings>(DEFAULT_SSO);
  const [brandingForm, setBrandingForm] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [storageForm, setStorageForm] = useState<StorageSettings>(DEFAULT_STORAGE);
  const [initialized, setInitialized] = useState(false);

  // Sync from API on first load only
  useEffect(() => {
    if (settingsData && !initialized) {
      if (settings.auth) setAuthForm({ ...DEFAULT_AUTH, ...(settings.auth as Partial<AuthSettings>) });
      if (settings.sso) setSsoForm({ ...DEFAULT_SSO, ...(settings.sso as Partial<SsoSettings>) });
      if (settings.branding) { const b = { ...DEFAULT_BRANDING, ...(settings.branding as Partial<BrandingSettings>) }; setBrandingForm(b); applyBranding(b); }
      if (settings.storage) setStorageForm({ ...DEFAULT_STORAGE, ...(settings.storage as Partial<StorageSettings>) });
      setInitialized(true);
    }
  }, [settingsData, initialized]);

  // Explicit save
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const markDirty = () => { if (!dirty) setDirty(true); setSaved(false); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        auth: authForm,
        sso: ssoForm,
        branding: brandingForm,
        storage: storageForm,
      };
      await fetchApi("/api/settings", { method: "PUT", body: JSON.stringify(body) });
      await mutate();
      applyBranding(brandingForm);
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error("[handleSave]", e); }
    setSaving(false);
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-tu-text-primary">System Config</h1>
          <p className="text-tu-text-muted text-sm mt-1">ตั้งค่าระบบ — กดบันทึกเพื่อให้การเปลี่ยนแปลงมีผล</p>
        </div>
      </div>

      {dirty && (
        <div className="flex items-center justify-between bg-tu-secondary-soft border border-tu-secondary/30 rounded-[--radius-card] px-4 py-2.5 text-sm">
          <span className="flex items-center gap-2 text-tu-text-primary">
            <AlertTriangle size={16} className="text-tu-secondary" />
            คุณยังไม่ได้บันทึกการเปลี่ยนแปลง
          </span>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-[--radius-btn] bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors disabled:opacity-50">
            <Save size={16} />{saving ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
          </button>
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 rounded-[--radius-card] bg-tu-success/10 border border-tu-success/30 px-4 py-2.5 text-sm text-tu-success">
          <CheckCircle size={16} />บันทึกสำเร็จ
        </div>
      )}

      <div className="flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5 w-fit flex-wrap">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors", activeTab === tab.id ? "bg-tu-primary text-white shadow-sm" : "text-tu-text-secondary hover:text-tu-text-primary")}>
            <tab.icon size={14} />{tab.label}
          </button>
        ))}
      </div>

      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6 max-w-4xl">
        {activeTab === "auth" && <AuthTab form={authForm} onChange={(f) => { setAuthForm(f); markDirty(); }} />}
        {activeTab === "sso" && <SsoTab form={ssoForm} onChange={(f) => { setSsoForm(f); markDirty(); }} />}
        {activeTab === "branding" && <BrandingTab form={brandingForm} onChange={(f) => { setBrandingForm(f); markDirty(); }} />}
        {activeTab === "storage" && <StorageSettingsTab form={storageForm} onChange={(f) => { setStorageForm(f); markDirty(); }} />}
        {activeTab === "api-keys" && <ApiKeysTabWrapper />}
        {activeTab === "categories" && <CategoriesTabWrapper annCats={storageForm.annCats} projCats={storageForm.projCats} onChange={(a, p) => { setStorageForm({ ...storageForm, annCats: a, projCats: p }); markDirty(); }} />}
        {activeTab === "rooms" && <MeetingRoomsTab />}
        {activeTab === "app-status" && <AppStatusTab />}
      </div>
    </div>
  );
}
