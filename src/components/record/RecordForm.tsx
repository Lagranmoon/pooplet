import React, { useState, useEffect } from 'react';
import { recordService } from '../../services/recordService';
import type { CreateRecordRequest, BowelMovementRecord } from '../../types/database';
import { BRISTOL_STOOL_DESCRIPTIONS } from '../../types/database';

interface RecordFormProps {
  onRecordCreated?: (record: BowelMovementRecord) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const RecordForm: React.FC<RecordFormProps> = ({
  onRecordCreated,
  onError,
  className = '',
}) => {
  const [formData, setFormData] = useState<CreateRecordRequest>({
    occurred_at: '',
    quality_rating: 4,
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // 初始化时间为当前时间
  useEffect(() => {
    const now = new Date();
    const localISOTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    setFormData(prev => ({
      ...prev,
      occurred_at: localISOTime,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    try {
      // 转换为UTC时间
      const occurredAtUTC = new Date(formData.occurred_at).toISOString();
      
      const result = await recordService.createRecord({
        ...formData,
        occurred_at: occurredAtUTC,
        notes: formData.notes?.trim() || undefined,
      });

      if (result.error) {
        setErrors([result.error.message]);
        onError?.(result.error.message);
      } else if (result.data) {
        // 重置表单
        const now = new Date();
        const localISOTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setFormData({
          occurred_at: localISOTime,
          quality_rating: 4,
          notes: '',
        });
        onRecordCreated?.(result.data);
      }
    } catch (error) {
      const errorMessage = '提交失败，请稍后重试';
      setErrors([errorMessage]);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quality_rating' ? parseInt(value) : value,
    }));
  };

  const getQualityColor = (rating: number) => {
    if (rating <= 2) return 'text-red-600'; // 便秘 - 红色
    if (rating <= 4) return 'text-green-600'; // 正常 - 绿色
    return 'text-yellow-600'; // 较稀 - 黄色
  };

  const getQualityBorderColor = (rating: number) => {
    if (rating <= 2) return 'border-red-300';
    if (rating <= 4) return 'border-green-300';
    return 'border-yellow-300';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">记录排便信息</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 发生时间 */}
        <div>
          <label htmlFor="occurred_at" className="block text-sm font-medium text-gray-700 mb-2">
            发生时间 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="occurred_at"
            name="occurred_at"
            value={formData.occurred_at}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            max={new Date().toISOString().slice(0, 16)}
          />
        </div>

        {/* 质量评级 */}
        <div>
          <label htmlFor="quality_rating" className="block text-sm font-medium text-gray-700 mb-2">
            质量评级 <span className="text-red-500">*</span>
          </label>
          <select
            id="quality_rating"
            name="quality_rating"
            value={formData.quality_rating}
            onChange={handleInputChange}
            required
            className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getQualityBorderColor(formData.quality_rating)}`}
          >
            {[1, 2, 3, 4, 5, 6, 7].map(rating => (
              <option key={rating} value={rating}>
                {rating} - {BRISTOL_STOOL_DESCRIPTIONS[rating as keyof typeof BRISTOL_STOOL_DESCRIPTIONS]}
              </option>
            ))}
          </select>
          
          {/* 质量评级描述 */}
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            <p className={`text-sm font-medium ${getQualityColor(formData.quality_rating)}`}>
              {formData.quality_rating} - {BRISTOL_STOOL_DESCRIPTIONS[formData.quality_rating as keyof typeof BRISTOL_STOOL_DESCRIPTIONS]}
            </p>
          </div>
        </div>

        {/* 备注 */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            备注 <span className="text-gray-400">(可选)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            maxLength={500}
            placeholder="记录任何特殊情况、感受或需要注意的事项..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="mt-1 text-xs text-gray-500">
            {(formData.notes || '').length}/500 字符
          </div>
        </div>

        {/* 错误显示 */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">提交失败</h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 提交按钮 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                提交中...
              </>
            ) : (
              '保存记录'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecordForm;