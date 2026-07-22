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
