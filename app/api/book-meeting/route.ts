import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireMinRoleLevel } from "@/lib/auth-guard";
import { ROLE_LEVELS, type RoleCode } from "@/lib/permissions";
import { apiSuccess, apiError, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const session = await requirePermission("BOOK_MEETING_VIEW");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์เข้าถึง", 403);
  const { page, limit, skip } = parsePagination(req);
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const roomId = searchParams.get("roomId");
  const where: Record<string, unknown> = {};
  if (search) where.title = { contains: search, mode: "insensitive" };
  if (roomId) where.roomId = roomId;
  // Exclude cancelled bookings
  where.status = { not: "cancelled" };
  const [data, total] = await Promise.all([
    prisma.roomBooking.findMany({ where: where as any, skip, take: limit, orderBy: { startTime: "asc" }, include: { room: true, user: { select: { email: true, firstNameTh: true, lastNameTh: true } } } }),
    prisma.roomBooking.count({ where: where as any }),
  ]);

  const mapped = data.map((b) => ({
    id: b.id,
    roomId: b.roomId,
    title: b.title,
    purpose: b.remark ?? "",
    date: b.startTime.toISOString().slice(0, 10),
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    attendeeCount: b.attendeeCount ?? 0,
    msTeamsLink: b.msTeamsLink ?? "",
    notes: b.remark ?? "",
    status: b.status,
    userId: b.userId,
  }));

  return apiSuccess(mapped, { total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await requirePermission("BOOK_MEETING_CREATE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จอง", 403);
  try {
    const body = await req.json();
    const { roomId, title, startTime, endTime, attendeeCount, msTeamsLink, purpose, notes, status } = body;
    if (!roomId || !title || !startTime || !endTime) return apiError("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");
    const conflict = await prisma.roomBooking.findFirst({
      where: { roomId, status: { not: "cancelled" }, OR: [{ startTime: { lt: new Date(endTime) }, endTime: { gt: new Date(startTime) } }] },
    });
    if (conflict) return apiError("CONFLICT", "ช่วงเวลานี้มีผู้จองแล้ว กรุณาเลือกเวลาใหม่");
    const booking = await prisma.roomBooking.create({
      data: {
        roomId, userId: session.user.id, title,
        startTime: new Date(startTime), endTime: new Date(endTime),
        attendeeCount: attendeeCount ?? 0, msTeamsLink,
        remark: purpose || notes || null,
        status: status || "confirmed",
        createdBy: session.user.id,
      },
    });
    return apiSuccess(booking);
  } catch (e: unknown) {
    console.error("[POST /api/book-meeting]", e);
    return apiError("DB_ERROR", "ไม่สามารถจองห้องประชุมได้");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, title, startTime, endTime, attendeeCount, roomId, purpose, notes } = body;
    if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");

    // Determine mode: "approve" if only status change, "edit" if other fields present
    const isApprove = !title && startTime === undefined && endTime === undefined && attendeeCount === undefined && roomId === undefined && purpose === undefined && notes === undefined;

    if (isApprove) {
      // --- Approve mode: only status change, requires BOOK_MEETING_APPROVE ---
      const session = await requirePermission("BOOK_MEETING_APPROVE");
      if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์อนุมัติ", 403);
      if (!status) return apiError("VALIDATION", "กรุณาระบุสถานะ");

      const booking = await prisma.roomBooking.update({ where: { id }, data: { status, updatedBy: session.user.id } });

      // Send notification when booking is confirmed (non-fatal)
      if (status === "confirmed") {
        try {
          const targetBooking = await prisma.roomBooking.findUnique({ where: { id }, select: { userId: true, title: true } });
          if (targetBooking) {
            const notif = await prisma.notification.create({
              data: {
                title: "การจองห้องประชุมได้รับการอนุมัติ",
                message: `การจอง "${targetBooking.title}" ของคุณได้รับการอนุมัติแล้ว`,
                actionUrl: "/book-meeting?tab=my-bookings",
                createdBy: session.user.id,
              },
            });
            await prisma.notificationRead.createMany({
              data: [{ notificationId: notif.id, userId: targetBooking.userId, isRead: false }],
            });
          }
        } catch (notifErr) {
          console.error("[PUT /api/book-meeting] notification failed (non-fatal):", notifErr);
        }
      }

      return apiSuccess(booking);
    }

    // --- Edit mode: update booking fields, ownership check ---
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);

    // Find current booking
    const existing = await prisma.roomBooking.findUnique({ where: { id } });
    if (!existing) return apiError("NOT_FOUND", "ไม่พบการจอง");

    // Ownership: Admin (level >= 50) can edit any, others only own
    const roles = (session.user as { roles?: string[] } | undefined)?.roles ?? [];
    const maxLevel = Math.max(0, ...roles.map((r) => ROLE_LEVELS[r as RoleCode] ?? 0));
    if (maxLevel < 50 && existing.userId !== session.user.id) {
      return apiError("FORBIDDEN", "คุณสามารถแก้ไขได้เฉพาะการจองของตนเอง", 403);
    }

    // Detect if time/room changed → auto-pending
    const timeChanged = startTime !== undefined || endTime !== undefined || roomId !== undefined;
    const newStatus = timeChanged ? "pending" : (status || existing.status);

    // Conflict check if time/room changed
    if (startTime || endTime || roomId) {
      const checkRoomId = roomId || existing.roomId;
      const checkStart = startTime ? new Date(startTime) : existing.startTime;
      const checkEnd = endTime ? new Date(endTime) : existing.endTime;
      const conflict = await prisma.roomBooking.findFirst({
        where: {
          roomId: checkRoomId,
          status: { not: "cancelled" },
          id: { not: id }, // exclude self
          OR: [
            { startTime: { lt: checkEnd }, endTime: { gt: checkStart } },
          ],
        },
      });
      if (conflict) return apiError("CONFLICT", "ช่วงเวลานี้มีผู้จองแล้ว กรุณาเลือกเวลาใหม่");
    }

    const updateData: Record<string, unknown> = { updatedBy: session.user.id };
    if (title) updateData.title = title;
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (attendeeCount !== undefined) updateData.attendeeCount = attendeeCount;
    if (roomId) updateData.roomId = roomId;
    if (purpose || notes) updateData.remark = purpose || notes;
    updateData.status = newStatus;

    const booking = await prisma.roomBooking.update({ where: { id }, data: updateData });
    return apiSuccess(booking);
  } catch (e: unknown) {
    console.error("[PUT /api/book-meeting]", e);
    return apiError("DB_ERROR", "ไม่สามารถอัปเดตได้");
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requirePermission("BOOK_MEETING_DELETE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์ลบ", 403);
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");

    // Ownership check: User/Dept Admin can only cancel own bookings
    const adminSession = await requireMinRoleLevel(50);
    if (!adminSession) {
      const booking = await prisma.roomBooking.findUnique({ where: { id } });
      if (!booking) return apiError("NOT_FOUND", "ไม่พบการจอง");
      if (booking.userId !== session.user.id) {
        return apiError("FORBIDDEN", "คุณสามารถยกเลิกได้เฉพาะการจองของตนเอง", 403);
      }
    }

    await prisma.roomBooking.update({ where: { id }, data: { status: "cancelled", updatedBy: session.user.id } });
    return apiSuccess({ deleted: true });
  } catch (e: unknown) {
    console.error("[DELETE /api/book-meeting]", e);
    return apiError("DB_ERROR", "ไม่สามารถยกเลิกการจองได้");
  }
}
