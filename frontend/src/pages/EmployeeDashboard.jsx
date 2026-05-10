import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import {
  Card,
  Button,
  Badge,
  Loading,
  ErrorMessage,
} from '../components/Common';
import StatCard from '../components/StatCard';
import { employeeService, attendanceService } from '../services/api';
import { formatDate } from '../utils/formatters';
import { CheckCircle, Clock, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

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

      // Get current employee details from localStorage/context
      // In real app, would get from user context or auth service
      const employeeId = localStorage.getItem('employeeId');
      
      if (!employeeId) {
        setError('Employee ID not found');
        return;
      }

      // Fetch employee details
      const empResponse = await employeeService.getById(employeeId);
      setEmployeeData({
        id: empResponse.employeeId,
        name: empResponse.employeeName,
        mobileNumber: empResponse.mobileNumber,
        joiningDate: empResponse.joiningDate,
        polishingRate: empResponse.polishingRate,
        status: empResponse.status,
      });

      // Fetch recent attendance
      const attResponse = await attendanceService.getByEmployeeId(employeeId, 0, 30);
      const attList = attResponse?.content || [];
      setRecentAttendance(attList.slice(0, 10));

      // Calculate statistics
      const present = attList.filter(a => a.status === 'PRESENT').length;
      const absent = attList.filter(a => a.status === 'ABSENT').length;
      const leave = attList.filter(a => a.status === 'LEAVE').length;
      const total = attList.length;

      setStats({
        presentDays: present,
        absentDays: absent,
        leaveDays: leave,
        totalRecords: total,
        attendance: total > 0 ? Math.round((present / total) * 100) : 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <MainLayout><Loading text="Loading your dashboard..." /></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="slide-down">
          <h1 className="text-4xl font-bold text-gray-900">
            👋 Welcome, {employeeData?.name}
          </h1>
          <p className="text-gray-600 mt-2">Here's your work summary and attendance overview</p>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchEmployeeData} />}

        {/* Employee Info Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Employee ID</p>
              <p className="text-2xl font-bold text-gray-900">#{employeeData?.id}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Status</p>
              <Badge variant={employeeData?.status === 'ACTIVE' ? 'success' : 'danger'}>
                {employeeData?.status}
              </Badge>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Mobile</p>
              <p className="text-lg font-medium text-gray-900">{employeeData?.mobileNumber}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Polishing Rate</p>
              <p className="text-lg font-medium text-green-600">₹{employeeData?.polishingRate}/unit</p>
            </div>
          </div>
        </Card>

        {/* Attendance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            color="success"
            title="Days Present"
            value={stats.presentDays}
            description={`${stats.presentDays} days recorded`}
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            color="danger"
            title="Days Absent"
            value={stats.absentDays}
            description={`${stats.absentDays} days missed`}
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            color="warning"
            title="Leave Days"
            value={stats.leaveDays}
            description={`${stats.leaveDays} days approved`}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            color="info"
            title="Attendance Rate"
            value={`${stats.attendance}%`}
            description="Overall attendance"
          />
        </div>

        {/* Attendance Progress */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Attendance Progress</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Present</span>
                <span className="font-medium text-green-600">{stats.presentDays} days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${(stats.presentDays / stats.totalRecords * 100) || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">On Leave</span>
                <span className="font-medium text-yellow-600">{stats.leaveDays} days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full transition-all"
                  style={{ width: `${(stats.leaveDays / stats.totalRecords * 100) || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Absent</span>
                <span className="font-medium text-red-600">{stats.absentDays} days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all"
                  style={{ width: `${(stats.absentDays / stats.totalRecords * 100) || 0}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Recent Attendance Records
          </h3>
          {recentAttendance.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No attendance records yet</p>
          ) : (
            <div className="space-y-2">
              {recentAttendance.map((record) => (
                <div
                  key={record.id || record.attendanceId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {record.status === 'PRESENT' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : record.status === 'LEAVE' ? (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm text-gray-600">{formatDate(record.date)}</p>
                      <p className="text-xs text-gray-500">
                        {record.checkInTime && `Check-in: ${record.checkInTime}`}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      record.status === 'PRESENT'
                        ? 'success'
                        : record.status === 'LEAVE'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {record.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Links */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="text-left"
              onClick={() => {
                // Navigate to attendance page
                window.location.hash = '#/attendance';
              }}
            >
              📍 View Full Attendance
            </Button>
            <Button
              variant="outline"
              className="text-left"
              onClick={() => {
                // Navigate to salary page
                window.location.hash = '#/salary';
              }}
            >
              💰 View Salary Details
            </Button>
            <Button
              variant="outline"
              className="text-left"
              onClick={() => {
                // Navigate to daily work
                window.location.hash = '#/daily-work';
              }}
            >
              📝 Daily Work Records
            </Button>
            <Button
              variant="outline"
              className="text-left"
              onClick={() => {
                // Contact admin
                alert('Contact your administrator for support');
              }}
            >
              💬 Contact Admin
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default EmployeeDashboard;
