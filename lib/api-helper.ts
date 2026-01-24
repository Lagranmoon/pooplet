/**
 * API 响应工具函数
 *
 * 提供统一的 API 响应格式创建和错误处理工具
 * 确保所有 API 端点返回一致的数据结构
 *
 * @path /lib/api-helper.ts
 * @author Auto-generated
 */
import type { ApiResponse } from "@/types";

export function createApiResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    error: null,
    message,
  };
}

export function createErrorResponse(message: string): ApiResponse {
  return {
    success: false,
    data: null,
    error: message,
  };
}

export function handleApiError(error: unknown, context?: string): ApiResponse {
  console.error(`API Error [${context || ''}]:`, error);
  return createErrorResponse(error instanceof Error ? error.message : '服务器错误');
}
