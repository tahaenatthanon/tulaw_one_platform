import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, parsePagination } from "@/lib/api-utils";
import { hasPermission } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "PROJECTS_VIEW")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "ไม่มีสิทธิ์ดูโครงการ" } }, { status: 403 });
  }

  try {
    const { page, limit, skip } = parsePagination(req);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};
    if (search) {
      where.name = { contains: search };
    }

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          projectType: true,
          owner: { select: { firstNameTh: true, lastNameTh: true } },
          members: { include: { user: { select: { firstNameTh: true, lastNameTh: true } } } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    const mapped = data.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description ?? "",
      type: project.projectType.name,
      column: project.status as "planning" | "in_progress" | "pending_approval" | "completed",
      progress: 50,
      owner: `${project.owner.firstNameTh} ${project.owner.lastNameTh}`,
      deadline: project.endDate?.toISOString() ?? new Date().toISOString(),
      tasks: project.members.length,
    }));

    return apiSuccess(mapped, { total, page, limit });
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถดึงโครงการได้");
  }
}
