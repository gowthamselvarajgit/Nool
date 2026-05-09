import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Button, Badge, Loading, ErrorMessage, EmptyState } from '../components/Common';
import { dashboardService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const StatCard = ({ label, value, icon, trend }) => {
  return (
    <Card hover className="relative overflow-hidden group">
      <div className="absolute -right-8 -bottom-8 text-6xl opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        {icon}
      </div>
      <div>
        <p className="text-gray-600 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
          </p>
        )}
      </div>
    </Card>
  );
};

const ChartCard = ({ title, children }) => {
  return (
    <Card>
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </Card>
  );
};

const SimpleChart = ({ data, label }) => {
  const maxValue = Math.max(...(data || []), 1);
  return (
    <div className="space-y-4">
      {data && data.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{item.name || `Item ${index}`}</span>
            <span className="text-sm font-bold text-gray-900">{item.value}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <MainLayout><Loading text="Loading dashboard..." /></MainLayout>;
  if (error) return <MainLayout><ErrorMessage message={error} onRetry={fetchDashboardData} /></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="slide-down">
          <h1 className="text-4xl font-bold text-gray-900">📊 Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time business analytics and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Employees"
            value={summary?.totalEmployees || 0}
            icon="👥"
            trend={5}
          />
          <StatCard
            label="Active Employees"
            value={summary?.activeEmployees || 0}
            icon="✅"
            trend={3}
          />
          <StatCard
            label="Total Owners"
            value={summary?.totalOwners || 0}
            icon="🧵"
            trend={8}
          />
          <StatCard
            label="Total Revenue"
            value={formatCurrency(summary?.totalRevenue || 0)}
            icon="💰"
            trend={12}
          />
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Employee Status Distribution">
            {summary?.employeeStatusData ? (
              <SimpleChart data={summary.employeeStatusData} />
            ) : (
              <EmptyState message="No employee data available" />
            )}
          </ChartCard>

          <ChartCard title="Owner Distribution">
            {summary?.ownerData ? (
              <SimpleChart data={summary.ownerData} />
            ) : (
              <EmptyState message="No owner data available" />
            )}
          </ChartCard>
        </div>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/admin/employees'}
            >
              👥 Manage Employees
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/admin/owners'}
            >
              🧵 Manage Owners
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/admin/attendance'}
            >
              📍 View Attendance
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/admin/salary'}
            >
              💰 Salary Payments
            </Button>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">📋 System Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg border border-green-100">
              <div>
                <p className="font-medium text-gray-900">System Status</p>
                <p className="text-sm text-gray-600">All systems operational</p>
              </div>
              <Badge variant="success">🟢 Online</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border border-blue-100">
              <div>
                <p className="font-medium text-gray-900">Database</p>
                <p className="text-sm text-gray-600">Connected and synced</p>
              </div>
              <Badge variant="info">✓ Connected</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg border border-purple-100">
              <div>
                <p className="font-medium text-gray-900">API Status</p>
                <p className="text-sm text-gray-600">All endpoints responsive</p>
              </div>
              <Badge variant="success">⚡ Active</Badge>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};
