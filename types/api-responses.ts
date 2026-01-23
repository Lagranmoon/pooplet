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
