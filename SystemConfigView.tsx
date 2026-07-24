import { useMemo, useState } from "react";
import {
  ShieldCheck, Key, Palette, HardDrive, Plug, Plus, X, Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsHeader } from "@/components/settings/settings-header";
import { GroupedCategorySidebar } from "@/components/settings/grouped-category-sidebar";
import { CategoryId, CATEGORIES } from "@/components/settings/category-sidebar";
import { ConfigSection } from "@/components/settings/config-section";
import { BrandingPreview } from "@/components/settings/branding-preview";
import { LogoUpload } from "@/components/settings/logo-upload";
import { ApiKeyTable } from "@/components/settings/api-key-table";
import { StorageVisualization } from "@/components/settings/storage-visualization";
import { SaveBar } from "@/components/settings/save-bar";
import { SaveConfirmationDialog } from "@/components/settings/save-confirmation-dialog";
import { SettingsSearch } from "@/components/settings/settings-search";
import { EmptyState } from "@/components/settings/empty-state";
import type {
  ApiKey, AuthSettings, BrandingSettings, SsoSettings,
  StorageSettings, SystemConfigViewProps,
} from "./types";

const BRAND_COLORS = ["#A31D1D", "#FDB813", "#2563EB", "#16A34A", "#DC2626", "#7C3AED", "#DB2777", "#0284C7"];

/* ================================ Panel Components ============================ */

function AuthPanel({ v, onChange }: { v: AuthSettings; onChange: (v: AuthSettings) => void }) {
  return (
    <div className="space-y-5">
      <ConfigSection title="Session" description="กำหนดระยะเวลา session และอายุ token">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-tu-text-primary block mb-1">Session Timeout (วินาที)</label>
            <input type="number" value={v.sessionTimeout} onChange={(e) => onChange({ ...v, sessionTimeout: e.target.value })} placeholder="28800" className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
          </div>
          <div>
            <label className="text-sm font-medium text-tu-text-primary block mb-1">JWT Token Expiry (วินาที)</label>
            <input type="number" value={v.jwtExpiry} onChange={(e) => onChange({ ...v, jwtExpiry: e.target.value })} placeholder="3600" className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
          </div>
        </div>
      </ConfigSection>
      <ConfigSection title="Login Policy" description="ตั้งค่านโยบายการเข้าสู่ระบบ">
        <div>
          <label className="text-sm font-medium text-tu-text-primary block mb-1">จำนวนครั้งล็อกอินสูงสุดก่อนล็อกบัญชี</label>
          <input type="number" value={v.maxLoginAttempts} onChange={(e) => onChange({ ...v, maxLoginAttempts: e.target.value })} min={1} max={20} className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm w-32 outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
        </div>
      </ConfigSection>
      <ConfigSection title="MFA" description="การยืนยันตัวตน 2 ขั้นตอน">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={v.mfaEnforced} onChange={(e) => onChange({ ...v, mfaEnforced: e.target.checked })} className="rounded border-tu-border text-tu-primary focus:ring-tu-primary w-4 h-4" />
          <div><span className="text-sm font-medium text-tu-text-primary">บังคับใช้ MFA สำหรับ Admin ขึ้นไป</span><p className="text-xs text-tu-text-muted">บังคับให้ Super Admin, System Admin ต้องยืนยันตัวตน 2 ขั้นตอน</p></div>
        </label>
      </ConfigSection>
    </div>
  );
}

function SsoPanel({ v, onChange }: { v: SsoSettings; onChange: (v: SsoSettings) => void }) {
  return (
    <div className="space-y-5">
      <ConfigSection title="LDAP Configuration" description="ตั้งค่าเซิร์ฟเวอร์ LDAP สำหรับการเชื่อมต่อ Active Directory">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-sm font-medium text-tu-text-primary block mb-1">LDAP URL</label><input type="text" value={v.ldapUrl} onChange={(e) => onChange({ ...v, ldapUrl: e.target.value })} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div>
          <div><label className="text-sm font-medium text-tu-text-primary block mb-1">Domain</label><input type="text" value={v.domain} onChange={(e) => onChange({ ...v, domain: e.target.value })} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div>
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium text-tu-text-primary block mb-1">Base DN</label>
          <input type="text" value={v.baseDn} onChange={(e) => onChange({ ...v, baseDn: e.target.value })} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
        </div>
      </ConfigSection>
      <ConfigSection title="Synchronization" description="ตั้งค่าการซิงค์ข้อมูลจาก Active Directory">
        <div>
          <label className="text-sm font-medium text-tu-text-primary block mb-1">Sync Interval (นาที)</label>
          <input type="number" value={v.syncInterval} onChange={(e) => onChange({ ...v, syncInterval: e.target.value })} min={1} max={120} className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm w-32 outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
        </div>
        <label className="flex items-center gap-3 cursor-pointer mt-4">
          <input type="checkbox" checked={v.enabled} onChange={(e) => onChange({ ...v, enabled: e.target.checked })} className="rounded border-tu-border text-tu-primary focus:ring-tu-primary w-4 h-4" />
          <span className="text-sm font-medium text-tu-text-primary">เปิดใช้งาน Active Directory Sync</span>
        </label>
      </ConfigSection>
    </div>
  );
}

