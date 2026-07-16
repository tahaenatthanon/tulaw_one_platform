"use client";

import { useEffect, useState } from "react";
import { Smartphone, Shield, CheckCircle, Key, Eye, Copy, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = "intro" | "setup" | "verify" | "backup" | "done";

export default function MfaSetupPage() {
  const [step, setStep] = useState<Step>("intro");
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [required, setRequired] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [codesCopied, setCodesCopied] = useState(false);

  useEffect(() => {
    void loadStatus();
  }, []);

  async function loadStatus() {
    const res = await fetch("/api/mfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check" }),
    });
    const json = await res.json();
    if (json.success) {
      setRequired(json.data.required);
      setEnabled(json.data.enabled);
      if (json.data.enabled) {
        setStep("done");
      }
    }
  }

  async function startSetup() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/mfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setup" }),
    });
    const json = await res.json();
    setLoading(false);
    if (json.success) {
      setQrDataUrl(json.data.qrDataUrl);
      setSecretKey(json.data.secret);
      setStep("setup");
    } else {
      setError(json.error?.message ?? "ไม่สามารถเริ่มตั้งค่า MFA ได้");
    }
  }

  async function verifySetup() {
    if (code.length !== 6) return;
    setError("");
    setLoading(true);
    const res = await fetch("/api/mfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify-setup", otp: code, secret: secretKey }),
    });
    const json = await res.json();
    setLoading(false);
    if (json.success) {
      setVerified(true);
      setEnabled(true);
      setBackupCodes(json.data.backupCodes ?? []);
      setStep("backup");
    } else {
      setError(json.error?.message ?? "รหัส OTP ไม่ถูกต้อง");
    }
  }

  function copyBackupCodes() {
    void navigator.clipboard.writeText(backupCodes.join("\n"));
    setCodesCopied(true);
    setTimeout(() => setCodesCopied(false), 2500);
  }

  function downloadBackupCodes() {
    const text = ["TULAW ONE Platform - MFA Backup Codes", "วันที่: " + new Date().toLocaleDateString("th-TH"), "", ...backupCodes].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tulaw-mfa-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl font-semibold text-tu-text-primary">ตั้งค่า MFA</h1>
        <p className="text-tu-text-muted text-sm mt-1">Multi-Factor Authentication — เพิ่มความปลอดภัยให้บัญชีของคุณ</p>
      </div>

      {error && (
        <div className="bg-tu-error/10 border border-tu-error/30 rounded-lg p-3 text-sm text-tu-error">{error}</div>
      )}

      {/* Intro */}
      {step === "intro" && (
        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tu-primary-soft"><Shield size={24} className="text-tu-primary" /></div>
            <div><h2 className="text-sm font-semibold text-tu-text-primary">เปิดใช้งาน MFA</h2><p className="text-xs text-tu-text-muted">MFA จำเป็นสำหรับผู้ใช้ระดับ System Admin ขึ้นไป</p></div>
          </div>
          <p className="text-sm text-tu-text-secondary">MFA (Multi-Factor Authentication) เพิ่มขั้นตอนการยืนยันตัวตนอีกชั้นด้วยรหัส OTP ผ่านแอป Authenticator ทำให้บัญชีของคุณปลอดภัยแม้รหัสผ่านจะรั่วไหล</p>
          <div className="rounded-lg border border-tu-border bg-tu-bg p-3 text-sm text-tu-text-secondary">
            {required ? (
              enabled ? "สถานะ: ✅ เปิดใช้งานแล้ว" : "สถานะ: ⚠ จำเป็นต้องตั้งค่า MFA ก่อนใช้งานระบบ"
            ) : (
              "สถานะ: ไม่มีข้อกำหนด MFA สำหรับบัญชีนี้"
            )}
          </div>
          {(!enabled || !required) && (
            <Button onClick={startSetup} disabled={loading}>
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <Smartphone size={18} />}
              เริ่มตั้งค่า
            </Button>
          )}
          {enabled && (
            <p className="text-sm text-tu-success font-medium flex items-center gap-1.5"><CheckCircle size={16} />MFA พร้อมใช้งานแล้ว — คุณสามารถเข้าสู่ระบบได้ตามปกติ</p>
          )}
        </div>
      )}

      {/* Setup — QR Code */}
      {step === "setup" && (
        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-tu-text-primary flex items-center gap-2"><Key size={18} className="text-tu-primary" />สแกน QR Code</h2>
          <p className="text-sm text-tu-text-secondary">1. เปิดแอป Google Authenticator หรือ Microsoft Authenticator</p>
          <p className="text-sm text-tu-text-secondary">2. สแกน QR Code ด้านล่าง หรือกรอก Secret Key ด้วยตนเอง</p>
          <div className="flex justify-center py-2">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="MFA QR Code" className="h-48 w-48 rounded-xl border border-tu-border" />
            ) : (
              <div className="h-48 w-48 border-2 border-dashed border-tu-border rounded-xl flex items-center justify-center bg-tu-bg">
                <RefreshCw size={24} className="animate-spin text-tu-text-muted" />
              </div>
            )}
          </div>

          <button type="button" onClick={() => setShowManual(!showManual)} className="text-xs text-tu-primary hover:underline text-center w-full">
            {showManual ? "ซ่อน Secret Key" : "ดูไม่เห็น QR Code? กรอกด้วยตนเอง"}
          </button>

          {showManual && (
            <div className="bg-tu-bg rounded-lg p-3">
              <p className="text-xs text-tu-text-muted mb-1">Secret Key:</p>
              <code className="text-tu-primary font-mono text-sm break-all">{secretKey || "กำลังโหลด..."}</code>
            </div>
          )}

          <Button onClick={() => setStep("verify")} disabled={!secretKey}>ต่อไป</Button>
        </div>
      )}

      {/* Verify OTP */}
      {step === "verify" && (
        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-tu-text-primary flex items-center gap-2"><CheckCircle size={18} className="text-tu-success" />ยืนยันรหัส OTP</h2>
          <p className="text-sm text-tu-text-secondary">กรอกรหัส 6 หลักจากแอป Authenticator</p>
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="text-center text-2xl tracking-[0.5em] font-mono"
            autoComplete="one-time-code"
          />
          <Button onClick={verifySetup} disabled={code.length !== 6 || loading}>
            {loading ? <RefreshCw size={18} className="animate-spin" /> : null}
            ยืนยัน
          </Button>
          <button type="button" onClick={() => setStep("setup")} className="text-xs text-tu-text-muted hover:underline w-full text-center">← กลับไปหน้า QR Code</button>
        </div>
      )}

      {/* Backup Codes */}
      {step === "backup" && (
        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tu-secondary-soft"><Shield size={24} className="text-tu-secondary" /></div>
            <div><h2 className="text-sm font-semibold text-tu-text-primary">บันทึก Backup Codes</h2><p className="text-xs text-tu-text-muted">ใช้เมื่อไม่สามารถเข้าถึง Authenticator ได้</p></div>
          </div>
          <div className="bg-tu-bg rounded-lg border border-tu-border p-4">
            <p className="text-xs text-tu-text-muted mb-3">⚠ Backup Codes จะแสดงเพียงครั้งเดียว กรุณาบันทึกไว้ในที่ปลอดภัย แต่ละ code ใช้ได้เพียงครั้งเดียว</p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((bc, i) => (
                <code key={i} className="bg-tu-surface rounded-md px-2 py-1 text-xs font-mono text-tu-text-primary border border-tu-border text-center">{bc}</code>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyBackupCodes} className="flex-1">
              {codesCopied ? <CheckCircle size={16} /> : <Copy size={16} />}
              {codesCopied ? "คัดลอกแล้ว" : "คัดลอก"}
            </Button>
            <Button variant="outline" onClick={downloadBackupCodes} className="flex-1">
              <Download size={16} />
              ดาวน์โหลด
            </Button>
          </div>
          <Button onClick={() => setStep("done")} className="w-full"><CheckCircle size={18} />เสร็จสิ้น</Button>
        </div>
      )}

      {/* Done */}
      {step === "done" && (
        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tu-success/10"><CheckCircle size={24} className="text-tu-success" /></div>
            <div><h2 className="text-sm font-semibold text-tu-text-primary">MFA พร้อมใช้งานแล้ว</h2><p className="text-xs text-tu-text-muted">บัญชีของคุณได้รับการปกป้องด้วย Multi-Factor Authentication</p></div>
          </div>
          <p className="text-sm text-tu-text-secondary">ทุกครั้งที่เข้าสู่ระบบ คุณจะต้องกรอกรหัส OTP 6 หลักจากแอป Authenticator เพิ่มเติมจากรหัสผ่าน</p>
          <div className="rounded-lg border border-tu-border bg-tu-bg p-3 text-sm text-tu-text-secondary flex items-center gap-2">
            <Eye size={16} className="text-tu-text-muted" />
            {backupCodes.length > 0 ? `คุณมี Backup Codes เหลือ ${backupCodes.length} ชุด` : "MFA เปิดใช้งานแล้ว"}
          </div>
        </div>
      )}
    </div>
  );
}
