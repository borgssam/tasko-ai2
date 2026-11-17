import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import DeviceFrame from './components/DeviceFrame.jsx';
import LoginScreen from './screens/LoginScreen.jsx';
import SignupScreen from './screens/SignupScreen.jsx';
import DashboardScreen from './screens/DashboardScreen.jsx';
import AllTasksScreen from './screens/AllTasksScreen.jsx';
import TaskDetailScreen from './screens/TaskDetailScreen.jsx';

/**
 * Tasko 메인 애플리케이션 컴포넌트
 * - React Router 7을 이용한 화면 이동 라우팅
 * - 첫 화면은 로그인(/login) 화면으로 설정
 * - 5개 지정 화면 라우트 구성:
 *   1. 로그인 (/login)
 *   2. 회원가입 (/signup)
 *   3. 대시보드 (/dashboard)
 *   4. 전체 할 일 목록 (/tasks)
 *   5. 할 일 상세/수정 (/tasks/:id)
 */
export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
    <TaskProvider>
      <BrowserRouter>
        <DeviceFrame>
          <Routes>
            {/* 로그인하지 않은 사람만 볼 수 있는 화면 (로그인한 사람은 대시보드로 보낸다) */}
            <Route element={<PublicOnlyRoute />}>
              {/* 앱 첫 화면은 로그인 화면입니다 */}
              <Route path="/" element={<LoginScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
            </Route>
            {/* 로그인한 사람만 볼 수 있는 화면 (아니면 로그인 화면으로 보낸다) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardScreen />} />
              <Route path="/tasks" element={<AllTasksScreen />} />
              <Route path="/tasks/:id" element={<TaskDetailScreen />} />
            </Route>
            {/* 알 수 없는 경로는 로그인으로 리디렉트 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DeviceFrame>
      </BrowserRouter>
    </TaskProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

// 로그인한 사람만 통과시키는 문지기
function ProtectedRoute() {
  const { user, loading } = useAuth();
  // 로그인 여부를 확인하는 동안은 빈 화면 (로그인 화면이 번쩍이지 않게)
  if (loading) {
    return null;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

// 로그인하지 않은 사람만 통과시키는 문지기 (이미 로그인했으면 대시보드로)
function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return null;
  }
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
