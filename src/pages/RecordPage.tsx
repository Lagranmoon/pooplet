import React, { useState } from 'react';
import RecordForm from '../components/record/RecordForm';
import RecordList from '../components/record/RecordList';
import type { BowelMovementRecord } from '../types/database';

interface RecordPageProps {
  className?: string;
}

export const RecordPage: React.FC<RecordPageProps> = ({ className = '' }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRecordCreated = (_record: BowelMovementRecord) => {
    setRefreshTrigger(prev => prev + 1);
    setSuccessMessage('记录已成功保存！');
    
    // 3秒后清除成功消息
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleError = (error: string) => {
    // 错误处理逻辑，可以显示错误消息或进行其他操作
    console.error('Record form error:', error);
  };

  const handleEdit = (record: BowelMovementRecord) => {
    // TODO: 实现编辑功能
    console.log('Edit record:', record);
  };

  const handleDelete = (_record: BowelMovementRecord) => {
    setRefreshTrigger(prev => prev + 1);
    setSuccessMessage('记录已成功删除！');
    
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">排便记录</h1>
          <p className="mt-2 text-gray-600">
            记录您的排便信息，跟踪健康状况
          </p>
        </div>

        {/* 成功消息 */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* 记录表单 */}
          <section>
            <RecordForm
              onRecordCreated={handleRecordCreated}
              onError={handleError}
            />
          </section>

          {/* 记录列表 */}
          <section>
            <RecordList
              refreshTrigger={refreshTrigger}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default RecordPage;