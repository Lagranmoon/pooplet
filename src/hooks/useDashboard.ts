import { useState, useCallback, useMemo, useEffect } from "react";

// 类型定义
export interface BowelRecord {
  id: string;
  userId: string;
  occurredAt: string;
  qualityRating: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QualityOption {
  value: number;
  label: string;
  color: string;
  bg: string;
  text: string;
}

export interface FormData {
  occurredAt: string;
  qualityRating: number;
  notes: string;
}

// 优化的质量选项
export const qualityOptions: QualityOption[] = [
  { value: 1, label: "很差", color: "bg-red-500", bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400" },
  { value: 2, label: "较差", color: "bg-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-700 dark:text-orange-400" },
  { value: 3, label: "一般", color: "bg-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-700 dark:text-yellow-400" },
  { value: 4, label: "还好", color: "bg-lime-500", bg: "bg-lime-50 dark:bg-lime-900/20", text: "text-lime-700 dark:text-lime-400" },
  { value: 5, label: "良好", color: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400" },
  { value: 6, label: "很好", color: "bg-teal-500", bg: "bg-teal-50 dark:bg-teal-900/20", text: "text-teal-700 dark:text-teal-400" },
  { value: 7, label: "完美", color: "bg-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-900/20", text: "text-cyan-700 dark:text-cyan-400" },
];

// 缓存质量选项映射
export const qualityOptionsMap = qualityOptions.reduce((acc, option) => {
  acc[option.value] = option;
  return acc;
}, {} as Record<number, QualityOption>);

// useRecords Hook - 优化的记录管理
export function useRecords() {
  const [records, setRecords] = useState<BowelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async (params?: { page?: number; limit?: number }) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      
      const res = await fetch(`/api/records?${searchParams.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setRecords(data.data.records);
      } else {
        setError(data.error || '获取记录失败');
      }
    } catch (err) {
      setError('网络连接失败');
      console.error('获取记录失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addRecord = useCallback(async (formData: FormData) => {
    try {
      const isoDateTime = new Date(formData.occurredAt).toISOString();
      
      const res = await fetch("/api/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          occurredAt: isoDateTime,
        }),
      });
      const result = await res.json();

      if (result.success) {
        // 添加新记录到列表
        setRecords(prev => [result.data, ...prev]);
        return { success: true };
      } else {
        return { success: false, error: result.error || '保存失败' };
      }
    } catch (err) {
      return { success: false, error: '网络连接失败' };
    }
  }, []);

  const deleteRecord = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (result.success) {
        setRecords(prev => prev.filter(record => record.id !== id));
        return { success: true };
      } else {
        return { success: false, error: result.error || '删除失败' };
      }
    } catch (err) {
      return { success: false, error: '网络连接失败' };
    }
  }, []);

  // 缓存计算
  const todayRecords = useMemo(() => {
    const today = new Date().toDateString();
    return records.filter(record => {
      const recordDate = new Date(record.occurredAt).toDateString();
      return recordDate === today;
    });
  }, [records]);

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => 
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }, [records]);

  return {
    records,
    loading,
    error,
    fetchRecords,
    addRecord,
    deleteRecord,
    todayRecords,
    sortedRecords,
    setError,
  };
}

// useFormData Hook - 优化的表单管理
export function useFormData() {
  const [formData, setFormData] = useState<FormData>(() => ({
    occurredAt: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm 格式
    qualityRating: 4,
    notes: "",
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const resetForm = useCallback(() => {
    setFormData({
      occurredAt: new Date().toISOString().slice(0, 16),
      qualityRating: 4,
      notes: "",
    });
  }, []);

  const toggleForm = useCallback(() => {
    setShowForm(prev => !prev);
    if (showForm) {
      resetForm();
    }
  }, [showForm, resetForm]);

  const handleSubmit = useCallback(async (e: React.FormEvent, onSubmit: (data: FormData) => Promise<{ success: boolean; error?: string }>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await onSubmit(formData);
      if (result.success) {
        setShowForm(false);
        resetForm();
      }
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, resetForm]);

  return {
    formData,
    setFormData,
    isSubmitting,
    showForm,
    toggleForm,
    handleSubmit,
    resetForm,
    setIsSubmitting,
    setShowForm,
  };
}

// 兼容的useAuth Hook - 匹配better-auth接口
export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    // 这里可以集成更好的认证逻辑
    const checkAuth = async () => {
      try {
        // 检查认证状态
        // 实际实现中应该调用真正的认证API
        setSession({ user: { id: '1', email: 'test@example.com' } });
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsPending(false);
      }
    };
    checkAuth();
  }, []);

  const isAuthenticated = useMemo(() => {
    return !isPending && !!session;
  }, [session, isPending]);

  return {
    data: { session, isPending },
    isPending,
    isAuthenticated,
  };
}

// useDebounce Hook - 防抖
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// useLocalStorage Hook - 本地存储
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// 工具函数
export const utils = {
  formatTime: (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  formatDateTime: (dateString: string): string => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  getQualityInfo: (rating: number): QualityOption => {
    return qualityOptionsMap[rating] || qualityOptions[0];
  },

  isToday: (dateString: string): boolean => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    );
  },

  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
};