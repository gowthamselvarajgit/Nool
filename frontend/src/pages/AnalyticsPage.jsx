import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Button, Loading, ErrorMessage } from '../components/Common';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { employeeService, attendanceService, ownerService, inventoryService } from '../services/api';
import { TrendingUp, Users, Package, Building2, RefreshCw, Award, UserCheck, UserX, Clock } from 'lucide-react';

const COLORS = {
  present: '#10b981',
  absent: '#f43f5e',
  leave: '#f59e0b',
  active: '#6366f1',
  inactive: '#94a3b8',
  onLeave: '#f59e0b',
  received: '#6366f1',
  returned: '#10b981',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Data state
  const [employeeStats, setEmployeeStats] = useState({ total: 0, active: 0, inactive: 0, onLeave: 0 });
  const [ownerStats, setOwnerStats] = useState({ total: 0, active: 0 });
  const [inventorySummary, setInventorySummary] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);   // daily chart data
  const [attendanceSummary, setAttendanceSummary] = useState({ total: 0, present: 0, absent: 0, leave: 0 });
  const [topAttendees, setTopAttendees] = useState([]);        // leaderboard

  useEffect(() => { fetchAnalytics(); }, [selectedMonth]); // eslint-disable-line

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      // Date range for inventory summary
      const [year, month] = selectedMonth.split('-').map(Number);
      const fromDate = `${selectedMonth}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const toDate = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`;

      // ── Fetch all data in parallel ──────────────────────────────────────────
      const [empRes, ownerRes, attRes, invRes] = await Promise.allSettled([
        employeeService.getList(0, 200),
        ownerService.getList(0, 200),
        attendanceService.getList(0, 1000),
        inventoryService.getOverallSummary(fromDate, toDate),
      ]);

      // ── Employee stats ─────────────────────────────────────────────────────
      const employees = empRes.status === 'fulfilled' ? (empRes.value?.content || []) : [];
      setEmployeeStats({
        total: employees.length,
        active: employees.filter(e => e.status === 'ACTIVE').length,
        inactive: employees.filter(e => e.status === 'INACTIVE').length,
        onLeave: employees.filter(e => e.status === 'ON_LEAVE').length,
      });

      // ── Owner stats ────────────────────────────────────────────────────────
      const owners = ownerRes.status === 'fulfilled' ? (ownerRes.value?.content || []) : [];
      setOwnerStats({
        total: owners.length,
        active: owners.filter(o => o.ownerStatus === 'ACTIVE').length,
      });

      // ── Inventory summary ──────────────────────────────────────────────────
      if (invRes.status === 'fulfilled' && invRes.value) {
        setInventorySummary(invRes.value);
      }

      // ── Attendance processing ──────────────────────────────────────────────
      const attList = attRes.status === 'fulfilled' ? (attRes.value?.content || []) : [];

      // Filter by selected month
      const monthRecords = attList.filter(r => {
        const d = (r.attendanceDate || '').toString();
        return d.startsWith(selectedMonth);
      });

      // Daily breakdown for bar chart
      const dailyMap = {};
      monthRecords.forEach(r => {
        const day = (r.attendanceDate || '').toString().slice(-2);
        if (!day) return;
        if (!dailyMap[day]) dailyMap[day] = { day, present: 0, absent: 0, leave: 0 };
        if (r.status === 'PRESENT') dailyMap[day].present++;
        else if (r.status === 'ABSENT') dailyMap[day].absent++;
        else dailyMap[day].leave++;
      });
      setAttendanceData(
        Object.values(dailyMap).sort((a, b) => parseInt(a.day) - parseInt(b.day))
      );

      // Summary totals
      const totalPresent = monthRecords.filter(r => r.status === 'PRESENT').length;
      const totalAbsent = monthRecords.filter(r => r.status === 'ABSENT').length;
      const totalLeave = monthRecords.filter(r => r.status !== 'PRESENT' && r.status !== 'ABSENT').length;
      setAttendanceSummary({
        total: monthRecords.length,
        present: totalPresent,
        absent: totalAbsent,
        leave: totalLeave,
      });

      // Attendance leaderboard: group by employeeName, count PRESENT days
      const empPresent = {};
      monthRecords.forEach(r => {
        if (r.status === 'PRESENT') {
          const name = r.employeeName || `Emp #${r.employeeId}`;
          empPresent[name] = (empPresent[name] || 0) + 1;
        }
      });
      const leaderboard = Object.entries(empPresent)
        .map(([name, count]) => ({ name, days: count }))
        .sort((a, b) => b.days - a.days)
        .slice(0, 8);
      setTopAttendees(leaderboard);

    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <MainLayout><Loading text="Loading analytics..." /></MainLayout>;

  const attendanceRate = attendanceSummary.total > 0
    ? Math.round((attendanceSummary.present / attendanceSummary.total) * 100)
    : 0;

  const employeeStatusData = [
    { name: 'Active', value: employeeStats.active },
    { name: 'Inactive', value: employeeStats.inactive },
    { name: 'On Leave', value: employeeStats.onLeave },
  ].filter(d => d.value > 0);

  const inventoryBarData = inventorySummary ? [
    { name: 'This Month', received: inventorySummary.totalSareesReceived ?? 0, returned: inventorySummary.totalSareesReturned ?? 0, inHand: inventorySummary.sareesInHand ?? 0 },
  ] : [];

  return (
    <MainLayout>
      <div className="space-y-6 pb-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">📊 Analytics & Reports</h1>
            <p className="text-gray-500 mt-1">Real-time insights from your ERP data</p>
          </div>
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
            </div>
            <Button onClick={fetchAnalytics} variant="outline">
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchAnalytics} />}

        {/* ── Key Metrics ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Employees', value: employeeStats.total, sub: `${employeeStats.active} active`, icon: Users, color: 'indigo' },
            { label: 'Attendance Rate', value: `${attendanceRate}%`, sub: `${attendanceSummary.present} present days`, icon: UserCheck, color: 'emerald' },
            { label: 'Total Owners', value: ownerStats.total, sub: `${ownerStats.active} active`, icon: Building2, color: 'violet' },
            { label: 'Sarees In Hand', value: inventorySummary?.sareesInHand ?? '—', sub: 'Current stock', icon: Package, color: 'amber' },
          ].map((m, i) => {
            const colors = {
              indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
              emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
              violet: 'bg-violet-50 text-violet-600 border-violet-100',
              amber: 'bg-amber-50 text-amber-600 border-amber-100',
            };
            return (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colors[m.color]}`}>
                    <m.icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                <p className="text-sm font-medium text-gray-500 mt-0.5">{m.label}</p>
                <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ── Attendance Summary Row ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Present Days', value: attendanceSummary.present, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: UserCheck },
            { label: 'Absent Days', value: attendanceSummary.absent, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: UserX },
            { label: 'Leave / Half Day', value: attendanceSummary.leave, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock },
            { label: 'Total Records', value: attendanceSummary.total, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: TrendingUp },
          ].map((s, i) => (
            <div key={i} className={`rounded-2xl p-4 border ${s.bg} ${s.border} flex items-center gap-4`}>
              <div className={`w-10 h-10 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Daily Attendance Chart ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Daily Attendance Trend</h3>
            <p className="text-sm text-gray-500">{selectedMonth} — Present / Absent / Leave per day</p>
          </div>
          <div className="p-5">
            {attendanceData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 text-3xl">📅</div>
                <p className="text-gray-500 font-medium">No attendance records for {selectedMonth}</p>
                <p className="text-xs text-gray-400 mt-1">Mark attendance for employees to see data here</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={attendanceData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="present" stackId="a" fill={COLORS.present} name="Present" />
                  <Bar dataKey="absent" stackId="a" fill={COLORS.absent} name="Absent" />
                  <Bar dataKey="leave" stackId="a" fill={COLORS.leave} name="Leave" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Employee Status + Inventory ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Employee Status Pie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Workforce Status</h3>
              <p className="text-sm text-gray-500">Employee distribution by status</p>
            </div>
            <div className="p-5">
              {employeeStats.total === 0 ? (
                <div className="flex items-center justify-center py-12 text-gray-400">No employee data</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={employeeStatusData}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        <Cell fill={COLORS.active} />
                        <Cell fill={COLORS.inactive} />
                        <Cell fill={COLORS.onLeave} />
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-2">
                    {[
                      { label: 'Active', val: employeeStats.active, color: 'bg-indigo-500' },
                      { label: 'Inactive', val: employeeStats.inactive, color: 'bg-gray-400' },
                      { label: 'On Leave', val: employeeStats.onLeave, color: 'bg-amber-400' },
                    ].map((l, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className={`w-3 h-3 rounded-full ${l.color}`} />
                        <span className="text-gray-600">{l.label}: <strong>{l.val}</strong></span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Inventory Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Inventory Flow</h3>
              <p className="text-sm text-gray-500">{selectedMonth} — Sarees received vs returned</p>
            </div>
            <div className="p-5">
              {!inventorySummary ? (
                <div className="flex items-center justify-center py-12 text-gray-400">No inventory data</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={inventoryBarData} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="received" fill={COLORS.received} name="Received" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="returned" fill={COLORS.returned} name="Returned" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                      { label: 'Received', value: inventorySummary.totalSareesReceived ?? 0, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                      { label: 'Returned', value: inventorySummary.totalSareesReturned ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { label: 'In Hand', value: inventorySummary.sareesInHand ?? 0, color: 'text-amber-600', bg: 'bg-amber-50' },
                    ].map((s, i) => (
                      <div key={i} className={`rounded-xl p-3 ${s.bg} text-center`}>
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-500">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Attendance Leaderboard ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Attendance Leaderboard</h3>
              <p className="text-sm text-gray-500">Top performers by present days — {selectedMonth}</p>
            </div>
          </div>
          <div className="p-5">
            {topAttendees.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="font-medium">No attendance data for this month</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topAttendees.map((emp, i) => {
                  const maxDays = topAttendees[0]?.days || 1;
                  const pct = Math.round((emp.days / maxDays) * 100);
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-8 text-center text-lg font-bold text-gray-400">
                        {i < 3 ? medals[i] : `#${i + 1}`}
                      </div>
                      <div className="w-32 truncate text-sm font-semibold text-gray-800">{emp.name}</div>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: i === 0
                                ? 'linear-gradient(90deg,#6366f1,#8b5cf6)'
                                : i === 1
                                ? 'linear-gradient(90deg,#10b981,#34d399)'
                                : '#94a3b8',
                            }}
                          />
                        </div>
                      </div>
                      <div className="w-20 text-right text-sm font-bold text-gray-700">
                        {emp.days} day{emp.days !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
