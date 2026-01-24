/**
 * API 数据类型定义
 *
 * 定义 API 返回的数据结构和查询参数
 * 包括记录行、统计信息、分页响应等类型
 *
 * @path /types/api-types.ts
 * @author Auto-generated
 */
export interface RecordRow {
  id: string;
  user_id: string;
  occurred_at: string;
  quality_rating: number;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface DailyStats {
  date: string;
  count: number;
  avgQuality: number;
  minQuality: number;
  maxQuality: number;
}

export interface UserStats {
  totalRecords: number;
  avgDailyCount: number;
  mostCommonQuality: number;
  streakDays: number;
  lastRecordAt: string;
  firstRecordAt: string;
}

export interface RecordsQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationResponse {
  records: RecordRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
