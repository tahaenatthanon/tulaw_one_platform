import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    if (q.length < 2) return apiSuccess([]);

    const users = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { firstNameTh: { contains: q, mode: "insensitive" } },
          { lastNameTh: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        firstNameTh: true,
        lastNameTh: true,
        email: true,
        department: { select: { name: true } },
      },
      take: 10,
      orderBy: { firstNameTh: "asc" },
    });

    const mapped = users.map((u) => ({
      id: u.id,
      firstNameTh: u.firstNameTh,
      lastNameTh: u.lastNameTh,
      email: u.email,
      departmentName: u.department.name,
    }));

    return apiSuccess(mapped);
  } catch (e: unknown) {
    console.error("[GET /api/projects/users/search]", e);
    return apiError("DB_ERROR", "ไม่สามารถค้นหาผู้ใช้ได้");
  }
}
