import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { statsService } from '../services/statsService';
import { supabase } from '../services/supabase';

// Mock Supabase
vi.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            order: vi.fn(),
            count: 'exact',
          })),
          count: 'exact',
        })),
      })),
    })),
  },
}));

describe('StatsService', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful auth by default
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDailyStats', () => {
    it('should return daily statistics successfully', async () => {
      const mockStats = [
        {
          date: '2024-01-01',
          count: 2,
          average_quality: 4.5,
        },
        {
          date: '2024-01-02',
          count: 1,
          average_quality: 4.0,
        },
      ];

      (supabase.rpc as any).mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const result = await statsService.getDailyStats(30);

      expect(result.data).toEqual(mockStats);
      expect(result.error).toBeNull();
      expect(supabase.rpc).toHaveBeenCalledWith(
        'get_daily_bowel_movement_stats',
        {
          p_user_id: mockUser.id,
          p_start_date: expect.any(String),
        }
      );
    });

    it('should handle authentication error', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await statsService.getDailyStats(30);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('AUTH_ERROR');
      expect(result.error?.message).toBe('用户未登录');
    });

    it('should handle database errors', async () => {
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: { code: '42501', message: 'Permission denied' },
      });

      const result = await statsService.getDailyStats(30);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('PERMISSION_DENIED');
    });
  });

  describe('getWeeklyStats', () => {
    it('should return weekly statistics successfully', async () => {
      const mockStats = [
        {
          week_start: '2024-01-01',
          total_count: 10,
          daily_average: 1.43,
          quality_average: 4.2,
        },
      ];

      (supabase.rpc as any).mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const result = await statsService.getWeeklyStats(4);

      expect(result.data).toEqual(mockStats);
      expect(result.error).toBeNull();
      expect(supabase.rpc).toHaveBeenCalledWith(
        'get_weekly_bowel_movement_stats',
        {
          p_user_id: mockUser.id,
          p_start_date: expect.any(String),
        }
      );
    });
  });

  describe('getMonthlyStats', () => {
    it('should return monthly statistics successfully', async () => {
      const mockStats = [
        {
          month: '2024-01',
          total_count: 45,
          daily_average: 1.45,
          quality_average: 4.1,
          days_with_records: 20,
        },
      ];

      (supabase.rpc as any).mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const result = await statsService.getMonthlyStats(6);

      expect(result.data).toEqual(mockStats);
      expect(result.error).toBeNull();
      expect(supabase.rpc).toHaveBeenCalledWith(
        'get_monthly_bowel_movement_stats',
        {
          p_user_id: mockUser.id,
          p_start_date: expect.any(String),
        }
      );
    });
  });

  describe('getOverallStats', () => {
    it('should return overall statistics successfully', async () => {
      const mockStats = [
        {
          total_records: 150,
          daily_average: 1.5,
          most_common_quality: 4,
          streak_days: 7,
          first_record_date: '2023-06-01T00:00:00Z',
          last_record_date: '2024-01-01T00:00:00Z',
        },
      ];

      (supabase.rpc as any).mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const result = await statsService.getOverallStats();

      expect(result.data).toEqual({
        total_records: 150,
        daily_average: 1.5,
        most_common_quality: 4,
        streak_days: 7,
        first_record_date: '2023-06-01T00:00:00Z',
        last_record_date: '2024-01-01T00:00:00Z',
      });
      expect(result.error).toBeNull();
    });

    it('should return default values when no data exists', async () => {
      (supabase.rpc as any).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await statsService.getOverallStats();

      expect(result.data).toEqual({
        total_records: 0,
        daily_average: 0,
        most_common_quality: 0,
        streak_days: 0,
        first_record_date: null,
        last_record_date: null,
      });
      expect(result.error).toBeNull();
    });
  });

  describe('getFrequencyTrend', () => {
    it('should return frequency trend for daily type', async () => {
      const mockData = [
        { date: '2024-01-01', count: 2 },
        { date: '2024-01-02', count: 1 },
      ];

      (supabase.rpc as any).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await statsService.getFrequencyTrend('daily', 30);

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(supabase.rpc).toHaveBeenCalledWith(
        'get_daily_bowel_movement_stats',
        {
          p_user_id: mockUser.id,
          p_start_date: expect.any(String),
        }
      );
    });

    it('should return frequency trend for weekly type', async () => {
      const mockData = [
        { week_start: '2024-01-01', total_count: 8 },
      ];

      (supabase.rpc as any).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await statsService.getFrequencyTrend('weekly', 4);

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(supabase.rpc).toHaveBeenCalledWith(
        'get_weekly_bowel_movement_stats',
        {
          p_user_id: mockUser.id,
          p_start_date: expect.any(String),
        }
      );
    });
  });

  describe('getQualityDistribution', () => {
    it('should return quality distribution successfully', async () => {
      const mockRecords = [
        { quality_rating: 3 },
        { quality_rating: 4 },
        { quality_rating: 4 },
        { quality_rating: 5 },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await statsService.getComparisonStats();

      expect(result.data).toEqual({
        last_7_days: 0,
        last_30_days: 0,
        improvement: 0,
        trend: 'stable',
      });
      expect(result.error).toBeNull();
    });
  });

  describe('getStreakDays', () => {
    it('should calculate streak days successfully', async () => {
      const mockRecords = [
        { occurred_at: '2024-01-10T10:00:00Z' }, // Today
        { occurred_at: '2024-01-09T10:00:00Z' }, // Yesterday
        { occurred_at: '2024-01-08T10:00:00Z' }, // 2 days ago
        { occurred_at: '2024-01-07T10:00:00Z' }, // 3 days ago
        { occurred_at: '2024-01-05T10:00:00Z' }, // Gap (5 days ago)
      ];

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockRecords,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await statsService.getStreakDays();

      expect(result).toBe(4); // 4 consecutive days
    });

    it('should return 0 for no records', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await statsService.getStreakDays();

      expect(result).toBe(0);
    });

    it('should handle authentication error', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await statsService.getStreakDays();

      expect(result).toBe(0);
    });
  });
});