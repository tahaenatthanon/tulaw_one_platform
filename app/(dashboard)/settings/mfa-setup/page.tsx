"use client";

import { useState } from "react";
import { Smartphone, Shield, CheckCircle, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MfaSetupPage() {
  const [step, setStep] = useState<"intro" | "setup" | "verify">("intro");
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);

  return (
    <div className="p-6 space-y-6 max-w-lg">
      <div><h1 className="text-xl font-semibold text-tu-text-primary">ตั้งค่า MFA</h1><p className="text-tu-text-muted text-sm mt-1">Multi-Factor Authentication — เพิ่มความปลอดภัยให้บัญชีของคุณ</p></div>

      {step === "intro" && (
        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tu-primary-soft"><Shield size={24} className="text-tu-primary" /></div>
            <div><h2 className="text-sm font-semibold text-tu-text-primary">เปิดใช้งาน MFA</h2><p className="text-xs text-tu-text-muted">MFA จำเป็นสำหรับผู้ใช้ระดับ System Admin ขึ้นไป</p></div>
          </div>
          <p className="text-sm text-tu-text-secondary">MFA (Multi-Factor Authentication) เพิ่มขั้นตอนการยืนยันตัวตนอีกชั้นด้วยรหัส OTP ผ่านแอป Authenticator ทำให้บัญชีของคุณปลอดภัยแม้รหัสผ่านจะรั่วไหล</p>
          <Button onClick={() => setStep("setup")}><Smartphone size={18} />เริ่มตั้งค่า</Button>
        </div>
      )}

      {step === "setup" && (
        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-tu-text-primary flex items-center gap-2"><Key size={18} className="text-tu-primary" />สแกน QR Code</h2>
          <p className="text-sm text-tu-text-secondary">1. เปิดแอป Google Authenticator หรือ Microsoft Authenticator</p>
          <p className="text-sm text-tu-text-secondary">2. สแกน QR Code ด้านล่าง หรือกรอก Secret Key ด้วยตนเอง</p>
          <div className="flex justify-center py-4">
            <div className="h-40 w-40 border-2 border-dashed border-tu-border rounded-xl flex items-center justify-center bg-tu-bg">
              <span className="text-tu-text-muted text-xs text-center">[QR Code Placeholder]<br />TU-LAW-MFA-ADMIN</span>
            </div>
          </div>
          <div className="bg-tu-bg rounded-lg p-3">
            <p className="text-xs text-tu-text-muted">Secret Key: <code className="text-tu-primary font-mono">JBSWY3DPEHPK3PXP</code></p>
          </div>
          <Button onClick={() => setStep("verify")}>ต่อไป</Button>
        </div>
      )}

      {step === "verify" && (
        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-tu-text-primary flex items-center gap-2"><CheckCircle size={18} className="text-tu-success" />ยืนยันรหัส OTP</h2>
          <p className="text-sm text-tu-text-secondary">กรอกรหัส 6 หลักจากแอป Authenticator</p>
          <Input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" maxLength={6} className="text-center text-2xl tracking-[0.5em] font-mono" />
          <Button onClick={() => { setVerified(true); alert("✅ MFA เปิดใช้งานสำเร็จ"); }} disabled={code.length !== 6}>ยืนยัน</Button>
          {verified && <p className="text-sm text-tu-success font-medium flex items-center gap-1.5"><CheckCircle size={16} />MFA พร้อมใช้งานแล้ว</p>}
        </div>
      )}
    </div>
  );
}
