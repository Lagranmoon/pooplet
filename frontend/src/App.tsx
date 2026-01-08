import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { ToastProvider } from '@/contexts/ToastContext';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/Home';
import { AddLogPage } from '@/pages/AddLog';
import { LogsPage } from '@/pages/Logs';
import { StatsPage } from '@/pages/Stats';
import { CalendarPage } from '@/pages/Calendar';
import { ProfilePage } from '@/pages/Profile';
import { AdminPage } from '@/pages/Admin';
import { LoginPage } from '@/pages/Login';
import { RegisterPage } from '@/pages/Register';
import { useState, useEffect } from 'react';

type Tab = 'home' | 'add' | 'logs' | 'stats' | 'calendar' | 'profile' | 'admin';

function getActiveTabFromPath(path: string): Tab {
  switch (path) {
    case '/':
      return 'home';
    case '/add':
      return 'add';
    case '/logs':
      return 'logs';
    case '/stats':
      return 'stats';
    case '/calendar':
      return 'calendar';
    case '/profile':
      return 'profile';
    case '/admin':
      return 'admin';
    default:
      return 'home';
  }
}

function getPathFromTab(tab: Tab): string {
  switch (tab) {
    case 'home':
      return '/';
    case 'add':
      return '/add';
    case 'logs':
      return '/logs';
    case 'stats':
      return '/stats';
    case 'calendar':
      return '/calendar';
    case 'profile':
      return '/profile';
    case 'admin':
      return '/admin';
  }
}

// 受保护的路由组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-poplet-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce-subtle">💩</div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

function AppContent() {
  const [isMobile, setIsMobile] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = getActiveTabFromPath(location.pathname);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavigate = (tab: string) => {
    const newPath = getPathFromTab(tab as Tab);
    navigate(newPath);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'add':
        return <AddLogPage onComplete={() => navigate('/', { replace: true })} />;
      case 'logs':
        return <LogsPage />;
      case 'stats':
        return <StatsPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'profile':
        return <ProfilePage onLogout={handleLogout} />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={handleNavigate} isMobile={isMobile} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
