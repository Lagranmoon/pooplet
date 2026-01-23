import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const qualityStats = await prisma.record.groupBy({
      by: ["qualityRating"],
      _count: true,
    });

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
    } as Record<1 | 2 | 3 | 4 | 5 | 6 | 7, number>;

    qualityStats.forEach((stat) => {
      distribution[stat.qualityRating] = stat._count;
    });

    const totalRecords = qualityStats.reduce((sum, s) => sum + s._count, 0);

    const mostCommon = parseInt(
      Object.entries(distribution).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
    );

    return NextResponse.json({
      success: true,
      data: {
        distribution,
        totalRecords,
        mostCommon,
      },
    });
  } catch (error) {
    console.error('Quality stats error:', error);
    return NextResponse.json({
      success: false,
      error: '获取质量分布数据失败',
    });
  }
}
