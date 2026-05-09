import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Button, Badge, Loading, ErrorMessage, EmptyState } from '../components/Common';
import { employeeService, attendanceService } from '../services/api';
import { formatDate, formatCurrency, getEmployeeStatusColor } from '../utils/formatters';

const QuickActionCard = ({ icon, title, description, onClick }) => {
  return (
    <Card hover className="cursor-pointer" onClick={onClick}>
      <div className="flex items-start gap-4">
        <span className="text-4xl">{icon}</span>
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </Card>
  );
};

export const EmployeeDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const profileData = await employeeService.getMe();
      setProfile(profileData);

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0];
      const attData = await attendanceService.getList({
        pageNo: 0,
        pageSize: 1,
        date: today,
      });
      
      if (attData.data && attData.data.length > 0) {
        setAttendance(attData.data[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <MainLayout><Loading text="Loading your dashboard..." /></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="slide-down">
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {profile?.name}! 👋
                </h1>
                <p className="text-gray-600 mt-2">
                  {profile?.status === 'ACTIVE' 
                    ? "You're all set for today. Great to see you!" 
                    : `Your current status is ${profile?.status}`}
                </p>
              </div>
              <Badge variant={getEmployeeStatusColor(profile?.status)}>
                {profile?.status}
              </Badge>
            </div>
          </Card>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchEmployeeData} />}

        {/* Key Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <p className="text-gray-600 text-sm">Employee ID</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">#{profile?.id}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Joining Date</p>
            <p className="text-lg font-bold text-gray-900 mt-2">
              {formatDate(profile?.joiningDate)}
            </p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Polishing Rate</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ₹{profile?.polishingRate || 0}
            </p>
          </Card>
        </div>

        {/* Attendance Status */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">📍 Today's Attendance</h3>
              {attendance ? (
                <div className="mt-2">
                  <Badge variant="success" className="mb-2">
                    ✓ Marked
                  </Badge>
                  <p className="text-sm text-gray-600">
                    Status: <span className="font-medium text-gray-900">{attendance.status}</span>
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600 mt-2">Not marked yet</p>
              )}
            </div>
            <Button onClick={() => window.location.href = '/employee/attendance'}>
              Mark Attendance
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickActionCard
              icon="💰"
              title="View Salary"
              description="Check your salary details and payment history"
              onClick={() => window.location.href = '/employee/salary'}
            />
            <QuickActionCard
              icon="📝"
              title="Daily Work"
              description="Log your daily work and productivity"
              onClick={() => window.location.href = '/employee/daily-work'}
            />
            <QuickActionCard
              icon="👤"
              title="My Profile"
              description="Update your personal information"
              onClick={() => window.location.href = '/employee/profile'}
            />
            <QuickActionCard
              icon="📊"
              title="Performance"
              description="View your performance metrics"
              onClick={() => window.location.href = '/employee/performance'}
            />
          </div>
        </div>

        {/* Information Cards */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Important Information</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-xl">ℹ️</span>
              <div>
                <p className="font-medium text-gray-900">Mark Attendance Daily</p>
                <p className="text-sm text-gray-600">Make sure to mark your attendance before end of the day</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Update Daily Work</p>
                <p className="text-sm text-gray-600">Log your daily activities and tasks completed</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};
