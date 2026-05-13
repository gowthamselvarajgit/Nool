import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Button, Badge, Loading, ErrorMessage } from '../components/Common';
import { employeeService, attendanceService } from '../services/api';
import { formatDate, friendlyStatus } from '../utils/formatters';
import { CheckCircle, Clock, TrendingUp, Calendar, AlertCircle, ArrowUpRight, Award, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

// Custom StatCard with modern aesthetic
const StatCard = ({ title, value, icon: Icon, description, color = 'primary' }) => {
  const colorMap = {
    primary: 'from-primary-500 to-indigo-600 bg-primary-50 text-primary-600 border-primary-100',
    success: 'from-emerald-400 to-emerald-600 bg-emerald-50 text-emerald-600 border-emerald-100',
    warning: 'from-amber-400 to-amber-600 bg-amber-50 text-amber-600 border-amber-100',
    info: 'from-blue-400 to-blue-600 bg-blue-50 text-blue-600 border-blue-100',
    danger: 'from-rose-400 to-rose-600 bg-rose-50 text-rose-600 border-rose-100',
  };

  const gradientClass = colorMap[color].split(' ')[0] + ' ' + colorMap[color].split(' ')[1];
  const bgClass = colorMap[color].split(' ')[2];
  const textClass = colorMap[color].split(' ')[3];
  const borderClass = colorMap[color].split(' ')[4];

  return (
    <div className="bg-surface rounded-3xl p-6 border border-border shadow-soft hover:shadow-card transition-all duration-300 relative overflow-hidden group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradientClass} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-sm font-medium text-secondary-500 mb-1">{title}</p>
          <h3 className="text-3xl font-display font-bold text-text-main">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bgClass} ${textClass} border ${borderClass} shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      <div className="relative z-10">
        <span className="text-xs font-medium text-secondary-500">{description}</span>
      </div>
    </div>
  );
};

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/90 backdrop-blur-md p-3 rounded-xl shadow-elevated border border-border">
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-medium flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const EmployeeDashboard = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [stats, setStats] = useState({});
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setError('');

      const today = new Date().toISOString().split('T')[0];
      const fromDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      // ✅ Fetch real employee profile
      const profile = await employeeService.getMe();
      setEmployeeData({
        id: profile.employeeId,
        name: profile.employeeName,
        mobileNumber: profile.mobileNumber,
        status: profile.status,
        polishingRate: profile.polishingRate,
        joiningDate: profile.joiningDate,
        role: 'Worker',
      });

      // ✅ AttendanceSummaryDto: { employeeId, employeeName, totalWorkingDays, absentDays, attendancePercentage }
      let totalDays = 0, absentDays = 0, attendancePct = 0;
      try {
        const summaryRes = await attendanceService.getMySummary(fromDate, today);
        totalDays = summaryRes?.totalWorkingDays ?? 0;
        absentDays = summaryRes?.absentDays ?? 0;
        attendancePct = Math.round(summaryRes?.attendancePercentage ?? 0);
      } catch (_) { /* ignore — will show zeros */ }

      const presentDays = Math.max(totalDays - absentDays, 0);

      setStats({
        presentDays,
        absentDays,
        totalDays,
        attendance: attendancePct,
        chartData: [
          { name: 'Present', value: presentDays || 0, color: '#10b981' },
          { name: 'Absent', value: absentDays || 0, color: '#ef4444' },
        ],
      });

      // ✅ Fetch recent attendance records (latest 10)
      try {
        const attRes = await attendanceService.getMyList(0, 10);
        setRecentAttendance(attRes?.content || []);
      } catch (_) {
        setRecentAttendance([]);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <MainLayout><Loading text="Loading your workspace..." /></MainLayout>;
  
  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="bg-surface rounded-3xl p-8 max-w-md w-full text-center border border-border shadow-soft animate-scale-up">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-text-main mb-2">Dashboard Error</h2>
            <p className="text-secondary-500 mb-8">{error}</p>
            <Button onClick={fetchEmployeeData} variant="primary" className="w-full">
              Try Again
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8 pb-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
              {employeeData?.role} workspace
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main tracking-tight mb-2">
              👋 Welcome back, {employeeData?.name?.split(' ')[0]}
            </h1>
            <p className="text-secondary-500 font-medium">Here's your work summary for this month.</p>
          </div>
        </div>

        {/* Profile Highlight Card */}
        <Card className="bg-gradient-to-r from-primary-600 to-indigo-700 !border-none !p-0 overflow-hidden text-white shadow-lg shadow-primary-500/20">
          <div className="p-8 relative">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold border border-white/20">
                  {employeeData?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-primary-100 text-sm mb-0.5">Employee ID</p>
                  <p className="text-xl font-bold tracking-wide">{employeeData?.id}</p>
                </div>
              </div>
              
              <div className="flex flex-col justify-center border-l border-white/10 pl-8">
                <p className="text-primary-100 text-sm mb-1">Current Status</p>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-100 text-xs font-semibold border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {friendlyStatus(employeeData?.status)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col justify-center border-l border-white/10 pl-8">
                <p className="text-primary-100 text-sm mb-1">Attendance Rate</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-display font-bold">{stats.attendance ?? 0}</p>
                  <p className="text-primary-200 text-sm mb-1">%</p>
                </div>
              </div>

              <div className="flex flex-col justify-center border-l border-white/10 pl-8">
                <p className="text-primary-100 text-sm mb-1">Polishing Rate</p>
                <p className="text-2xl font-bold text-emerald-300">₹{employeeData?.polishingRate}<span className="text-sm font-medium text-primary-200">/unit</span></p>
              </div>
            </div>
          </div>
        </Card>

        {/* Attendance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={CheckCircle}
            color="success"
            title="Days Present"
            value={stats.presentDays}
            description={`Out of ${stats.totalDays} recorded days`}
          />
          <StatCard
            icon={AlertCircle}
            color="danger"
            title="Days Absent"
            value={stats.absentDays}
            description="Days marked as absent"
          />
          <StatCard
            icon={Activity}
            color="info"
            title="Attendance Rate"
            value={`${stats.attendance}%`}
            description="Target: 95%"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Attendance Chart */}
          <Card className="!p-0 overflow-hidden flex flex-col">
            <div className="p-6 pb-2 border-b border-border/50">
              <h3 className="text-lg font-bold text-text-main font-display">Attendance Overview</h3>
              <p className="text-sm text-secondary-500">Current month distribution</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-6 h-80 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {(stats.chartData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
                <span className="text-4xl font-bold text-text-main">{stats.attendance}%</span>
                <span className="text-xs text-secondary-500 font-medium">Rate</span>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {(stats.chartData || []).map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                    <span className="text-xs font-medium text-secondary-600">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Attendance */}
          <Card className="lg:col-span-2 !p-0 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-surface-hover/30">
              <div>
                <h3 className="text-lg font-bold text-text-main font-display">Recent Activity</h3>
                <p className="text-sm text-secondary-500">Your latest attendance records</p>
              </div>
            </div>
            
            <div className="p-2 overflow-y-auto max-h-[360px] scrollbar-hide">
              {recentAttendance.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-secondary-400">
                  <Calendar className="w-12 h-12 mb-3 opacity-50" />
                  <p>No attendance records found</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentAttendance.map((record) => (
                    <div
                      key={record.id || record.attendanceId}
                      className="flex items-center justify-between p-4 rounded-2xl hover:bg-surface-hover transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                          record.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                          record.status === 'LEAVE' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                          'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {record.status === 'PRESENT' ? <CheckCircle className="w-6 h-6" /> : 
                           record.status === 'LEAVE' ? <Clock className="w-6 h-6" /> : 
                           <AlertCircle className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="font-bold text-text-main group-hover:text-primary-600 transition-colors">
                            {formatDate(record.attendanceDate)}
                          </p>
                          <p className="text-sm text-secondary-500 font-medium">
                            {record.employeeName || 'Attendance Record'}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          record.status === 'PRESENT' ? 'success' :
                          record.status === 'LEAVE' ? 'warning' : 'danger'
                        }
                        className="px-3 py-1 text-xs"
                      >
                        {friendlyStatus(record.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default EmployeeDashboard;
