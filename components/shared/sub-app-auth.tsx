"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SubAppAuthProps {
  appName: string;
  onAuthenticated: () => void;
}

function SubAppAuthForm({ appName, onAuthenticated }: SubAppAuthProps) {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState(searchParams.get("app") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (username && password.length >= 4) {
        setLoading(false);
        onAuthenticated();
      } else {
        setLoading(false);
        setError("Invalid credentials for " + appName);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-tu-bg p-4">
      <div className="w-full max-w-sm bg-tu-surface rounded-[--radius-card] border border-tu-border shadow-lg p-6 space-y-5">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-tu-primary-soft">
            <Shield size={28} className="text-tu-primary" />
          </div>
          <h2 className="text-lg font-semibold text-tu-text-primary">{appName}</h2>
          <p className="text-xs text-tu-text-muted mt-1">Sign in to continue to this application</p>
        </div>

        <div className="bg-tu-info/5 border border-tu-info/10 rounded-lg p-3 text-xs text-tu-text-secondary">
          <p className="font-medium text-tu-info mb-1">Single Sign-On (SSO)</p>
          <p>This application requires separate authentication. Use your platform credentials.</p>
        </div>

        {error && (
          <div className="bg-tu-error/5 border border-tu-error/20 rounded-lg p-3 text-xs text-tu-error">{error}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1">Username / Email</label>
            <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="enter credentials" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading ? "Authenticating..." : (<><Lock size={16} />Sign In to {appName}<ArrowRight size={16} /></>)}
          </Button>
        </form>

        <p className="text-center text-[10px] text-tu-text-muted">Powered by TULAW ONE PLATFORM SSO</p>
      </div>
    </div>
  );
}

function SubAppAuth({ appName, onAuthenticated }: SubAppAuthProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-tu-bg">
        <div className="text-tu-text-muted text-sm">Loading...</div>
      </div>
    }>
      <SubAppAuthForm appName={appName} onAuthenticated={onAuthenticated} />
    </Suspense>
  );
}

export { SubAppAuth };

export function useSubAppAuth(appName: string) {
  const [authenticated, setAuthenticated] = useState(false);
  return {
    authenticated,
    AuthGuard: !authenticated ? (
      <SubAppAuth appName={appName} onAuthenticated={() => setAuthenticated(true)} />
    ) : null,
  };
}
