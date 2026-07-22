"use client";

import AuthProvider from "@/components/layouts/auth-provider";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { Toaster } from "sonner";

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  );
}
