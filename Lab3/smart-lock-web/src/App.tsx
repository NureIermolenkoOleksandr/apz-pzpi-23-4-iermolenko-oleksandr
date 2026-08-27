import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import { UserLayout } from './components/layout/UserLayout';
import MyLocksPage from './pages/user/MyLocksPage';

import { AdminLayout } from './components/layout/AdminLayout';
import UsersPage from './pages/admin/UsersPage';
import DevicesPage from './pages/admin/DevicesPage';
import DashboardPage from './pages/admin/DashboardPage';
import LogsPage from './pages/admin/LogsPage';
import BuildingsRoomsPage from './pages/admin/BuildingsRoomsPage';
import AlertsPage from './pages/admin/AlertsPage';
import RegisterPage from './pages/auth/RegisterPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<UserLayout />}>
          <Route path="/app" element={<MyLocksPage />} />
        </Route>
      </Route>


      <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'MANAGER']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<DashboardPage />} />
          
       
          <Route path="/admin/devices" element={<DevicesPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/logs"element={<LogsPage />} />
          <Route path="/admin/alerts" element={<AlertsPage />} />
          <Route path="/admin/buildings" element={<BuildingsRoomsPage />} />

        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}

export default App;