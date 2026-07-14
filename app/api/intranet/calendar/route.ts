import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { hasPermission, ROLE_LEVELS, type RoleCode } from "@/lib/permissions";
import type { NextRequest } from "next/server";

interface CalendarEvent {
  id: string;
  title: string;
  day: number;
  category: string;
  time: string;
  createdBy: string; // userId
}

// In-memory store (sync with mock data)
let events: CalendarEvent[] = [
  { id: "e1", day: 10, title: "ประชุมคณะกรรมการบริหาร", category: "meeting", time: "09:00 - 12:00", createdBy: "admin" },
  { id: "e2", day: 11, title: "สัมมนากฎหมายระหว่างประเทศ", category: "seminar", time: "13:00 - 16:30", createdBy: "admin" },
  { id: "e3", day: 15, title: "สอบกลางภาค 1/2568", category: "exam", time: "09:00 - 12:00", createdBy: "admin" },
  { id: "e4", day: 15, title: "ประชุมทีมกฎหมาย", category: "meeting", time: "10:00 - 11:00", createdBy: "admin" },
  { id: "e5", day: 18, title: "ประชุมสภาคณาจารย์", category: "meeting", time: "09:00 - 12:00", createdBy: "admin" },
  { id: "e6", day: 22, title: "อบรม PDPA บุคลากร", category: "seminar", time: "08:30 - 16:00", createdBy: "admin" },
  { id: "e7", day: 24, title: "กำหนดส่งงานวิจัย", category: "deadline", time: "ภายใน 17:00", createdBy: "admin" },
  { id: "e8", day: 25, title: "ประชุมฝ่ายวิชาการ", category: "meeting", time: "13:00 - 15:00", createdBy: "admin" },
  { id: "e9", day: 28, title: "วันหยุดชดเชย", category: "holiday", time: "ทั้งวัน", createdBy: "admin" },
  { id: "e10", day: 30, title: "กำหนดส่งเกรด", category: "deadline", time: "ภายใน 16:00", createdBy: "admin" },
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);

  return apiSuccess(events);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "INTRANET_CREATE")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์สร้างกิจกรรม", 403);
  }

  try {
    const body = await req.json();
    const { title, category, time, day } = body;
    if (!title?.trim() || !category || !day) {
      return apiError("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    const event: CalendarEvent = {
      id: String(Date.now()),
      title: title.trim(),
      category,
      time: time ?? "09:00 - 12:00",
      day: Number(day),
      createdBy: session.user.id,
    };
    events = [event, ...events];
    return apiSuccess(event);
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถสร้างกิจกรรมได้");
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "INTRANET_EDIT")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์แก้ไขกิจกรรม", 403);
  }

  try {
    const body = await req.json();
    const { id, title, category, time, day } = body;
    if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");

    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) return apiError("NOT_FOUND", "ไม่พบกิจกรรม");

    // Ownership check: User (level < 50) can only edit own events
    const maxLevel = Math.max(0, ...roles.map((r) => ROLE_LEVELS[r as RoleCode] ?? 0));
    if (maxLevel < 50 && events[idx].createdBy !== session.user.id) {
      return apiError("FORBIDDEN", "คุณสามารถแก้ไขได้เฉพาะกิจกรรมของตนเอง", 403);
    }

    events[idx] = {
      ...events[idx],
      title: title?.trim() ?? events[idx].title,
      category: category ?? events[idx].category,
      time: time ?? events[idx].time,
      day: day ? Number(day) : events[idx].day,
    };
    return apiSuccess(events[idx]);
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถแก้ไขกิจกรรมได้");
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "INTRANET_DELETE")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์ลบกิจกรรม", 403);
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");

  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return apiError("NOT_FOUND", "ไม่พบกิจกรรม");

  // Ownership check
  const maxLevel = Math.max(0, ...roles.map((r) => ROLE_LEVELS[r as RoleCode] ?? 0));
  if (maxLevel < 50 && events[idx].createdBy !== session.user.id) {
    return apiError("FORBIDDEN", "คุณสามารถลบได้เฉพาะกิจกรรมของตนเอง", 403);
  }

  events = events.filter(e => e.id !== id);
  return apiSuccess({ deleted: true });
}
