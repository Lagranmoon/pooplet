import { supabase } from './supabase';
import type {
  DailyStats,
  WeeklyStats,
  MonthlyStats,
  OverallStats,
  DatabaseError,
  ApiResponse,
} from '../types/database';

/**
 * 统计服务类 - 处理排便记录的统计和分析功能
 * 实现需求: 3.2, 3.3, 3.4
 */
export class StatsService {
  /**
   * 处理数据库错误
   */
  private handleDatabaseError(error: any): DatabaseError {
    console.error('Database error:', error);
    
    // 处理常见的 PostgreSQL 错误
    if (error.code === '42501') {
      return {
        code: 'PERMISSION_DENIED',
        message: '没有权限访问统计数据',
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
      message: error.message || '统计查询失败，请稍后重试',
      details: error.details,
      hint: error.hint,
    };
  }

  /**
   * 获取当前用户ID
   */
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return null;
      }
      return user.id;
    } catch {
      return null;
    }
  }

  /**
   * 获取每日统计
   * 需求: 3.2 - 每日平均次数计算
   */
  async getDailyStats(days: number = 30): Promise<ApiResponse<DailyStats[]>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: {
            code: 'AUTH_ERROR',
            message: '用户未登录',
          },
        };
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString();

      const { data, error } = await supabase
        .rpc('get_daily_bowel_movement_stats', {
          p_user_id: userId,
          p_start_date: startDateStr,
        });

      if (error) {
        return {
          data: null,
          error: this.handleDatabaseError(error),
        };
      }

      return {
        data: data || [],
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
   * 获取周统计
   * 需求: 3.3 - 周统计展示最近7天的排便频率
   */
  async getWeeklyStats(weeks: number = 4): Promise<ApiResponse<WeeklyStats[]>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: {
            code: 'AUTH_ERROR',
            message: '用户未登录',
          },
        };
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (weeks * 7));
      const startDateStr = startDate.toISOString();

      const { data, error } = await supabase
        .rpc('get_weekly_bowel_movement_stats', {
          p_user_id: userId,
          p_start_date: startDateStr,
        });

      if (error) {
        return {
          data: null,
          error: this.handleDatabaseError(error),
        };
      }

      return {
        data: data || [],
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
   * 获取月统计
   * 需求: 3.4 - 月统计展示最近30天的排便趋势
   */
  async getMonthlyStats(months: number = 6): Promise<ApiResponse<MonthlyStats[]>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: {
            code: 'AUTH_ERROR',
            message: '用户未登录',
          },
        };
      }

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      const startDateStr = startDate.toISOString();

      const { data, error } = await supabase
        .rpc('get_monthly_bowel_movement_stats', {
          p_user_id: userId,
          p_start_date: startDateStr,
        });

      if (error) {
        return {
          data: null,
          error: this.handleDatabaseError(error),
        };
      }

      return {
        data: data || [],
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
   * 获取总体统计信息
   * 需求: 3.1 - 总体统计数据
   */
  async getOverallStats(): Promise<ApiResponse<OverallStats>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: {
            code: 'AUTH_ERROR',
            message: '用户未登录',
          },
        };
      }

      // 获取总体统计
      const { data, error } = await supabase
        .rpc('get_overall_bowel_movement_stats', {
          p_user_id: userId,
        });

      if (error) {
        return {
          data: null,
          error: this.handleDatabaseError(error),
        };
      }

      // 如果没有数据，返回默认值
      if (!data || data.length === 0) {
        return {
          data: {
            total_records: 0,
            daily_average: 0,
            most_common_quality: 0,
            streak_days: 0,
            first_record_date: null,
            last_record_date: null,
          },
          error: null,
        };
      }

      const stats = data[0];
      return {
        data: {
          total_records: stats.total_records || 0,
          daily_average: parseFloat(stats.daily_average) || 0,
          most_common_quality: stats.most_common_quality || 0,
          streak_days: stats.streak_days || 0,
          first_record_date: stats.first_record_date,
          last_record_date: stats.last_record_date,
        },
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
   * 获取频率趋势数据（用于图表）
   * 需求: 3.5 - 图表数据生成
   */
  async getFrequencyTrend(
    type: 'daily' | 'weekly' | 'monthly',
    limit: number = 30
  ): Promise<ApiResponse<any[]>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: {
            code: 'AUTH_ERROR',
            message: '用户未登录',
          },
        };
      }

      let rpcFunction = '';
      let days = limit;

      switch (type) {
        case 'daily':
          rpcFunction = 'get_daily_bowel_movement_stats';
          break;
        case 'weekly':
          rpcFunction = 'get_weekly_bowel_movement_stats';
          days = limit * 7;
          break;
        case 'monthly':
          rpcFunction = 'get_monthly_bowel_movement_stats';
          days = limit * 30;
          break;
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString();

      const { data, error } = await supabase
        .rpc(rpcFunction, {
          p_user_id: userId,
          p_start_date: startDateStr,
        });

      if (error) {
        return {
          data: null,
          error: this.handleDatabaseError(error),
        };
      }

      return {
        data: data || [],
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
   * 计算连续记录天数（连续天数）
   */
  async getStreakDays(): Promise<number> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return 0;
      }

      // 获取最近90天的记录
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
      const startDateStr = startDate.toISOString();

      const { data, error } = await supabase
        .from('bowel_movements')
        .select('occurred_at')
        .eq('user_id', userId)
        .gte('occurred_at', startDateStr)
        .order('occurred_at', { ascending: false });

      if (error || !data) {
        return 0;
      }

      // 按日期分组
      const recordsByDate = new Map<string, number>();
      data.forEach(record => {
        const date = record.occurred_at.split('T')[0]; // YYYY-MM-DD
        recordsByDate.set(date, (recordsByDate.get(date) || 0) + 1);
      });

      // 计算连续天数
      let streak = 0;
      const today = new Date();
      
      for (let i = 0; i < 365; i++) { // 最多检查365天
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        if (recordsByDate.has(dateStr)) {
          streak++;
        } else {
          break; // 中断连续记录
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak days:', error);
      return 0;
    }
  }

  /**
   * 获取质量分布统计
   */
  async getQualityDistribution(): Promise<ApiResponse<Record<number, number>>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: {
            code: 'AUTH_ERROR',
            message: '用户未登录',
          },
        };
      }

      const { data, error } = await supabase
        .from('bowel_movements')
        .select('quality_rating')
        .eq('user_id', userId);

      if (error) {
        return {
          data: null,
          error: this.handleDatabaseError(error),
        };
      }

      // 计算质量分布
      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
      
      data?.forEach(record => {
        const rating = record.quality_rating;
        if (rating >= 1 && rating <= 7) {
          distribution[rating] = (distribution[rating] || 0) + 1;
        }
      });

      return {
        data: distribution,
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
   * 获取最近7天和30天的对比统计
   * 需求: 3.6 - 空数据状态显示处理
   */
  async getComparisonStats(): Promise<ApiResponse<{
    last_7_days: number;
    last_30_days: number;
    improvement: number;
    trend: 'up' | 'down' | 'stable';
  }>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: {
            code: 'AUTH_ERROR',
            message: '用户未登录',
          },
        };
      }

      // 获取最近7天和30天的记录数
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const [last7Result, last30Result] = await Promise.all([
        supabase
          .from('bowel_movements')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
          .gte('occurred_at', last7Days.toISOString()),
        supabase
          .from('bowel_movements')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
          .gte('occurred_at', last30Days.toISOString())
      ]);

      if (last7Result.error || last30Result.error) {
        return {
          data: null,
          error: this.handleDatabaseError(last7Result.error || last30Result.error),
        };
      }

      const last7DaysCount = last7Result.count || 0;
      const last30DaysCount = last30Result.count || 0;

      // 计算改善情况（相对于预期的每天1次）
      const expectedLast7Days = 7;
      
      const improvement = last7DaysCount >= expectedLast7Days ? 100 : (last7DaysCount / expectedLast7Days) * 100;

      // 判断趋势
      let trend: 'up' | 'down' | 'stable' = 'stable';
      const averagePerDay7 = last7DaysCount / 7;
      const averagePerDay30 = last30DaysCount / 30;
      
      if (averagePerDay7 > averagePerDay30 * 1.2) {
        trend = 'up';
      } else if (averagePerDay7 < averagePerDay30 * 0.8) {
        trend = 'down';
      }

      return {
        data: {
          last_7_days: last7DaysCount,
          last_30_days: last30DaysCount,
          improvement: Math.round(improvement),
          trend,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleDatabaseError(error),
      };
    }
  }
}

// 导出单例实例
export const statsService = new StatsService();