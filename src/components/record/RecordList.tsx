import React, { useState, useEffect } from 'react';
import { recordService } from '../../services/recordService';
import type { BowelMovementRecord, PaginatedResponse } from '../../types/database';
import { BRISTOL_STOOL_DESCRIPTIONS } from '../../types/database';

interface RecordListProps {
  refreshTrigger?: number; // 用于触发刷新
  onEdit?: (record: BowelMovementRecord) => void;
  onDelete?: (record: BowelMovementRecord) => void;
  className?: string;
}

export const RecordList: React.FC<RecordListProps> = ({
  refreshTrigger = 0,
  onEdit,
  onDelete,
  className = '',
}) => {
  const [records, setRecords] = useState<BowelMovementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginatedResponse<BowelMovementRecord>>({
    data: [],
    count: 0,
    hasMore: false,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const loadRecords = async (page: number = 0, append: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await recordService.getRecords({
        limit: pageSize,
        offset: page * pageSize,
        orderBy: 'occurred_at',
        orderDirection: 'desc',
      });

      // getRecords 返回 PaginatedResponse<BowelMovementRecord>
      const paginatedResult = result as PaginatedResponse<BowelMovementRecord>;
      if (append) {
        setRecords(prev => [...prev, ...paginatedResult.data]);
      } else {
        setRecords(paginatedResult.data);
      }
      setPagination(paginatedResult);
    } catch (err) {
      setError('加载记录失败，请稍后重试');
      console.error('Error loading records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords(0, false);
  }, [refreshTrigger]);

  const handleLoadMore = () => {
    if (pagination.hasMore && !isLoading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadRecords(nextPage, true);
    }
  };

  const handleDelete = async (record: BowelMovementRecord) => {
    if (!window.confirm('确定要删除这条记录吗？此操作无法撤销。')) {
      return;
    }

    try {
      const result = await recordService.deleteRecord(record.id);
      if (result.error) {
        setError(result.error.message);
      } else {
        // 从列表中移除记录
        setRecords(prev => prev.filter(r => r.id !== record.id));
        onDelete?.(record);
      }
    } catch (err) {
      setError('删除失败，请稍后重试');
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getQualityColor = (rating: number) => {
    if (rating <= 2) return 'text-red-600 bg-red-100';
    if (rating <= 4) return 'text-green-600 bg-green-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const groupRecordsByDate = (records: BowelMovementRecord[]) => {
    const grouped: { [key: string]: BowelMovementRecord[] } = {};
    
    records.forEach(record => {
      const date = new Date(record.occurred_at).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(record);
    });

    return Object.entries(grouped).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    ) as [string, BowelMovementRecord[]][];
  };

  if (isLoading && records.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadRecords(0, false)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有记录</h3>
          <p className="text-gray-600">开始记录您的排便信息吧！</p>
        </div>
      </div>
    );
  }

  const groupedRecords = groupRecordsByDate(records) as [string, BowelMovementRecord[]][];

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">记录列表</h2>
      
      <div className="space-y-6">
        {groupedRecords.map(([dateStr, dayRecords]) => (
          <div key={dateStr} className="space-y-3">
            {/* 日期标题 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 pb-2 mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                {new Date(dateStr).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
                <span className="ml-2 text-xs text-gray-500">
                  ({dayRecords.length} 条记录)
                </span>
              </h3>
            </div>

            {/* 当日记录列表 */}
            <div className="space-y-3">
              {dayRecords.map((record) => (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {formatDateTime(record.occurred_at)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(record.quality_rating)}`}>
                          {record.quality_rating}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">质量:</span> {BRISTOL_STOOL_DESCRIPTIONS[record.quality_rating as keyof typeof BRISTOL_STOOL_DESCRIPTIONS]}
                      </p>
                      
                      {record.notes && (
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-md p-2">
                          {record.notes}
                        </p>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center space-x-2 ml-4">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(record)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="编辑"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => handleDelete(record)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="删除"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 加载更多按钮 */}
      {pagination.hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                加载中...
              </>
            ) : (
              '加载更多'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecordList;