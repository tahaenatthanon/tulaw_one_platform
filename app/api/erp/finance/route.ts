import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, parsePagination } from "@/lib/api-utils";
import { hasPermission, type RoleCode } from "@/lib/permissions";
import { resolveDataScope } from "@/lib/data-scope";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  const userId = (session?.user as { id?: string })?.id ?? "";
  const departmentId = (session?.user as { departmentId?: number | null })?.departmentId ?? null;
  if (!session?.user?.email || !hasPermission(roles, "ERP_VIEW")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์ดูข้อมูล ERP Finance", 403);
  }

  try {
    const { page, limit, skip } = parsePagination(req);

    const scope = resolveDataScope(roles as RoleCode[], departmentId, userId);
    const where: Record<string, unknown> = {};

    if (!scope.canSeeAllDepartments && scope.departmentId !== null) {
      where.budget = { departmentId: scope.departmentId };
    }

    const [data, total] = await Promise.all([
      prisma.erpBudgetTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { transDate: "desc" },
        include: {
          budget: true,
        },
      }),
      prisma.erpBudgetTransaction.count({ where }),
    ]);

    const mapped = data.map((tx) => ({
      id: tx.id,
      accountCode: (tx.budget as { code?: string } | null)?.code ?? "-",
      description: tx.description,
      debit: tx.type === "debit" ? tx.amount : 0,
      credit: tx.type === "credit" ? tx.amount : 0,
      type: tx.type,
      department: "-",
      transactionDate: tx.transDate.toISOString(),
      createdBy: tx.createdBy,
    }));

    const totals = mapped.reduce(
      (acc, tx) => ({
        totalDebit: acc.totalDebit + Number(tx.debit),
        totalCredit: acc.totalCredit + Number(tx.credit),
      }),
      { totalDebit: 0, totalCredit: 0 }
    );

    return apiSuccess({ entries: mapped, ...totals }, { total, page, limit });
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถดึงข้อมูล GL ได้");
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "ERP_MANAGE")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์สร้างรายการบัญชี", 403);
  }

  try {
    const body = await req.json();
    const { budgetId, description, amount, type } = body;

    if (!budgetId || !description || !amount || !type) {
      return apiError("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    const entry = await prisma.erpBudgetTransaction.create({
      data: {
        budgetId: String(budgetId),
        description,
        amount: Number(amount),
        type,
        transDate: new Date(),
        createdBy: session.user.id,
      },
    });

    return apiSuccess(entry);
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถสร้างรายการบัญชีได้");
  }
}
