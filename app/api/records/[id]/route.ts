import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

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

  const body = await request.json();
  const { id } = await params;

  const record = await prisma.record.update({
    where: {
      id,
      userId: session.user.id,
    },
    data: {
      ...body,
    },
  });

  return NextResponse.json({
    success: true,
    data: record,
    message: "记录更新成功",
  });
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
