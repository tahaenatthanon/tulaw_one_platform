import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { apiSuccess, apiError } from "@/lib/api-utils";

// GET /api/erp/stats
export async function GET(_req: NextRequest) {
  const session = await requirePermission("ERP_VIEW");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์เข้าถึง", 403);

  const [totalVendors, totalPR, totalPO, totalAssets, totalBudgets] = await Promise.all([
    prisma.erpVendor.count(),
    prisma.erpPurchaseRequest.count(),
    prisma.erpPurchaseOrder.count(),
    prisma.erpAsset.count(),
    prisma.erpBudget.count(),
  ]);

  const pendingPR = await prisma.erpPurchaseRequest.count({ where: { status: "pending" } });
  const totalBudgetAmount = await prisma.erpBudget.aggregate({ _sum: { totalAmount: true } });
  const totalAssetValue = await prisma.erpAsset.aggregate({ _sum: { purchaseValue: true } });

  const recentPR = await prisma.erpPurchaseRequest.findMany({
    take: 5, orderBy: { createdAt: "desc" },
    include: { items: true, requester: { select: { email: true } } },
  });

  return apiSuccess({
    totalVendors,
    totalPR,
    totalPO,
    totalAssets,
    totalBudgets,
    pendingPR,
    totalBudgetAmount: totalBudgetAmount._sum.totalAmount ?? 0,
    totalAssetValue: totalAssetValue._sum.purchaseValue ?? 0,
    recentPR,
  });
}
