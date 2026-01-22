import React, { useState, useEffect } from 'react';

interface OfflineIndicatorProps {
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 初始检查
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator && isOnline) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      {!isOnline ? (
        // 离线状态指示器
        <div className="bg-red-600 text-white text-center py-2 px-4">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
            </svg>
            <span className="text-sm font-medium">网络连接断开，数据将稍后同步</span>
          </div>
        </div>
      ) : (
        // 重新连接指示器
        <div className="bg-green-600 text-white text-center py-2 px-4">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">网络连接已恢复</span>
          </div>
        </div>
      )}
    </div>
  );
};



// 数据缓存管理 Hook
export function useDataCache<T>(key: string, fetcher: () => Promise<T>, ttl: number = 5 * 60 * 1000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const getCachedData = (): T | null => {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const { data: cachedData, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > ttl) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return cachedData;
    } catch {
      return null;
    }
  };

  const setCachedData = (data: T) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  };

  const fetchData = async (forceRefresh = false) => {
    try {
      // 检查缓存
      if (!forceRefresh) {
        const cachedData = getCachedData();
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      const result = await fetcher();
      setData(result);
      setCachedData(result);
      setLastFetch(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
      
      // 如果有缓存数据，即使出错也显示缓存
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [key]);

  const refresh = () => fetchData(true);

  return {
    data,
    loading,
    error,
    refresh,
    lastFetch,
    isStale: Date.now() - lastFetch > ttl,
  };
}

// 离线队列管理 Hook
export const useOfflineQueue = () => {
  const [pendingActions, setPendingActions] = useState<Array<{
    id: string;
    action: string;
    data: any;
    timestamp: number;
  }>>([]);

  useEffect(() => {
    // 从本地存储加载待处理的操作
    const loadPendingActions = () => {
      try {
        const stored = localStorage.getItem('offline_queue');
        if (stored) {
          setPendingActions(JSON.parse(stored));
        }
      } catch (error) {
        console.warn('Failed to load offline queue:', error);
      }
    };

    loadPendingActions();
  }, []);

  const savePendingActions = (actions: typeof pendingActions) => {
    try {
      localStorage.setItem('offline_queue', JSON.stringify(actions));
    } catch (error) {
      console.warn('Failed to save offline queue:', error);
    }
  };

  const addAction = (action: string, data: any) => {
    const newAction = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      data,
      timestamp: Date.now(),
    };

    setPendingActions(prev => {
      const updated = [...prev, newAction];
      savePendingActions(updated);
      return updated;
    });
  };

  const removeAction = (id: string) => {
    setPendingActions(prev => {
      const updated = prev.filter(action => action.id !== id);
      savePendingActions(updated);
      return updated;
    });
  };

  const clearQueue = () => {
    setPendingActions([]);
    savePendingActions([]);
  };

  const syncActions = async () => {
    if (!navigator.onLine || pendingActions.length === 0) {
      return;
    }

    // 这里应该实现实际的同步逻辑
    // 目前只是一个占位符
    console.log('Syncing offline actions:', pendingActions);
    clearQueue();
  };

  // 监听网络状态变化
  useEffect(() => {
    const handleOnline = () => {
      syncActions();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [pendingActions]);

  return {
    pendingActions,
    addAction,
    removeAction,
    clearQueue,
    syncActions,
    hasPendingActions: pendingActions.length > 0,
  };
};

