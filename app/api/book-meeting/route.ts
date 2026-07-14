import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireMinRoleLevel } from "@/lib/auth-guard";
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
  const session = await requirePermission("BOOK_MEETING_APPROVE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์", 403);
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) return apiError("VALIDATION", "กรุณาระบุ ID และสถานะ");
    const booking = await prisma.roomBooking.update({ where: { id }, data: { status, updatedBy: session.user.id } });
    return apiSuccess(booking);
  } catch (e: unknown) {
    console.error("[PUT /api/book-meeting]", e);
    return apiError("DB_ERROR", "ไม่สามารถอัปเดตสถานะได้");
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