function BrandingPanel({ v, onChange, logoUrl, logoPreviewUrl, onLogoChange }: {
  v: BrandingSettings; onChange: (v: BrandingSettings) => void;
  logoUrl?: string | null; logoPreviewUrl?: string | null;
  onLogoChange?: (file: File | null) => void;
}) {
  return (
    <div className="space-y-5">
      <ConfigSection title="Identity" description="กำหนดเอกลักษณ์ของระบบ">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-tu-text-primary block mb-1">Logo</label>
            <LogoUpload
              currentLogo={v.logoUrl}
              previewUrl={logoPreviewUrl}
              onLogoChange={onLogoChange || (() => {})}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-tu-text-primary block mb-1">ชื่อระบบ</label>
            <input type="text" value={v.name} onChange={(e) => onChange({ ...v, name: e.target.value })} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
          </div>
        </div>
      </ConfigSection>
      <ConfigSection title="Theme" description="กำหนดสีหลักของระบบ">
        <div>
          <label className="text-sm font-medium text-tu-text-primary block mb-1">สีธีมหลัก</label>
          <div className="flex items-center gap-3">
            <input type="color" value={v.color} onChange={(e) => onChange({ ...v, color: e.target.value })} className="h-10 w-16 rounded-lg border border-tu-border cursor-pointer" />
            <div className="flex flex-wrap gap-2">
              {BRAND_COLORS.map((c) => (
                <button key={c} onClick={() => onChange({ ...v, color: c })} className={cn("h-7 w-7 rounded-full border-2 transition-all", c === v.color ? "border-tu-text-primary scale-110" : "border-transparent")} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>
      </ConfigSection>
      <BrandingPreview branding={v} logoUrl={logoPreviewUrl || v.logoUrl} />
    </div>
  );
}

function StoragePanel({ v, onChange }: { v: StorageSettings; onChange: (v: StorageSettings) => void }) {
  const [newType, setNewType] = useState("");
  const add = () => {
    const t = newType.trim().toUpperCase();
    if (t && !v.fileTypes.includes(t)) { onChange({ ...v, fileTypes: [...v.fileTypes, t] }); setNewType(""); }
  };
  const remove = (t: string) => onChange({ ...v, fileTypes: v.fileTypes.filter((x) => x !== t) });
  return (
    <div className="space-y-5">
      <ConfigSection title="Quota" description="กำหนดขนาดพื้นที่จัดเก็บสูงสุดต่อผู้ใช้">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-tu-text-secondary">ขนาดสูงสุดต่อผู้ใช้:</label>
            <input type="number" value={v.quota} onChange={(e) => onChange({ ...v, quota: e.target.value })} min={1} max={100} className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm w-24 outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
            <span className="text-sm text-tu-text-secondary">GB</span>
          </div>
          <StorageVisualization quota={parseInt(v.quota) || 5} />
        </div>
      </ConfigSection>
      <ConfigSection title="File Types" description="กำหนดประเภทไฟล์ที่อนุญาตให้อัปโหลด">
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {v.fileTypes.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-tu-primary-soft px-3 py-1 text-xs font-medium text-tu-primary">
                {t}
                <button onClick={() => remove(t)} className="ml-1 hover:text-tu-error"><X size={12} /></button>
              </span>
            ))}
            {v.fileTypes.length === 0 && <p className="text-xs text-tu-text-muted">ยังไม่มีประเภทไฟล์ที่อนุญาต</p>}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newType} onChange={(e) => setNewType(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} placeholder="เพิ่มประเภทไฟล์..." className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm flex-1 outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
            <button onClick={add} className="rounded-[--radius-btn] bg-tu-primary px-3 py-2 text-xs font-medium text-white hover:bg-tu-primary-hover transition-colors shrink-0"><Plus size={14} />เพิ่ม</button>
          </div>
        </div>
      </ConfigSection>
    </div>
  );
}

function IntegrationPanel({ settings }: { settings: Record<string, Record<string, unknown>> }) {
  return (
    <div className="space-y-5">
      <ConfigSection title="API Keys" description="จัดการ API Key สำหรับเชื่อมต่อระบบภายนอก">
        <ApiKeyTable settings={settings} />
      </ConfigSection>
      <ConfigSection title="External Services" description="การเชื่อมต่อกับระบบภายนอก">
        <EmptyState type="integration" />
      </ConfigSection>
    </div>
  );
}

/* ================================ Main View ================================== */

export function SystemConfigView(props: SystemConfigViewProps) {
  const {
    loading, saving, saved, dirty,
    auth, sso, branding, storage, apiKeys,
    onAuthChange, onSsoChange, onBrandingChange, onStorageChange, onApiKeysChange,
    onSave, onReset,
  } = props;

  const [active, setActive] = useState<CategoryId>("auth");
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState<null | "save" | "reset">(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return undefined;
    const matched = new Set<CategoryId>();
    CATEGORIES.forEach((c) => {
      if (
        c.label.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.includes(q))
      ) {
        matched.add(c.id);
      }
    });
    return matched.size > 0 ? matched : undefined;
  }, [query]);

  const currentMeta = CATEGORIES.find((c) => c.id === active)!;

  // Pending change count (UI only)
  const pendingCount = dirty ? 1 : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <SettingsHeader />
      </div>

      {/* Search */}
      <div className="px-6 pb-4">
        <SettingsSearch value={query} onChange={setQuery} />
      </div>

      {/* Main Content: Sidebar + Panel */}
      <div className="flex flex-1 min-h-0 px-6 pb-24">
        {/* Desktop: Vertical Grouped Sidebar */}
        <aside className="hidden lg:flex w-[280px] shrink-0 mr-6">
          <div className="rounded-2xl border border-tu-border bg-tu-surface p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] w-full">
            <GroupedCategorySidebar
              active={active}
              onSelect={setActive}
              visible={filtered}
              searchQuery={query}
            />
          </div>
        </aside>

        {/* Tablet: Horizontal Pill Bar — Natural Width, No Background on Active, Underline Only */}
        <div className="hidden md:flex lg:hidden w-fit mb-4 overflow-x-auto gap-1 pb-1 border-b border-tu-border">
          {CATEGORIES.filter((c) => !filtered || filtered.has(c.id)).map((cat) => {
            const Icon = cat.icon;
            const isActive = active === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 shrink-0 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px]",
                  isActive
                    ? "text-tu-primary border-tu-primary"
                    : "text-tu-text-muted border-transparent hover:text-tu-text-secondary",
                )}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile: Dropdown Select */}
        <div className="md:hidden w-full mb-4">
          <select
            value={active}
            onChange={(e) => setActive(e.target.value as CategoryId)}
            className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20"
          >
            {CATEGORIES.filter((c) => !filtered || filtered.has(c.id)).map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Configuration Panel */}
        <main className="flex-1 min-w-0 max-w-4xl">
          <div className="rounded-2xl border border-tu-border bg-tu-surface shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            {/* Panel Header */}
            <div className="flex items-center gap-3 border-b border-tu-border px-6 py-4">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-tu-primary-soft text-tu-primary">
                <currentMeta.icon size={16} />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-tu-text-primary truncate">{currentMeta.label}</h2>
                <p className="text-xs text-tu-text-muted truncate">{currentMeta.description}</p>
              </div>
            </div>
            {/* Panel Body */}
            <div className="p-6">
              {loading ? (
                <div className="space-y-5">
                  <div className="h-5 w-40 bg-tu-bg rounded animate-pulse" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="h-16 bg-tu-bg rounded animate-pulse" />
                    <div className="h-16 bg-tu-bg rounded animate-pulse" />
                  </div>
                  <div className="h-24 bg-tu-bg rounded animate-pulse" />
                </div>
              ) : (
                <>
                  {active === "auth" && <AuthPanel v={auth} onChange={onAuthChange} />}
                  {active === "sso" && <SsoPanel v={sso} onChange={onSsoChange} />}
                  {active === "branding" && (
                    <BrandingPanel
                      v={branding}
                      onChange={onBrandingChange}
                      logoUrl={branding.logoUrl}
                    />
                  )}
                  {active === "storage" && <StoragePanel v={storage} onChange={onStorageChange} />}
                  {active === "integration" && (
                    <IntegrationPanel settings={{ apiKeys } as unknown as Record<string, Record<string, unknown>>} />
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Sticky Action Bar */}
      <SaveBar
        dirty={dirty}
        saving={saving}
        saved={saved}
        pendingCount={pendingCount}
        onSave={() => setConfirm("save")}
        onReset={() => setConfirm("reset")}
        onDiscard={onReset}
      />

      {/* Save Confirmation Dialog */}
      <SaveConfirmationDialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        onConfirm={() => {
          const action = confirm;
          setConfirm(null);
          if (action === "save") onSave();
          if (action === "reset") onReset();
        }}
        pendingCount={pendingCount}
      />
    </div>
  );
}