import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, PublicRoute, UnauthorizedPage } from './components/ProtectedRoutes';
import './styles/globals.css';

// Pages
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { EmployeesPage } from './pages/EmployeesPage';
import AttendancePage from './pages/AttendancePage';
import SalaryPage from './pages/SalaryPage';
import OwnersPage from './pages/OwnersPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import DailyWorkManagementPage from './pages/DailyWorkManagementPage';
import { InventoryManagementPage } from './pages/InventoryManagementPage';
import OwnerProfile from './pages/OwnerProfile';
import InventoryPage from './pages/InventoryPage';
import TransactionsPage from './pages/TransactionsPage';
import OwnerPaymentsPage from './pages/OwnerPaymentsPage';
import EmployeeProfile from './pages/EmployeeProfile';
import DailyWorkPage from './pages/DailyWorkPage';
import PerformancePage from './pages/PerformancePage';
import PaymentsManagementPage from './pages/PaymentsManagementPage';
import InventoryReportPage from './pages/InventoryReportPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Error Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <EmployeesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/owners"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <OwnersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AttendancePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/salary"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <SalaryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <PaymentsManagementPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/daily-work"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <DailyWorkManagementPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <InventoryManagementPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/inventory-report"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <InventoryReportPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AnalyticsPage />
              </PrivateRoute>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/employee/dashboard"
            element={
              <PrivateRoute requiredRole="WORKER">
                <EmployeeDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/profile"
            element={
              <PrivateRoute requiredRole="WORKER">
                <EmployeeProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/attendance"
            element={
              <PrivateRoute requiredRole="WORKER">
                <AttendancePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/salary"
            element={
              <PrivateRoute requiredRole="WORKER">
                <SalaryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/daily-work"
            element={
              <PrivateRoute requiredRole="WORKER">
                <DailyWorkPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/performance"
            element={
              <PrivateRoute requiredRole="WORKER">
                <PerformancePage />
              </PrivateRoute>
            }
          />

          {/* Owner Routes */}
          <Route
            path="/owner/dashboard"
            element={
              <PrivateRoute requiredRole="SAREE_OWNER">
                <OwnerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/owner/profile"
            element={
              <PrivateRoute requiredRole="SAREE_OWNER">
                <OwnerProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/owner/inventory"
            element={
              <PrivateRoute requiredRole="SAREE_OWNER">
                <InventoryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/owner/transactions"
            element={
              <PrivateRoute requiredRole="SAREE_OWNER">
                <TransactionsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/owner/payments"
            element={
              <PrivateRoute requiredRole="SAREE_OWNER">
                <OwnerPaymentsPage />
              </PrivateRoute>
            }
          />

          {/* Default Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;