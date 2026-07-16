"use client";

import { useEffect, useState } from "react";
import { Save, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mfaStats, setMfaStats] = useState({ required: 0, enabled: 0 });
  const [settings, setSettings] = useState({
    sessionTimeout: "28800", jwtExpiry: "3600", maxLoginAttempts: "5",
    mfaEnabled: true, passwordMinLength: "8", passwordExpiry: "90",
  });

  useEffect(() => {
    void loadMfaSettings();
  }, []);

  async function loadMfaSettings() {
    try {
      const res = await fetch("/api/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check" }),
      });
      const json = await res.json();
      if (json.success) {
        setSettings((prev) => ({ ...prev, mfaEnabled: json.data.required }));
      }
    } catch { /* ignore */ }
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Persist MFA enforcement setting via settings API
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "mfa_enforcement", value: settings.mfaEnabled }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* ignore */ }
    setSaving(false);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-xl font-semibold text-tu-text-primary">การยืนยันตัวตน</h1><p className="text-tu-text-muted text-sm mt-1">ตั้งค่าวิธีการเข้าสู่ระบบและความปลอดภัย</p></div>
        <Button onClick={handleSave} disabled={saved || saving}>
          {saved ? <><CheckCircle size={18} />บันทึกแล้ว</> : <><Save size={18} />บันทึกการตั้งค่า</>}
        </Button>
      </div>
      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6 space-y-6">
        <div className="pb-6 border-b border-tu-border">
          <h3 className="text-sm font-semibold text-tu-text-primary mb-4">นโยบายรหัสผ่าน</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm text-tu-text-secondary mb-1">ความยาวขั้นต่ำ</label><Input type="number" value={settings.passwordMinLength} onChange={(e) => setSettings({ ...settings, passwordMinLength: e.target.value })} /></div>
            <div><label className="block text-sm text-tu-text-secondary mb-1">หมดอายุทุก (วัน)</label><Input type="number" value={settings.passwordExpiry} onChange={(e) => setSettings({ ...settings, passwordExpiry: e.target.value })} /></div>
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded accent-tu-primary" /><span className="text-sm text-tu-text-secondary">ต้องมีตัวพิมพ์ใหญ่</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded accent-tu-primary" /><span className="text-sm text-tu-text-secondary">ต้องมีอักขระพิเศษ</span></label>
          </div>
        </div>
        <div className="pb-6 border-b border-tu-border">
          <h3 className="text-sm font-semibold text-tu-text-primary mb-4">เซสชันและ JWT</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm text-tu-text-secondary mb-1">Session Timeout (วินาที)</label><Input type="number" value={settings.sessionTimeout} onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })} /></div>
            <div><label className="block text-sm text-tu-text-secondary mb-1">JWT Expiry (วินาที)</label><Input type="number" value={settings.jwtExpiry} onChange={(e) => setSettings({ ...settings, jwtExpiry: e.target.value })} /></div>
            <div><label className="block text-sm text-tu-text-secondary mb-1">จำนวนล็อกอินสูงสุดก่อนล็อก</label><Input type="number" value={settings.maxLoginAttempts} onChange={(e) => setSettings({ ...settings, maxLoginAttempts: e.target.value })} /></div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-tu-text-primary mb-4 flex items-center gap-2"><Shield size={16} className="text-tu-primary" />MFA</h3>
          <label className="flex items-center gap-3 mb-4">
            <input type="checkbox" checked={settings.mfaEnabled} onChange={(e) => setSettings({ ...settings, mfaEnabled: e.target.checked })} className="rounded accent-tu-primary h-5 w-5" />
            <div><span className="text-sm font-medium text-tu-text-primary">บังคับ MFA สำหรับ System Admin+</span><p className="text-xs text-tu-text-muted">ผู้ใช้ระดับ System Admin และ Super Admin ต้องตั้งค่า MFA ก่อนเข้าใช้งาน</p></div>
          </label>
          {mfaStats.required > 0 && (
            <div className="rounded-lg border border-tu-border bg-tu-bg p-3 text-sm text-tu-text-secondary">
              MFA Status: {mfaStats.enabled}/{mfaStats.required} ผู้ดูแลระบบตั้งค่า MFA แล้ว
              {mfaStats.enabled < mfaStats.required && (
                <span className="text-tu-warning ml-1">({mfaStats.required - mfaStats.enabled} รายยังไม่ได้ตั้งค่า)</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
