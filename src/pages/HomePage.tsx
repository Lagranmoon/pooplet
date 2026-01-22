import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          拉屎记录应用
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          跟踪和分析您的排便习惯，了解健康状况
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              记录排便
            </h2>
            <p className="text-gray-600 mb-6">
              快速记录每次排便的时间、质量和备注信息
            </p>
            <Link
              to="/record"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              开始记录
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              查看统计
            </h2>
            <p className="text-gray-600 mb-6">
              分析您的排便趋势和健康指标
            </p>
            <Link
              to="/stats"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              查看统计
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          为什么要记录排便？
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-medium mb-2">🏥 健康监测</h4>
            <p>及时发现消化系统问题和健康变化</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">📈 趋势分析</h4>
            <p>了解饮食和生活习惯对排便的影响</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">👨‍⚕️ 医疗参考</h4>
            <p>为医生提供准确的健康数据参考</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;