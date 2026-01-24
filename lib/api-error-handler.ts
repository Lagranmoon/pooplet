/**
 * Next.js API 错误处理器
 *
 * 提供统一的 API 响应处理函数，用于 Next.js 路由处理
 * 封装 NextResponse 的成功和错误响应
 *
 * @path /lib/api-error-handler.ts
 * @author Auto-generated
 */
import { NextResponse } from "next/server";
import { createApiResponse } from "@/lib/api-helper";

export async function handleApiSuccess<T>(
  data: T,
  message?: string,
  status?: number
): Promise<NextResponse> {
  return NextResponse.json(createApiResponse(data, message), { status });
}

export async function handleApiErrorNext(
  message: string,
  context?: string,
  status?: number
): Promise<NextResponse> {
  return handleApiErrorNext(message, context, status);
}
