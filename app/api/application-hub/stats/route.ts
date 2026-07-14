import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบ" } }, { status: 401 });
  }

  const stats = {
    totalSystems: 40,
    activeUsers: 24,
    onlineSystems: 38,
    underMaintenance: 2,
    lastSync: new Date().toISOString(),
  };
  return NextResponse.json({ success: true, data: stats });
}
