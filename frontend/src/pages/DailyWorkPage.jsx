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
        setLoading(true);
        // ✅ Correct date strings for fromDate/toDate params
        const fromDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const toDate = new Date().toISOString().split('T')[0];

        // ✅ Correct method: getMyWorkSummary(fromDate, toDate)
        // ✅ Correct method: getList(page, size) instead of non-existent getWorkLogsList
        const [summaryRes, logsRes] = await Promise.all([
          dailyWorkService.getMyWorkSummary(fromDate, toDate).catch(() => null),
          dailyWorkService.getList(0, 30).catch(() => ({ content: [] })),
        ]);

        // ✅ Map summary — field names from EmployeeDailyWorkSummaryDto
        const totalFresh = summaryRes?.totalFreshCount ?? summaryRes?.totalFreshSareesPolished ?? 0;
        const totalRePolish = summaryRes?.totalRePolishCount ?? summaryRes?.totalRePolishSareesPolished ?? 0;
        const daysWorked = summaryRes?.totalWorkDays ?? 0;
        const total = totalFresh + totalRePolish;

        setSummary({
          totalFresh,
          totalRePolish,
          totalPolished: total,
          averagePerDay: daysWorked > 0 ? Math.round(total / daysWorked) : 0,
          daysWorked,
        });

        // ✅ Map logs — fields from EmployeeDailyWorkListDto: workId, employeeId, employeeName, workDate, freshCount, rePolishCount, todayEarning
        const mappedLogs = (logsRes?.content || []).map(log => ({
          workId: log.workId,
          date: log.workDate,   // ✅ workDate is the correct field
          freshCount: log.freshCount || 0,
          rePolishCount: log.rePolishCount || 0,
          totalWork: (log.freshCount || 0) + (log.rePolishCount || 0),
          todayEarning: log.todayEarning || 0,
        }));

        setWorkLogs(mappedLogs);
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
    fresh: log.freshCount,
    rePolish: log.rePolishCount,
    total: log.totalWork
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
              <p className="text-sm font-medium text-secondary-500 mb-1">Total Polished (This Month)</p>
              <p className="text-3xl font-display font-bold text-text-main">{summary?.totalPolished}</p>
              <p className="text-xs text-secondary-400 mt-1">{summary?.totalFresh} Fresh + {summary?.totalRePolish} Re-polish</p>
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
              <p className="text-xs text-secondary-400 mt-1">Sarees polished</p>
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
              <p className="text-xs text-secondary-400 mt-1">This month</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card className="lg:col-span-2 !p-0 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-text-main font-display">Polishing Breakdown</h3>
                <p className="text-sm text-secondary-500">Fresh vs Re-polish - Last 7 days</p>
              </div>
            </div>
            <div className="p-6 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="fresh" stackId="a" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} name="Fresh" />
                  <Bar dataKey="rePolish" stackId="a" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={40} name="Re-polish" />
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
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100 shadow-sm">
                      {new Date(log.date).getDate()}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-text-main">
                        {new Date(log.date).toLocaleDateString('en-IN', {
                          weekday: 'short', month: 'short',
                        })}
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">Fresh: {log.freshCount} | Re-polish: {log.rePolishCount}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-text-main text-lg mb-0.5">
                      {log.totalWork}
                    </p>
                    <p className="text-xs font-medium text-secondary-500 uppercase">total</p>
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
