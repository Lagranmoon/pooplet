import React, { memo } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

// 提取静态导航项为常量
const MOBILE_NAV_ITEMS = [
  { href: '/', emoji: '🏠', label: '首页' },
  { href: '/record', emoji: '📝', label: '记录' },
  { href: '/stats', emoji: '📊', label: '统计' },
] as const;

const MobileNavItem: React.FC<{ href: string; emoji: string; label: string }> = ({ href, emoji, label }) => (
  <a
    href={href}
    className="flex flex-col items-center justify-center py-2 px-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
  >
    <span className="text-lg mb-1">{emoji}</span>
    <span>{label}</span>
  </a>
);

const Layout: React.FC = memo(() => {
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
          {MOBILE_NAV_ITEMS.map((item) => (
            <MobileNavItem key={item.href} {...item} />
          ))}
        </div>
      </div>
      
      {/* 为底部导航预留空间 */}
      <div className="h-16 sm:h-0" />
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;