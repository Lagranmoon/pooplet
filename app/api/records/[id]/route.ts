import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/records/:id - 获取单条记录
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const recordId = parseInt(id, 10);

    if (isNaN(recordId)) {
      return NextResponse.json(
        { error: '无效的记录ID' },
        { status: 400 }
      );
    }

    const record = dbOperations.getRecordById(session.userId, recordId);

    if (!record) {
      return NextResponse.json(
        { error: '记录不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error('Error fetching record:', error);
    return NextResponse.json(
      { error: '获取记录失败' },
      { status: 500 }
    );
  }
}

// PUT /api/records/:id - 更新记录
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const recordId = parseInt(id, 10);

    if (isNaN(recordId)) {
      return NextResponse.json(
        { error: '无效的记录ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { date, time, type, notes } = body;

    if (type !== undefined && (type < 1 || type > 7)) {
      return NextResponse.json(
        { error: '类型必须在 1-7 之间' },
        { status: 400 }
      );
    }

    const record = dbOperations.updateRecord(session.userId, recordId, { date, time, type, notes });

    if (!record) {
      return NextResponse.json(
        { error: '记录不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json(
      { error: '更新记录失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/records/:id - 删除记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const recordId = parseInt(id, 10);

    if (isNaN(recordId)) {
      return NextResponse.json(
        { error: '无效的记录ID' },
        { status: 400 }
      );
    }

    const result = dbOperations.deleteRecord(session.userId, recordId);

    if (!result) {
      return NextResponse.json(
        { error: '记录不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deletedId: result.id });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json(
      { error: '删除记录失败' },
      { status: 500 }
    );
  }
}
