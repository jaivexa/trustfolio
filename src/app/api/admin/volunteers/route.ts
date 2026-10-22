import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/server/auth-guard";
import type { VolunteerApplicationStatus } from "@/generated/prisma/enums";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const status = params.get("status") as VolunteerApplicationStatus | null;
  const q = params.get("q")?.trim();
  const page = Math.max(0, Number(params.get("page")) || 0);
  const pageSize = Math.min(100, Math.max(1, Number(params.get("pageSize")) || 20));

  const validStatuses = new Set(["PENDING", "REVIEWING", "CONTACTED", "APPROVED", "REJECTED"]);

  const where: Prisma.VolunteerApplicationWhereInput = {
    isDeleted: false,
    ...(status && validStatuses.has(status) ? { status } : {}),
    ...(q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { motivation: { contains: q, mode: "insensitive" } },
            { goals: { contains: q, mode: "insensitive" } },
            { remarks: { contains: q, mode: "insensitive" } },
            { activity: { titleEn: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [items, total, counts] = await Promise.all([
    db.volunteerApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
      include: {
        activity: {
          select: { id: true, titleEn: true, titleTa: true, slug: true },
        },
      },
    }),
    db.volunteerApplication.count({ where }),
    db.volunteerApplication.groupBy({
      by: ["status"],
      where: { isDeleted: false },
      _count: { _all: true },
    }),
  ]);

  const byStatus = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    counts: {
      all: Object.values(byStatus).reduce((a, b) => a + b, 0),
      ...byStatus,
    },
  });
}
