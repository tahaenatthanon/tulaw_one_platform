"use client";

import AuthProvider from "@/components/layouts/auth-provider";
import DashboardLayout from "@/components/layouts/dashboard-layout";

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  );
}
