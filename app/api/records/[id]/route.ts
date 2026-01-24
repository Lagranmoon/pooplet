/**
 * 单个记录 API 端点
 *
 * 处理单个记录的 CRUD 操作：获取详情、更新、删除
 * 使用动态路由参数 ID 确保用户只能操作自己的记录
 *
 * @path /app/api/records/[id]/route.ts
 * @author Auto-generated
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateRecordSchema = z.object({
  occurredAt: z.string().datetime().optional(),
  qualityRating: z.number().int().min(1).max(7).optional(),
  notes: z.string().max(500).optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "未认证" }, { status: 401 });
  }

  const { id } = await params;
  const record = await prisma.record.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!record) {
    return NextResponse.json({ error: "记录不存在或无权访问" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: record });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "未认证" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = updateRecordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "验证失败",
          details: process.env.NODE_ENV === 'development' ? validated.error.errors : undefined
        },
        { status: 400 }
      );
    }

    const { id } = await params;

    const record = await prisma.record.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        ...validated.data,
        occurredAt: validated.data.occurredAt ? new Date(validated.data.occurredAt) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: record,
      message: "记录更新成功",
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Record update error:', error);
    }
    
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? "更新记录失败" 
      : error.message || "更新记录失败";
      
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "未认证" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.record.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });

  return NextResponse.json({
    success: true,
    message: "记录删除成功",
  });
}