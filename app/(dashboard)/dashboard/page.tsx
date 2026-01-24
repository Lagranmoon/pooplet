/**
 * 仪表板首页
 *
 * 显示今日记录、最近记录和快速添加记录功能
 * 包含状态管理、性能优化和错误处理
 * 
 * @path /app/(dashboard)/dashboard/page.tsx
 * @author Auto-generated
 */

"use client";

import React, { Suspense, useCallback, useMemo, useReducer, useEffect, memo } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Button } from "../../../components/ui/button";
import { ErrorBoundary } from "../../../src/components/ui/error-boundary";
import { 
  useRecords, 
  useFormData, 
  useAuth,
  qualityOptionsMap,
  utils,
  type BowelRecord,
  type FormData 
} from "../../../src/hooks/useDashboard";

// ===================================
// 1. 状态管理 - useReducer
// ===================================

interface DashboardState {
  records: BowelRecord[];
  loading: boolean;
  submitting: boolean;
  showForm: boolean;
  error: string | null;
  initialized: boolean;
}

type DashboardAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RECORDS'; payload: BowelRecord[] }
  | { type: 'ADD_RECORD'; payload: BowelRecord }
  | { type: 'REMOVE_RECORD'; payload: string }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'TOGGLE_FORM' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_INITIALIZED'; payload: boolean };

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_RECORDS':
      return { ...state, records: action.payload, loading: false, initialized: true };
    case 'ADD_RECORD':
      return { ...state, records: [action.payload, ...state.records] };
    case 'REMOVE_RECORD':
      return { ...state, records: state.records.filter(r => r.id !== action.payload) };
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
    case 'TOGGLE_FORM':
      return { ...state, showForm: !state.showForm, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, submitting: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    default:
      return state;
  }
}

const initialState: DashboardState = {
  records: [],
  loading: true,
  submitting: false,
  showForm: false,
  error: null,
  initialized: false,
};

// ===================================
// 2. 优化的子组件
// ===================================

// 记录项组件 - 使用 memo 防止不必要重新渲染
interface RecordItemProps {
  record: BowelRecord;
}

const RecordItem = memo(function RecordItem({ record }: RecordItemProps) {
  const quality = qualityOptionsMap[record.qualityRating];
  
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${quality.bg}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${quality.color} flex items-center justify-center text-white font-bold shadow-sm`}>
          {quality.value}
        </div>
        <div>
          <p className="font-semibold text-slate-900">
            {utils.formatTime(record.occurredAt)}
          </p>
          {record.notes && (
            <p className="text-sm text-slate-600 line-clamp-1 max-w-[200px]">
              {record.notes}
            </p>
          )}
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${quality.text}`}>
        {quality.label}
      </span>
    </div>
  );
});

// 记录列表组件
interface RecordsListProps {
  title: string;
  records: BowelRecord[];
  loading: boolean;
  emptyMessage: string;
  showCount?: boolean;
  onAddRecord?: () => void;
}

