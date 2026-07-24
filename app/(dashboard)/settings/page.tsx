"use client";

import { Suspense } from "react";
import { SettingsLayout } from "@/components/settings/settings-layout";

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-tu-text-muted">Loading...</div>}>
      <SettingsLayout />
    </Suspense>
  );
}