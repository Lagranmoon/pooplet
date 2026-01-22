import React, { useState } from 'react';
import StatsOverview from '../components/stats/StatsOverview';
import FrequencyChart from '../components/stats/FrequencyChart';

interface StatsPageProps {
  className?: string;
}

export const StatsPage: React.FC<StatsPageProps> = ({ className = '' }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activePeriod, setActivePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const _handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly') => {
    setActivePeriod(period);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">统计分析</h1>
          <p className="mt-2 text-gray-600">
            查看您的排便统计数据和健康趋势
          </p>
        </div>

        {/* 统计概览 */}
        <div className="mb-8">
          <StatsOverview
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* 频率图表 */}
        <div className="space-y-8">
          {/* 图表控制 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">频率趋势分析</h2>
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handlePeriodChange('daily')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activePeriod === 'daily'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  每日
                </button>
                <button
                  onClick={() => handlePeriodChange('weekly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activePeriod === 'weekly'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  每周
                </button>
                <button
                  onClick={() => handlePeriodChange('monthly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activePeriod === 'monthly'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  每月
                </button>
              </div>
            </div>

            <FrequencyChart
              refreshTrigger={refreshTrigger}
              period={activePeriod}
            />
          </div>

          {/* 附加信息和提示 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">健康建议</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">正常范围</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>每天1-3次排便被认为是正常的。布里斯托大便分类法4-5型是最理想的状态。</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">注意事项</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>如果出现持续便秘、腹泻或其他异常情况，请及时咨询医生。此应用仅供参考，不能替代专业医疗建议。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;