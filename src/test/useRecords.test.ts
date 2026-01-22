import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useRecords,
  useCreateRecord,
  useUpdateRecord,
  useDeleteRecord,
  useRecord,
  useTodayRecords,
  useRecordsByDateRange,
} from '../hooks/useRecords';
import { recordService } from '../services/recordService';
import { BowelMovementRecord, CreateRecordRequest, UpdateRecordRequest } from '../types/database';

// Mock the record service
vi.mock('../services/recordService', () => ({
  recordService: {
    getRecords: vi.fn(),
    createRecord: vi.fn(),
    updateRecord: vi.fn(),
    deleteRecord: vi.fn(),
    deleteRecords: vi.fn(),
    getRecord: vi.fn(),
    getTodayRecords: vi.fn(),
    getRecordsByDateRange: vi.fn(),
  },
}));

describe('useRecords hooks', () => {
  const mockRecord: BowelMovementRecord = {
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useRecords', () => {
    it('should load records on mount', async () => {
      const mockPaginatedResponse = {
        data: [mockRecord],
        count: 1,
        hasMore: false,
      };

      (recordService.getRecords as any).mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useRecords());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.records).toEqual([mockRecord]);
      expect(result.current.count).toBe(1);
      expect(result.current.hasMore).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle loading errors', async () => {
      const errorMessage = 'Failed to load records';
      (recordService.getRecords as any).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.records).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should refresh records when refresh is called', async () => {
      const mockPaginatedResponse = {
        data: [mockRecord],
        count: 1,
        hasMore: false,
      };

      (recordService.getRecords as any).mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear the mock to verify refresh calls the service again
      vi.clearAllMocks();
      (recordService.getRecords as any).mockResolvedValue(mockPaginatedResponse);

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(recordService.getRecords).toHaveBeenCalled();
      });
    });

    it('should load more records when loadMore is called', async () => {
      const initialResponse = {
        data: [mockRecord],
        count: 2,
        hasMore: true,
      };

      const moreResponse = {
        data: [{ ...mockRecord, id: 'second-record' }],
        count: 2,
        hasMore: false,
      };

      (recordService.getRecords as any)
        .mockResolvedValueOnce(initialResponse)
        .mockResolvedValueOnce(moreResponse);

      const { result } = renderHook(() => useRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.records).toHaveLength(1);
      expect(result.current.hasMore).toBe(true);

      act(() => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.records).toHaveLength(2);
      });

      expect(result.current.hasMore).toBe(false);
    });
  });

  describe('useCreateRecord', () => {
    it('should create a record successfully', async () => {
      const createData: CreateRecordRequest = {
        occurred_at: '2024-01-01T09:30:00Z',
        quality_rating: 4,
        notes: 'Test note',
      };

      (recordService.createRecord as any).mockResolvedValue({
        data: mockRecord,
        error: null,
      });

      const { result } = renderHook(() => useCreateRecord());

      let createdRecord: BowelMovementRecord | null = null;

      await act(async () => {
        createdRecord = await result.current.createRecord(createData);
      });

      expect(createdRecord).toEqual(mockRecord);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle creation errors', async () => {
      const createData: CreateRecordRequest = {
        occurred_at: '2024-01-01T09:30:00Z',
        quality_rating: 4,
      };

      const errorMessage = 'Validation failed';
      (recordService.createRecord as any).mockResolvedValue({
        data: null,
        error: { code: 'VALIDATION_ERROR', message: errorMessage },
      });

      const { result } = renderHook(() => useCreateRecord());

      let createdRecord: BowelMovementRecord | null = null;

      await act(async () => {
        createdRecord = await result.current.createRecord(createData);
      });

      expect(createdRecord).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('useUpdateRecord', () => {
    it('should update a record successfully', async () => {
      const updateData: UpdateRecordRequest = {
        quality_rating: 5,
        notes: 'Updated note',
      };

      const updatedRecord = { ...mockRecord, ...updateData };

      (recordService.updateRecord as any).mockResolvedValue({
        data: updatedRecord,
        error: null,
      });

      const { result } = renderHook(() => useUpdateRecord());

      let resultRecord: BowelMovementRecord | null = null;

      await act(async () => {
        resultRecord = await result.current.updateRecord('test-id', updateData);
      });

      expect(resultRecord).toEqual(updatedRecord);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle update errors', async () => {
      const updateData: UpdateRecordRequest = {
        quality_rating: 8, // Invalid
      };

      const errorMessage = 'Invalid quality rating';
      (recordService.updateRecord as any).mockResolvedValue({
        data: null,
        error: { code: 'VALIDATION_ERROR', message: errorMessage },
      });

      const { result } = renderHook(() => useUpdateRecord());

      let resultRecord: BowelMovementRecord | null = null;

      await act(async () => {
        resultRecord = await result.current.updateRecord('test-id', updateData);
      });

      expect(resultRecord).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('useDeleteRecord', () => {
    it('should delete a record successfully', async () => {
      (recordService.deleteRecord as any).mockResolvedValue({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => useDeleteRecord());

      let success = false;

      await act(async () => {
        success = await result.current.deleteRecord('test-id');
      });

      expect(success).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle delete errors', async () => {
      const errorMessage = 'Permission denied';
      (recordService.deleteRecord as any).mockResolvedValue({
        data: null,
        error: { code: 'PERMISSION_DENIED', message: errorMessage },
      });

      const { result } = renderHook(() => useDeleteRecord());

      let success = false;

      await act(async () => {
        success = await result.current.deleteRecord('test-id');
      });

      expect(success).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should delete multiple records successfully', async () => {
      (recordService.deleteRecords as any).mockResolvedValue({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => useDeleteRecord());

      let success = false;

      await act(async () => {
        success = await result.current.deleteRecords(['id1', 'id2']);
      });

      expect(success).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('useRecord', () => {
    it('should load a single record', async () => {
      (recordService.getRecord as any).mockResolvedValue({
        data: mockRecord,
        error: null,
      });

      const { result } = renderHook(() => useRecord('test-id'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.record).toEqual(mockRecord);
      expect(result.current.error).toBeNull();
    });

    it('should handle null id', () => {
      const { result } = renderHook(() => useRecord(null));

      expect(result.current.record).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle record not found', async () => {
      const errorMessage = 'Record not found';
      (recordService.getRecord as any).mockResolvedValue({
        data: null,
        error: { code: 'NOT_FOUND', message: errorMessage },
      });

      const { result } = renderHook(() => useRecord('non-existent-id'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.record).toBeNull();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('useTodayRecords', () => {
    it('should load today\'s records', async () => {
      (recordService.getTodayRecords as any).mockResolvedValue({
        data: [mockRecord],
        error: null,
      });

      const { result } = renderHook(() => useTodayRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.records).toEqual([mockRecord]);
      expect(result.current.count).toBe(1);
      expect(result.current.error).toBeNull();
    });

    it('should refresh today\'s records', async () => {
      (recordService.getTodayRecords as any).mockResolvedValue({
        data: [mockRecord],
        error: null,
      });

      const { result } = renderHook(() => useTodayRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear mock and setup for refresh
      vi.clearAllMocks();
      (recordService.getTodayRecords as any).mockResolvedValue({
        data: [mockRecord, { ...mockRecord, id: 'second-record' }],
        error: null,
      });

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.records).toHaveLength(2);
      });
    });
  });

  describe('useRecordsByDateRange', () => {
    it('should load records by date range', async () => {
      (recordService.getRecordsByDateRange as any).mockResolvedValue({
        data: [mockRecord],
        error: null,
      });

      const { result } = renderHook(() =>
        useRecordsByDateRange('2024-01-01T00:00:00Z', '2024-01-01T23:59:59Z')
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.records).toEqual([mockRecord]);
      expect(result.current.count).toBe(1);
      expect(result.current.error).toBeNull();
    });

    it('should handle empty date range', () => {
      const { result } = renderHook(() => useRecordsByDateRange('', ''));

      expect(result.current.records).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    it('should handle date range errors', async () => {
      const errorMessage = 'Invalid date range';
      (recordService.getRecordsByDateRange as any).mockResolvedValue({
        data: null,
        error: { code: 'VALIDATION_ERROR', message: errorMessage },
      });

      const { result } = renderHook(() =>
        useRecordsByDateRange('2024-01-01T00:00:00Z', '2024-01-01T23:59:59Z')
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.records).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
    });
  });
});