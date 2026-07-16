"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
  Shield,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const features = [
  { title: "Single Platform", desc: "รวมทุกระบบของคณะนิติศาสตร์ไว้ในที่เดียว" },
  { title: "Secure Access", desc: "ยืนยันตัวตนผ่าน Active Directory ของมหาวิทยาลัย" },
  { title: "Real-time Dashboard", desc: "ติดตามข้อมูลและสถิติแบบเรียลไทม์" },
  { title: "9 Application Modules", desc: "ครอบคลุมทุกการทำงานตั้งแต่ ERP ถึงคลินิกกฎหมาย" },
];

function LoginPageContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("admin@tulaw.ac.th");
  const [password, setPassword] = useState("TuLaw@2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // MFA states
  const [mfaStep, setMfaStep] = useState<"password" | "otp" | "backup">("password");
  const [otp, setOtp] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Get CSRF token
      const csrfRes = await fetch("/api/auth/csrf");
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrfToken;

      // Call credentials callback
      const res = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          csrfToken,
          callbackUrl,
          json: "true",
        }),
      });

      if (res.ok) {
        const data = await res.json();

        // Check MFA status from session
        try {
          const sessionRes = await fetch("/api/auth/session");
          const sessionData = await sessionRes.json();
          const userMfaVerified = sessionData?.user?.mfaVerified;
          const userRoles: string[] = sessionData?.user?.roles ?? [];

          // Check if user needs MFA (System Admin+)
          const isAdmin = userRoles.some((r) => r === "super_admin" || r === "system_admin");
          if (isAdmin) {
            setMfaRequired(true);
            // Check if MFA is set up
            const mfaRes = await fetch("/api/mfa", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "check" }),
            });
            const mfaData = await mfaRes.json();
            if (mfaData.success && mfaData.data.enabled) {
              setMfaEnabled(true);
              setMfaStep("otp");
              setLoading(false);
              return;
            }
            // MFA not enabled — redirect to setup
            window.location.href = "/settings/mfa-setup";
            return;
          }
        } catch {
          // Fall through to normal redirect
        }

        // Normal login — redirect to dashboard
        window.location.href = data.url || callbackUrl;
      } else {
        const text = await res.text();
        let msg = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
        try {
          const data = JSON.parse(text);
          msg = data.error || (res.status >= 500 ? "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง" : msg);
        } catch {}
        setError(msg);
        setLoading(false);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง";
      setError(message);
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (otp.length !== 6) return;
    setError("");
    setLoading(true);
    const res = await fetch("/api/mfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify-login", otp }),
    });
    const json = await res.json();
    if (json.success) {
      window.location.href = callbackUrl;
    } else {
      setError(json.error?.message ?? "รหัส OTP ไม่ถูกต้อง");
      setOtp("");
      setLoading(false);
    }
  }

  async function verifyBackupCodeHandler() {
    if (!backupCode.trim()) return;
    setError("");
    setLoading(true);
    const res = await fetch("/api/mfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify-backup", backupCode }),
    });
    const json = await res.json();
    if (json.success) {
      window.location.href = callbackUrl;
    } else {
      setError(json.error?.message ?? "Backup Code ไม่ถูกต้อง");
      setBackupCode("");
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ==========================================================================
          Left: Hero Section (60%)
          ========================================================================== */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-tu-primary">
        {/* Background pattern */}
        <div className="absolute inset-0">
          {/* Large decorative circles */}
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/5" />
          <div className="absolute -bottom-60 -right-20 w-[600px] h-[600px] rounded-full bg-white/3" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-tu-secondary/10" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 py-0 w-full h-full overflow-hidden">
          {/* Logo + Brand */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-tu-secondary shadow-xl shadow-tu-secondary/30">
                <span className="text-tu-text-primary font-black text-2xl">มธ</span>
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight leading-none">
                  TULAW ONE
                </h1>
                <p className="text-lg font-semibold text-white/80 tracking-wide">PLATFORM</p>
              </div>
            </div>
            <p className="text-white/60 text-lg leading-relaxed max-w-lg">
              ระบบศูนย์กลางดิจิทัล
              <br />
              <span className="text-white font-bold text-xl">คณะนิติศาสตร์</span>
              <br />
              <span className="text-white/80">มหาวิทยาลัยธรรมศาสตร์</span>
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm text-white/70">
              <Sparkles size={14} className="text-tu-secondary" />
              Digital Central Platform for Faculty of Law, TU
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-4 mb-10">
            {features.map((feat, i) => (
              <div key={feat.title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 shrink-0 mt-0.5 border border-white/10">
                  <span className="text-tu-secondary font-bold text-sm">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{feat.title}</h3>
                  <p className="text-sm text-white/50 mt-0.5">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom stats */}
          <div className="flex flex-wrap items-center gap-5 text-white/40 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-tu-secondary" />
              Microsoft SSO
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-tu-secondary" />
              MFA Protected
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-tu-secondary" />
              TLS/HTTPS Encrypted
            </div>
          </div>
        </div>

        {/* Decorative bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-tu-secondary" />
      </div>

      {/* ==========================================================================
          Right: Login Card (40%)
          ========================================================================== */}
      <div className="flex-1 flex items-center justify-center bg-tu-bg p-6 sm:p-12 lg:p-8 overflow-hidden">
        {/* Mobile logo (visible only on small screens) */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tu-primary">
            <span className="text-white font-bold text-sm">มธ</span>
          </div>
          <span className="text-sm font-semibold text-tu-text-primary">TULAW ONE PLATFORM</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Floating Card */}
          <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl p-8">
            {/* Card Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-tu-text-primary">
                ลงชื่อเข้าใช้
              </h2>
              <p className="text-tu-text-muted text-sm mt-1">
                Sign in to your account
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg border border-tu-error/30 bg-tu-error/5 px-4 py-3 text-sm text-tu-error">
                ⚠ {error}
              </div>
            )}

            {/* MFA OTP Step */}
            {mfaStep === "otp" && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tu-primary-soft">
                      <Shield size={28} className="text-tu-primary" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-tu-text-primary">ยืนยันตัวตนด้วย MFA</h3>
                  <p className="text-xs text-tu-text-muted mt-1">กรอกรหัส 6 หลักจากแอป Authenticator</p>
                </div>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  autoComplete="one-time-code"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") void verifyOtp(); }}
                />
                <Button onClick={verifyOtp} disabled={otp.length !== 6 || loading} className="w-full gap-2 h-11">
                  {loading ? "กำลังตรวจสอบ..." : <><Shield size={18} />ยืนยัน</>}
                </Button>
                <button type="button" onClick={() => setMfaStep("backup")} className="text-xs text-tu-primary hover:underline w-full text-center">
                  ใช้ Backup Code แทน
                </button>
              </div>
            )}

            {/* MFA Backup Code Step */}
            {mfaStep === "backup" && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tu-secondary-soft">
                      <Key size={28} className="text-tu-secondary" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-tu-text-primary">ใช้ Backup Code</h3>
                  <p className="text-xs text-tu-text-muted mt-1">กรอก Backup Code 10 หลักที่บันทึกไว้</p>
                </div>
                <Input
                  type="text"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.trim().toLowerCase())}
                  placeholder="xxxxxxxxxx"
                  className="text-center font-mono"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") void verifyBackupCodeHandler(); }}
                />
                <Button onClick={verifyBackupCodeHandler} disabled={!backupCode.trim() || loading} className="w-full gap-2 h-11">
                  {loading ? "กำลังตรวจสอบ..." : <><Key size={18} />ยืนยัน</>}
                </Button>
                <button type="button" onClick={() => { setMfaStep("otp"); setError(""); }} className="text-xs text-tu-primary hover:underline w-full text-center">
                  ← กลับไปกรอก OTP
                </button>
              </div>
            )}

            {/* Password Form */}
            {mfaStep === "password" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-tu-text-secondary mb-1.5"
                >
                  อีเมล / Username
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@tulaw.ac.th"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-tu-text-secondary mb-1.5"
                >
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-tu-text-muted hover:text-tu-text-secondary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded accent-tu-primary" />
                  <span className="text-tu-text-secondary">จดจำฉัน</span>
                </label>
                <a href="#" className="text-tu-primary hover:underline text-sm">
                  ลืมรหัสผ่าน?
                </a>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full gap-2 h-11 text-base"
              >
                {loading ? (
                  "กำลังเข้าสู่ระบบ..."
                ) : (
                  <>
                    <LogIn size={18} />
                    เข้าสู่ระบบ
                  </>
                )}
              </Button>
            </form>
            )}

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-tu-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-tu-surface px-3 text-tu-text-muted">
                  หรือ
                </span>
              </div>
            </div>

            {/* Google OAuth */}
            <a
              href={"/api/auth/signin/google?callbackUrl=" + encodeURIComponent(callbackUrl)}
              className="w-full rounded-[--radius-btn] border border-tu-border bg-tu-surface px-4 py-2.5 text-tu-text-primary font-medium hover:bg-tu-surface-hover transition-colors flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              เข้าสู่ระบบด้วย Google
            </a>

            <p className="text-center text-xs text-tu-text-muted mt-6">
              © {new Date().getFullYear()} Faculty of Law, Thammasat University
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-tu-bg text-sm text-tu-text-muted">Loading login...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
