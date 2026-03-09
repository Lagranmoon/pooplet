import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/db';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths, subYears } from 'date-fns';

// GET /api/stats - 获取统计数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    const today = new Date();
    let start: string;
    let end: string;

    switch (period) {
      case 'week':
        start = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        end = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        break;
      case 'month':
        start = format(startOfMonth(today), 'yyyy-MM-dd');
        end = format(endOfMonth(today), 'yyyy-MM-dd');
        break;
      case 'year':
        start = format(startOfYear(today), 'yyyy-MM-dd');
        end = format(endOfYear(today), 'yyyy-MM-dd');
        break;
      default:
        start = format(startOfMonth(today), 'yyyy-MM-dd');
        end = format(endOfMonth(today), 'yyyy-MM-dd');
    }

    // Get basic stats
    const stats = dbOperations.getStatsByPeriod(start, end);

    // Get type distribution
    const typeDistribution = dbOperations.getTypeDistribution(start, end);

    // Get daily counts for trend
    const dailyCounts = dbOperations.getDailyCounts(start, end);

    // Get current streak
    const currentStreak = dbOperations.getCurrentStreak();

    // Get previous period stats for comparison
    let prevStart: string;
    let prevEnd: string;

    switch (period) {
      case 'week':
        prevStart = format(startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        prevEnd = format(endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        break;
      case 'month':
        prevStart = format(startOfMonth(subMonths(today, 1)), 'yyyy-MM-dd');
        prevEnd = format(endOfMonth(subMonths(today, 1)), 'yyyy-MM-dd');
        break;
      case 'year':
        prevStart = format(startOfYear(subYears(today, 1)), 'yyyy-MM-dd');
        prevEnd = format(endOfYear(subYears(today, 1)), 'yyyy-MM-dd');
        break;
      default:
        prevStart = format(startOfMonth(subMonths(today, 1)), 'yyyy-MM-dd');
        prevEnd = format(endOfMonth(subMonths(today, 1)), 'yyyy-MM-dd');
    }

    const prevStats = dbOperations.getStatsByPeriod(prevStart, prevEnd);

    return NextResponse.json({
      period,
      dateRange: { start, end },
      summary: {
        totalCount: stats.total_count,
        uniqueDays: stats.unique_days,
        avgType: stats.avg_type ? parseFloat(stats.avg_type.toFixed(1)) : null,
        idealPercentage: stats.total_count > 0
          ? Math.round((stats.ideal_count / stats.total_count) * 100)
          : 0,
        currentStreak,
      },
      comparison: {
        totalCountChange: prevStats.total_count > 0
          ? Math.round(((stats.total_count - prevStats.total_count) / prevStats.total_count) * 100)
          : 0,
      },
      typeDistribution,
      dailyCounts,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
