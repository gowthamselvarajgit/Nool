import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Button, Badge } from '../components/Common';
import { Users, TrendingUp, Calendar, DollarSign, AlertCircle, ArrowUpRight, ArrowDownRight, Briefcase, Activity, ChevronRight, Bell, Search, Download, FileText } from 'lucide-react';
import { dashboardService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

// Custom StatCard with modern aesthetic
const StatCard = ({ title, value, icon: Icon, trend, trendUp, color = 'primary' }) => {
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
      {/* Decorative background blur */}
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
      
      <div className="flex items-center gap-2 relative z-10">
        <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {trend}
        </span>
        <span className="text-xs text-secondary-400">vs last month</span>
      </div>
    </div>
  );
};

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/90 backdrop-blur-md p-4 rounded-xl shadow-elevated border border-border">
        <p className="font-semibold text-text-main mb-2">{label}</p>
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

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30days');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await dashboardService.getSummary();
      setSummary({
        totalEmployees: data.totalEmployees || 0,
        activeEmployees: data.activeEmployees || 0,
        inactiveEmployees: data.inactiveEmployees || 0,
        todayFreshWork: data.todayFreshWork || 0,
        todayRepolishWork: data.todayRepolishWork || 0,
        monthFreshWork: data.monthFreshWork || 0,
        monthRepolishWork: data.monthRepolishWork || 0,
        todayRevenue: data.todayRevenue || 0,
        monthRevenue: data.monthRevenue || 0,
        totalRevenue: data.totalRevenue || 0,
        totalSareesReceived: data.totalSareesReceived || 0,
        totalSareesReturned: data.totalSareesReturned || 0,
        sareesInHand: data.sareesInHand || 0,
        totalSalaryPaid: data.totalSalaryPaid || 0,
        pendingSalary: Math.max(0, data.pendingSalary || 0), // Ensure no negative values
      });
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    // Trigger refresh based on selected range
    fetchDashboardData();
  };

  // Handle report download as Excel
  const handleDownloadReport = () => {
    try {
      // Create worksheet data
      const worksheetData = [
        ['Admin Dashboard Report'],
        [`Generated: ${new Date().toLocaleString()}`],
        [`Date Range: ${dateRange}`],
        [],
        ['Key Metrics'],
        ['Metric', 'Value'],
        ['Total Employees', summary?.totalEmployees || 0],
        ['Active Employees', summary?.activeEmployees || 0],
        ['Inactive Employees', summary?.inactiveEmployees || 0],
        ['Today Fresh Sarees', summary?.todayFreshWork || 0],
        ['Today Re-Polish Sarees', summary?.todayRepolishWork || 0],
        ['Month Fresh Sarees', summary?.monthFreshWork || 0],
        ['Month Re-Polish Sarees', summary?.monthRepolishWork || 0],
        ['Today Revenue', `₹${(summary?.todayRevenue || 0).toLocaleString('en-IN')}`],
        ['Month Revenue', `₹${(summary?.monthRevenue || 0).toLocaleString('en-IN')}`],
        ['Total Revenue', `₹${(summary?.totalRevenue || 0).toLocaleString('en-IN')}`],
        ['Total Sarees Received', summary?.totalSareesReceived || 0],
        ['Total Sarees Returned', summary?.totalSareesReturned || 0],
        ['Sarees In Hand', summary?.sareesInHand || 0],
        ['Total Salary Paid', `₹${(summary?.totalSalaryPaid || 0).toLocaleString('en-IN')}`],
        ['Pending Salary', `₹${(summary?.pendingSalary || 0).toLocaleString('en-IN')}`],
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Set column widths
      worksheet['!cols'] = [
        { wch: 25 },
        { wch: 20 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dashboard');
      
      const fileName = `admin-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error('Failed to download report:', err);
      alert('Failed to download report');
    }
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    // Add search functionality here
  };

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
            <Button onClick={fetchDashboardData} variant="primary" className="w-full">
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
        {/* Header Section - ONLY ONE */}
        <div className="bg-surface rounded-2xl p-6 border border-border shadow-soft">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main tracking-tight mb-2">
                Overview
              </h1>
              <p className="text-secondary-500 font-medium">Here's what's happening with your business today.</p>
            </div>
            <div className="flex gap-3 items-center">
              {/* Search Icon in Header */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-surface-hover border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm w-48"
                />
              </div>
              
              {/* Notification Bell - ONLY ONE */}
              <button 
                onClick={() => alert('Notifications: No new alerts')}
                className="p-2 hover:bg-surface-hover rounded-lg transition-colors relative group"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-secondary-600 group-hover:text-primary-600 transition-colors" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>
            </div>
          </div>

          {/* Search Bar for Mobile */}
          <div className="relative w-full md:hidden mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search employees, sarees..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-hover border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          {/* Date Range & Download Controls */}
          <div className="flex gap-2 flex-wrap items-center">
            <div className="flex gap-2 flex-wrap">
              {['7days', '30days', '90days', 'All'].map((range) => (
                <Button
                  key={range}
                  onClick={() => handleDateRangeChange(range)}
                  variant={dateRange === range ? 'primary' : 'secondary'}
                  className={`text-sm ${dateRange === range ? 'bg-primary-600 text-white' : 'bg-white'}`}
                >
                  {range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : range === '90days' ? 'Last 90 Days' : 'All Time'}
                </Button>
              ))}
            </div>
            <Button 
              onClick={handleDownloadReport}
              variant="primary" 
              className="ml-auto text-sm flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Download Excel
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface rounded-3xl p-6 border border-border shadow-soft animate-pulse">
                <div className="flex justify-between mb-4">
                  <div>
                    <div className="h-4 w-24 bg-secondary-200 rounded-full mb-3"></div>
                    <div className="h-8 w-16 bg-secondary-200 rounded-lg"></div>
                  </div>
                  <div className="w-12 h-12 bg-secondary-100 rounded-2xl"></div>
                </div>
                <div className="h-4 w-32 bg-secondary-100 rounded-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard
                title="Total Workforce"
                value={summary?.totalEmployees || 0}
                icon={Users}
                trend={`${summary?.activeEmployees || 0} Active`}
                trendUp={true}
                color="primary"
              />
              <StatCard
                title="Today's Fresh Sarees"
                value={summary?.todayFreshWork || 0}
                icon={Briefcase}
                trend={`Month: ${summary?.monthFreshWork || 0}`}
                trendUp={true}
                color="success"
              />
              <StatCard
                title="Monthly Revenue"
                value={`₹${(summary?.monthRevenue || 0).toLocaleString('en-IN')}`}
                icon={DollarSign}
                trend={`Total: ₹${(summary?.totalRevenue || 0).toLocaleString('en-IN')}`}
                trendUp={true}
                color="info"
              />
              <StatCard
                title="Sarees In Hand"
                value={summary?.sareesInHand || 0}
                icon={Activity}
                trend={`${summary?.totalSareesReceived || 0} Received`}
                trendUp={true}
                color="warning"
              />
            </div>

            {/* Main Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Polishing Work Overview */}
              <Card className="lg:col-span-2 !p-0 overflow-hidden flex flex-col">
                <div className="p-6 pb-2 border-b border-border/50">
                  <h3 className="text-lg font-bold text-text-main font-display">Saree Polishing Overview</h3>
                  <p className="text-sm text-secondary-500">Fresh vs Re-polish sarees this month</p>
                </div>
                <div className="flex-1 p-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Today', fresh: summary?.todayFreshWork || 0, rePolish: summary?.todayRepolishWork || 0 },
                      { name: 'This Month', fresh: summary?.monthFreshWork || 0, rePolish: summary?.monthRepolishWork || 0 }
                    ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9'}} />
                      <Bar dataKey="fresh" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="rePolish" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Saree Inventory Status */}
              <Card className="!p-0 overflow-hidden flex flex-col">
                <div className="p-6 pb-2 border-b border-border/50">
                  <h3 className="text-lg font-bold text-text-main font-display">Saree Inventory</h3>
                  <p className="text-sm text-secondary-500">Transaction summary</p>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-6 h-80 relative">
                  {(summary?.sareesInHand || 0) > 0 || (summary?.totalSareesReturned || 0) > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'In Hand', value: summary?.sareesInHand || 0, color: '#10b981' },
                              { name: 'Returned', value: summary?.totalSareesReturned || 0, color: '#6366f1' }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#6366f1" />
                          </Pie>
                          <RechartsTooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-text-main">{summary?.totalSareesReceived || 0}</span>
                        <span className="text-xs text-secondary-500 font-medium">Received</span>
                      </div>
                      {/* Legend */}
                      <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                          <span className="text-xs font-medium text-secondary-600">In Hand: {summary?.sareesInHand || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                          <span className="text-xs font-medium text-secondary-600">Returned: {summary?.totalSareesReturned || 0}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center">
                        <Activity className="w-8 h-8 text-secondary-400" />
                      </div>
                      <p className="text-sm text-secondary-500 font-medium">No inventory data yet</p>
                      <p className="text-xs text-secondary-400 text-center">Start receiving sarees to see inventory</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Secondary Row - Salary & Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Salary Summary */}
              <Card className="lg:col-span-2 !p-0 overflow-hidden">
                <div className="p-6 pb-2 border-b border-border/50">
                  <h3 className="text-lg font-bold text-text-main font-display">Salary Management</h3>
                  <p className="text-sm text-secondary-500">Payroll summary</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 rounded-2xl border border-emerald-200">
                      <p className="text-sm text-emerald-700 font-medium mb-1">Salary Paid (This Month)</p>
                      <p className="text-3xl font-bold text-emerald-900">₹{(summary?.totalSalaryPaid || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 p-6 rounded-2xl border border-rose-200">
                      <p className="text-sm text-rose-700 font-medium mb-1">Pending Salary</p>
                      <p className="text-3xl font-bold text-rose-900">₹{(summary?.pendingSalary || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Actions & Salary Card */}
              <div className="space-y-6">
                {/* Today's Overview */}
                <Card className="bg-gradient-to-br from-primary-600 to-indigo-700 !border-none !p-0 overflow-hidden text-white shadow-lg shadow-primary-500/20">
                  <div className="p-6 relative">
                    <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full border-4 border-white/10 blur-[1px]"></div>
                    <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full border-4 border-white/10 blur-[1px]"></div>
                    
                    <h3 className="text-lg font-bold mb-4 relative z-10 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary-200" />
                      Today's Work
                    </h3>
                    
                    <div className="space-y-3 relative z-10">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-primary-100">Fresh Sarees</span>
                          <span className="font-bold">{summary?.todayFreshWork || 0}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 pt-2 border-t border-white/10">
                        <div>
                          <p className="text-xs text-primary-200 mb-0.5">Re-Polish Sarees</p>
                          <p className="text-lg font-bold">{summary?.todayRepolishWork || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Quick Actions List */}
                <Card className="!p-0 overflow-hidden">
                  <div className="p-5 border-b border-border/50">
                    <h3 className="text-base font-bold text-text-main font-display">Quick Actions</h3>
                  </div>
                  <div className="p-2">
                    {[
                      { icon: Users, label: 'Add Employee', color: 'text-primary-600', bg: 'bg-primary-50', action: () => navigate('/admin/employees') },
                      { icon: DollarSign, label: 'Process Payroll', color: 'text-emerald-600', bg: 'bg-emerald-50', action: () => navigate('/admin/salary') },
                      { icon: Activity, label: 'Add Daily Work', color: 'text-amber-600', bg: 'bg-amber-50', action: () => navigate('/admin/daily-work') },
                    ].map((action, idx) => (
                      <button 
                        key={idx} 
                        onClick={action.action}
                        className="w-full flex items-center gap-3 p-3 hover:bg-surface-hover rounded-xl transition-colors group text-left"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.bg} ${action.color} group-hover:scale-105 transition-transform`}>
                          <action.icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-text-main">{action.label}</span>
                        <ChevronRight className="w-4 h-4 ml-auto text-secondary-400 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
