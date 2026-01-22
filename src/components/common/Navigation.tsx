import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, signOut, loading } = useAuthContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/record', label: '记录', icon: '📝' },
    { path: '/stats', label: '统计', icon: '📊' },
  ];

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl">💩</span>
                <h1 className="text-xl font-bold text-gray-800 hidden sm:block">拉屎记录</h1>
                <h1 className="text-lg font-bold text-gray-800 sm:hidden">记录</h1>
              </Link>
            </div>
            
            {/* 桌面端导航 */}
            <div className="hidden sm:flex items-center space-x-4">
              {/* 导航链接 */}
              <div className="flex space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-1 lg:mr-2">{item.icon}</span>
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* 用户信息和登出 */}
              {user && (
                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span className="hidden lg:inline">欢迎，</span>
                    <span className="font-medium truncate max-w-32 lg:max-w-none">
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={loading || isLoggingOut}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      loading || isLoggingOut
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {isLoggingOut ? '登出中...' : '登出'}
                  </button>
                </div>
              )}
            </div>

            {/* 移动端菜单按钮 */}
            <div className="sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                aria-label="切换菜单"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 移动端下拉菜单 */}
        {isMobileMenuOpen && (
          <div className="sm:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              
              {user && (
                <div className="pt-2 pb-3 border-t border-gray-200">
                  <div className="px-3 py-2 text-sm text-gray-600">
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={loading || isLoggingOut}
                    className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      loading || isLoggingOut
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                    }`}
                  >
                    {isLoggingOut ? '登出中...' : '登出'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 点击外部关闭移动端菜单 */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 sm:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;