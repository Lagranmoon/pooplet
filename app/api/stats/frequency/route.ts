import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await prisma.$queryRaw`
      SELECT DATE(occurred_at) as date,
             COUNT(*) as count,
             AVG(quality_rating) as avg_quality
      FROM pooplet_record
      WHERE DATE(occurred_at) >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(occurred_at)
      ORDER BY date DESC;
    `;

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Frequency stats error:', error);
    return NextResponse.json({
      success: false,
      error: '获取频率数据失败',
    });
  }
}
