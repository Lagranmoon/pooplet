import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </main>
      
      {/* 移动端底部导航 */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-3 gap-1 p-2">
          <a
            href="/"
            className="flex flex-col items-center justify-center py-2 px-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
          >
            <span className="text-lg mb-1">🏠</span>
            <span>首页</span>
          </a>
          <a
            href="/record"
            className="flex flex-col items-center justify-center py-2 px-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
          >
            <span className="text-lg mb-1">📝</span>
            <span>记录</span>
          </a>
          <a
            href="/stats"
            className="flex flex-col items-center justify-center py-2 px-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
          >
            <span className="text-lg mb-1">📊</span>
            <span>统计</span>
          </a>
        </div>
      </div>
      
      {/* 为底部导航预留空间 */}
      <div className="h-16 sm:h-0"></div>
    </div>
  );
};

export default Layout;