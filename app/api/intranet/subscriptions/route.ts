import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "ไม่พบผู้ใช้" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;

    const subs = await prisma.announcementSubscription.findMany({
      where: { userId, deletedAt: null },
      include: {
        category: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: subs });
  } catch {
    return NextResponse.json({ success: false, message: "DB_ERROR" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "ไม่พบผู้ใช้" }, { status: 401 });
    }

    const { categoryName, departmentId, isSubscribed } = await req.json();
    const userId = (session.user as { id: string }).id;

    // If categoryName is provided, look up the category by name
    let catId: number | null = null;
    if (categoryName) {
      const cat = await prisma.announcementCategory.findFirst({ where: { name: categoryName } });
      if (cat) catId = cat.id;
    }

    // Check existing subscription
    const existing = await prisma.announcementSubscription.findFirst({
      where: {
        userId,
        ...(catId ? { categoryId: catId } : { categoryId: null }),
        ...(departmentId ? { departmentId } : { departmentId: null }),
        deletedAt: null,
      },
    });

    if (existing) {
      // Toggle subscription status
      const updated = await prisma.announcementSubscription.update({
        where: { id: existing.id },
        data: { isSubscribed: isSubscribed ?? !existing.isSubscribed },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    // Create new subscription
    const created = await prisma.announcementSubscription.create({
      data: {
        userId,
        categoryId: catId,
        departmentId: departmentId ?? null,
        isSubscribed: isSubscribed ?? true,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch {
    return NextResponse.json({ success: false, message: "DB_ERROR" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "ไม่พบผู้ใช้" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "ไม่พบ ID" }, { status: 400 });
    }

    await prisma.announcementSubscription.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: "DB_ERROR" }, { status: 500 });
  }
}
