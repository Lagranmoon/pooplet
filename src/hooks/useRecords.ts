import { useState, useEffect, useCallback, useMemo } from 'react';
import { recordService } from '../services/recordService';
import type {
  BowelMovementRecord,
  CreateRecordRequest,
  UpdateRecordRequest,
  RecordQueryParams,
  ApiResponse,
  PaginatedResponse,
} from '../types/database';

/**
 * 记录状态类型
 */
interface RecordState {
  records: BowelMovementRecord[];
  loading: boolean;
  error: string | null;
  count: number;
  hasMore: boolean;
}

/**
 * 单个记录操作状态
 */
interface RecordOperationState {
  loading: boolean;
  error: string | null;
}

/**
 * useRecords Hook - 管理记录列表状态
 * 需求: 1.6, 2.2
 */
export function useRecords(params: RecordQueryParams = {}) {
  const [state, setState] = useState<RecordState>({
    records: [],
    loading: true,
    error: null,
    count: 0,
    hasMore: false,
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 加载记录
  const loadRecords = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result: PaginatedResponse<BowelMovementRecord> = await recordService.getRecords(params);
      setState({
        records: result.data || [],
        loading: false,
        error: null,
        count: result.count || 0,
        hasMore: result.hasMore || false,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: String(error?.message || error || '加载记录失败'),
      }));
    }
  }, [params, refreshTrigger]);

  // 刷新记录
  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // 加载更多记录
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.loading) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const newParams = {
        ...params,
        offset: state.records.length,
      };
      const result: PaginatedResponse<BowelMovementRecord> = await recordService.getRecords(newParams);
      
      setState(prev => ({
        ...prev,
        records: [...prev.records, ...(result.data || [])],
        loading: false,
        hasMore: result.hasMore || false,
        count: result.count || 0,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: String(error?.message || error || '加载更多记录失败'),
      }));
    }
  }, [params, state.records.length, state.hasMore, state.loading]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  return useMemo(() => ({
    ...state,
    refresh,
    loadMore,
  }), [state, refresh, loadMore]);
}

/**
 * useCreateRecord Hook - 创建记录
 * 需求: 1.2, 1.3, 1.4, 1.5, 2.1
 */
export function useCreateRecord() {
  const [state, setState] = useState<RecordOperationState>({
    loading: false,
    error: null,
  });

  const createRecord = useCallback(async (data: CreateRecordRequest): Promise<BowelMovementRecord | null> => {
    setState({ loading: true, error: null });

    try {
      const result: ApiResponse<BowelMovementRecord> = await recordService.createRecord(data);
      
      if (result.error) {
        setState({ loading: false, error: String(result.error) });
        return null;
      }

      setState({ loading: false, error: null });
      return result.data;
    } catch (error: any) {
      setState({ loading: false, error: String(error?.message || error || '创建记录失败') });
      return null;
    }
  }, []);

  return useMemo(() => ({
    ...state,
    createRecord,
  }), [state, createRecord]);
}

/**
 * useUpdateRecord Hook - 更新记录
 * 需求: 1.4, 2.1
 */
export function useUpdateRecord() {
  const [state, setState] = useState<RecordOperationState>({
    loading: false,
    error: null,
  });

  const updateRecord = useCallback(async (
    id: string, 
    data: UpdateRecordRequest
  ): Promise<BowelMovementRecord | null> => {
    setState({ loading: true, error: null });

    try {
      const result: ApiResponse<BowelMovementRecord> = await recordService.updateRecord(id, data);
      
      if (result.error) {
        setState({ loading: false, error: String(result.error) });
        return null;
      }

      setState({ loading: false, error: null });
      return result.data;
    } catch (error: any) {
      setState({ loading: false, error: String(error?.message || error || '更新记录失败') });
      return null;
    }
  }, []);

  return useMemo(() => ({
    ...state,
    updateRecord,
  }), [state, updateRecord]);
}

/**
 * useDeleteRecord Hook - 删除记录
 * 需求: 2.1
 */
export function useDeleteRecord() {
  const [state, setState] = useState<RecordOperationState>({
    loading: false,
    error: null,
  });

  const deleteRecord = useCallback(async (id: string): Promise<boolean> => {
    setState({ loading: true, error: null });

    try {
      const result: ApiResponse<void> = await recordService.deleteRecord(id);
      
      if (result.error) {
        setState({ loading: false, error: String(result.error) });
        return false;
      }

      setState({ loading: false, error: null });
      return true;
    } catch (error: any) {
      setState({ loading: false, error: String(error?.message || error || '删除记录失败') });
      return false;
    }
  }, []);

  const deleteRecords = useCallback(async (ids: string[]): Promise<boolean> => {
    setState({ loading: true, error: null });

    try {
      const result: ApiResponse<void> = await recordService.deleteRecords(ids);
      
      if (result.error) {
        setState({ loading: false, error: String(result.error) });
        return false;
      }

      setState({ loading: false, error: null });
      return true;
    } catch (error: any) {
      setState({ loading: false, error: String(error?.message || error || '删除记录失败') });
      return false;
    }
  }, []);

  return useMemo(() => ({
    ...state,
    deleteRecord,
    deleteRecords,
  }), [state, deleteRecord, deleteRecords]);
}

/**
 * useRecord Hook - 获取单个记录
 * 需求: 2.2
 */
export function useRecord(id: string | null) {
  const [record, setRecord] = useState<BowelMovementRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecord = useCallback(async () => {
    if (!id) {
      setRecord(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result: ApiResponse<BowelMovementRecord> = await recordService.getRecord(id);
      
      if (result.error) {
        setError(String(result.error));
        setRecord(null);
      } else {
        setRecord(result.data);
      }
    } catch (error: any) {
      setError(String(error?.message || error || '加载记录失败'));
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRecord();
  }, [loadRecord]);

  return useMemo(() => ({
    record,
    loading,
    error,
    refresh: loadRecord,
  }), [record, loading, error, loadRecord]);
}

/**
 * useTodayRecords Hook - 获取今天的记录
 * 需求: 1.1, 1.6
 */
export function useTodayRecords() {
  const [records, setRecords] = useState<BowelMovementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadTodayRecords = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result: ApiResponse<BowelMovementRecord[]> = await recordService.getTodayRecords();
      
      if (result.error) {
        setError(String(result.error));
        setRecords([]);
      } else {
        setRecords(result.data || []);
      }
    } catch (error: any) {
      setError(String(error?.message || error || '加载今日记录失败'));
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [refreshTrigger]);

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    loadTodayRecords();
  }, [loadTodayRecords]);

  return useMemo(() => ({
    records,
    loading,
    error,
    refresh,
    count: records.length,
  }), [records, loading, error, refresh]);
}

/**
 * useRecordsByDateRange Hook - 获取日期范围内的记录
 * 需求: 2.2, 3.2, 3.3, 3.4
 */
export function useRecordsByDateRange(startDate: string, endDate: string, limit?: number) {
  const [records, setRecords] = useState<BowelMovementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    if (!startDate || !endDate) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result: ApiResponse<BowelMovementRecord[]> = await recordService.getRecordsByDateRange(
        startDate,
        endDate,
        limit
      );
      
      if (result.error) {
        setError(String(result.error));
        setRecords([]);
      } else {
        setRecords(result.data || []);
      }
    } catch (error: any) {
      setError(String(error?.message || error || '加载记录失败'));
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, limit]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  return useMemo(() => ({
    records,
    loading,
    error,
    refresh: loadRecords,
    count: records.length,
  }), [records, loading, error, loadRecords]);
}