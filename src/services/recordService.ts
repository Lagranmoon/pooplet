import { supabase } from './supabase';
import type {
  BowelMovementRecord,
  CreateRecordRequest,
  UpdateRecordRequest,
  RecordQueryParams,
  ApiResponse,
  PaginatedResponse,
  DatabaseError,
} from '../types/database';
import { VALIDATION_RULES } from '../types/database';

/**
 * 记录服务类 - 处理排便记录的 CRUD 操作
 * 实现需求: 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2
 */
export class RecordService {
  /**
   * 验证记录数据
   * 需求: 5.1, 5.2, 5.4, 5.5
   */
  private validateRecordData(data: CreateRecordRequest | UpdateRecordRequest): string[] {
    const errors: string[] = [];

    // 验证质量评级
    if ('quality_rating' in data && data.quality_rating !== undefined) {
      if (!Number.isInteger(data.quality_rating) || 
          data.quality_rating < VALIDATION_RULES.QUALITY_RATING.MIN || 
          data.quality_rating > VALIDATION_RULES.QUALITY_RATING.MAX) {
        errors.push(`质量评级必须是 ${VALIDATION_RULES.QUALITY_RATING.MIN}-${VALIDATION_RULES.QUALITY_RATING.MAX} 之间的整数`);
      }
    }

    // 验证发生时间
    if ('occurred_at' in data && data.occurred_at) {
      const occurredDate = new Date(data.occurred_at);
      const now = new Date();
      
      if (isNaN(occurredDate.getTime())) {
        errors.push('发生时间格式无效');
      } else if (occurredDate > now) {
        errors.push('发生时间不能是未来时间');
      }
    }

    // 验证备注长度
    if (data.notes && data.notes.length > VALIDATION_RULES.NOTES.MAX_LENGTH) {
      errors.push(`备注不能超过 ${VALIDATION_RULES.NOTES.MAX_LENGTH} 个字符`);
    }

    return errors;
  }

  /**
   * 处理数据库错误
   */
  private handleDatabaseError(error: any): DatabaseError {
    console.error('Database error:', error);
    
    // 处理常见的 PostgreSQL 错误
    if (error.code === '23505') {
      return {
        code: 'DUPLICATE_ENTRY',
        message: '记录已存在',
        details: error.details,
      };
    }
    
    if (error.code === '23503') {
      return {
        code: 'FOREIGN_KEY_VIOLATION',
        message: '用户不存在',
        details: error.details,
      };
    }
    
    if (error.code === '23514') {
      return {
        code: 'CHECK_VIOLATION',
        message: '数据验证失败',
        details: error.details,
      };
    }

    // RLS 策略违反
    if (error.code === '42501' || error.message?.includes('RLS')) {
      return {
        code: 'PERMISSION_DENIED',
        message: '没有权限访问此记录',
      };
    }

    // 网络或连接错误
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return {
        code: 'NETWORK_ERROR',
        message: '网络连接失败，请检查网络连接',
      };
    }

