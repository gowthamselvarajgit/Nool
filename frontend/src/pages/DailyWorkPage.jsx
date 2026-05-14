import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Loading, ErrorMessage, Badge } from '../components/Common';
import { useAuth } from '../hooks/useAuth';
import { dailyWorkService } from '../services/api';
import { exportToExcel } from '../utils/excelExporter';
import { formatDate, toLocalISODate } from '../utils/formatters';
import { ClipboardList, CheckCircle2, TrendingUp, Calendar, Zap, Download, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Calendar state — independent of the summary's "current month" so the
  // user can browse past months without changing the summary above.
  const currentMonthIso = toLocalISODate(new Date()).slice(0, 7);
  const todayIso = toLocalISODate(new Date());
  const [calMonth, setCalMonth] = useState(currentMonthIso);

  const shiftCalMonth = (delta) => {
    const [y, m] = calMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setCalMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const monthLabel = (ym) => {
    const [y, m] = ym.split('-');
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1)
      .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fromDate = toLocalISODate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
        const toDate = toLocalISODate(new Date());

        // Bumped to 5000 so the calendar can browse past months without re-fetching.
        const [summaryRes, logsRes] = await Promise.all([
          dailyWorkService.getMyWorkSummary(fromDate, toDate).catch(() => null),
          dailyWorkService.getMyList(0, 5000).catch(() => ({ content: [] })),
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

  // Bucket workLogs by date for the calendar
  const calData = useMemo(() => {
    const [yStr, mStr] = calMonth.split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10) - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();

    const byDate = {};
    let monthFresh = 0, monthRepolish = 0, monthEarning = 0, workedDays = 0;
    for (const log of workLogs) {
      const d = log.date || '';
      if (!d.startsWith(calMonth)) continue;
      const cur = byDate[d] || { fresh: 0, repolish: 0, earning: 0 };
      cur.fresh += log.freshCount || 0;
      cur.repolish += log.rePolishCount || 0;
      cur.earning += log.todayEarning || 0;
      byDate[d] = cur;
    }
    for (const d in byDate) {
      monthFresh += byDate[d].fresh;
      monthRepolish += byDate[d].repolish;
      monthEarning += byDate[d].earning;
      workedDays += 1;
    }
    return { year, month, daysInMonth, firstWeekday, byDate, monthFresh, monthRepolish, monthEarning, workedDays };
  }, [workLogs, calMonth]);

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
          
          <button
            type="button"
            disabled={!workLogs.length}
            onClick={() => exportToExcel({
              rows: workLogs.map(log => ({
                'Date': log.workDate ? formatDate(log.workDate) : (log.date ? formatDate(log.date) : ''),
                'Fresh Sarees': log.freshCount ?? 0,
                'Re-Polish': log.rePolishCount ?? 0,
                'Earnings (₹)': Math.round(log.todayEarning ?? log.earnings ?? 0),
              })),
              fileName: 'Nool_My_Daily_Work',
              sheetName: 'Daily Work',
              columnWidths: [14, 14, 12, 14],
            })}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-text-main border border-border rounded-xl text-sm font-bold hover:bg-surface-hover transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
          >
            <Download className="w-5 h-5" />
            Export Excel
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

        {/* ── My Work Calendar ── */}
        <Card className="!p-0 overflow-hidden">
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 px-2 sm:px-5 py-2 sm:py-4 border-b border-emerald-100">
            <button
              onClick={() => shiftCalMonth(-1)}
              className="p-1.5 sm:p-2 rounded-xl bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </button>
            <div className="text-center px-1">
              <p className="text-sm sm:text-xl font-bold text-gray-900">{monthLabel(calMonth)}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 leading-snug">
                {calData.workedDays}d ·
                <strong className="text-emerald-700 ml-1">{calData.monthFresh}</strong> fresh ·
                <strong className="text-amber-700 ml-1">{calData.monthRepolish}</strong> re ·
                <strong className="text-purple-700 ml-1">₹{Math.round(calData.monthEarning).toLocaleString('en-IN')}</strong>
              </p>
              {calMonth !== currentMonthIso && (
                <button
                  onClick={() => setCalMonth(currentMonthIso)}
                  className="text-[10px] sm:text-xs text-emerald-700 hover:text-emerald-900 font-semibold mt-0.5"
                >
                  Jump to this month
                </button>
              )}
            </div>
            <button
              onClick={() => shiftCalMonth(1)}
              disabled={calMonth >= currentMonthIso}
              className="p-1.5 sm:p-2 rounded-xl bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </button>
          </div>

          <div className="p-2 sm:p-5">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1.5 sm:mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <div
                  key={d}
                  className={`text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider py-1 ${
                    i === 0 ? 'text-rose-400' : 'text-gray-500'
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: calData.firstWeekday }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {Array.from({ length: calData.daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const dateIso = `${calData.year}-${String(calData.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const entry = calData.byDate[dateIso];
                const total = entry ? entry.fresh + entry.repolish : 0;
                const isToday = dateIso === todayIso;
                const isFuture = dateIso > todayIso;

                let cellClasses;
                if (entry) {
                  if (total >= 21) cellClasses = 'bg-emerald-600 text-white border-emerald-700 shadow-md';
                  else if (total >= 11) cellClasses = 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
                  else if (total >= 6) cellClasses = 'bg-emerald-400 text-white border-emerald-500';
                  else cellClasses = 'bg-emerald-200 text-emerald-900 border-emerald-300';
                } else if (isFuture) {
                  cellClasses = 'bg-white text-gray-300 border-gray-100';
                } else {
                  cellClasses = 'bg-gray-50 text-gray-400 border-gray-200';
                }

                const tooltip = entry
                  ? `${formatDate(dateIso)} — ${entry.fresh} fresh + ${entry.repolish} re-polish · ₹${Math.round(entry.earning).toLocaleString('en-IN')}`
                  : formatDate(dateIso);

                return (
                  <div
                    key={day}
                    title={tooltip}
                    className={`min-h-[52px] sm:min-h-[70px] md:min-h-[78px] rounded-lg sm:rounded-xl border sm:border-2 flex flex-col items-center justify-center px-0.5 sm:px-1 py-1 sm:py-2 transition-transform hover:scale-105 ${cellClasses} ${
                      isToday ? 'ring-2 ring-indigo-500 ring-offset-1 sm:ring-offset-2' : ''
                    }`}
                  >
                    <span className="text-[10px] sm:text-sm font-bold leading-none mb-0.5 sm:mb-1 opacity-90">{day}</span>
                    {entry ? (
                      <>
                        <span className="text-base sm:text-xl md:text-2xl font-extrabold leading-none">{total}</span>
                        <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wider mt-1 opacity-90">
                          {total === 1 ? 'saree' : 'sarees'}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-5 pt-4 border-t border-gray-100 text-xs">
              <span className="text-gray-700 font-semibold mr-1">Sarees polished:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-emerald-200 border-2 border-emerald-300" />
                <span className="text-gray-700">1–5</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-emerald-400 border-2 border-emerald-500" />
                <span className="text-gray-700">6–10</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-emerald-500 border-2 border-emerald-600" />
                <span className="text-gray-700">11–20</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-emerald-600 border-2 border-emerald-700" />
                <span className="text-gray-700">21+</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-gray-50 border-2 border-gray-200" />
                <span className="text-gray-700">No work</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-white border-2 border-indigo-500" />
                <span className="text-gray-700">Today</span>
              </div>
            </div>
          </div>
        </Card>

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
