import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminOrHigher } from "@/lib/permissions";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "ต้องเข้าสู่ระบบก่อน" } }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "USER_NOT_FOUND", message: "ไม่พบผู้ใช้" } }, { status: 404 });
  }

  const roles = (session.user as { roles?: string[] }).roles ?? [];
  const requiresMfa = isAdminOrHigher(roles);

  if (!requiresMfa) {
    return NextResponse.json({ success: true, data: { enabled: false, required: false } });
  }

  const body = await request.json().catch(() => ({}));
  const action = typeof body?.action === "string" ? body.action : "check";
  const existing = await prisma.userMfa.findFirst({ where: { userId: user.id } });

  if (action === "enable") {
    if (existing) {
      await prisma.userMfa.update({
        where: { id: existing.id },
        data: { isEnabled: true, verifiedAt: new Date(), secret: "TULAW-MFA-PLACEHOLDER", backupCode: "TULAW-000000" },
      });
    } else {
      await prisma.userMfa.create({
        data: {
          userId: user.id,
          secret: "TULAW-MFA-PLACEHOLDER",
          backupCode: "TULAW-000000",
          isEnabled: true,
          verifiedAt: new Date(),
        },
      });
    }
  }

  const refreshed = await prisma.userMfa.findFirst({ where: { userId: user.id } });
  return NextResponse.json({ success: true, data: { enabled: Boolean(refreshed?.isEnabled), required: true } });
}
