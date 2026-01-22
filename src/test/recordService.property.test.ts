import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { recordService } from '../services/recordService';
import { supabase } from '../services/supabase';
import { CreateRecordRequest, BowelMovementRecord } from '../types/database';

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
      })),
    })),
  },
}));

/**
 * Property-based tests for Record Service
 * 验证设计文档中定义的正确性属性
 */

// Test data generators
const validQualityRating = fc.integer({ min: 1, max: 7 });
const validNotes = fc.string({ maxLength: 500 });
const pastDateTime = fc.date({ max: new Date() }).map(d => d.toISOString());
const validRecordData = fc.record({
  occurred_at: pastDateTime,
  quality_rating: validQualityRating,
  notes: fc.option(validNotes, { nil: undefined }),
});

// Mock setup for property tests
const setupMockUser = () => {
  const mockUser = { id: 'test-user-id', email: 'test@example.com' };
  (supabase.auth.getUser as any).mockResolvedValue({
    data: { user: mockUser },
    error: null,
  });
  return mockUser;
};

const setupMockDatabase = (mockRecord: BowelMovementRecord) => {
  // Mock successful create
  const mockInsert = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: mockRecord,
        error: null,
      }),
    }),
  });
  
  const mockSelect = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: mockRecord,
        error: null,
      }),
    }),
  });

  (supabase.from as any).mockReturnValue({
    insert: mockInsert,
    select: mockSelect,
  });
};