    // 默认错误
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || '操作失败，请稍后重试',
      details: error.details,
      hint: error.hint,
    };
  }

  /**
   * 创建新的排便记录
   * 需求: 1.2, 1.3, 1.4, 1.5, 2.1
   */
  async createRecord(data: CreateRecordRequest): Promise<ApiResponse<BowelMovementRecord>> {
    try {
      // 数据验证
      const validationErrors = this.validateRecordData(data);
      if (validationErrors.length > 0) {
        return {
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: validationErrors.join('; '),
          },
        };
      }

      // 获取当前用户
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return {
          data: null,
          error: validationErrors.join('; '),
        };
      }

      // 插入记录
      const { data: record, error } = await supabase
        .from('bowel_movements')
        .insert({
          user_id: user.id,
          occurred_at: data.occurred_at,
          quality_rating: data.quality_rating,
          notes: data.notes !== undefined ? data.notes : null,
          recorded_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: this.handleDatabaseError(error),
        };
      }

      return {
        data: record,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleDatabaseError(error),
      };
    }
  }

  /**
   * 获取单个记录
   * 需求: 2.2
   */
  async getRecord(id: string): Promise<ApiResponse<BowelMovementRecord>> {
    try {
      const { data: record, error } = await supabase
        .from('bowel_movements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return {
          data: null,
          error: this.handleDatabaseError(error),
        };
      }

      return {
        data: record,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleDatabaseError(error),
      };
    }
  }

  /**
   * 获取用户的记录列表
   * 需求: 2.2, 1.6
   */
  async getRecords(params: RecordQueryParams = {}): Promise<PaginatedResponse<BowelMovementRecord>> {
    try {
      const {
        limit = 50,
        offset = 0,
        startDate,
        endDate,
        orderBy = 'occurred_at',
        orderDirection = 'desc',
      } = params;

      let query = supabase
        .from('bowel_movements')
        .select('*', { count: 'exact' });

      // 日期范围过滤
      if (startDate) {
        query = query.gte('occurred_at', startDate);
      }
      if (endDate) {
        query = query.lte('occurred_at', endDate);
      }

      // 排序和分页
      query = query
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(offset, offset + limit - 1);

      const { data: records, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        data: records || [],
        count: count || 0,
        hasMore: (count || 0) > offset + limit,
        nextOffset: (count || 0) > offset + limit ? offset + limit : undefined,
      };
    } catch (error) {
      throw this.handleDatabaseError(error);
    }
  }

  /**
   * 获取指定日期范围内的记录
   * 需求: 2.2, 3.2, 3.3, 3.4
   */
  async getRecordsByDateRange(
    startDate: string,
    endDate: string,
    limit?: number
  ): Promise<ApiResponse<BowelMovementRecord[]>> {
    try {
      let query = supabase
        .from('bowel_movements')
        .select('*')
        .gte('occurred_at', startDate)
        .lte('occurred_at', endDate)
        .order('occurred_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data: records, error } = await query;

      if (error) {
        return {
          data: null,
          error: this.handleDatabaseError(error),
        };
      }

      return {
        data: records || [],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleDatabaseError(error),
      };
    }
  }

  /**
   * 获取今天的记录
   * 需求: 1.1, 1.6
   */
  async getTodayRecords(): Promise<ApiResponse<BowelMovementRecord[]>> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    return this.getRecordsByDateRange(startOfDay, endOfDay);
  }

  /**
   * 更新记录
   * 需求: 1.4, 2.1
   */
  async updateRecord(id: string, data: UpdateRecordRequest): Promise<ApiResponse<BowelMovementRecord>> {
    try {
      // 数据验证
      const validationErrors = this.validateRecordData(data);
      if (validationErrors.length > 0) {
        return {
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: validationErrors.join('; '),
          },
        };
      }

      // 更新记录
      const { data: record, error } = await supabase
        .from('bowel_movements')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: this.handleDatabaseError(error),
        };
      }

      return {
        data: record,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleDatabaseError(error),
      };
    }
  }

  /**
   * 删除记录
   * 需求: 2.1
   */
  async deleteRecord(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('bowel_movements')
        .delete()
        .eq('id', id);

      if (error) {
        return {
          data: null,
          error: this.handleDatabaseError(error),
        };
      }

      return {
        data: null,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleDatabaseError(error),
      };
    }
  }

  /**
   * 批量删除记录
   * 需求: 2.1
   */
  async deleteRecords(ids: string[]): Promise<ApiResponse<void>> {
    try {
      if (ids.length === 0) {
        return {
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: '没有指定要删除的记录',
          },
        };
      }

      const { error } = await supabase
        .from('bowel_movements')
        .delete()
        .in('id', ids);

      if (error) {
        return {
          data: null,
          error: this.handleDatabaseError(error),
        };
      }

      return {
        data: null,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleDatabaseError(error),
      };
    }
  }

  /**
   * 检查记录是否存在
   */
  async recordExists(id: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('bowel_movements')
        .select('id')
        .eq('id', id)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * 获取记录总数
   */
  async getRecordCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('bowel_movements')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      return count || 0;
    } catch {
      return 0;
    }
  }
}

// 导出单例实例
export const recordService = new RecordService();