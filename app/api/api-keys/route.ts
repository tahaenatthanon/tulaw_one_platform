import { getServerSession } from "next-auth";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { logAction } from "@/lib/audit-log";
import type { NextRequest } from "next/server";

function generateApiKey(): { prefix: string; fullKey: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  const prefix = "top_sk_" + raw.slice(0, 8);
  const fullKey = prefix + "_" + raw.slice(8);
  const hash = createHash("sha256").update(fullKey).digest("hex");
  return { prefix, fullKey, hash };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "SETTINGS_VIEW")) {
    return apiError("FORBIDDEN", "No permission", 403);
  }

  try {
    const clients = await prisma.apiClient.findMany({
      include: { apiKeys: { where: { deletedAt: null }, select: { id: true, keyHash: true, isActive: true, createdAt: true, updatedAt: true } } },
      orderBy: { createdAt: "desc" },
    });

    const result = clients.map(c => ({
      id: c.id,
      name: c.name,
      keys: c.apiKeys.map(k => ({
        id: k.id,
        prefix: k.keyHash.slice(0, 16) + "...",
        isActive: k.isActive,
        createdAt: k.createdAt,
      })),
      createdAt: c.createdAt,
    }));

    return apiSuccess(result);
  } catch (e) {
    console.error("[GET /api/api-keys]", e);
    return apiError("DB_ERROR", "Failed to load API keys");
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "SETTINGS_MANAGE")) {
    return apiError("FORBIDDEN", "No permission", 403);
  }

  try {
    const { name } = await req.json();
    if (!name?.trim()) return apiError("VALIDATION", "Name is required");

    const { fullKey, hash } = generateApiKey();

    const client = await prisma.apiClient.create({
      data: {
        name: name.trim(),
        createdBy: session.user.id,
        apiKeys: {
          create: {
            keyHash: hash,
            isActive: true,
            createdBy: session.user.id,
          },
        },
      },
      include: { apiKeys: { take: 1, orderBy: { createdAt: "desc" } } },
    });

    await logAction(session.user.id, "settings", "API_KEY_CREATE", {
      entityType: "ApiClient", entityId: client.id, newValue: name,
    });

    return apiSuccess({
      id: client.id,
      name: client.name,
      fullKey, // Only returned once!
      createdAt: client.createdAt,
    });
  } catch (e) {
    console.error("[POST /api/api-keys]", e);
    return apiError("DB_ERROR", "Failed to create API key");
  }
}