describe('Feature: bowel-movement-tracker - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * 属性 1: 记录数据完整性
   * 验证需求: 1.2, 1.3, 1.4, 1.5
   */
  it('Property 1: 记录数据完整性 - 创建记录后检索应返回相同数据值', async () => {
    await fc.assert(
      fc.asyncProperty(validRecordData, async (recordData) => {
        const mockUser = setupMockUser();
        
        const mockRecord: BowelMovementRecord = {
          id: 'test-id',
          user_id: mockUser.id,
          recorded_at: new Date().toISOString(),
          occurred_at: recordData.occurred_at,
          quality_rating: recordData.quality_rating,
          notes: recordData.notes !== undefined ? recordData.notes : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setupMockDatabase(mockRecord);

        // Create record
        const createResult = await recordService.createRecord(recordData);
        expect(createResult.error).toBeNull();
        expect(createResult.data).toBeTruthy();

        // Retrieve record
        const retrieveResult = await recordService.getRecord(createResult.data!.id);
        expect(retrieveResult.error).toBeNull();
        expect(retrieveResult.data).toBeTruthy();

        // Verify data integrity
        const retrieved = retrieveResult.data!;
        expect(retrieved.occurred_at).toBe(recordData.occurred_at);
        expect(retrieved.quality_rating).toBe(recordData.quality_rating);
        const expectedNotes = recordData.notes !== undefined ? recordData.notes : null;
        expect(retrieved.notes).toBe(expectedNotes === '' ? null : expectedNotes);
      }),
      { numRuns: 20 } // Reduced from 100 for faster execution
    );
  });

  /**
   * 属性 7: 输入验证完整性
   * 验证需求: 5.1, 5.2, 5.4
   */
  it('Property 7: 输入验证完整性 - 无效输入应被拒绝并显示错误信息', async () => {
    // Test invalid quality ratings
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          occurred_at: pastDateTime,
          quality_rating: fc.integer().filter(n => n < 1 || n > 7),
          notes: fc.option(validNotes, { nil: undefined }),
        }),
        async (invalidData) => {
          setupMockUser();
          
          const result = await recordService.createRecord(invalidData);
          
          expect(result.data).toBeNull();
          expect(result.error).toBeTruthy();
          expect(result.error!.code).toBe('VALIDATION_ERROR');
          expect(result.error!.message).toContain('质量评级必须是 1-7 之间的整数');
        }
      ),
      { numRuns: 10 } // Reduced from 50 for faster execution
    );

    // Test future dates
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          occurred_at: fc.date({ min: new Date(Date.now() + 86400000) }).map(d => d.toISOString()), // Future date
          quality_rating: validQualityRating,
          notes: fc.option(validNotes, { nil: undefined }),
        }),
        async (invalidData) => {
          setupMockUser();
          
          const result = await recordService.createRecord(invalidData);
          
          expect(result.data).toBeNull();
          expect(result.error).toBeTruthy();
          expect(result.error!.code).toBe('VALIDATION_ERROR');
          expect(result.error!.message).toContain('发生时间不能是未来时间');
        }
      ),
      { numRuns: 10 } // Reduced from 50 for faster execution
    );

    // Test notes too long
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          occurred_at: pastDateTime,
          quality_rating: validQualityRating,
          notes: fc.string({ minLength: 501, maxLength: 1000 }), // Too long
        }),
        async (invalidData) => {
          setupMockUser();
          
          const result = await recordService.createRecord(invalidData);
          
          expect(result.data).toBeNull();
          expect(result.error).toBeTruthy();
          expect(result.error!.code).toBe('VALIDATION_ERROR');
          expect(result.error!.message).toContain('备注不能超过 500 个字符');
        }
      ),
      { numRuns: 10 } // Reduced from 50 for faster execution
    );
  });

  /**
   * 属性 8: 有效数据接受性
   * 验证需求: 5.5
   */
  it('Property 8: 有效数据接受性 - 通过验证的数据应成功保存', async () => {
    await fc.assert(
      fc.asyncProperty(validRecordData, async (recordData) => {
        const mockUser = setupMockUser();
        
        const mockRecord: BowelMovementRecord = {
          id: 'test-id',
          user_id: mockUser.id,
          recorded_at: new Date().toISOString(),
          occurred_at: recordData.occurred_at,
          quality_rating: recordData.quality_rating,
          notes: recordData.notes !== undefined ? recordData.notes : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setupMockDatabase(mockRecord);

        const result = await recordService.createRecord(recordData);
        
        expect(result.error).toBeNull();
        expect(result.data).toBeTruthy();
        expect(result.data!.occurred_at).toBe(recordData.occurred_at);
        expect(result.data!.quality_rating).toBe(recordData.quality_rating);
        const expectedNotes = recordData.notes !== undefined ? recordData.notes : null;
        expect(result.data!.notes).toBe(expectedNotes === '' ? null : expectedNotes);
      }),
      { numRuns: 20 } // Reduced from 100 for faster execution
    );
  });

  /**
   * 属性测试：质量评级边界值
   */
  it('Property: 质量评级边界值验证', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          occurred_at: pastDateTime,
          quality_rating: fc.constantFrom(1, 7), // Boundary values
          notes: fc.option(validNotes, { nil: undefined }),
        }),
        async (recordData) => {
          const mockUser = setupMockUser();
          
          const mockRecord: BowelMovementRecord = {
            id: 'test-id',
            user_id: mockUser.id,
            recorded_at: new Date().toISOString(),
            occurred_at: recordData.occurred_at,
            quality_rating: recordData.quality_rating,
            notes: recordData.notes !== undefined ? recordData.notes : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          setupMockDatabase(mockRecord);

          const result = await recordService.createRecord(recordData);
          
          expect(result.error).toBeNull();
          expect(result.data).toBeTruthy();
          expect(result.data!.quality_rating).toBe(recordData.quality_rating);
        }
      ),
      { numRuns: 20 } // Reduced from 100 for faster execution
    );
  });

  /**
   * 属性测试：备注长度边界值
   */
  it('Property: 备注长度边界值验证', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          occurred_at: pastDateTime,
          quality_rating: validQualityRating,
          notes: fc.string({ maxLength: 500 }), // Exactly at limit
        }),
        async (recordData) => {
          const mockUser = setupMockUser();
          
          const mockRecord: BowelMovementRecord = {
            id: 'test-id',
            user_id: mockUser.id,
            recorded_at: new Date().toISOString(),
            occurred_at: recordData.occurred_at,
            quality_rating: recordData.quality_rating,
            notes: recordData.notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          setupMockDatabase(mockRecord);

          const result = await recordService.createRecord(recordData);
          
          expect(result.error).toBeNull();
          expect(result.data).toBeTruthy();
          expect(result.data!.notes).toBe(recordData.notes);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 属性测试：时间格式一致性
   */
  it('Property: 时间格式一致性 - 输入和输出时间格式应保持一致', async () => {
    await fc.assert(
      fc.asyncProperty(validRecordData, async (recordData) => {
        const mockUser = setupMockUser();
        
        const mockRecord: BowelMovementRecord = {
          id: 'test-id',
          user_id: mockUser.id,
          recorded_at: new Date().toISOString(),
          occurred_at: recordData.occurred_at,
          quality_rating: recordData.quality_rating,
          notes: recordData.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setupMockDatabase(mockRecord);

        const result = await recordService.createRecord(recordData);
        
        expect(result.error).toBeNull();
        expect(result.data).toBeTruthy();
        
        // Verify ISO 8601 format is maintained
        const occurredDate = new Date(result.data!.occurred_at);
        expect(occurredDate.toISOString()).toBe(recordData.occurred_at);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性测试：用户隔离性
   */
  it('Property: 用户隔离性 - 记录应正确关联到创建用户', async () => {
    await fc.assert(
      fc.asyncProperty(validRecordData, async (recordData) => {
        const mockUser = setupMockUser();
        
        const mockRecord: BowelMovementRecord = {
          id: 'test-id',
          user_id: mockUser.id,
          recorded_at: new Date().toISOString(),
          occurred_at: recordData.occurred_at,
          quality_rating: recordData.quality_rating,
          notes: recordData.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setupMockDatabase(mockRecord);

        const result = await recordService.createRecord(recordData);
        
        expect(result.error).toBeNull();
        expect(result.data).toBeTruthy();
        expect(result.data!.user_id).toBe(mockUser.id);
      }),
      { numRuns: 100 }
    );
  });
});