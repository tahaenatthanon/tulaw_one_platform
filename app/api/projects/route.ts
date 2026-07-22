import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, parsePagination } from "@/lib/api-utils";
import { hasPermission, ROLE_LEVELS, type RoleCode } from "@/lib/permissions";
import { resolveDataScope } from "@/lib/data-scope";
import { logAction } from "@/lib/audit-log";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  const userId = (session?.user as { id?: string })?.id ?? "";
  const departmentId = (session?.user as { departmentId?: number | null })?.departmentId ?? null;
  if (!session?.user?.email || !hasPermission(roles, "PROJECTS_VIEW")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "ไม่มีสิทธิ์ดูโครงการ" } }, { status: 403 });
  }

  try {
    const { page, limit, skip } = parsePagination(req);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    // Apply data scope
    const scope = resolveDataScope(roles as RoleCode[], departmentId, userId);

    const where: Record<string, unknown> = {};
    // Always exclude soft-deleted projects
    where.deletedAt = null;

    if (search) {
      where.name = { contains: search };
    }

    // Filter by scope: if not seeing all departments, filter by department or membership
    if (!scope.canSeeAllDepartments) {
      if (scope.ownerUserId !== null) {
        // Personal scope: own projects OR projects they're a member of
        where.OR = [
          { ownerUserId: scope.ownerUserId },
          { members: { some: { userId: scope.ownerUserId } } },
        ];
      } else if (scope.departmentId !== null) {
        // Department scope: all projects in the department
        where.OR = [
          { owner: { departmentId: scope.departmentId } },
          { members: { some: { user: { departmentId: scope.departmentId } } } },
        ];
      }
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
          members: { where: { deletedAt: null }, include: { user: { select: { firstNameTh: true, lastNameTh: true } } } },
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
      priority: project.priority ?? "medium",
      progress: project.status === "completed" ? 100 : project.status === "pending_approval" ? 90 : project.status === "in_progress" ? 50 : 0,
      owner: `${project.owner.firstNameTh} ${project.owner.lastNameTh}`,
      startDate: project.startDate?.toISOString() ?? "",
      deadline: project.endDate?.toISOString() ?? new Date().toISOString(),
      members: project.members.map((m) => ({
        userId: m.userId,
        name: `${m.user.firstNameTh} ${m.user.lastNameTh}`,
        role: m.role,
      })),
    }));

    return apiSuccess(mapped, { total, page, limit });
  } catch (e: unknown) {
    console.error("[GET /api/projects]", e);
    return apiError("DB_ERROR", "ไม่สามารถดึงโครงการได้");
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  const userId = (session?.user as { id?: string })?.id ?? "";
  if (!session?.user?.email || !hasPermission(roles, "PROJECTS_CREATE")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์สร้างโครงการ", 403);
  }
  try {
    const body = await req.json();
    const { name, type, description, priority, startDate, deadline, memberIds } = body;
    if (!name?.trim()) return apiError("VALIDATION", "กรุณาระบุชื่อโครงการ");

    const projectType = await prisma.projectType.findFirst({ where: { name: type ?? "ทั่วไป" } });
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description ?? "",
        projectTypeId: projectType?.id ?? 1,
        status: "planning",
        priority: priority ?? "medium",
        startDate: parseDate(startDate),
        endDate: parseDate(deadline),
        ownerUserId: session.user.id,
        createdBy: session.user.id,
      },
    });

    // Create member records if provided
    if (Array.isArray(memberIds) && memberIds.length > 0) {
      const deduped = dedupeMembers(memberIds);
      if (deduped.length > 0) {
        await prisma.projectMember.createMany({
          data: deduped.map((m) => ({
            projectId: project.id,
            userId: m.userId,
            role: m.role || "member",
            createdBy: userId,
          })),
        });
      }
    }

    await logAction(session.user.id, "projects", "PROJECT_CREATE", { entityType: "Project", entityId: project.id as string });
    return apiSuccess(project);
  } catch (e: unknown) {
    console.error("[POST /api/projects]", e);
    return apiError("DB_ERROR", "ไม่สามารถสร้างโครงการได้");
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  const maxLevel = Math.max(0, ...roles.map((r) => ROLE_LEVELS[r as RoleCode] ?? 0));
  if (!session?.user?.email) return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);

  try {
    const body = await req.json();
    const { id, status, name, description, type, startDate, deadline, priority } = body;
    if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");

    // Non-admin users can only edit their own projects
    if (maxLevel < 50) {
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) return apiError("NOT_FOUND", "ไม่พบโครงการ");
      if (project.ownerUserId !== session.user.id) {
        return apiError("FORBIDDEN", "คุณสามารถแก้ไขได้เฉพาะโครงการของตนเอง", 403);
      }
      // Users cannot move to completed — needs admin approval
      if (status === "completed") {
        return apiError("FORBIDDEN", "ต้องมีผู้อนุมัติก่อนจึงจะเปลี่ยนเป็น Complete ได้", 403);
      }
    }

    const data: Record<string, unknown> = { updatedBy: session.user.id };
    if (status) data.status = status;
    if (name) data.name = name.trim();
    if (description !== undefined) data.description = description;
    if (priority) data.priority = priority;
    if (startDate) data.startDate = parseDate(startDate);
    if (deadline) data.endDate = parseDate(deadline);

    // Resolve project type name → id
    if (type) {
      let pt = await prisma.projectType.findFirst({ where: { name: type } });
      if (!pt) pt = await prisma.projectType.create({ data: { name: type } });
      data.projectTypeId = pt.id;
    }

    await prisma.project.update({ where: { id }, data });

    // Sync members if memberIds is provided
    const { memberIds } = body;
    if (memberIds !== undefined) {
      // Remove all existing members
      await prisma.projectMember.deleteMany({ where: { projectId: id } });
      // Add new members
      if (Array.isArray(memberIds) && memberIds.length > 0) {
        const deduped = dedupeMembers(memberIds);
        if (deduped.length > 0) {
          await prisma.projectMember.createMany({
            data: deduped.map((m) => ({
              projectId: id,
              userId: m.userId,
              role: m.role || "member",
              createdBy: session.user.id,
            })),
          });
        }
      }
    }

    // Determine audit action type
    let auditAction = "PROJECT_UPDATE";
    if (status === "completed") auditAction = "PROJECT_APPROVE";
    else if (status === "planning" && description) {
      // Reject: moved from pending_approval to planning with a reason
      auditAction = "PROJECT_REJECT";
    }
    await logAction(session.user.id, "projects", auditAction, { entityType: "Project", entityId: id });
    return apiSuccess({ updated: true });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") return apiError("NOT_FOUND", "ไม่พบโครงการ");
    }
    console.error("[PUT /api/projects]", e);
    return apiError("DB_ERROR", "ไม่สามารถแก้ไขโครงการได้");
  }
}

