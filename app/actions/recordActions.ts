/**
 * 记录操作 Server Actions
 *
 * 提供记录的创建、更新、删除和批量删除操作
 * 使用 Next.js Server Actions 进行服务端数据处理
 *
 * @path /app/actions/recordActions.ts
 * @author Auto-generated
 */
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createRecordSchema = z.object({
  occurredAt: z.string().datetime().refine(
    (date) => new Date(date) <= new Date(),
    "发生时间不能是未来时间"
  ),
  qualityRating: z.number().int().min(1).max(7),
  notes: z.string().max(500).optional(),
});

export async function createRecord(formData: FormData) {
  const session = await auth.api.getSession();
  if (!session) {
    return { success: false, error: "未认证" };
  }

  const occurredAt = formData.get("occurredAt") as string;
  const qualityRating = parseInt(formData.get("qualityRating") as string);
  const notes = formData.get("notes") as string;

  const validated = createRecordSchema.safeParse({
    occurredAt,
    qualityRating,
    notes,
  });

  if (!validated.success) {
    return { success: false, error: "验证失败" };
  }

  const record = await prisma.record.create({
    data: {
      userId: session.user.id,
      occurredAt: new Date(validated.data.occurredAt),
      qualityRating: validated.data.qualityRating,
      notes: validated.data.notes,
    },
  });

  return { success: true, data: record };
}

export async function updateRecord(id: string, formData: FormData) {
  const session = await auth.api.getSession();
  if (!session) {
    return { success: false, error: "未认证" };
  }

  const occurredAt = formData.get("occurredAt") as string;
  const qualityRating = formData.get("qualityRating") as string;
  const notes = formData.get("notes") as string;

  const validated = createRecordSchema.safeParse({
    occurredAt,
    qualityRating,
    notes,
  });

  if (!validated.success) {
    return { success: false, error: "验证失败" };
  }

  const record = await prisma.record.update({
    where: {
      id,
      userId: session.user.id,
    },
    data: {
      occurredAt: validated.data.occurredAt ? new Date(validated.data.occurredAt) : undefined,
      qualityRating: validated.data.qualityRating ?? undefined,
      notes: validated.data.notes,
    },
  });

  return { success: true, data: record };
}

export async function deleteRecord(id: string) {
  const session = await auth.api.getSession();
  if (!session) {
    return { success: false, error: "未认证" };
  }

  await prisma.record.delete({
    where: {
      id: id,
      userId: session.user.id,
    },
  });

  return { success: true };
}

export async function deleteRecords(ids: string[]) {
  const session = await auth.api.getSession();
  if (!session) {
    return { success: false, error: "未认证" };
  }

  const { count } = await prisma.record.deleteMany({
    where: {
      id: { in: ids },
      userId: session.user.id,
    },
  });

  return { success: true, data: { deletedCount: count } };
}
