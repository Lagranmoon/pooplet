import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/db';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';

// GET /api/records - 获取记录列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const period = searchParams.get('period');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (startDate && endDate) {
      const records = dbOperations.getRecordsByDateRange(startDate, endDate);
      return NextResponse.json({ records });
    }

    if (month) {
      // month format: YYYY-MM
      const records = dbOperations.getRecordsByMonth(month);
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

      const records = dbOperations.getRecordsByDateRange(start, end);
      return NextResponse.json({ records, period, start, end });
    }

    const records = dbOperations.getAllRecords();
    return NextResponse.json({ records });
  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
}

// POST /api/records - 创建记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, time, type, notes } = body;

    if (!date || !type) {
      return NextResponse.json(
        { error: 'Date and type are required' },
        { status: 400 }
      );
    }

    if (type < 1 || type > 7) {
      return NextResponse.json(
        { error: 'Type must be between 1 and 7' },
        { status: 400 }
      );
    }

    const record = dbOperations.createRecord({ date, time, type, notes });
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error('Error creating record:', error);
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    );
  }
}
