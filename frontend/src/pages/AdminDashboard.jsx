import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Button, Badge } from '../components/Common';
import { Users, TrendingUp, Calendar, DollarSign, AlertCircle, ArrowUpRight, ArrowDownRight, Briefcase, Activity, ChevronRight } from 'lucide-react';
import { dashboardService } from '../services/api';
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
      // In a real app, this would be an actual API call
      // const data = await dashboardService.getSummary();
      
      // Simulating API delay and mock data for demonstration of UI
      await new Promise(resolve => setTimeout(resolve, 800));
      setSummary({
        totalEmployees: 142, employeeTrend: '+12%',
        activeProjects: 24, projectTrend: '+5%',
        monthlyRevenue: '12.4L', revenueTrend: '+18%',
        totalTransactions: 856, transactionTrend: '-2%',
        presentToday: 135,
        onLeave: 5,
        absent: 2,
        // Mock data for charts
        revenueData: [
          { name: 'Jan', revenue: 4000, expenses: 2400 },
          { name: 'Feb', revenue: 3000, expenses: 1398 },
          { name: 'Mar', revenue: 2000, expenses: 9800 },
          { name: 'Apr', revenue: 2780, expenses: 3908 },
          { name: 'May', revenue: 1890, expenses: 4800 },
          { name: 'Jun', revenue: 2390, expenses: 3800 },
        ],
        employeeStatus: [
          { name: 'Active', value: 120, color: '#10b981' },
          { name: 'On Leave', value: 15, color: '#f59e0b' },
          { name: 'Inactive', value: 7, color: '#ef4444' },
        ],
        departmentData: [
          { name: 'Weaving', workers: 45 },
          { name: 'Dyeing', workers: 30 },
          { name: 'Design', workers: 20 },
          { name: 'Packaging', workers: 25 },
          { name: 'Sales', workers: 22 },
        ]
      });
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main tracking-tight mb-2">
              Overview
            </h1>
            <p className="text-secondary-500 font-medium">Here's what's happening with your business today.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="bg-white">
              <Calendar className="w-4 h-4 mr-2" />
              Last 30 Days
            </Button>
            <Button variant="primary">
              Download Report
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
                trend={summary?.employeeTrend || '+0%'}
                trendUp={summary?.employeeTrend?.startsWith('+')}
                color="primary"
              />
              <StatCard
                title="Active Projects"
                value={summary?.activeProjects || 0}
                icon={Briefcase}
                trend={summary?.projectTrend || '+0%'}
                trendUp={summary?.projectTrend?.startsWith('+')}
                color="success"
              />
              <StatCard
                title="Monthly Revenue"
                value={`₹${summary?.monthlyRevenue || 0}`}
                icon={DollarSign}
                trend={summary?.revenueTrend || '+0%'}
                trendUp={summary?.revenueTrend?.startsWith('+')}
                color="info"
              />
              <StatCard
                title="Transactions"
                value={summary?.totalTransactions || 0}
                icon={Activity}
                trend={summary?.transactionTrend || '+0%'}
                trendUp={summary?.transactionTrend?.startsWith('+')}
                color="warning"
              />
            </div>

            {/* Main Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Revenue Area Chart */}
              <Card className="lg:col-span-2 !p-0 overflow-hidden flex flex-col">
                <div className="p-6 pb-2 border-b border-border/50">
                  <h3 className="text-lg font-bold text-text-main font-display">Revenue Overview</h3>
                  <p className="text-sm text-secondary-500">Monthly income vs expenses</p>
                </div>
                <div className="flex-1 p-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={summary?.revenueData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                      <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Employee Status Donut */}
              <Card className="!p-0 overflow-hidden flex flex-col">
                <div className="p-6 pb-2 border-b border-border/50">
                  <h3 className="text-lg font-bold text-text-main font-display">Workforce Status</h3>
                  <p className="text-sm text-secondary-500">Current availability</p>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-6 h-80 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary?.employeeStatus || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {(summary?.employeeStatus || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
                    <span className="text-3xl font-bold text-text-main">{summary?.totalEmployees || 0}</span>
                    <span className="text-xs text-secondary-500 font-medium">Total</span>
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {(summary?.employeeStatus || []).map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                        <span className="text-xs font-medium text-secondary-600">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Secondary Charts & Actions Row */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Department Bar Chart */}
              <Card className="lg:col-span-2 !p-0 overflow-hidden flex flex-col">
                <div className="p-6 pb-2 border-b border-border/50 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-text-main font-display">Department Distribution</h3>
                    <p className="text-sm text-secondary-500">Workers per department</p>
                  </div>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="flex-1 p-6 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary?.departmentData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9'}} />
                      <Bar dataKey="workers" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Quick Actions & Recent Activity Stack */}
              <div className="space-y-6">
                {/* Attendance Summary */}
                <Card className="bg-gradient-to-br from-primary-600 to-indigo-700 !border-none !p-0 overflow-hidden text-white shadow-lg shadow-primary-500/20">
                  <div className="p-6 relative">
                    <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full border-4 border-white/10 blur-[1px]"></div>
                    <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full border-4 border-white/10 blur-[1px]"></div>
                    
                    <h3 className="text-lg font-bold mb-4 relative z-10 flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary-200" />
                      Today's Attendance
                    </h3>
                    
                    <div className="space-y-4 relative z-10">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-primary-100">Present</span>
                          <span className="font-bold">{summary?.presentToday || 0}</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-1.5">
                          <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                        <div>
                          <p className="text-xs text-primary-200 mb-0.5">On Leave</p>
                          <p className="text-xl font-bold">{summary?.onLeave || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-primary-200 mb-0.5">Absent</p>
                          <p className="text-xl font-bold">{summary?.absent || 0}</p>
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
                      { icon: Users, label: 'Add Employee', color: 'text-primary-600', bg: 'bg-primary-50' },
                      { icon: DollarSign, label: 'Process Payroll', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { icon: Activity, label: 'Update Inventory', color: 'text-amber-600', bg: 'bg-amber-50' },
                    ].map((action, idx) => (
                      <button key={idx} className="w-full flex items-center gap-3 p-3 hover:bg-surface-hover rounded-xl transition-colors group text-left">
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
