"use client";

import { useState } from "react";
import { Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    sessionTimeout: "28800", jwtExpiry: "3600", maxLoginAttempts: "5",
    mfaEnabled: true, passwordMinLength: "8", passwordExpiry: "90",
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-xl font-semibold text-tu-text-primary">การยืนยันตัวตน</h1><p className="text-tu-text-muted text-sm mt-1">ตั้งค่าวิธีการเข้าสู่ระบบและความปลอดภัย</p></div>
        <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }} disabled={saved}>
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
          <h3 className="text-sm font-semibold text-tu-text-primary mb-4">MFA</h3>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={settings.mfaEnabled} onChange={(e) => setSettings({ ...settings, mfaEnabled: e.target.checked })} className="rounded accent-tu-primary h-5 w-5" />
            <div><span className="text-sm font-medium text-tu-text-primary">บังคับ MFA สำหรับ System Admin+</span><p className="text-xs text-tu-text-muted">ผู้ใช้ระดับ System Admin และ Super Admin ต้องตั้งค่า MFA</p></div>
          </label>
        </div>
      </div>
    </div>
  );
}
