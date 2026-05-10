import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import {
  Card,
  Button,
  Select,
  Loading,
  ErrorMessage,
} from '../components/Common';
import StatCard from '../components/StatCard';
import { employeeService, attendanceService, salaryService } from '../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [attendanceData, setAttendanceData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [employeeStats, setEmployeeStats] = useState({});
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch employee statistics
      const empResponse = await employeeService.getList(0, 100);
      const employees = empResponse?.content || [];
      
      setEmployeeStats({
        total: employees.length,
        active: employees.filter(e => e.status === 'ACTIVE').length,
        inactive: employees.filter(e => e.status === 'INACTIVE').length,
        onLeave: employees.filter(e => e.status === 'ON_LEAVE').length,
      });

      // Fetch attendance data for the month
      const startDate = `${selectedMonth}-01`;
      const endDate = `${selectedMonth}-31`;
      const attResponse = await attendanceService.getByDateRange(startDate, endDate);
      const attList = attResponse?.content || [];

      // Process attendance data for chart
      const dailyAttendance = {};
      attList.forEach(record => {
        const date = record.date.split('T')[0].slice(8); // Get day
        if (!dailyAttendance[date]) {
          dailyAttendance[date] = { date, present: 0, absent: 0, leave: 0 };
        }
        if (record.status === 'PRESENT') dailyAttendance[date].present++;
        else if (record.status === 'ABSENT') dailyAttendance[date].absent++;
        else if (record.status === 'LEAVE') dailyAttendance[date].leave++;
      });

      const attendanceChartData = Object.values(dailyAttendance).sort((a, b) => 
        parseInt(a.date) - parseInt(b.date)
      );
      setAttendanceData(attendanceChartData);

      // Simulate salary data
      const salaryChartData = [
        { date: '1st', amount: Math.random() * 500000 + 300000 },
        { date: '5th', amount: Math.random() * 500000 + 300000 },
        { date: '10th', amount: Math.random() * 500000 + 300000 },
        { date: '15th', amount: Math.random() * 500000 + 300000 },
        { date: '20th', amount: Math.random() * 500000 + 300000 },
        { date: '25th', amount: Math.random() * 500000 + 300000 },
        { date: '30th', amount: Math.random() * 500000 + 300000 },
      ];
      setSalaryData(salaryChartData);

      // Revenue data
      const revenueChartData = [
        { name: 'Polishing', value: 45 },
        { name: 'Saree Sales', value: 35 },
        { name: 'Services', value: 20 },
      ];
      setRevenueData(revenueChartData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0D6EFD', '#198754', '#FFC107'];

  if (loading) return <MainLayout><Loading text="Loading analytics..." /></MainLayout>;

  // Calculate statistics
  const totalAttendance = attendanceData.reduce((sum, d) => sum + d.present, 0);
  const totalAbsent = attendanceData.reduce((sum, d) => sum + d.absent, 0);
  const averageAttendance = totalAttendance > 0 
    ? Math.round((totalAttendance / (totalAttendance + totalAbsent)) * 100) 
    : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="slide-down">
          <h1 className="text-4xl font-bold text-gray-900">📊 Analytics & Reports</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into your ERP system</p>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchAnalytics} />}

        {/* Month Selection */}
        <Card className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button onClick={fetchAnalytics}>Refresh</Button>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            color="primary"
            title="Total Employees"
            value={employeeStats.total}
            description={`${employeeStats.active} active`}
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            color="success"
            title="Attendance Rate"
            value={`${averageAttendance}%`}
            description="Monthly average"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            color="info"
            title="Total Marked"
            value={totalAttendance + totalAbsent}
            description="This month"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            color="warning"
            title="Total Salary"
            value="₹0"
            description="Pending processing"
          />
        </div>

        {/* Attendance Trend Chart */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Attendance Trend</h3>
          {attendanceData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No attendance data for this month</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" stackId="a" fill="#198754" name="Present" />
                <Bar dataKey="absent" stackId="a" fill="#DC3545" name="Absent" />
                <Bar dataKey="leave" stackId="a" fill="#FFC107" name="Leave" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Salary Trend Chart */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Salary Processing Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salaryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#0D6EFD" 
                strokeWidth={2}
                name="Amount Processed"
                dot={{ fill: '#0D6EFD', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Employee Status Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Status Pie Chart */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Employee Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active', value: employeeStats.active },
                    { name: 'Inactive', value: employeeStats.inactive },
                    { name: 'On Leave', value: employeeStats.onLeave },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#198754" />
                  <Cell fill="#6C757D" />
                  <Cell fill="#FFC107" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Revenue Distribution */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Statistics Summary */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-900 font-medium">Total Present</p>
              <p className="text-2xl font-bold text-green-600">{totalAttendance}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-900 font-medium">Total Absent</p>
              <p className="text-2xl font-bold text-red-600">{totalAbsent}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900 font-medium">Attendance Rate</p>
              <p className="text-2xl font-bold text-blue-600">{averageAttendance}%</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-purple-900 font-medium">Total Employees</p>
              <p className="text-2xl font-bold text-purple-600">{employeeStats.total}</p>
            </div>
          </div>
        </Card>

        {/* Export Options */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Export Reports</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">📥 Export as PDF</Button>
            <Button variant="outline">📊 Export as Excel</Button>
            <Button variant="outline">📧 Email Report</Button>
            <Button variant="outline">🖨️ Print Report</Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