/** Deduplicate member array by userId, keeping first role */
function dedupeMembers(list: { userId: string; role?: string }[]) {
  const seen = new Set<string>();
  return list.filter((m) => {
    if (!m.userId || seen.has(m.userId)) return false;
    seen.add(m.userId);
    return true;
  });
}

/** Parse date string as UTC date (prevents timezone offset from shifting the date). */
function parseDate(d?: string): Date | undefined {
  if (!d) return undefined;
  // "2026-07-31" → new Date("2026-07-31T00:00:00.000Z") — UTC midnight, so @db.Date extracts the correct day
  return new Date(d + "T00:00:00.000Z");
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  const maxLevel = Math.max(0, ...roles.map((r) => ROLE_LEVELS[r as RoleCode] ?? 0));
  if (!session?.user?.email) return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");

    // User-level can only delete own projects
    if (maxLevel < 50) {
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) return apiError("NOT_FOUND", "ไม่พบโครงการ");
      if (project.ownerUserId !== session.user.id) {
        return apiError("FORBIDDEN", "คุณสามารถลบได้เฉพาะโครงการของตนเอง", 403);
      }
    }

    await prisma.project.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: session.user.id } });
    await logAction(session.user.id, "projects", "PROJECT_DELETE", { entityType: "Project", entityId: id });
    return apiSuccess({ deleted: true });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return apiError("NOT_FOUND", "ไม่พบโครงการ");
    }
    console.error("[DELETE /api/projects]", e);
    return apiError("DB_ERROR", "ไม่สามารถลบโครงการได้");
  }
}
