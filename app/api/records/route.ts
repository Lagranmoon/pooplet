import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';

// GET /api/records - 获取记录列表
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const period = searchParams.get('period');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (startDate && endDate) {
      const records = dbOperations.getRecordsByDateRange(session.userId, startDate, endDate);
      return NextResponse.json({ records });
    }

    if (month) {
      const records = dbOperations.getRecordsByMonth(session.userId, month);
      return NextResponse.json({ records });
    }

    if (period) {
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

      const records = dbOperations.getRecordsByDateRange(session.userId, start, end);
      return NextResponse.json({ records, period, start, end });
    }

    const records = dbOperations.getAllRecords(session.userId);
    return NextResponse.json({ records });
  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json(
      { error: '获取记录失败' },
      { status: 500 }
    );
  }
}

// POST /api/records - 创建记录
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { date, time, type, notes } = body;

    if (!date || !type) {
      return NextResponse.json(
        { error: '日期和类型不能为空' },
        { status: 400 }
      );
    }

    if (type < 1 || type > 7) {
      return NextResponse.json(
        { error: '类型必须在 1-7 之间' },
        { status: 400 }
      );
    }

    const record = dbOperations.createRecord(session.userId, { date, time, type, notes });
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error('Error creating record:', error);
    return NextResponse.json(
      { error: '创建记录失败' },
      { status: 500 }
    );
  }
}
