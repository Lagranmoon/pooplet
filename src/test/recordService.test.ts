import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { recordService } from '../services/recordService';
import { supabase } from '../services/supabase';
import { CreateRecordRequest, UpdateRecordRequest } from '../types/database';

// Mock Supabase
vi.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(),
            })),
          })),
        })),
        order: vi.fn(() => ({
          range: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
        in: vi.fn(),
      })),
    })),
  },
}));

describe('RecordService', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockRecord = {
    id: 'test-record-id',
    user_id: 'test-user-id',
    recorded_at: '2024-01-01T10:00:00Z',
    occurred_at: '2024-01-01T09:30:00Z',
    quality_rating: 4,
    notes: 'Test note',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
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

  describe('createRecord', () => {
    it('should create a record successfully with valid data', async () => {
      const createData: CreateRecordRequest = {
        occurred_at: '2024-01-01T09:30:00Z',
        quality_rating: 4,
        notes: 'Test note',
      };

      // Mock successful database insert
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockRecord,
            error: null,
          }),
        }),
      });
      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      const result = await recordService.createRecord(createData);

      expect(result.data).toEqual(mockRecord);
      expect(result.error).toBeNull();
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        occurred_at: createData.occurred_at,
        quality_rating: createData.quality_rating,
        notes: createData.notes,
        recorded_at: expect.any(String),
      });
    });

    it('should reject invalid quality rating', async () => {
      const createData: CreateRecordRequest = {
        occurred_at: '2024-01-01T09:30:00Z',
        quality_rating: 8, // Invalid: should be 1-7
        notes: 'Test note',
      };

      const result = await recordService.createRecord(createData);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('质量评级必须是 1-7 之间的整数');
    });

    it('should reject future dates', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const createData: CreateRecordRequest = {
        occurred_at: futureDate.toISOString(),
        quality_rating: 4,
      };

      const result = await recordService.createRecord(createData);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('发生时间不能是未来时间');
    });

    it('should reject notes that are too long', async () => {
      const longNotes = 'a'.repeat(501); // Exceeds 500 character limit

      const createData: CreateRecordRequest = {
        occurred_at: '2024-01-01T09:30:00Z',
        quality_rating: 4,
        notes: longNotes,
      };

      const result = await recordService.createRecord(createData);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('备注不能超过 500 个字符');
    });

    it('should handle authentication error', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const createData: CreateRecordRequest = {
        occurred_at: '2024-01-01T09:30:00Z',
        quality_rating: 4,
      };

      const result = await recordService.createRecord(createData);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('AUTH_ERROR');
      expect(result.error?.message).toBe('用户未登录');
    });

    it('should handle database errors', async () => {
      const createData: CreateRecordRequest = {
        occurred_at: '2024-01-01T09:30:00Z',
        quality_rating: 4,
      };

      // Mock database error
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: '23505', message: 'Duplicate entry' },
          }),
        }),
      });
      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      const result = await recordService.createRecord(createData);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('DUPLICATE_ENTRY');
    });
  });

  describe('getRecord', () => {
    it('should retrieve a record successfully', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockRecord,
            error: null,
          }),
        }),
      });
      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await recordService.getRecord('test-record-id');

      expect(result.data).toEqual(mockRecord);
      expect(result.error).toBeNull();
    });

    it('should handle record not found', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116', message: 'No rows found' },
          }),
        }),
      });
      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await recordService.getRecord('non-existent-id');

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
    });
  });

  describe('updateRecord', () => {
    it('should update a record successfully', async () => {
      const updateData: UpdateRecordRequest = {
        quality_rating: 5,
        notes: 'Updated note',
      };

      const updatedRecord = { ...mockRecord, ...updateData };

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: updatedRecord,
              error: null,
            }),
          }),
        }),
      });
      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
      });

      const result = await recordService.updateRecord('test-record-id', updateData);

      expect(result.data).toEqual(updatedRecord);
      expect(result.error).toBeNull();
      expect(mockUpdate).toHaveBeenCalledWith({
        ...updateData,
        updated_at: expect.any(String),
      });
    });

    it('should validate update data', async () => {
      const updateData: UpdateRecordRequest = {
        quality_rating: 0, // Invalid
      };

      const result = await recordService.updateRecord('test-record-id', updateData);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('deleteRecord', () => {
    it('should delete a record successfully', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });
      (supabase.from as any).mockReturnValue({
        delete: mockDelete,
      });

      const result = await recordService.deleteRecord('test-record-id');

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should handle delete errors', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { code: '42501', message: 'Permission denied' },
        }),
      });
      (supabase.from as any).mockReturnValue({
        delete: mockDelete,
      });

      const result = await recordService.deleteRecord('test-record-id');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('PERMISSION_DENIED');
    });
  });

  describe('getRecords', () => {
    it('should retrieve records with pagination', async () => {
      const mockRecords = [mockRecord];
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue({
            data: mockRecords,
            error: null,
            count: 1,
          }),
        }),
      });
      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await recordService.getRecords({ limit: 10, offset: 0 });

      expect(result.data).toEqual(mockRecords);
      expect(result.count).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it('should handle date range filtering', async () => {
      const mockRecords = [mockRecord];
      const mockSelect = vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          lte: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({
                data: mockRecords,
                error: null,
                count: 1,
              }),
            }),
          }),
        }),
      });
      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await recordService.getRecords({
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-01T23:59:59Z',
      });

      expect(result.data).toEqual(mockRecords);
    });
  });

  describe('getTodayRecords', () => {
    it('should retrieve today\'s records', async () => {
      const mockRecords = [mockRecord];
      const mockSelect = vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          lte: vi.fn().mockReturnValue({
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

      const result = await recordService.getTodayRecords();

      expect(result.data).toEqual(mockRecords);
      expect(result.error).toBeNull();
    });
  });

  describe('deleteRecords', () => {
    it('should delete multiple records', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });
      (supabase.from as any).mockReturnValue({
        delete: mockDelete,
      });

      const result = await recordService.deleteRecords(['id1', 'id2']);

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should validate empty array', async () => {
      const result = await recordService.deleteRecords([]);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toBe('没有指定要删除的记录');
    });
  });
});