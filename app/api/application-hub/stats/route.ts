import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const stats = {
    totalSystems: 40,
    activeUsers: 24,
    onlineSystems: 38,
    underMaintenance: 2,
    lastSync: new Date().toISOString(),
  };
  return NextResponse.json({ success: true, data: stats });
}
