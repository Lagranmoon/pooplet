import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "未认证" }, { status: 401 });
  }

  const [
    totalRecords,
    firstRecord,
    lastRecord,
    qualityStats,
  ] = await Promise.all([
    prisma.record.count({ where: { userId: session.user.id } }),
    prisma.record.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.record.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.record.groupBy({
      by: ["qualityRating"],
      where: { userId: session.user.id },
      _count: true,
      orderBy: { _count: { qualityRating: "desc" } },
    }),
  ]);

  const mostCommonQuality = qualityStats[0]?.qualityRating || null;

  const daysSinceFirst = firstRecord
    ? Math.ceil((Date.now() - firstRecord.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const avgDailyCount = daysSinceFirst > 0 ? totalRecords / daysSinceFirst : 0;

  return NextResponse.json({
    success: true,
    data: {
      totalRecords,
      avgDailyCount: Math.round(avgDailyCount * 100) / 100,
      mostCommonQuality,
      streakDays: daysSinceFirst,
      lastRecordAt: lastRecord?.occurredAt,
      firstRecordAt: firstRecord?.occurredAt,
    },
  });
}
