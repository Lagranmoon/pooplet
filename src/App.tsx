import React, { Suspense, lazy, memo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/common/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// 使用懒加载优化bundle大小
const HomePage = lazy(() => import('./pages/HomePage'));
const RecordPage = lazy(() => import('./pages/RecordPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));

const App: React.FC = memo(() => {
  return (
    <AuthProvider>
      <Router>
        <ProtectedRoute>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={
                <Suspense fallback={<LoadingSpinner />}>
                  <HomePage />
                </Suspense>
              } />
              <Route path="record" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <RecordPage />
                </Suspense>
              } />
              <Route path="stats" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <StatsPage />
                </Suspense>
              } />
            </Route>
          </Routes>
        </ProtectedRoute>
      </Router>
    </AuthProvider>
  );
});

App.displayName = 'App';

export default App;
