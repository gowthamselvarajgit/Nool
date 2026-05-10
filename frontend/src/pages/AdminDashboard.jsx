import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Table from '../components/Table';
import { Users, TrendingUp, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { dashboardService } from '../services/api';

const SimpleChart = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  return (
    <Card padding="lg">
      <h3 className="text-lg font-bold text-text-dark mb-6">{title}</h3>
      <div className="space-y-4">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-text">{item.name}</span>
              <span className="text-sm font-bold text-text-dark">{item.value}</span>
            </div>
            <div className="w-full bg-light-gray rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-info h-full transition-all duration-500"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
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
      setSummary(data || {});
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card padding="lg" className="text-center">
            <AlertCircle size={48} className="text-danger mx-auto mb-4" />
            <p className="text-danger font-semibold mb-4">{error}</p>
            <Button onClick={fetchDashboardData} variant="primary">
              Retry
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-text-dark mb-2">Admin Dashboard</h1>
          <p className="text-gray-text">Real-time business analytics and insights</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} padding="lg">
                <div className="animate-pulse">
                  <div className="h-4 bg-light-gray rounded mb-4 w-3/4"></div>
                  <div className="h-8 bg-light-gray rounded mb-3"></div>
                  <div className="h-3 bg-light-gray rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Employees"
                value={summary?.totalEmployees || 0}
                icon={Users}
                trend={summary?.employeeTrend || '+0%'}
                trendUp={true}
                color="primary"
              />
              <StatCard
                title="Active Projects"
                value={summary?.activeProjects || 0}
                icon={TrendingUp}
                trend={summary?.projectTrend || '+0%'}
                trendUp={true}
                color="success"
              />
              <StatCard
                title="This Month Revenue"
                value={`₹${summary?.monthlyRevenue || 0}`}
                icon={DollarSign}
                trend={summary?.revenueTrend || '+0%'}
                trendUp={true}
                color="info"
              />
              <StatCard
                title="Total Transactions"
                value={summary?.totalTransactions || 0}
                icon={Calendar}
                trend={summary?.transactionTrend || '+0%'}
                trendUp={true}
                color="warning"
              />
            </div>

            {/* Charts & Analytics Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <SimpleChart
                data={summary?.employeeStatus || [
                  { name: 'Active', value: 45 },
                  { name: 'On Leave', value: 12 },
                  { name: 'Inactive', value: 3 },
                ]}
                title="Employee Distribution"
              />
              <SimpleChart
                data={summary?.workStatus || [
                  { name: 'Completed', value: 78 },
                  { name: 'In Progress', value: 45 },
                  { name: 'Pending', value: 12 },
                ]}
                title="Work Status"
              />
            </div>

            {/* Summary & Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Stats */}
              <Card padding="lg">
                <h3 className="text-lg font-bold text-text-dark mb-6">Quick Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary-light rounded-lg">
                    <span className="text-gray-text font-medium">Present Today</span>
                    <span className="text-2xl font-bold text-primary">{summary?.presentToday || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-warning-light rounded-lg">
                    <span className="text-gray-text font-medium">On Leave</span>
                    <span className="text-2xl font-bold text-warning">{summary?.onLeave || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-danger-light rounded-lg">
                    <span className="text-gray-text font-medium">Absent</span>
                    <span className="text-2xl font-bold text-danger">{summary?.absent || 0}</span>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card padding="lg">
                <h3 className="text-lg font-bold text-text-dark mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" fullWidth className="justify-start">
                    👥 Add New Employee
                  </Button>
                  <Button variant="outline" fullWidth className="justify-start">
                    🧵 Add New Owner
                  </Button>
                  <Button variant="outline" fullWidth className="justify-start">
                    💰 Process Salary
                  </Button>
                  <Button variant="outline" fullWidth className="justify-start">
                    📊 View Analytics
                  </Button>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card padding="lg">
              <h3 className="text-lg font-bold text-text-dark mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { icon: '✅', text: 'Employee John Doe marked present', time: '2 minutes ago' },
                  { icon: '💰', text: 'Salary processed for 45 employees', time: '1 hour ago' },
                  { icon: '🎫', text: 'New project assigned', time: '3 hours ago' },
                  { icon: '📦', text: 'Inventory updated', time: '5 hours ago' },
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 hover:bg-light-gray rounded-lg transition-colors">
                    <span className="text-2xl">{activity.icon}</span>
                    <div className="flex-1">
                      <p className="text-text-dark font-medium">{activity.text}</p>
                      <p className="text-xs text-gray-text">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
