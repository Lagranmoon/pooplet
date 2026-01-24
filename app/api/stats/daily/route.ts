/**
 * 每日统计端点
 *
 * 提供按日期统计的用户健康数据
 * 包括每日记录数、平均/最小/最大质量等指标
 *
 * @path /app/api/stats/daily/route.ts
 * @author Auto-generated
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "未认证" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  interface DailyStatRow {
    day: Date;
    count: bigint;
    avg_quality: number | null;
    min_quality: number | null;
    max_quality: number | null;
  }

  const dailyStats = await prisma.$queryRaw<DailyStatRow[]>`
    SELECT DATE(occurred_at) as day,
           COUNT(*) as count,
           AVG(quality_rating) as avg_quality,
           MIN(quality_rating) as min_quality,
           MAX(quality_rating) as max_quality
    FROM pooplet_record
    WHERE user_id = ${session.user.id}
      AND occurred_at >= ${startDate}
    GROUP BY DATE(occurred_at)
    ORDER BY day ASC;
  `;

  const summary = {
    totalDays: dailyStats.length,
    totalRecords: dailyStats.reduce((sum, s) => sum + Number(s.count), 0),
    avgDaily: 0,
    maxDaily: 0,
    minDaily: 0,
  };

  if (summary.totalDays > 0) {
    summary.avgDaily = summary.totalRecords / summary.totalDays;
    summary.maxDaily = Math.max(...dailyStats.map((s) => Number(s.count)));
    summary.minDaily = Math.min(...dailyStats.map((s) => Number(s.count)));
  }

  return NextResponse.json({
    success: true,
    data: {
      dailyStats: dailyStats.map((s) => ({
        date: s.day.toLocaleDateString("zh-CN"),
        count: Number(s.count),
        avgQuality: s.avg_quality,
        minQuality: s.min_quality,
        maxQuality: s.max_quality,
      })),
      summary,
    },
  });
}
