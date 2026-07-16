import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return apiError("FORBIDDEN", "กรุณาเข้าสู่ระบบ", 401);
  }

  try {
    const departments = await prisma.department.findMany({
      where: { status: "active" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return apiSuccess(departments);
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถดึงข้อมูลหน่วยงานได้");
  }
}
