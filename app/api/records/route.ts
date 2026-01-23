import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createRecordSchema = z.object({
  occurredAt: z.string().datetime(),
  qualityRating: z.number().int().min(1).max(7),
  notes: z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "未认证" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: Prisma.RecordWhereInput = { userId: session.user.id };
  if (startDate) {
    where.occurredAt = { gte: new Date(startDate) };
  }
  if (endDate) {
    where.occurredAt = { lte: new Date(endDate) };
  }

  const [records, total] = await Promise.all([
    prisma.record.findMany({
      where,
      orderBy: { occurredAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.record.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "未认证" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.ids) {
      const { count } = await prisma.record.deleteMany({
        where: {
          id: { in: body.ids },
          userId: session.user.id,
        },
      });

      return NextResponse.json({
        success: true,
        data: { deletedCount: count },
        message: `删除成功`,
      });
    }

    const validated = createRecordSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "验证失败", details: validated.error },
        { status: 400 }
      );
    }

    const record = await prisma.record.create({
      data: {
        userId: session.user.id,
        occurredAt: new Date(validated.data.occurredAt),
        qualityRating: validated.data.qualityRating,
        notes: validated.data.notes,
      },
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "创建记录失败" },
      { status: 500 }
    );
  }
}
