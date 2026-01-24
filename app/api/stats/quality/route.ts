import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "未认证" }, { status: 401 });
  }

  try {
    const qualityStats = await prisma.record.groupBy({
      by: ["qualityRating"],
      _count: true,
      where: { userId: session.user.id },
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
    if (process.env.NODE_ENV === 'development') {
      console.error('Quality stats error:', error);
    }
    return NextResponse.json({
      success: false,
      error: '获取质量分布数据失败',
    }, { status: 500 });
  }
}
