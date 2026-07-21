"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  LogIn,
  Shield,
  Key,
  Lock,
  Mail,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface LoginFormProps {
  azureAdEnabled: boolean;
}

export function LoginForm({ azureAdEnabled }: LoginFormProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [azureLoading, setAzureLoading] = useState(false);

  const [mfaStep, setMfaStep] = useState<"password" | "otp" | "backup">(
    "password",
  );
  const [otp, setOtp] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [, setMfaRequired] = useState(false);
  const [, setMfaEnabled] = useState(false);

  // Show OAuth errors from URL query param
  useEffect(() => {
    if (authError) {
      const errorMessages: Record<string, string> = {
        OAuthSignin:
          "เกิดข้อผิดพลาดระหว่างเชื่อมต่อ Microsoft กรุณาลองใหม่",
        OAuthCallback:
          "การยืนยันตัวตนกับ Microsoft ไม่สำเร็จ กรุณาลองใหม่",
        OAuthCreateAccount:
          "ไม่สามารถสร้างบัญชีจาก Microsoft ได้ กรุณาติดต่อผู้ดูแลระบบ",
        OAuthAccountNotLinked:
          "อีเมลนี้ผูกกับบัญชีอื่นอยู่แล้ว",
        Callback: "ไม่สามารถดำเนินการต่อได้ กรุณาลองใหม่อีกครั้ง",
        AccessDenied:
          "บัญชี Microsoft นี้ถูกระงับหรือไม่มีอยู่ในระบบ",
        "microsoft-entra":
          "การตั้งค่า Microsoft Entra ID ไม่ถูกต้อง กรุณาตรวจสอบ Redirect URI ใน Azure Portal",
        Configuration:
          "การตั้งค่าระบบไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ",
        Default: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      };
      setError(
        errorMessages[authError] ||
          `การเข้าสู่ระบบด้วย Microsoft ล้มเหลว (${authError})`
      );
    }
  }, [authError]);

  function handleMicrosoftSignIn() {
    setAzureLoading(true);
    window.location.href = "/api/auth/azure/login";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const csrfRes = await fetch("/api/auth/csrf");
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrfToken;

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

        try {
          const sessionRes = await fetch("/api/auth/session");
          const sessionData = await sessionRes.json();
          const userRoles: string[] = sessionData?.user?.roles ?? [];

          // TODO: ปิด MFA admin ชั่วคราว — เอาออกเมื่อพร้อม
          /*
          const isAdmin = userRoles.some(
            (r) => r === "super_admin" || r === "system_admin",
          );
          if (isAdmin) {
            setMfaRequired(true);
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
            window.location.href = "/settings/mfa-setup";
            return;
          }
          */
        } catch {
          // Fall through to normal redirect
        }

        window.location.href = data.url || callbackUrl;
      } else {
        const text = await res.text();
        let msg = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
        try {
          const data = JSON.parse(text);
          msg =
            data.error ||
            (res.status >= 500
              ? "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง"
              : msg);
        } catch {}
        setError(msg);
        setLoading(false);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง";
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

  const inputCls =
    "h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-[15px] text-[#1A1A2E] placeholder:text-[#9CA3AF] shadow-sm transition-[border-color,box-shadow,background-color,transform] duration-200 ease-out hover:border-[#9CA3AF]/50 hover:bg-[#F9FAFB]/40 focus:border-[#8B1515] focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-[#8B1515]/15 focus:shadow-[0_0_0_1px_rgba(120,20,20,0.15),0_4px_14px_-6px_rgba(120,20,20,0.25)]";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#8B1515] font-sans text-white">
      {/* ================= Ambient background ================= */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Radial gradients */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1100px 700px at 0% 0%, rgba(253,184,19,0.16), transparent 60%), radial-gradient(900px 600px at 100% 100%, rgba(0,0,0,0.45), transparent 60%)",
          }}
        />
        {/* Blur glows */}
        <div className="absolute -top-32 -left-32 h-[460px] w-[460px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-[560px] w-[560px] rounded-full bg-[#FDB813]/15 blur-3xl" />
        {/* Ambient glow behind login card */}
        <div className="absolute right-[6%] top-1/2 hidden h-[560px] w-[560px] -translate-y-1/2 rounded-full bg-[#FDB813]/12 blur-[120px] lg:block" />
      </div>

      {/* ================= Layout ================= */}
      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[1.25fr_minmax(420px,0.75fr)]">
        {/* ---------------- Hero ---------------- */}
        <aside className="animate-tu-fade-in flex flex-col justify-between px-6 pt-10 pb-10 sm:px-10 sm:pt-12 sm:pb-12 lg:px-16 lg:pt-14 lg:pb-14 xl:px-20">
          {/* Logo + Hero */}
          <div>
            <div className="mb-10 flex items-center gap-4 sm:mb-12">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
                <span className="text-xl font-bold text-white">มธ</span>
              </div>

              <div>
                <h1 className="text-lg font-semibold text-white">
                  TULAW
                </h1>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                  Faculty of Law
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                  Thammasat University
                </p>

              </div>
            </div>

            <h1 className="text-5xl font-semibold leading-[1.0] tracking-tight text-white sm:text-6xl xl:text-7xl">
              TULAW
            </h1>
            <h2 className="mt-3 text-5xl font-semibold leading-[1.0] tracking-tight text-[#FDB813] sm:text-6xl xl:text-7xl">
              ONE Platform
            </h2>

            {/* Description */}
            <div className="mt-10 space-y-6 sm:mt-12">
              <p className="max-w-lg text-base font-medium leading-relaxed text-white sm:text-lg">
                ศูนย์กลางระบบดิจิทัลของ
                <br className="hidden sm:inline" />
                คณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์
              </p>
              <p className="max-w-lg text-sm font-medium leading-relaxed text-white/80 sm:text-base">
                เชื่อมต่อทุกระบบภายในองค์กร
                <br className="hidden sm:inline" />
                อย่างปลอดภัยในแพลตฟอร์มเดียว
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-16 lg:mt-0">
            <dl className="grid grid-cols-3 divide-x divide-white/15">
              {[
                { k: "9+", v: "Application Modules" },
                { k: "SSO", v: "Single Sign-On" },
                { k: "MFA", v: "Multi-Factor Authentication" },
              ].map((s) => (
                <div
                  key={s.v}
                  className="flex flex-col items-center px-3 py-1 text-center first:pl-0 last:pr-0 sm:px-4"
                >
                  <dt className="text-2xl font-semibold leading-none tracking-tight text-[#FDB813] sm:text-3xl lg:text-4xl">
                    {s.k}
                  </dt>
                  <dd className="mt-2 max-w-[110px] text-[10px] font-medium uppercase leading-tight tracking-[0.08em] text-white/60 sm:text-[11px]">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>

        {/* ---------------- Login Card ---------------- */}
        <main className="flex items-center justify-center px-6 pb-12 sm:px-10 lg:px-14 lg:py-14">
          <div className="animate-tu-fade-in w-full max-w-[400px]">
            <section
              aria-labelledby="login-title"
              className="rounded-[24px] border border-white/50 bg-[rgba(255,255,255,0.96)] p-8 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_24px_60px_-20px_rgba(0,0,0,0.45),0_8px_24px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-9"
            >
              {/* Heading */}
              <div className="mb-7">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#8B1515]/8 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8B1515] ring-1 ring-[#8B1515]/15">
                  <Lock size={12} />
                  Secure sign-in
                </div>
                <h2
                  id="login-title"
                  className="mt-4 text-[26px] font-semibold leading-tight tracking-tight text-[#1A1A2E]"
                >
                  {mfaStep === "password" && "เข้าสู่ระบบ"}
                  {mfaStep === "otp" && "ยืนยันตัวตน"}
                  {mfaStep === "backup" && "ใช้ Backup Code"}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                  {mfaStep === "password" &&
                    "ลงชื่อเข้าใช้ด้วยบัญชี Microsoft หรือ Active Directory ของคณะ"}
                  {mfaStep === "otp" &&
                    "กรอกรหัส 6 หลักจากแอป Authenticator ของคุณ"}
                  {mfaStep === "backup" &&
                    "กรอก Backup Code ที่คุณบันทึกไว้เพื่อดำเนินการต่อ"}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#A31D1D]/25 bg-[#A31D1D]/[0.06] px-4 py-3 text-sm text-[#A31D1D]"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* OTP */}
              {mfaStep === "otp" && (
                <div className="space-y-5">
                  <div className="flex justify-center">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#8B1515]/8 ring-1 ring-[#8B1515]/15">
                      <Shield size={26} className="text-[#8B1515]" />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="otp"
                      className="mb-2 block text-sm font-medium text-[#374151]"
                    >
                      รหัสยืนยัน 6 หลัก
                    </label>
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="000000"
                      className={`${inputCls} h-14 text-center font-mono text-2xl tracking-[0.6em]`}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void verifyOtp();
                      }}
                    />
                  </div>
                  <PrimaryButton
                    onClick={verifyOtp}
                    disabled={otp.length !== 6 || loading}
                    loading={loading}
                    icon={<Shield size={18} />}
                    label="ยืนยัน"
                  />
                  <button
                    type="button"
                    onClick={() => setMfaStep("backup")}
                    className="w-full text-center text-xs font-medium text-[#8B1515] transition-colors hover:text-[#7A1212] hover:underline"
                  >
                    ใช้ Backup Code แทน
                  </button>
                </div>
              )}

              {/* Backup */}
              {mfaStep === "backup" && (
                <div className="space-y-5">
                  <div className="flex justify-center">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#FEF6DF] ring-1 ring-[#FDB813]/25">
                      <Key size={26} className="text-[#D49A0F]" />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="backupCode"
                      className="mb-2 block text-sm font-medium text-[#374151]"
                    >
                      Backup Code
                    </label>
                    <input
                      id="backupCode"
                      type="text"
                      value={backupCode}
                      onChange={(e) =>
                        setBackupCode(e.target.value.trim().toLowerCase())
                      }
                      placeholder="xxxxxxxxxx"
                      className={`${inputCls} text-center font-mono tracking-widest`}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void verifyBackupCodeHandler();
                      }}
                    />
                  </div>
                  <PrimaryButton
                    onClick={verifyBackupCodeHandler}
                    disabled={!backupCode.trim() || loading}
                    loading={loading}
                    icon={<Key size={18} />}
                    label="ยืนยัน"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMfaStep("otp");
                      setError("");
                    }}
                    className="inline-flex w-full items-center justify-center gap-1.5 text-xs font-medium text-[#8B1515] transition-colors hover:text-[#7A1212] hover:underline"
                  >
                    <ArrowLeft size={12} />
                    กลับไปกรอก OTP
                  </button>
                </div>
              )}

              {/* Password form */}
              {mfaStep === "password" && (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-[#374151]"
                    >
                      อีเมล / Username
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
                      />
                      <input
                        id="email"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="username@tulaw.ac.th"
                        className={`${inputCls} pl-11`}
                        readOnly
                        onFocus={(e) => e.target.removeAttribute("readOnly")}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-[#374151]"
                      >
                        รหัสผ่าน
                      </label>
                      <a
                        href="#"
                        className="text-xs font-medium text-[#8B1515] transition-colors hover:text-[#7A1212] hover:underline"
                      >
                        ลืมรหัสผ่าน?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
                      />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className={`${inputCls} pl-11 pr-12`}
                        readOnly
                        onFocus={(e) => e.target.removeAttribute("readOnly")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                        }
                        className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#F9FAFB] hover:text-[#1A1A2E]"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <PrimaryButton
                    type="submit"
                    disabled={loading}
                    loading={loading}
                    icon={<LogIn size={18} />}
                    label="เข้าสู่ระบบ"
                    loadingLabel="กำลังเข้าสู่ระบบ..."
                  />
                </form>
              )}

              {/* ── Divider (only if Azure AD is available) ── */}
              {mfaStep === "password" && azureAdEnabled && (
                <div className="my-5 flex items-center gap-3" aria-hidden>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#E5E7EB] to-[#E5E7EB]/60" />
                  <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]/80">
                    หรือ
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#E5E7EB] to-[#E5E7EB]/60" />
                </div>
              )}

              {/* ── Microsoft Sign-in ── */}
              {mfaStep === "password" && azureAdEnabled && (
                <div>
                  <button
                    type="button"
                    onClick={handleMicrosoftSignIn}
                    disabled={azureLoading}
                    className="group inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-white px-4 text-[15px] font-medium text-[#1A1A2E] shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:border-[#9CA3AF]/40 hover:bg-[#F9FAFB] hover:shadow-md active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {azureLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin text-[#6B7280]" />
                        กำลังเชื่อมต่อ Microsoft...
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-[18px] w-[18px]"
                          viewBox="0 0 21 21"
                          fill="none"
                          aria-hidden
                        >
                          <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                          <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                          <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                          <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                        </svg>
                        เข้าสู่ระบบด้วย Microsoft
                      </>
                    )}
                  </button>
                </div>
              )}
            </section>

            {/* Footer */}
            <footer className="mt-6 flex flex-col items-center gap-1.5 text-center text-[11px] text-white/70">
              <div>© {new Date().getFullYear()} Faculty of Law, TU</div>
              <div className="inline-flex items-center gap-1.5 text-white/55">
                <ShieldCheck size={12} className="text-[#FDB813]" />
                <span>TLS 1.3 · Encrypted Session · WCAG AA</span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

function PrimaryButton({
  onClick,
  disabled,
  loading,
  icon,
  label,
  loadingLabel = "กำลังตรวจสอบ...",
  type = "button",
}: {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon: React.ReactNode;
  label: string;
  loadingLabel?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#8B1515] px-4 text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(120,20,20,0.55),0_2px_6px_-2px_rgba(120,20,20,0.35)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-[#7A1212] hover:shadow-[0_14px_32px_-10px_rgba(120,20,20,0.65),0_4px_10px_-4px_rgba(120,20,20,0.4)] active:translate-y-0 active:scale-[0.99] active:bg-[#681010] disabled:opacity-70 disabled:shadow-none disabled:hover:translate-y-0 before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-transform before:duration-700 hover:before:translate-x-full disabled:before:hidden"
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          {loadingLabel}
        </>
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </button>
  );
}
