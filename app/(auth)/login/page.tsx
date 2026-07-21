import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  const azureAdEnabled = !!(
    process.env.AUTH_MICROSOFT_ENTRA_ID_ID &&
    process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET
  );

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#8B1515]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FDB813] border-t-transparent" />
            <p className="text-sm text-white/70">กำลังโหลด...</p>
          </div>
        </div>
      }
    >
      <LoginForm azureAdEnabled={azureAdEnabled} />
    </Suspense>
  );
}
