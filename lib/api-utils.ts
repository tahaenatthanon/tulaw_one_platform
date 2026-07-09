import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function apiSuccess<T>(data: T, meta?: { total: number; page: number; limit: number }) {
  return NextResponse.json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function apiError(code: string, message: string, status = 400) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

export function parsePagination(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 10));
  return { page, limit, skip: (page - 1) * limit };
}
