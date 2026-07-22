import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);
  }

  try {
    const now = new Date();
    const [rooms, allActiveBookings] = await Promise.all([
      prisma.meetingRoom.findMany({
        where: { deletedAt: null },
        orderBy: { name: "asc" },
      }),
      prisma.roomBooking.findMany({
        where: {
          // Only confirmed bookings affect room status — pending don't mark room as booked
          status: "confirmed",
          endTime: { gt: now },
        },
        select: { roomId: true, startTime: true },
      }),
    ]);

    const inUseRoomIds = new Set<string>();
    const bookedRoomIds = new Set<string>();

    for (const b of allActiveBookings) {
      if (b.startTime <= now) {
        inUseRoomIds.add(b.roomId);
      } else {
        bookedRoomIds.add(b.roomId);
      }
    }

    const mapped = rooms.map((r) => ({
      id: r.id,
      name: r.name,
      location: "", // MeetingRoom has no location field yet
      capacity: r.capacity,
      status: inUseRoomIds.has(r.id) ? "in-use" : bookedRoomIds.has(r.id) ? "booked" : "available",
    }));

    return apiSuccess(mapped);
  } catch (e: unknown) {
    console.error("[GET /api/book-meeting/rooms]", e);
    return apiError("DB_ERROR", "ไม่สามารถดึงข้อมูลห้องประชุมได้");
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);
  try {
    const { name, capacity } = await req.json();
    if (!name?.trim()) return apiError("VALIDATION", "กรุณาระบุชื่อห้อง");
    const userId = (session.user as { id?: string }).id;
    const room = await prisma.meetingRoom.create({
      data: { name: name.trim(), capacity: parseInt(capacity) || 10, createdBy: userId },
    });
    // Audit log
    prisma.auditLog.create({ data: { userId: userId ?? null, module: "BOOK_MEETING", action: "ROOM_CREATE", entityType: "MeetingRoom", entityId: room.id, newValue: name.trim(), isSuccess: true } }).catch(() => {});
    return apiSuccess(room);
  } catch (e) { console.error("[POST /api/book-meeting/rooms]", e); return apiError("DB_ERROR", "ไม่สามารถเพิ่มห้องประชุมได้"); }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);
  try {
    const { id, name, capacity } = await req.json();
    if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");
    const userId = (session.user as { id?: string }).id;
    const data: Record<string, unknown> = { updatedBy: userId };
    if (name?.trim()) data.name = name.trim();
    if (capacity !== undefined) data.capacity = parseInt(capacity);
    const room = await prisma.meetingRoom.update({ where: { id }, data });
    // Audit log
    prisma.auditLog.create({ data: { userId: userId ?? null, module: "BOOK_MEETING", action: "ROOM_UPDATE", entityType: "MeetingRoom", entityId: id, newValue: name?.trim() || "", isSuccess: true } }).catch(() => {});
    return apiSuccess(room);
  } catch (e) { console.error("[PUT /api/book-meeting/rooms]", e); return apiError("DB_ERROR", "ไม่สามารถแก้ไขห้องประชุมได้"); }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");
    const userId = (session.user as { id?: string }).id;

    // Soft-delete
    await prisma.meetingRoom.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: userId } });

    // Audit log — use direct prisma call for reliability
    await prisma.auditLog.create({
      data: {
        userId: userId ?? null,
        module: "BOOK_MEETING",
        action: "ROOM_DELETE",
        entityType: "MeetingRoom",
        entityId: id,
        isSuccess: true,
      },
    });

    return apiSuccess({ deleted: true });
  } catch (e: unknown) {
    console.error("[DELETE /api/book-meeting/rooms]", e);
    // Still try to log
    try {
      const userId = (session.user as { id?: string }).id;
      await prisma.auditLog.create({
        data: { userId: userId ?? null, module: "BOOK_MEETING", action: "ROOM_DELETE", entityType: "MeetingRoom", entityId: (new URL(req.url)).searchParams.get("id") || "", isSuccess: false },
      });
    } catch {}
    return apiError("DB_ERROR", "ไม่สามารถลบห้องประชุมได้");
  }
}
