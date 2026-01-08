import { useState } from 'react';
import { type ReactNode } from 'react';
import { Home, Plus, List, BarChart3, Calendar, Bell, BellOff, Menu, ChevronDown, LogOut, User, Shield } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { usePoopData } from '@/hooks/usePoopData';
import { useAuth } from '@/lib/auth';

interface LayoutProps {
  children: ReactNode;
  activeTab: 'home' | 'add' | 'logs' | 'stats' | 'calendar' | 'profile' | 'admin';
  onTabChange: (tab: 'home' | 'add' | 'logs' | 'stats' | 'calendar' | 'profile' | 'admin') => void;
  isMobile: boolean;
  onLogout: () => void;
}

const navItems = [
  { id: 'home' as const, icon: Home, label: '首页' },
  { id: 'calendar' as const, icon: Calendar, label: '日历' },
  { id: 'logs' as const, icon: List, label: '历史' },
  { id: 'stats' as const, icon: BarChart3, label: '统计' },
];

export function Layout({ children, activeTab, onTabChange, isMobile, onLogout }: LayoutProps) {
  const { reminderEnabled, setReminderEnabled } = usePoopData();
	const { isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="text-xl">💩</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Pooplet</h1>
            <p className="text-xs text-gray-400">排便记录助手</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  onTabChange(item.id);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
          {isAdmin && (
            <li>
              <button
                onClick={() => {
                  onTabChange('admin');
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'admin'
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Shield size={20} />
                <span className="font-medium">管理中心</span>
              </button>
            </li>
          )}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => {
            onTabChange('add');
            if (isMobile) setSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'add'
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90'
          }`}
        >
          <Plus size={20} />
          记录排便
        </button>
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => {
            onTabChange('profile');
            if (isMobile) setSidebarOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'bg-primary/10 text-primary'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <User size={20} />
          <span className="font-medium">个人资料</span>
        </button>
        <button
          onClick={() => {
            onLogout();
            if (isMobile) setSidebarOpen(false);
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-600 hover:bg-red-50 mt-1"
        >
          <LogOut size={20} />
          <span className="font-medium">退出登录</span>
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-poplet-bg">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">
              Pooplet
            </h1>
            <Avatar className="h-8 w-8 bg-primary/10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                U
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-4">
          {children}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe">
          <div className="max-w-md mx-auto flex justify-around items-center h-14">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  activeTab === item.id ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <item.icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
            <button
              onClick={() => onTabChange('add')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                activeTab === 'add' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Plus size={20} />
              <span className="text-xs font-medium">记录</span>
            </button>
          </div>
        </nav>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">导航</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-2">
                  <Menu className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              {sidebarContent}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-poplet-bg">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-lg">💩</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Pooplet
              </h1>
            </div>
            
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setReminderEnabled(!reminderEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                reminderEnabled ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              {reminderEnabled ? <Bell size={20} /> : <BellOff size={20} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Avatar className="h-8 w-8 bg-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    U
                  </AvatarFallback>
                </Avatar>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <Card className="absolute right-0 top-full mt-2 w-48 py-2 shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-800">用户</p>
                      <p className="text-xs text-gray-400">本地用户</p>
                    </div>
                    <button
                      onClick={() => {
                        onTabChange('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      <User size={16} />
                      个人资料
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          onTabChange('admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                      >
                        <Shield size={16} />
                        管理中心
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      退出登录
                    </button>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
