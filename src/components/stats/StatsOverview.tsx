import React, { useState, useEffect } from 'react';
import { statsService } from '../../services/statsService';
import type { OverallStats } from '../../types/database';

interface StatsOverviewProps {
  className?: string;
  refreshTrigger?: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  className = '',
  refreshTrigger = 0,
}) => {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await statsService.getOverallStats();
      
      if (result.error) {
        setError(result.error.message);
      } else {
        setStats(result.data);
      }
    } catch (err) {
      setError('加载统计数据失败');
      console.error('Error loading stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  const formatNumber = (num: number) => {
    if (num === 0) return '0';
    return num.toFixed(1);
  };

  const getQualityDescription = (rating: number) => {
    const descriptions = {
      1: '严重便秘',
      2: '轻度便秘', 
      3: '正常偏干',
      4: '理想状态',
      5: '轻度较稀',
      6: '轻度腹泻',
      7: '腹泻',
    };
    return descriptions[rating as keyof typeof descriptions] || '未知';
  };

  const getStreakMessage = (streakDays: number) => {
    if (streakDays === 0) return '还没有连续记录';
    if (streakDays === 1) return '连续记录1天';
    if (streakDays < 7) return `连续记录${streakDays}天`;
    if (streakDays < 30) return `连续记录${streakDays}天，保持得很好！`;
    return `连续记录${streakDays}天，优秀！`;
  };

  const getHealthStatus = (stats: OverallStats) => {
    const { daily_average, most_common_quality } = stats;
    
    if (daily_average === 0) return { status: '无数据', color: 'text-gray-500', bg: 'bg-gray-100' };
    if (daily_average < 0.5) return { status: '需要关注', color: 'text-red-600', bg: 'bg-red-100' };
    if (daily_average > 2) return { status: '过于频繁', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (most_common_quality >= 4 && most_common_quality <= 5) return { status: '健康', color: 'text-green-600', bg: 'bg-green-100' };
    return { status: '一般', color: 'text-blue-600', bg: 'bg-blue-100' };
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
          <div className="text-red-600 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadStats}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (!stats || stats.total_records === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">统计概览</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无统计数据</h3>
          <p className="text-gray-600">开始记录排便信息后，这里将显示您的统计数据</p>
        </div>
      </div>
    );
  }

  const healthStatus = getHealthStatus(stats);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">统计概览</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 总记录数 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">总记录数</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total_records}</p>
            </div>
          </div>
        </div>

        {/* 日均次数 */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">日均次数</p>
              <p className="text-2xl font-bold text-green-900">{formatNumber(stats.daily_average)}</p>
            </div>
          </div>
        </div>

        {/* 最常见质量 */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">最常见质量</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-yellow-900">{stats.most_common_quality}</p>
                <span className="text-sm text-yellow-700">({getQualityDescription(stats.most_common_quality)})</span>
              </div>
            </div>
          </div>
        </div>

        {/* 连续天数 */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">连续记录</p>
              <p className="text-2xl font-bold text-purple-900">{stats.streak_days}天</p>
            </div>
          </div>
        </div>
      </div>

      {/* 健康状态和连续记录提示 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 健康状态 */}
        <div className={`rounded-lg p-4 ${healthStatus.bg}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className={`h-6 w-6 ${healthStatus.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${healthStatus.color}`}>健康状态</h3>
              <p className={`text-lg font-bold ${healthStatus.color}`}>{healthStatus.status}</p>
            </div>
          </div>
        </div>

        {/* 连续记录提示 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-600">记录习惯</h3>
              <p className="text-sm text-gray-900">{getStreakMessage(stats.streak_days)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 记录时间范围 */}
      {stats.first_record_date && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span>记录时间范围: </span>
            <span className="font-medium">
              {new Date(stats.first_record_date).toLocaleDateString('zh-CN')} - {stats.last_record_date ? new Date(stats.last_record_date).toLocaleDateString('zh-CN') : '至今'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsOverview;