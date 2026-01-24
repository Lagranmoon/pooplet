/**
 * API 响应结构定义
 *
 * 定义标准化的 API 响应结构，包括分页和统计响应
 * 确保所有 API 返回数据格式一致
 *
 * @path /types/api-responses.ts
 * @author Auto-generated
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface RecordsResponse {
  records: unknown[];
  pagination: Pagination;
}

export interface OverviewStats {
  totalRecords: number;
  avgDailyCount: number;
  mostCommonQuality: number;
  streakDays: number;
  lastRecordAt: string;
  firstRecordAt: string;
}
