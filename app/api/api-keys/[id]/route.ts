import { getServerSession } from "next-auth";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { logAction } from "@/lib/audit-log";
import type { NextRequest } from "next/server";

function generateApiKey(): { fullKey: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  const prefix = "top_sk_" + raw.slice(0, 8);
  const fullKey = prefix + "_" + raw.slice(8);
  const hash = createHash("sha256").update(fullKey).digest("hex");
  return { fullKey, hash };
}

// Rotate API Key
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "SETTINGS_MANAGE")) {
    return apiError("FORBIDDEN", "No permission", 403);
  }

  try {
    const { id } = await params;

    // Disable all existing keys for this client
    await prisma.apiKey.updateMany({
      where: { clientId: id, isActive: true },
      data: { isActive: false, deletedAt: new Date(), updatedBy: session.user.id },
    });

    // Create new key
    const { fullKey, hash } = generateApiKey();
    await prisma.apiKey.create({
      data: {
        clientId: id,
        keyHash: hash,
        isActive: true,
        createdBy: session.user.id,
      },
    });

    await logAction(session.user.id, "settings", "API_KEY_ROTATE", {
      entityType: "ApiKey", entityId: id,
    });

    return apiSuccess({ fullKey, message: "Key rotated. Old keys invalidated." });
  } catch (e) {
    console.error("[POST /api/api-keys/:id/rotate]", e);
    return apiError("DB_ERROR", "Failed to rotate key");
  }
}

// Disable API Key
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "SETTINGS_MANAGE")) {
    return apiError("FORBIDDEN", "No permission", 403);
  }

  try {
    const { id } = await params;
    await prisma.apiKey.update({
      where: { id },
      data: { isActive: false, updatedBy: session.user.id },
    });

    await logAction(session.user.id, "settings", "API_KEY_DISABLE", {
      entityType: "ApiKey", entityId: id,
    });

    return apiSuccess({ message: "Key disabled" });
  } catch (e) {
    console.error("[PATCH /api/api-keys/:id]", e);
    return apiError("DB_ERROR", "Failed to disable key");
  }
}

// Delete (soft-delete) API Key
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "SETTINGS_MANAGE")) {
    return apiError("FORBIDDEN", "No permission", 403);
  }

  try {
    const { id } = await params;
    await prisma.apiKey.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false, updatedBy: session.user.id },
    });

    await logAction(session.user.id, "settings", "API_KEY_DELETE", {
      entityType: "ApiKey", entityId: id,
    });

    return apiSuccess({ message: "Key deleted" });
  } catch (e) {
    console.error("[DELETE /api/api-keys/:id]", e);
    return apiError("DB_ERROR", "Failed to delete key");
  }
}
