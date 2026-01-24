/**
 * 频率统计端点
 *
 * 提供用户近30天的排便频率统计数据
 * 按日期聚合，返回每日记录数和平均质量
 *
 * @path /app/api/stats/frequency/route.ts
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

  try {
    const result = await prisma.$queryRaw`
      SELECT DATE(occurred_at) as date,
             COUNT(*) as count,
             AVG(quality_rating) as avg_quality
      FROM pooplet_record
      WHERE user_id = ${session.user.id}
        AND DATE(occurred_at) >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(occurred_at)
      ORDER BY date DESC;
    `;

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Frequency stats error:', error);
    }
    return NextResponse.json({
      success: false,
      error: '获取频率数据失败',
    }, { status: 500 });
  }
}
