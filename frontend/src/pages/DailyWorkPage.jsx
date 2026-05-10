import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Loading, ErrorMessage, Badge } from '../components/Common';
import { useAuth } from '../hooks/useAuth';
import { dailyWorkService } from '../services/api';
import { ClipboardList, PlusCircle, CheckCircle2, TrendingUp, Calendar, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/90 backdrop-blur-md p-3 rounded-xl shadow-elevated border border-border">
        <p className="text-secondary-500 text-xs mb-1 font-medium">{label}</p>
        <p className="text-sm font-bold flex items-center gap-2 text-indigo-600">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          {payload[0].value} Sarees Polished
        </p>
      </div>
    );
  }
  return null;
};

export const DailyWorkPage = () => {
  const { user } = useAuth();
  const [workLogs, setWorkLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const now = new Date();
  const monthName = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeeId = user?.employeeId || 'EMP-102';

        // Mock delay for UI
        await new Promise(resolve => setTimeout(resolve, 800));

        setSummary({
          totalPolished: 450,
          averagePerDay: 18,
          daysWorked: 25
        });

        // Mock data
        const mockData = Array.from({ length: 10 }).map((_, i) => ({
          workId: i + 1,
          date: new Date(Date.now() - (i * 86400000)).toISOString(),
          sareesPolished: Math.floor(Math.random() * 15) + 10,
          status: i < 2 ? 'PENDING_APPROVAL' : 'APPROVED'
        }));

        setWorkLogs(mockData);
      } catch (err) {
        setError(err.message || 'Failed to load work data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <MainLayout><Loading text="Loading your work logs..." /></MainLayout>;
  
  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <ErrorMessage message={error} />
        </div>
      </MainLayout>
    );
  }

  // Chart Data
  const chartData = workLogs.slice(0, 7).reverse().map(log => ({
    name: new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    polished: log.sareesPolished
  }));

  return (
    <MainLayout>
      <div className="space-y-6 pb-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-3">
              <ClipboardList className="w-4 h-4" />
              Work Log
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main tracking-tight mb-2">
              My Daily Work
            </h1>
            <p className="text-secondary-500 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {monthName}
            </p>
          </div>
          
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-text-main text-white rounded-xl text-sm font-bold hover:bg-black transition-all duration-300 shadow-xl shadow-black/10 hover:-translate-y-0.5 w-full md:w-auto">
            <PlusCircle className="w-5 h-5" />
            Log Today's Work
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-soft flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-colors"></div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0 z-10">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="z-10">
              <p className="text-sm font-medium text-secondary-500 mb-1">Total Polished</p>
              <p className="text-3xl font-display font-bold text-text-main">{summary?.totalPolished}</p>
            </div>
          </div>
          
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-soft flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-colors"></div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0 z-10">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div className="z-10">
              <p className="text-sm font-medium text-secondary-500 mb-1">Average per Day</p>
              <p className="text-3xl font-display font-bold text-text-main">{summary?.averagePerDay}</p>
            </div>
          </div>
          
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-soft flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-colors"></div>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0 z-10">
              <Zap className="w-7 h-7" />
            </div>
            <div className="z-10">
              <p className="text-sm font-medium text-secondary-500 mb-1">Days Worked</p>
              <p className="text-3xl font-display font-bold text-text-main">{summary?.daysWorked}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card className="lg:col-span-2 !p-0 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-text-main font-display">Productivity Trend</h3>
                <p className="text-sm text-secondary-500">Last 7 days performance</p>
              </div>
            </div>
            <div className="p-6 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="polished" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="url(#colorIndigo)" />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Data Table List Style */}
          <Card className="!p-0 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-border bg-surface-hover/30 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-text-main font-display">Recent Logs</h2>
                <p className="text-sm text-secondary-500">Daily entry history</p>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[300px] scrollbar-hide divide-y divide-border/50">
              {workLogs.map((log) => (
                <div key={log.workId} className="flex items-center justify-between p-5 hover:bg-surface-hover transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100 shadow-sm">
                      {new Date(log.date).getDate()}
                    </div>
                    <div>
                      <p className="font-bold text-text-main">
                        {new Date(log.date).toLocaleDateString('en-IN', {
                          weekday: 'short', month: 'short',
                        })}
                      </p>
                      <Badge variant={log.status === 'APPROVED' ? 'success' : 'warning'} className="text-[10px] px-2 py-0.5 mt-1">
                        {log.status === 'APPROVED' ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-text-main text-lg mb-0.5">
                      {log.sareesPolished}
                    </p>
                    <p className="text-xs font-medium text-secondary-500 uppercase">sarees</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default DailyWorkPage;
