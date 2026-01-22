export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bowel_movements: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          occurred_at: string
          quality_rating: number
          recorded_at: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          occurred_at: string
          quality_rating: number
          recorded_at?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          occurred_at?: string
          quality_rating?: number
          recorded_at?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// 应用程序特定的类型定义
export type BowelMovementRecord = Database['public']['Tables']['bowel_movements']['Row'];
export type CreateRecordRequest = Database['public']['Tables']['bowel_movements']['Insert'];
export type UpdateRecordRequest = Database['public']['Tables']['bowel_movements']['Update'];

// API 响应类型
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  count: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 查询参数类型
export interface RecordQueryParams {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'occurred_at' | 'created_at' | 'quality_rating';
  sortOrder?: 'asc' | 'desc';
  orderBy?: string;
  orderDirection?: string;
}

// 统计数据类型
export interface DailyStats {
  date: string;
  count: number;
  average_quality: number;
}

export interface WeeklyStats {
  week_start: string;
  total_count: number;
  daily_average: number;
  quality_average: number;
}

export interface MonthlyStats {
  month_start: string;
  total_count: number;
  daily_average: number;
  quality_average: number;
}

export interface OverallStats {
  total_records: number;
  daily_average: number;
  most_common_quality: number;
  streak_days: number;
  first_record_date?: string;
  last_record_date?: string;
}

// 错误类型
export interface DatabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

// 验证规则
export const VALIDATION_RULES = {
  QUALITY_RATING: {
    MIN: 1,
    MAX: 7,
  },
  NOTES: {
    MAX_LENGTH: 500,
  },
} as const;

// 布里斯托大便分类法描述
export const BRISTOL_STOOL_DESCRIPTIONS = {
  1: '硬块状，难以排出',
  2: '香肠状但有硬块',
  3: '香肠状但表面有裂纹',
  4: '香肠状，表面光滑柔软',
  5: '软块状，边缘清晰',
  6: '糊状，边缘不规则',
  7: '水状，无固体块'
} as const;