const RecordsList = memo(function RecordsList({ 
  title, 
  records, 
  loading, 
  emptyMessage,
  showCount = false,
  onAddRecord 
}: RecordsListProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {showCount && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
            {records.length} 次
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-600">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-slate-600 mb-4">{emptyMessage}</p>
          {onAddRecord && (
            <Button onClick={onAddRecord} variant="outline">
              添加第一条记录
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <RecordItem key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
});

// 表单组件
interface RecordFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => Promise<{ success: boolean; error?: string }>;
  submitting: boolean;
  onCancel: () => void;
}

const RecordForm = memo(function RecordForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  submitting, 
  onCancel 
}: RecordFormProps) {
  const handleQualitySelect = useCallback((rating: number) => {
    setFormData(prev => ({ ...prev, qualityRating: rating }));
  }, [setFormData]);

  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, occurredAt: e.target.value }));
  }, [setFormData]);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, notes: e.target.value }));
  }, [setFormData]);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-6 mb-6">
      <h2 className="text-xl font-bold mb-6 text-slate-900">添加新记录</h2>
      
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">发生时间</label>
          <input
            type="datetime-local"
            value={formData.occurredAt}
            onChange={handleTimeChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-900"
            required
            disabled={submitting}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">排便质量</label>
          <div className="grid grid-cols-7 gap-2">
            {Object.values(qualityOptionsMap).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleQualitySelect(option.value)}
                disabled={submitting}
                className={`flex flex-col items-center py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  formData.qualityRating === option.value
                    ? option.color + " text-white shadow-md"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <span className="text-lg mb-1">{option.value}</span>
                <span className="text-xs">{option.label}</span>
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-slate-600 mt-3">
            当前选择: {qualityOptionsMap[formData.qualityRating]?.label}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">备注</label>
          <textarea
            value={formData.notes}
            onChange={handleNotesChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none text-slate-900 placeholder-slate-400"
            rows={3}
            placeholder="可选..."
            disabled={submitting}
          />
        </div>

        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={submitting}
            className="flex-1"
          >
            取消
          </Button>
          <Button 
            type="submit" 
            disabled={submitting}
            className="flex-1"
          >
            {submitting ? "保存中..." : "保存记录"}
          </Button>
        </div>
      </form>
    </div>
  );
});

// 错误组件
const ErrorMessage = memo(function ErrorMessage({ error, onDismiss }: { error: string; onDismiss: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
        <button 
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
});

// ===================================
// 3. 主组件
// ===================================

function DashboardContent() {
  const { data, isPending } = useAuth();
  const session = data?.session;
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { formData, setFormData, isSubmitting, showForm, toggleForm, handleSubmit } = useFormData();

  // 使用优化的记录管理
  const { 
    records, 
    loading, 
    error, 
    fetchRecords, 
    addRecord, 
    todayRecords, 
    sortedRecords 
  } = useRecords();

  // 缓存计算
  const recentRecords = useMemo(() => sortedRecords.slice(0, 5), [sortedRecords]);

  // 事件处理器
  const handleFormSubmit = useCallback(async (e: React.FormEvent): Promise<{ success: boolean; error?: string }> => {
    e.preventDefault();
    
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_SUBMITTING', payload: true });

    try {
      const result = await addRecord(formData);
      if (result.success) {
        dispatch({ type: 'TOGGLE_FORM' });
        // 清空表单
        setFormData({
          occurredAt: new Date().toISOString().slice(0, 16),
          qualityRating: 4,
          notes: "",
        });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || '保存失败' });
        return { success: false, error: result.error || '保存失败' };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '网络连接失败' });
      return { success: false, error: '网络连接失败' };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [formData, addRecord, setFormData]);

  const handleCancel = useCallback(() => {
    dispatch({ type: 'TOGGLE_FORM' });
    setFormData({
      occurredAt: new Date().toISOString().slice(0, 16),
      qualityRating: 4,
      notes: "",
    });
  }, [setFormData]);

  // 初始化
  useEffect(() => {
    if (!isPending && session) {
      fetchRecords();
    } else if (!isPending && !session) {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    }
  }, [session, isPending, fetchRecords]);

  // 同步外部状态
  useEffect(() => {
    if (records.length > 0 || !loading) {
      dispatch({ type: 'SET_RECORDS', payload: records });
    }
  }, [records, loading]);

  // 加载状态
  if (!session && !isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">健康记录</h1>
            <p className="text-slate-600">
              {format(new Date(), "yyyy年M月d日 EEEE", { locale: zhCN })}
            </p>
          </div>
          <Button onClick={toggleForm} disabled={state.submitting}>
            {state.showForm ? "取消" : "添加记录"}
          </Button>
        </div>

        {state.error && (
          <ErrorMessage 
            error={state.error} 
            onDismiss={() => dispatch({ type: 'CLEAR_ERROR' })} 
          />
        )}

        {state.showForm && (
          <RecordForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleFormSubmit}
            submitting={isSubmitting}
            onCancel={handleCancel}
          />
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <ErrorBoundary level="section">
            <Suspense fallback={<RecordsList title="今日记录" records={[]} loading emptyMessage="加载中..." />}>
              <RecordsList
                title="今日记录"
                records={todayRecords}
                loading={loading}
                emptyMessage="今日还没有记录"
                showCount
                onAddRecord={toggleForm}
              />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary level="section">
            <Suspense fallback={<RecordsList title="最近记录" records={[]} loading emptyMessage="加载中..." />}>
              <RecordsList
                title="最近记录"
                records={recentRecords}
                loading={loading}
                emptyMessage="还没有任何记录"
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

// ===================================
// 4. 包装组件
// ===================================

export default function OptimizedDashboardPage() {
  return (
    <ErrorBoundary level="page">
      <DashboardContent />
    </ErrorBoundary>
  );
}