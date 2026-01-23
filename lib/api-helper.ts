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
