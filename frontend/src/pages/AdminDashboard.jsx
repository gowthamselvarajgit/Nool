import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Button, Badge } from '../components/Common';
import {
  Users, TrendingUp, DollarSign, Activity, AlertCircle, ArrowUpRight,
  Briefcase, ChevronRight, CheckCircle, XCircle, Wifi, Database, Monitor, RefreshCw
} from 'lucide-react';
import { dashboardService, leaveProductivityService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const today = new Date().toISOString().split('T')[0];
const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

const fmt = (n) => (n || 0).toLocaleString('en-IN');

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, sub, color = 'primary' }) => {
  const colors = {
    primary: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', grad: 'from-indigo-400 to-indigo-600' },
    success: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', grad: 'from-emerald-400 to-emerald-600' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', grad: 'from-amber-400 to-amber-600' },
    info: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', grad: 'from-blue-400 to-blue-600' },
    danger: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', grad: 'from-rose-400 to-rose-600' },
  };
  const c = colors[color];
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${c.grad} opacity-10 blur-xl group-hover:opacity-20 transition-opacity`} />
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} ${c.text} border ${c.border}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {sub && <p className="text-xs text-gray-500 flex items-center gap-1"><ArrowUpRight className="w-3 h-3 text-emerald-500" />{sub}</p>}
    </div>
  );
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const Tooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map((e, i) => (
        <p key={i} style={{ color: e.color }} className="font-medium">
          {e.name}: {e.value}
        </p>
      ))}
    </div>
  );
};

// ── System Health Card ────────────────────────────────────────────────────────
const SystemDiagnostics = ({ backendOk, dbOk, lastSync, loadTime }) => {
  const items = [
    { label: 'Frontend', ok: true, icon: Monitor, detail: 'React App Running' },
    { label: 'Backend API', ok: backendOk, icon: Wifi, detail: backendOk ? 'Connected' : 'Unreachable' },
    { label: 'Database', ok: dbOk, icon: Database, detail: dbOk ? 'Data Flowing' : 'No Response' },
  ];
  const allOk = backendOk && dbOk;
  return (
    <div className={`rounded-2xl p-5 border ${allOk ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${allOk ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <h3 className="font-bold text-gray-800">System Diagnostics</h3>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${allOk ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {allOk ? '✓ All Systems Operational' : '⚠ Issues Detected'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {items.map(({ label, ok, icon: Icon, detail }) => (
          <div key={label} className={`rounded-xl p-3 border text-center ${ok ? 'bg-white border-emerald-200' : 'bg-white border-rose-200'}`}>
            <div className={`w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center ${ok ? 'bg-emerald-100' : 'bg-rose-100'}`}>
              <Icon className={`w-4 h-4 ${ok ? 'text-emerald-600' : 'text-rose-600'}`} />
            </div>
            <p className="text-xs font-semibold text-gray-700">{label}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              {ok ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-rose-500" />}
              <p className="text-xs text-gray-500">{detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
        <span>Last sync: {lastSync || '—'}</span>
        {loadTime && <span>Load time: {loadTime}ms</span>}
      </div>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [workforce, setWorkforce] = useState(null);
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendOk, setBackendOk] = useState(false);
  const [dbOk, setDbOk] = useState(false);
  const [lastSync, setLastSync] = useState('');
  const [loadTime, setLoadTime] = useState(null);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    const t0 = Date.now();
    setLoading(true);
    setError('');
    try {
      // Main summary
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
        pendingSalary: Math.max(0, data.pendingSalary || 0),
      });
      setBackendOk(true);
      setDbOk(true);
    } catch (err) {
      setError(err.message);
      setBackendOk(false);
      setDbOk(false);
    }

    // Workforce analytics
    try {
      const wf = await dashboardService.getWorkforceAnalytics(firstOfMonth, today);
      setWorkforce(wf);
    } catch (_) {}

    // Leave & productivity
    try {
      const lp = await leaveProductivityService.getEmployeeLeaveProductivity(firstOfMonth, today);
      setLeaveData(Array.isArray(lp) ? lp : []);
    } catch (_) { setLeaveData([]); }

    setLastSync(new Date().toLocaleTimeString('en-IN'));
    setLoadTime(Date.now() - t0);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Chart data
  const workChart = [
    { name: 'Today', Fresh: summary?.todayFreshWork || 0, RePolish: summary?.todayRepolishWork || 0 },
    { name: 'This Month', Fresh: summary?.monthFreshWork || 0, RePolish: summary?.monthRepolishWork || 0 },
  ];

  const inventoryChart = [
    { name: 'In Hand', value: summary?.sareesInHand || 0, color: '#10b981' },
    { name: 'Returned', value: summary?.totalSareesReturned || 0, color: '#6366f1' },
  ];

  const salaryPct = (summary?.totalSalaryPaid || summary?.pendingSalary)
    ? Math.round(((summary?.totalSalaryPaid || 0) / ((summary?.totalSalaryPaid || 0) + (summary?.pendingSalary || 0))) * 100)
    : 0;

  return (
    <MainLayout>
      <div className="space-y-6 pb-8">

        {/* Header */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">Real-time business overview — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <Button onClick={fetchAll} variant="outline" className="flex items-center gap-2 text-sm">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <p className="text-rose-700 text-sm">{error}</p>
          </div>
        )}

        {/* System Diagnostics */}
        <SystemDiagnostics backendOk={backendOk} dbOk={dbOk} lastSync={lastSync} loadTime={loadTime} />

        {loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <>
            {/* KPI Row 1 — Workforce & Work */}
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard title="Total Employees" value={summary?.totalEmployees} icon={Users}
                sub={`${summary?.activeEmployees} active`} color="primary" />
              <StatCard title="Today Fresh Sarees" value={summary?.todayFreshWork} icon={Briefcase}
                sub={`Month: ${summary?.monthFreshWork}`} color="success" />
              <StatCard title="Today Revenue" value={`₹${fmt(summary?.todayRevenue)}`} icon={DollarSign}
                sub={`Month: ₹${fmt(summary?.monthRevenue)}`} color="info" />
              <StatCard title="Sarees In Hand" value={summary?.sareesInHand} icon={Activity}
                sub={`${summary?.totalSareesReceived} received total`} color="warning" />
            </div>

            {/* KPI Row 2 — Salary */}
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard title="Total Revenue (All)" value={`₹${fmt(summary?.totalRevenue)}`} icon={TrendingUp} color="success" />
              <StatCard title="Salary Paid" value={`₹${fmt(summary?.totalSalaryPaid)}`} icon={DollarSign} color="info" />
              <StatCard title="Pending Salary" value={`₹${fmt(summary?.pendingSalary)}`} icon={AlertCircle} color="danger" />
              <StatCard title="Re-Polish Today" value={summary?.todayRepolishWork} icon={Activity}
                sub={`Month: ${summary?.monthRepolishWork}`} color="warning" />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Polishing Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800">Saree Polishing Overview</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Fresh vs Re-polish — Today & This Month</p>
                </div>
                <div className="p-5 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workChart} barSize={36} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <RechartsTip content={<Tooltip />} cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="Fresh" fill="#6366f1" radius={[6,6,0,0]} name="Fresh" />
                      <Bar dataKey="RePolish" fill="#f59e0b" radius={[6,6,0,0]} name="Re-Polish" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-6 px-5 pb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600"><span className="w-3 h-3 rounded bg-indigo-500" />Fresh</div>
                  <div className="flex items-center gap-2 text-xs text-gray-600"><span className="w-3 h-3 rounded bg-amber-400" />Re-Polish</div>
                </div>
              </div>

              {/* Inventory Pie */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800">Inventory Status</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Saree distribution</p>
                </div>
                <div className="p-5 h-64 relative">
                  {(summary?.sareesInHand || summary?.totalSareesReturned) ? (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={inventoryChart} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                            paddingAngle={4} dataKey="value" stroke="none">
                            {inventoryChart.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <RechartsTip content={<Tooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-gray-800">{summary?.totalSareesReceived}</span>
                        <span className="text-xs text-gray-500">Total In</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Activity className="w-10 h-10 mb-2 opacity-30" />
                      <p className="text-sm">No inventory data</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-4 px-5 pb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600"><span className="w-3 h-3 rounded-full bg-emerald-500" />In Hand: {summary?.sareesInHand}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-600"><span className="w-3 h-3 rounded-full bg-indigo-500" />Returned: {summary?.totalSareesReturned}</div>
                </div>
              </div>
            </div>

            {/* Salary Progress + Workforce + Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Salary Card */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800">Salary Overview</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                      <p className="text-xs text-emerald-700 font-medium mb-1">Paid</p>
                      <p className="text-2xl font-bold text-emerald-800">₹{fmt(summary?.totalSalaryPaid)}</p>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                      <p className="text-xs text-rose-700 font-medium mb-1">Pending</p>
                      <p className="text-2xl font-bold text-rose-800">₹{fmt(summary?.pendingSalary)}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Payment Progress</span><span>{salaryPct}% paid</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${salaryPct}%` }} />
                    </div>
                  </div>

                  {/* Workforce from analytics */}
                  {workforce && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Today's Workforce</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
                          <p className="text-lg font-bold text-emerald-700">{workforce.employeesPresentToday || 0}</p>
                          <p className="text-xs text-gray-500">Present</p>
                        </div>
                        <div className="bg-rose-50 rounded-lg p-3 text-center border border-rose-100">
                          <p className="text-lg font-bold text-rose-700">{workforce.employeesAbsentToday || 0}</p>
                          <p className="text-xs text-gray-500">Absent</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg">
                  <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-200" /> Today's Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-indigo-200">Fresh</span><span className="font-bold">{summary?.todayFreshWork}</span></div>
                    <div className="flex justify-between"><span className="text-indigo-200">Re-Polish</span><span className="font-bold">{summary?.todayRepolishWork}</span></div>
                    <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                      <span className="text-indigo-200">Revenue</span>
                      <span className="font-bold">₹{fmt(summary?.todayRevenue)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-sm">Quick Actions</h3>
                  </div>
                  <div className="p-2">
                    {[
                      { label: 'Manage Employees', color: 'text-indigo-600', bg: 'bg-indigo-50', action: () => navigate('/admin/employees') },
                      { label: 'Pay Salary', color: 'text-emerald-600', bg: 'bg-emerald-50', action: () => navigate('/admin/salary') },
                      { label: 'Add Daily Work', color: 'text-amber-600', bg: 'bg-amber-50', action: () => navigate('/admin/daily-work') },
                      { label: 'Saree Inventory', color: 'text-purple-600', bg: 'bg-purple-50', action: () => navigate('/admin/inventory') },
                    ].map((a, i) => (
                      <button key={i} onClick={a.action}
                        className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors group text-left">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.bg}`}>
                          <ChevronRight className={`w-4 h-4 ${a.color}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{a.label}</span>
                        <ChevronRight className="w-3 h-3 ml-auto text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Leave & Productivity Table */}
            {leaveData.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800">Employee Leave & Productivity (This Month)</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Attendance, work counts and productivity scores</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Employee','Present','Absent','Fresh','Re-Polish','Productivity'].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {leaveData.map((row) => (
                        <tr key={row.employeeId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 font-medium text-gray-900">{row.employeeName}</td>
                          <td className="px-5 py-3 text-emerald-600 font-semibold">{row.presentDays}</td>
                          <td className="px-5 py-3 text-rose-600 font-semibold">{row.absentDays}</td>
                          <td className="px-5 py-3 text-indigo-600 font-semibold">{row.totalFreshWork}</td>
                          <td className="px-5 py-3 text-amber-600 font-semibold">{row.totalRePolish}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-20">
                                <div className="bg-indigo-500 h-1.5 rounded-full"
                                  style={{ width: `${Math.min(100, row.productivityScore || 0)}%` }} />
                              </div>
                              <span className="text-xs font-semibold text-gray-600">
                                {(row.productivityScore || 0).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
