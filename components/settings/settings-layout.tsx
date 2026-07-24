"use client";

import { useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import useSWR from "swr";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { swrFetcher, fetchApi } from "@/lib/fetcher";
import { SettingsHeader } from "./settings-header";
import { CategoryId, CATEGORIES } from "./category-sidebar";
import { GroupedCategorySidebar } from "./grouped-category-sidebar";
import { ConfigSection } from "./config-section";
import { BrandingPreview } from "./branding-preview";
import { LogoUpload } from "./logo-upload";
import { ApiKeyTable } from "./api-key-table";
import { StorageVisualization } from "./storage-visualization";
import { SaveBar } from "./save-bar";
import { SaveConfirmationDialog } from "./save-confirmation-dialog";
import { SettingsSearch } from "./settings-search";
import { EmptyState } from "./empty-state";
import {
  ShieldCheck, Key, Palette, HardDrive,
  Plus, X,
} from "lucide-react";

/* ==============================================================================
   Types — identical to original page.tsx, kept for backward compatibility
   ============================================================================== */

interface Category { id: string; name: string; color: string; }

interface AuthSettings { sessionTimeout: string; jwtExpiry: string; maxLoginAttempts: string; mfaEnforced: boolean; }
interface SsoSettings { ldapUrl: string; baseDn: string; domain: string; syncInterval: string; enabled: boolean; }
interface BrandingSettings { name: string; color: string; logoUrl?: string; }
interface StorageSettings { quota: string; fileTypes: string[]; projectTypes: string[]; annCats: Category[]; projCats: Category[]; }
interface ApiKey { id: string; name: string; key: string; permissions: string; createdAt: string; lastUsed: string; }

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

const SAVED_KEYS = ["auth", "sso", "branding", "storage"] as const;
type SavedKey = (typeof SAVED_KEYS)[number];

function getOriginalValues(
  settingsData: Record<string, Record<string, unknown>> | undefined,
): Record<SavedKey, Record<string, unknown>> {
  return {
    auth: { ...DEFAULT_AUTH, ...(settingsData?.auth as Partial<AuthSettings> ?? {}) },
    sso: { ...DEFAULT_SSO, ...(settingsData?.sso as Partial<SsoSettings> ?? {}) },
    branding: { ...DEFAULT_BRANDING, ...(settingsData?.branding as Partial<BrandingSettings> ?? {}) },
    storage: { ...DEFAULT_STORAGE, ...(settingsData?.storage as Partial<StorageSettings> ?? {}) },
  };
}

/* ==============================================================================
   Branding helpers — identical to original
   ============================================================================== */

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

/* ==============================================================================
   Settings Layout — Enterprise orchestrator
   ============================================================================== */

export function SettingsLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("category") ?? searchParams.get("tab") ?? "auth";
  const activeCategory: CategoryId = (CATEGORIES.some((c) => c.id === tabParam) ? tabParam : "auth") as CategoryId;

  const setActiveCategory = useCallback(
    (id: CategoryId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("category", id);
      params.delete("tab");
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // Fetch settings
  const { data: settingsData, mutate } = useSWR("/api/settings", swrFetcher);
  const settings = (settingsData || {}) as Record<string, Record<string, unknown>>;

  // Form state
  const [authForm, setAuthForm] = useState<AuthSettings>(DEFAULT_AUTH);
  const [ssoForm, setSsoForm] = useState<SsoSettings>(DEFAULT_SSO);
  const [brandingForm, setBrandingForm] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [storageForm, setStorageForm] = useState<StorageSettings>(DEFAULT_STORAGE);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Sync from API on first load
  useEffect(() => {
    if (settingsData && !initialized) {
      if (settings.auth) setAuthForm({ ...DEFAULT_AUTH, ...(settings.auth as Partial<AuthSettings>) });
      if (settings.sso) setSsoForm({ ...DEFAULT_SSO, ...(settings.sso as Partial<SsoSettings>) });
      if (settings.branding) {
        const brandingFromApi = settings.branding as Record<string, unknown>;
        const b = {
          ...DEFAULT_BRANDING,
          ...(brandingFromApi as Partial<BrandingSettings>),
        };
        setBrandingForm(b);
        if (b.logoUrl) setLogoPreviewUrl(b.logoUrl);
        applyBranding(b);
      }
      if (settings.storage) setStorageForm({ ...DEFAULT_STORAGE, ...(settings.storage as Partial<StorageSettings>) });
      setInitialized(true);
    }
  }, [settingsData, initialized, settings.auth, settings.sso, settings.branding, settings.storage]);

  // Explicit save
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const markDirty = () => { if (!dirty) setDirty(true); setSaved(false); };

  const handleLogoUpload = async (): Promise<string | undefined> => {
    if (!logoFile) return brandingForm.logoUrl;
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);
      const result = await fetchApi("/api/settings/logo", {
        method: "POST",
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      });
      const newLogoUrl = (result as { logoUrl?: string })?.logoUrl;
      if (newLogoUrl) {
        setBrandingForm(prev => ({ ...prev, logoUrl: newLogoUrl }));
        setLogoPreviewUrl(newLogoUrl);
      }
      return newLogoUrl;
    } catch (e) {
      console.error("[handleLogoUpload]", e);
      return brandingForm.logoUrl;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upload logo first if changed
      await handleLogoUpload();

      const body: Record<string, unknown> = {
        auth: authForm,
        sso: ssoForm,
        branding: brandingForm,
        storage: storageForm,
      };
      await fetchApi("/api/settings", { method: "PUT", body: JSON.stringify(body) });
      await mutate();
      applyBranding(brandingForm);
      setLogoFile(null);
      // Keep preview URL as the saved logo
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error("[handleSave]", e); }
    setSaving(false);
  };

  const handleReset = () => {
    const original = getOriginalValues(settingsData);
    setAuthForm(original.auth as AuthSettings);
    setSsoForm(original.sso as SsoSettings);
    setBrandingForm(original.branding as BrandingSettings);
    setStorageForm(original.storage as StorageSettings);
    setDirty(false);
    setSaved(false);
  };

  const handleDiscard = () => {
    setAuthForm(DEFAULT_AUTH);
    setSsoForm(DEFAULT_SSO);
    setBrandingForm(DEFAULT_BRANDING);
    setStorageForm(DEFAULT_STORAGE);
    setLogoFile(null);
    setLogoPreviewUrl(null);
    setDirty(false);
    setSaved(false);
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Save confirmation dialog
  const [showConfirm, setShowConfirm] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const visibleCategories = useMemo(() => {
    if (!searchQuery.trim()) return undefined;
    const q = searchQuery.toLowerCase();
    const matched = new Set<CategoryId>();
    CATEGORIES.forEach((c) => {
      if (c.label.toLowerCase().includes(q)) matched.add(c.id);
    });
    return matched;
  }, [searchQuery]);

  // Determine section display for current category
  const getSectionVisibility = (): Record<SavedKey, boolean> => {
    const blank = { auth: false, sso: false, branding: false, storage: false };
    if (!searchQuery.trim()) return { auth: true, sso: true, branding: true, storage: true };

    const q = searchQuery.toLowerCase();
    if (activeCategory === "auth") {
      return {
        auth: "session" in { session: true } ? true : true, // always show
        sso: false, branding: false, storage: false,
      };
    }
    return blank;
  };

  // Compute pending change count
  const pendingCount = useMemo(() => {
    if (!dirty) return 0;
    let count = 0;
    const original = getOriginalValues(settingsData);
    if (JSON.stringify(authForm) !== JSON.stringify(original.auth)) count++;
    if (JSON.stringify(ssoForm) !== JSON.stringify(original.sso)) count++;
    if (JSON.stringify(brandingForm) !== JSON.stringify(original.branding)) count++;
    if (JSON.stringify(storageForm) !== JSON.stringify(original.storage)) count++;
    return count;
  }, [dirty, authForm, ssoForm, brandingForm, storageForm, settingsData]);

  /* ==========================================================================
     Render Content by Category
     ========================================================================== */

  const renderAuthContent = () => (
    <div className="space-y-5">
      <ConfigSection title="Session" description="กำหนดระยะเวลา session และอายุ token">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-tu-text-primary block mb-1">Session Timeout (วินาที)</label>
            <input type="number" value={authForm.sessionTimeout} onChange={e => { setAuthForm({ ...authForm, sessionTimeout: e.target.value }); markDirty(); }} placeholder="28800" className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm w-full outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
          </div>
          <div>
            <label className="text-sm font-medium text-tu-text-primary block mb-1">JWT Token Expiry (วินาที)</label>
            <input type="number" value={authForm.jwtExpiry} onChange={e => { setAuthForm({ ...authForm, jwtExpiry: e.target.value }); markDirty(); }} placeholder="3600" className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm w-full outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
          </div>
        </div>
      </ConfigSection>

      <ConfigSection title="Login Policy" description="ตั้งค่านโยบายการเข้าสู่ระบบ">
        <div>
          <label className="text-sm font-medium text-tu-text-primary block mb-1">จำนวนครั้งล็อกอินสูงสุดก่อนล็อกบัญชี</label>
          <input type="number" value={authForm.maxLoginAttempts} onChange={e => { setAuthForm({ ...authForm, maxLoginAttempts: e.target.value }); markDirty(); }} min={1} max={20} className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm w-32 outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
        </div>
      </ConfigSection>

      <ConfigSection title="MFA" description="การยืนยันตัวตน 2 ขั้นตอน">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={authForm.mfaEnforced} onChange={e => { setAuthForm({ ...authForm, mfaEnforced: e.target.checked }); markDirty(); }} className="rounded border-tu-border text-tu-primary focus:ring-tu-primary w-4 h-4" />
          <div><span className="text-sm font-medium text-tu-text-primary">บังคับใช้ MFA สำหรับ Admin ขึ้นไป</span><p className="text-xs text-tu-text-muted">บังคับให้ Super Admin, System Admin ต้องยืนยันตัวตน 2 ขั้นตอน</p></div>
        </label>
      </ConfigSection>
    </div>
  );

  const renderSsoContent = () => (
    <div className="space-y-5">
      <ConfigSection title="LDAP Configuration" description="ตั้งค่าเซิร์ฟเวอร์ LDAP สำหรับการเชื่อมต่อ Active Directory">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-tu-text-primary block mb-1">LDAP URL</label><input type="text" value={ssoForm.ldapUrl} onChange={e => { setSsoForm({ ...ssoForm, ldapUrl: e.target.value }); markDirty(); }} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div>
          <div><label className="text-sm font-medium text-tu-text-primary block mb-1">Domain</label><input type="text" value={ssoForm.domain} onChange={e => { setSsoForm({ ...ssoForm, domain: e.target.value }); markDirty(); }} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div>
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium text-tu-text-primary block mb-1">Base DN</label>
          <input type="text" value={ssoForm.baseDn} onChange={e => { setSsoForm({ ...ssoForm, baseDn: e.target.value }); markDirty(); }} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
        </div>
      </ConfigSection>

      <ConfigSection title="Synchronization" description="ตั้งค่าการซิงค์ข้อมูลจาก Active Directory">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-tu-text-primary block mb-1">Sync Interval (นาที)</label>
            <input type="number" value={ssoForm.syncInterval} onChange={e => { setSsoForm({ ...ssoForm, syncInterval: e.target.value }); markDirty(); }} min={1} max={120} className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm w-32 outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer mt-4">
          <input type="checkbox" checked={ssoForm.enabled} onChange={e => { setSsoForm({ ...ssoForm, enabled: e.target.checked }); markDirty(); }} className="rounded border-tu-border text-tu-primary focus:ring-tu-primary w-4 h-4" />
          <span className="text-sm font-medium text-tu-text-primary">เปิดใช้งาน Active Directory Sync</span>
        </label>
      </ConfigSection>
    </div>
  );

  const renderBrandingContent = () => (
    <div className="space-y-5">
      <ConfigSection title="Identity" description="กำหนดเอกลักษณ์ของระบบ">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-tu-text-primary block mb-1">Logo</label>
            <div className="flex items-center gap-4">
              <LogoUpload
                currentLogo={brandingForm.logoUrl}
                previewUrl={logoPreviewUrl}
                onLogoChange={(file) => {
                  if (file) {
                    setLogoFile(file);
                    const objectUrl = URL.createObjectURL(file);
                    setLogoPreviewUrl(objectUrl);
                    markDirty();
                  } else {
                    setLogoFile(null);
                    setLogoPreviewUrl(brandingForm.logoUrl || null);
                    markDirty();
                  }
                }}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-tu-text-primary block mb-1">ชื่อระบบ</label>
            <input type="text" value={brandingForm.name} onChange={e => { setBrandingForm({ ...brandingForm, name: e.target.value }); markDirty(); }} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
          </div>
        </div>
      </ConfigSection>

      <ConfigSection title="Theme" description="กำหนดสีหลักของระบบ">
        <div>
          <label className="text-sm font-medium text-tu-text-primary block mb-1">สีธีมหลัก</label>
          <div className="flex items-center gap-3">
            <input type="color" value={brandingForm.color} onChange={e => { setBrandingForm({ ...brandingForm, color: e.target.value }); markDirty(); }} className="h-10 w-16 rounded-lg border border-tu-border cursor-pointer" />
            <div className="flex flex-wrap gap-2">
              {BRAND_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => { setBrandingForm({ ...brandingForm, color: c }); markDirty(); }}
                  className={cn("h-7 w-7 rounded-full border-2 transition-all", c === brandingForm.color ? "border-tu-text-primary scale-110" : "border-transparent")}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </ConfigSection>

      <BrandingPreview branding={brandingForm} logoUrl={logoPreviewUrl || brandingForm.logoUrl} />
    </div>
  );

  const renderStorageContent = () => (
    <div className="space-y-5">
      <ConfigSection title="Quota" description="กำหนดขนาดพื้นที่จัดเก็บสูงสุดต่อผู้ใช้">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-tu-text-secondary">ขนาดสูงสุดต่อผู้ใช้:</label>
            <input type="number" value={storageForm.quota} onChange={e => { setStorageForm({ ...storageForm, quota: e.target.value }); markDirty(); }} min={1} max={100} className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm w-24 outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
            <span className="text-sm text-tu-text-secondary">GB</span>
          </div>
          <StorageVisualization quota={parseInt(storageForm.quota) || 5} />
        </div>
      </ConfigSection>

      <ConfigSection title="File Types" description="กำหนดประเภทไฟล์ที่อนุญาตให้อัปโหลด">
        <FileTypeManager types={storageForm.fileTypes} onChange={(types) => { setStorageForm({ ...storageForm, fileTypes: types }); markDirty(); }} />
      </ConfigSection>
    </div>
  );

  const renderIntegrationContent = () => (
    <div className="space-y-5">
      <ConfigSection title="API Keys" description="จัดการ API Key สำหรับเชื่อมต่อระบบภายนอก">
        <ApiKeyTable settings={settings} />
      </ConfigSection>
      <ConfigSection title="External Services" description="การเชื่อมต่อกับระบบภายนอก">
        <EmptyState type="integration" />
      </ConfigSection>
    </div>
  );

  /* ==========================================================================
     Main Render
     ========================================================================== */

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <SettingsHeader />
      </div>

      {/* Search */}
      <div className="px-6 pb-4">
        <SettingsSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Main Content: Sidebar + Panel */}
      <div className="flex flex-1 min-h-0 px-6 pb-24">
        {/* Desktop: Vertical Grouped Sidebar */}
        <aside className="hidden lg:flex w-[280px] shrink-0 mr-6">
          <div className="rounded-2xl border border-tu-border bg-tu-surface p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] w-full">
            <GroupedCategorySidebar
              active={activeCategory}
              onSelect={setActiveCategory}
              visible={visibleCategories}
              searchQuery={searchQuery}
            />
          </div>
        </aside>

        {/* Tablet: Horizontal Pill Bar — Natural Width, No Background on Active, Underline Only */}
        <div className="hidden md:flex lg:hidden w-fit mb-4 overflow-x-auto gap-1 pb-1 border-b border-tu-border">
          {CATEGORIES.filter((c) => !visibleCategories || visibleCategories.has(c.id)).map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
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

        {/* Mobile category selector */}
        <div className="md:hidden w-full mb-4">
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value as CategoryId)}
            className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Panel */}
        <main className="flex-1 min-w-0 max-w-4xl">
          <div className="space-y-5">
            {activeCategory === "auth" && renderAuthContent()}
            {activeCategory === "sso" && renderSsoContent()}
            {activeCategory === "branding" && renderBrandingContent()}
            {activeCategory === "storage" && renderStorageContent()}
            {activeCategory === "integration" && renderIntegrationContent()}
          </div>

        </main>
      </div>

      {/* Sticky Action Bar */}
      <SaveBar
        dirty={dirty}
        saving={saving}
        saved={saved}
        pendingCount={pendingCount}
        onSave={() => setShowConfirm(true)}
        onReset={handleReset}
        onDiscard={handleDiscard}
      />

      {/* Save Confirmation Dialog */}
      <SaveConfirmationDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={() => {
          setShowConfirm(false);
          handleSave();
        }}
        pendingCount={pendingCount}
      />
    </div>
  );
}


function FileTypeManager({ types, onChange }: { types: string[]; onChange: (t: string[]) => void }) {
  const [newType, setNewType] = useState("");
  const add = () => {
    if (newType.trim() && !types.includes(newType.trim().toUpperCase())) {
      onChange([...types, newType.trim().toUpperCase()]);
      setNewType("");
    }
  };
  const remove = (t: string) => onChange(types.filter(x => x !== t));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {types.map(t => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-tu-primary-soft px-3 py-1 text-xs font-medium text-tu-primary">
            {t}
            <button onClick={() => remove(t)} className="ml-1 hover:text-tu-error"><X size={12} /></button>
          </span>
        ))}
        {types.length === 0 && <p className="text-xs text-tu-text-muted">ยังไม่มีประเภทไฟล์ที่อนุญาต</p>}
      </div>
      <div className="flex gap-2">
        <input type="text" value={newType} onChange={e => setNewType(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="เพิ่มประเภทไฟล์..." className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm flex-1 outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
        <button onClick={add} className="rounded-[--radius-btn] bg-tu-primary px-3 py-2 text-xs font-medium text-white hover:bg-tu-primary-hover transition-colors shrink-0"><Plus size={14} />เพิ่ม</button>
      </div>
    </div>
  );
}
