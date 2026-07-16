import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { generateSecret, generateURI, verifySync } from "otplib";
import * as QRCode from "qrcode";
import { createHash, randomBytes } from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminOrHigher, ROLE_LEVELS, type RoleCode } from "@/lib/permissions";

/** App name for otpauth:// URI */
const OTPAUTH_LABEL = "TULAW-ONE";
const BACKUP_CODE_COUNT = 8;
const BACKUP_CODE_LENGTH = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 5;

// ─── Helpers ────────────────────────────────────────────────────────

function hashBackupCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    codes.push(randomBytes(BACKUP_CODE_LENGTH).toString("hex").slice(0, BACKUP_CODE_LENGTH));
  }
  return codes;
}

function getOtpAuthUri(secret: string, email: string): string {
  return generateURI({ type: "totp", label: email, issuer: OTPAUTH_LABEL, secret });
}

async function auditMfa(userId: string, action: string, targetUserId?: string) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: targetUserId ?? userId,
        module: "MFA",
        action,
        entityType: "UserMfa",
        entityId: userId,
        createdBy: userId,
      },
    });
  } catch {
    // audit failure should not block main flow
  }
}

// ─── POST Handler ───────────────────────────────────────────────────

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "ต้องเข้าสู่ระบบก่อน" } },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "USER_NOT_FOUND", message: "ไม่พบผู้ใช้" } },
      { status: 404 }
    );
  }

  const roles = (session.user as { roles?: string[] }).roles ?? [];
  const highestLevel = Math.max(0, ...roles.map((r) => ROLE_LEVELS[r as RoleCode] ?? 0));
  const requiresMfa = isAdminOrHigher(roles);

  const body = await request.json().catch(() => ({}));
  const action = typeof body?.action === "string" ? body.action : "check";

  // ── check ──────────────────────────────────────────────────────
  if (action === "check") {
    const mfa = await prisma.userMfa.findFirst({ where: { userId: user.id } });
    return NextResponse.json({
      success: true,
      data: {
        enabled: Boolean(mfa?.isEnabled),
        required: requiresMfa,
        hasBackupCodes: Array.isArray(mfa?.backupCodes) && (mfa!.backupCodes as unknown[]).length > 0,
      },
    });
  }

  // ── setup ──────────────────────────────────────────────────────
  if (action === "setup") {
    const secret = generateSecret();
    const otpauthUri = getOtpAuthUri(secret, user.email);
    const qrDataUrl = await QRCode.toDataURL(otpauthUri);

    return NextResponse.json({
      success: true,
      data: { secret, qrDataUrl, otpauthUri },
    });
  }

  // ── verify-setup ───────────────────────────────────────────────
  if (action === "verify-setup") {
    const { otp, secret: pendingSecret } = body as { otp?: string; secret?: string };
    if (!otp || otp.length !== 6 || !pendingSecret) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "กรุณากรอกรหัส OTP 6 หลัก" } },
        { status: 400 }
      );
    }

    const isValid = verifySync({ token: otp, secret: pendingSecret });
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_OTP", message: "รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่" } },
        { status: 400 }
      );
    }

    // Generate backup codes
    const rawBackupCodes = generateBackupCodes();
    const hashedBackupCodes = rawBackupCodes.map(hashBackupCode);

    const existing = await prisma.userMfa.findFirst({ where: { userId: user.id } });
    if (existing) {
      await prisma.userMfa.update({
        where: { id: existing.id },
        data: {
          secret: pendingSecret,
          backupCodes: hashedBackupCodes,
          isEnabled: true,
          verifiedAt: new Date(),
          failedAttempts: 0,
          lastFailedAt: null,
        },
      });
    } else {
      await prisma.userMfa.create({
        data: {
          userId: user.id,
          secret: pendingSecret,
          backupCodes: hashedBackupCodes,
          isEnabled: true,
          verifiedAt: new Date(),
        },
      });
    }

    // Update user status if MFA_PENDING
    if (user.status === "MFA_PENDING") {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: "ACTIVE" },
      });
    }

    await auditMfa(user.id, "MFA_ENABLED");

    return NextResponse.json({
      success: true,
      data: { enabled: true, backupCodes: rawBackupCodes },
    });
  }

  // ── verify-login ───────────────────────────────────────────────
  if (action === "verify-login") {
    const { otp } = body as { otp?: string };
    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "กรุณากรอกรหัส OTP 6 หลัก" } },
        { status: 400 }
      );
    }

    const mfa = await prisma.userMfa.findFirst({ where: { userId: user.id } });
    if (!mfa?.isEnabled) {
      return NextResponse.json(
        { success: false, error: { code: "MFA_NOT_ENABLED", message: "ยังไม่ได้เปิดใช้งาน MFA" } },
        { status: 400 }
      );
    }

    // Rate limiting check
    if (mfa.failedAttempts >= MAX_FAILED_ATTEMPTS && mfa.lastFailedAt) {
      const lockUntil = new Date(mfa.lastFailedAt.getTime() + LOCKOUT_MINUTES * 60 * 1000);
      if (new Date() < lockUntil) {
        const remainingSecs = Math.ceil((lockUntil.getTime() - Date.now()) / 1000);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "RATE_LIMITED",
              message: `กรุณารอ ${Math.ceil(remainingSecs / 60)} นาที ก่อนลองอีกครั้ง`,
            },
          },
          { status: 429 }
        );
      }
      // Lockout expired, reset counter
      await prisma.userMfa.update({
        where: { id: mfa.id },
        data: { failedAttempts: 0, lastFailedAt: null },
      });
      mfa.failedAttempts = 0;
    }

    const isValid = verifySync({ token: otp, secret: mfa.secret });
    if (!isValid) {
      const newCount = mfa.failedAttempts + 1;
      await prisma.userMfa.update({
        where: { id: mfa.id },
        data: { failedAttempts: newCount, lastFailedAt: new Date() },
      });
      const remaining = MAX_FAILED_ATTEMPTS - newCount;
      const msg = remaining > 0
        ? `รหัส OTP ไม่ถูกต้อง (เหลือ ${remaining} ครั้ง)`
        : "รหัส OTP ไม่ถูกต้องเกินจำนวนครั้งที่กำหนด กรุณารอ 5 นาที";
      return NextResponse.json(
        { success: false, error: { code: "INVALID_OTP", message: msg } },
        { status: 400 }
      );
    }

    // Reset failed attempts on success
    await prisma.userMfa.update({
      where: { id: mfa.id },
      data: { failedAttempts: 0, lastFailedAt: null },
    });

    return NextResponse.json({ success: true, data: { verified: true } });
  }

  // ── verify-backup ──────────────────────────────────────────────
  if (action === "verify-backup") {
    const { backupCode } = body as { backupCode?: string };
    if (!backupCode) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "กรุณากรอก Backup Code" } },
        { status: 400 }
      );
    }

    const mfa = await prisma.userMfa.findFirst({ where: { userId: user.id } });
    if (!mfa?.isEnabled) {
      return NextResponse.json(
        { success: false, error: { code: "MFA_NOT_ENABLED", message: "ยังไม่ได้เปิดใช้งาน MFA" } },
        { status: 400 }
      );
    }

    const hashed = hashBackupCode(backupCode.trim().toLowerCase());
    const codes: string[] = Array.isArray(mfa.backupCodes) ? (mfa.backupCodes as string[]) : [];

    if (!codes.includes(hashed)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_BACKUP", message: "Backup Code ไม่ถูกต้อง" } },
        { status: 400 }
      );
    }

    // Remove the used code
    const updatedCodes = codes.filter((c) => c !== hashed);
    await prisma.userMfa.update({
      where: { id: mfa.id },
      data: { backupCodes: updatedCodes, failedAttempts: 0, lastFailedAt: null },
    });

    await auditMfa(user.id, "MFA_BACKUP_CODE_USED");

    return NextResponse.json({ success: true, data: { verified: true, remainingBackupCodes: updatedCodes.length } });
  }

  // ── disable ────────────────────────────────────────────────────
  if (action === "disable") {
    const { targetUserId } = body as { targetUserId?: string };
    const targetId = targetUserId ?? user.id;

    // Only Super Admin (level 100) can disable MFA for others
    if (targetId !== user.id && highestLevel < 100) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "ไม่มีสิทธิ์ปิด MFA ให้ผู้อื่น" } },
        { status: 403 }
      );
    }

    const targetMfa = await prisma.userMfa.findFirst({ where: { userId: targetId } });
    if (!targetMfa) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "ยังไม่ได้ตั้งค่า MFA" } },
        { status: 404 }
      );
    }

    await prisma.userMfa.update({
      where: { id: targetMfa.id },
      data: { isEnabled: false, secret: "", backupCodes: [], verifiedAt: null, failedAttempts: 0, lastFailedAt: null },
    });

    const isAdminReset = targetId !== user.id;
    await auditMfa(user.id, isAdminReset ? "MFA_RESET" : "MFA_DISABLED", targetId);

    return NextResponse.json({ success: true, data: { enabled: false } });
  }

  // ── default: unrecognized action ───────────────────────────────
  return NextResponse.json(
    { success: false, error: { code: "UNKNOWN_ACTION", message: `ไม่รู้จัก action: ${action}` } },
    { status: 400 }
  );
}
