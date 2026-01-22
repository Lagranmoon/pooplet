import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { statsService } from '../../services/statsService';

// 静态图标组件
const EmptyChartIcon = () => (
  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ErrorChartIcon = () => (
  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const InfoIcon = () => (
  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

interface FrequencyChartProps {
  className?: string;
  refreshTrigger?: number;
  period: 'daily' | 'weekly' | 'monthly';
}

export const FrequencyChart: React.FC<FrequencyChartProps> = ({
  className = '',
  refreshTrigger = 0,
  period,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await statsService.getFrequencyTrend(period, 30);
      
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载图表数据失败');
      console.error('Error loading chart data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [refreshTrigger, period, loadData]);

  // 提取昂贵的计算逻辑
  const statsSummary = useMemo(() => {
    if (!data?.length) return null;

    const totalRecords = data.reduce((sum, item) => sum + item.count, 0);
    const averageCount = data.length > 0 ? totalRecords / data.length : 0;
    const maxCount = Math.max(...data.map(d => d.count));
    const minCount = Math.min(...data.map(d => d.count));

    return { totalRecords, averageCount, maxCount, minCount };
  }, [data]);

  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    if (period === 'daily') {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    } else if (period === 'weekly') {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('zh-CN', { year: '2-digit', month: 'short' });
    }
  }, [period]);

  const getPeriodLabel = useCallback(() => {
    switch (period) {
      case 'daily':
        return '每日频率';
      case 'weekly':
        return '每周频率';
      case 'monthly':
        return '每月频率';
      default:
        return '频率';
    }
  }, [period]);

  const renderSimpleChart = useMemo(() => {
    if (!data?.length) return null;

    const maxCount = Math.max(...data.map(d => d.count));

    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          const isHigh = item.count > (maxCount * 0.7);
          const isLow = item.count < (maxCount * 0.3);
          
          return (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-16 text-sm text-gray-600 text-right">
                {formatDate(item.date || item.week_start || item.month)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-red-500' : isLow ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-sm font-medium text-gray-900">
                    {item.count}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [data, formatDate]);

  const renderStatsSummary = useMemo(() => {
    if (!statsSummary) return null;

    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{formatNumber(statsSummary.averageCount)}</div>
          <div className="text-sm text-gray-600">平均值</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{statsSummary.maxCount}</div>
          <div className="text-sm text-gray-600">最大值</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{statsSummary.minCount}</div>
          <div className="text-sm text-gray-600">最小值</div>
        </div>
      </div>
    );
  }, [statsSummary]);

  const formatNumber = (num: number) => {
    if (num === 0) return '0';
    return num.toFixed(1);
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1 h-6 bg-gray-200 rounded"></div>
              </div>
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
          <div className="text-gray-400 mb-4">
            <EmptyChartIcon />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{getPeriodLabel()}</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无数据</h3>
          <p className="text-gray-600">开始记录排便信息后，这里将显示您的{getPeriodLabel()}趋势</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{getPeriodLabel()}</h2>
        <div className="text-sm text-gray-500">
          最近 {data.length} 个{period === 'daily' ? '天' : period === 'weekly' ? '周' : '月'}
        </div>
      </div>

      {/* 统计摘要 */}
      {renderStatsSummary}

      {/* 图表 */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">趋势图表</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          {renderSimpleChart}
        </div>
      </div>

      {/* 图例 */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">正常范围</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-600">偏低</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">偏高</span>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <InfoIcon />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              关于频率分析
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                正常的排便频率通常为每天 1-3 次。图表中的颜色可以帮助您快速识别异常情况。
                建议关注持续偏低或偏高的模式，如有疑虑请咨询医生。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 使用memo包装组件以优化重渲染
export default memo(FrequencyChart);