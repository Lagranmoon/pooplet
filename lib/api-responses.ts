/**
 * API 响应格式化工具
 *
 * 提供标准化的 API 响应格式，包括分页响应和错误处理
 * 确保前端和后端之间数据交互的一致性
 *
 * @path /lib/api-responses.ts
 * @author Auto-generated
 */
import type { RecordsResponse } from "@/types/api-responses";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function handleApiRequest<T>(
  request: () => Promise<ApiResponse<T>>
): Promise<ApiResponse<T>> {
  try {
    const response = await request();
    return response;
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "请求失败",
      data: null,
    };
  }
}

export function createPaginatedResponse(
  items: RecordsResponse["records"],
  page: number,
  limit: number,
  total: number
): ApiResponse<RecordsResponse> {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data: {
      records: items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    },
  };
}

export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function createErrorResponse(message: string): ApiResponse<null> {
  return {
    success: false,
    data: null,
    error: message,
  };
}
