import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '../components/Layout';
import {
  Card, Button, Input, Select, Modal, Loading, ErrorMessage, EmptyState,
} from '../components/Common';
import { useAuth } from '../hooks/useAuth';
import { salaryService, employeeService } from '../services/api';
import { formatDate } from '../utils/formatters';
import { exportToExcel } from '../utils/excelExporter';
import {
  Wallet, TrendingUp, RefreshCw, Download, Plus, ChevronRight,
  CheckCircle2, AlertCircle, Search, Users, IndianRupee,
} from 'lucide-react';

const todayIso = () => new Date().toISOString().split('T')[0];
const inr = (n) => `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const SalaryPage = () => {
  const { user } = useAuth();
  const isWorker = user?.role === 'WORKER';
  return isWorker ? <WorkerView /> : <AdminView />;
};

/* ────────────────────────────────────────────────────────────────────────
   ADMIN VIEW — per-employee cards with auto earnings + running balance
   ──────────────────────────────────────────────────────────────────────── */
const AdminView = () => {
  const today = todayIso();
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Pay Salary modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payForm, setPayForm] = useState({
    employeeId: '', fromDate: firstOfMonth, toDate: today, amountPaid: '',
    paymentDate: today, paymentMode: 'CASH', remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Detail drawer (history)
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  async function fetchAll() {
    try {
      setLoading(true);
      setError('');
      const data = await salaryService.getAllEmployeesSummary();
      setSummaries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(emp) {
    setSelectedEmployee(emp);
    setShowDetailModal(true);
    setHistory([]);
    try {
      setHistoryLoading(true);
      const res = await salaryService.getEmployeeHistory(emp.employeeId, 0, 200);
      setHistory(res?.content || []);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  }

  function openPay(emp = null) {
    setPayForm({
      employeeId: emp ? String(emp.employeeId) : '',
      fromDate: firstOfMonth,
      toDate: today,
      amountPaid: emp ? String(Math.round(emp.pendingSalary || 0)) : '',
      paymentDate: today,
      paymentMode: 'CASH',
      remarks: '',
    });
    setModalError('');
    setShowPayModal(true);
  }

  async function submitPay() {
    const { employeeId, fromDate, toDate, amountPaid, paymentDate, paymentMode, remarks } = payForm;
    if (!employeeId) { setModalError('Please select an employee'); return; }
    if (!fromDate || !toDate) { setModalError('Please pick the period covered'); return; }
    const amt = parseFloat(amountPaid);
    if (!amt || amt <= 0) { setModalError('Amount must be greater than 0'); return; }
    if (!paymentDate) { setModalError('Please pick the payment date'); return; }
    try {
      setSubmitting(true);
      setModalError('');
      await salaryService.create({
        employeeId: parseInt(employeeId, 10),
        fromDate, toDate, amountPaid: amt,
        paymentDate, paymentMode, remarks: remarks || null,
      });
      setShowPayModal(false);
      await fetchAll();
      if (showDetailModal && selectedEmployee?.employeeId === parseInt(employeeId)) {
        await openDetail(selectedEmployee);
      }
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Filtered + sorted: those owing money first
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return summaries
      .filter(s => !q || (s.employeeName || '').toLowerCase().includes(q))
      .sort((a, b) => (b.pendingSalary || 0) - (a.pendingSalary || 0));
  }, [summaries, search]);

  const totals = summaries.reduce((acc, s) => ({
    earned: acc.earned + (s.totalEarnings || 0),
    paid: acc.paid + (s.totalSalaryPaid || 0),
    pending: acc.pending + (s.pendingSalary || 0),
    withDues: acc.withDues + ((s.pendingSalary || 0) > 0 ? 1 : 0),
  }), { earned: 0, paid: 0, pending: 0, withDues: 0 });

  if (loading) return <MainLayout><Loading text="Loading salary data..." /></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">💰 Salary</h1>
            <p className="text-gray-500 mt-1">Each employee's earnings, payments, and what's still owed</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={fetchAll}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Button onClick={() => openPay(null)}>
              <Plus className="w-4 h-4 mr-1" /> Pay Salary
            </Button>
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchAll} />}

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: TrendingUp, color: 'indigo', label: 'Total Earned', value: inr(totals.earned), sub: 'All employees, all-time' },
            { icon: CheckCircle2, color: 'emerald', label: 'Total Paid', value: inr(totals.paid), sub: 'Salary disbursed' },
            { icon: AlertCircle, color: 'amber', label: 'Total To Pay', value: inr(totals.pending), sub: 'Pending across employees' },
            { icon: Users, color: 'purple', label: 'Employees With Dues', value: totals.withDues, sub: `out of ${summaries.length}` },
          ].map((s, i) => {
            const clr = {
              indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-600', border: 'border-indigo-100' },
              emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-600', border: 'border-emerald-100' },
              amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-600', border: 'border-amber-100' },
              purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-600', border: 'border-purple-100' },
            }[s.color];
            return (
              <div key={i} className={`rounded-2xl p-5 border ${clr.bg} ${clr.border}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white border ${clr.border} mb-3`}>
                  <s.icon className={`w-5 h-5 ${clr.icon}`} />
                </div>
                <p className={`text-2xl md:text-3xl font-bold ${clr.text}`}>{s.value}</p>
                <p className="text-sm font-semibold text-gray-700 mt-1">{s.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search employee by name..."
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>

        {/* Employee cards */}
        {!visible.length ? (
          <EmptyState message="No employees found" icon="💰" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visible.map(s => {
              const pending = s.pendingSalary || 0;
              const settled = pending <= 0;
              const earned = s.totalEarnings || 0;
              const paid = s.totalSalaryPaid || 0;
              return (
                <div
                  key={s.employeeId}
                  className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-4 ${
                    settled ? 'border-gray-200' : 'border-amber-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openDetail(s)}
                    className="flex items-start justify-between text-left w-full group"
                  >
                    <div>
                      <p className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                        {s.employeeName}
                      </p>
                      <p className="text-sm text-gray-500">Tap to view payment history</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                  </button>

                  {/* Money rows */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 px-3 bg-indigo-50/50 rounded-lg">
                      <span className="text-sm text-indigo-700 font-medium">Total Earned</span>
                      <span className="font-bold text-indigo-700">{inr(earned)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-emerald-50/50 rounded-lg">
                      <span className="text-sm text-emerald-700 font-medium">Already Paid</span>
                      <span className="font-bold text-emerald-700">{inr(paid)}</span>
                    </div>
                    <div className={`flex items-center justify-between py-3 px-3 rounded-lg border-2 ${
                      settled ? 'bg-gray-50 border-gray-100' : 'bg-amber-50 border-amber-200'
                    }`}>
                      <span className={`text-sm font-bold ${settled ? 'text-gray-500' : 'text-amber-800'}`}>
                        {settled ? '✓ All paid up' : 'Need to Pay'}
                      </span>
                      <span className={`text-2xl font-bold ${settled ? 'text-gray-400' : 'text-amber-700'}`}>
                        {settled ? '—' : inr(pending)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openDetail(s)}
                      className="flex-1 flex items-center justify-center gap-1 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors border border-gray-200"
                    >
                      View History
                    </button>
                    <button
                      onClick={() => openPay(s)}
                      disabled={pending <= 0}
                      className="flex-1 flex items-center justify-center gap-1 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors border border-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <IndianRupee className="w-4 h-4" /> Pay Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Pay Salary Modal ── */}
      <Modal
        isOpen={showPayModal}
        onClose={() => { setShowPayModal(false); setModalError(''); }}
        title="💰 Pay Salary"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Employee *</label>
            <select
              value={payForm.employeeId}
              onChange={e => {
                const id = e.target.value;
                const emp = summaries.find(s => String(s.employeeId) === id);
                setPayForm(f => ({ ...f, employeeId: id, amountPaid: emp ? String(Math.round(emp.pendingSalary || 0)) : '' }));
              }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              <option value="">Select employee...</option>
              {summaries.map(s => (
                <option key={s.employeeId} value={String(s.employeeId)}>
                  {s.employeeName} {(s.pendingSalary || 0) > 0 ? `(${inr(s.pendingSalary)} pending)` : '(paid up)'}
                </option>
              ))}
            </select>
          </div>

          {payForm.employeeId && (() => {
            const emp = summaries.find(s => String(s.employeeId) === payForm.employeeId);
            return emp ? (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-indigo-50 rounded-lg p-2.5">
                  <p className="text-xs text-indigo-600 font-medium">Earned</p>
                  <p className="text-lg font-bold text-indigo-700">{inr(emp.totalEarnings)}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-2.5">
                  <p className="text-xs text-emerald-600 font-medium">Paid</p>
                  <p className="text-lg font-bold text-emerald-700">{inr(emp.totalSalaryPaid)}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-2.5">
                  <p className="text-xs text-amber-600 font-medium">Pending</p>
                  <p className="text-lg font-bold text-amber-700">{inr(emp.pendingSalary)}</p>
                </div>
              </div>
            ) : null;
          })()}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Period: From *" type="date" value={payForm.fromDate}
              onChange={e => setPayForm(f => ({ ...f, fromDate: e.target.value }))} required
            />
            <Input
              label="Period: To *" type="date" value={payForm.toDate}
              onChange={e => setPayForm(f => ({ ...f, toDate: e.target.value }))} required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount to Pay (₹) *" type="number" min="1" value={payForm.amountPaid}
              onChange={e => setPayForm(f => ({ ...f, amountPaid: e.target.value }))} placeholder="0" required
            />
            <Input
              label="Payment Date *" type="date" value={payForm.paymentDate}
              onChange={e => setPayForm(f => ({ ...f, paymentDate: e.target.value }))} required
            />
          </div>

          <Select
            label="Payment Mode" value={payForm.paymentMode}
            onChange={e => setPayForm(f => ({ ...f, paymentMode: e.target.value }))}
            options={[
              { value: 'CASH', label: 'Cash' },
              { value: 'ONLINE', label: 'Online Transfer' },
              { value: 'CHEQUE', label: 'Cheque' },
            ]}
          />

          <Input
            label="Notes (optional)" value={payForm.remarks}
            onChange={e => setPayForm(f => ({ ...f, remarks: e.target.value }))}
            placeholder="Any reference number, comment..."
          />

          {modalError && <p className="text-red-600 text-sm">{modalError}</p>}

          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={submitPay} isLoading={submitting}>Record Payment</Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowPayModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* ── Employee Detail / History Modal ── */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedEmployee(null); setHistory([]); }}
        title={selectedEmployee ? `💼 ${selectedEmployee.employeeName} — Payment History` : ''}
        size="lg"
      >
        {selectedEmployee && (
          <div className="space-y-4">
            {/* Top stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <p className="text-xs text-indigo-600 font-medium mb-1">Total Earned</p>
                <p className="text-xl font-bold text-indigo-700">{inr(selectedEmployee.totalEarnings)}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-xs text-emerald-600 font-medium mb-1">Already Paid</p>
                <p className="text-xl font-bold text-emerald-700">{inr(selectedEmployee.totalSalaryPaid)}</p>
              </div>
              <div className={`rounded-xl p-4 text-center ${
                (selectedEmployee.pendingSalary || 0) > 0 ? 'bg-amber-50' : 'bg-gray-50'
              }`}>
                <p className={`text-xs font-medium mb-1 ${
                  (selectedEmployee.pendingSalary || 0) > 0 ? 'text-amber-600' : 'text-gray-500'
                }`}>Need to Pay</p>
                <p className={`text-xl font-bold ${
                  (selectedEmployee.pendingSalary || 0) > 0 ? 'text-amber-700' : 'text-gray-400'
                }`}>{(selectedEmployee.pendingSalary || 0) > 0 ? inr(selectedEmployee.pendingSalary) : '—'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={(selectedEmployee.pendingSalary || 0) <= 0}
                onClick={() => { setShowDetailModal(false); openPay(selectedEmployee); }}
              >
                <IndianRupee className="w-4 h-4 mr-1" /> Pay Now
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                disabled={!history.length}
                onClick={() => {
                  // Build sorted-asc list with running cumulative paid
                  const sortedAsc = [...history].sort((a, b) => (a.paymentDate || '').localeCompare(b.paymentDate || ''));
                  let cum = 0;
                  const rows = sortedAsc.map((p, i) => {
                    cum += p.amountPaid || 0;
                    return {
                      '#': i + 1,
                      'Payment Date': p.paymentDate ? formatDate(p.paymentDate) : '',
                      'Amount Paid (₹)': p.amountPaid ?? 0,
                      'Cumulative Paid (₹)': cum,
                      'Period From': p.fromDate ? formatDate(p.fromDate) : '',
                      'Period To': p.toDate ? formatDate(p.toDate) : '',
                      'Mode': p.paymentMode || '',
                      'Notes': p.remarks || '',
                    };
                  });
                  exportToExcel({
                    rows,
                    fileName: `Nool_Salary_${selectedEmployee.employeeName.replace(/\s+/g, '_')}`,
                    sheetName: 'Payment History',
                    columnWidths: [4, 14, 16, 18, 14, 14, 12, 24],
                  });
                }}
              >
                <Download className="w-4 h-4 mr-1" /> Export
              </Button>
            </div>

            {/* History table */}
            <div>
              <p className="font-semibold text-gray-700 mb-2">All Payments</p>
              {historyLoading ? (
                <p className="text-sm text-gray-400 text-center py-4">Loading history...</p>
              ) : !history.length ? (
                <p className="text-sm text-gray-400 italic text-center py-6">No payments made yet</p>
              ) : (() => {
                // Sort ascending for running cumulative, then reverse for display
                const sortedAsc = [...history].sort((a, b) => (a.paymentDate || '').localeCompare(b.paymentDate || ''));
                let cum = 0;
                const withCum = sortedAsc.map(p => {
                  cum += p.amountPaid || 0;
                  return { ...p, cumulativePaid: cum };
                });
                const displayed = [...withCum].reverse();
                return (
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
                            <th className="px-3 py-2 text-left">Date Paid</th>
                            <th className="px-3 py-2 text-right">Amount</th>
                            <th className="px-3 py-2 text-left">For Period</th>
                            <th className="px-3 py-2 text-left">Mode</th>
                            <th className="px-3 py-2 text-right">Paid So Far</th>
                            <th className="px-3 py-2 text-left">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {displayed.map(p => (
                            <tr key={p.salaryPaymentId} className="hover:bg-gray-50">
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{formatDate(p.paymentDate)}</td>
                              <td className="px-3 py-2.5 text-right font-bold text-emerald-700">{inr(p.amountPaid)}</td>
                              <td className="px-3 py-2.5 text-gray-600 text-xs">
                                {p.fromDate ? formatDate(p.fromDate) : '—'} → {p.toDate ? formatDate(p.toDate) : '—'}
                              </td>
                              <td className="px-3 py-2.5">
                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                                  {p.paymentMode}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-right text-gray-700">{inr(p.cumulativePaid)}</td>
                              <td className="px-3 py-2.5 text-gray-500 text-xs max-w-[180px] truncate" title={p.remarks || ''}>
                                {p.remarks || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-4 py-2 bg-amber-50/50 border-t border-amber-100 text-xs text-gray-600">
                      <strong className="text-amber-700">Paid So Far</strong> is the running total of all payments up to and including that row.
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   WORKER VIEW — read-only history with cumulative paid
   ──────────────────────────────────────────────────────────────────────── */
const WorkerView = () => {
  const today = todayIso();
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  async function fetchData() {
    try {
      setLoading(true);
      setError('');
      const me = await employeeService.getMe();
      setProfile(me);

      const [s, h] = await Promise.all([
        salaryService.getMySummary(firstOfMonth, today).catch(() => null),
        salaryService.getMyHistory(0, 100).catch(() => ({ content: [] })),
      ]);
      setSummary(s);
      setHistory(h?.content || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <MainLayout><Loading text="Loading your salary..." /></MainLayout>;

  // Running cumulative for the table
  const sortedAsc = [...history].sort((a, b) => (a.paymentDate || '').localeCompare(b.paymentDate || ''));
  let cum = 0;
  const withCum = sortedAsc.map(p => {
    cum += p.amountPaid || 0;
    return { ...p, cumulativePaid: cum };
  });
  const totalPaidAllTime = withCum.length ? withCum[withCum.length - 1].cumulativePaid : 0;
  const displayed = [...withCum].reverse();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">💰 My Salary</h1>
          <p className="text-gray-500 mt-1">Your earnings and payment history</p>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchData} />}

        {/* Profile + Summary */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase">Employee</p>
              <p className="text-xl font-bold text-gray-900">{profile?.employeeName}</p>
              <p className="text-sm text-gray-500 mt-1">Rate: ₹{profile?.polishingRate}/saree</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white rounded-xl p-4 text-center min-w-[120px]">
                <p className="text-xs text-indigo-600 font-medium mb-1">Earned (this month)</p>
                <p className="text-xl font-bold text-indigo-700">{inr(summary?.totalEarnings)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center min-w-[120px]">
                <p className="text-xs text-emerald-600 font-medium mb-1">Paid (this month)</p>
                <p className="text-xl font-bold text-emerald-700">{inr(summary?.totalSalaryPaid)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center min-w-[120px]">
                <p className="text-xs text-amber-600 font-medium mb-1">Pending</p>
                <p className="text-xl font-bold text-amber-700">{inr(summary?.pendingSalary)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* History */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Payment History</h2>
              <p className="text-sm text-gray-500">All payments you've received · total: {inr(totalPaidAllTime)}</p>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => exportToExcel({
                  rows: withCum.map((p, i) => ({
                    '#': i + 1,
                    'Payment Date': p.paymentDate ? formatDate(p.paymentDate) : '',
                    'Amount Paid (₹)': p.amountPaid ?? 0,
                    'Cumulative Paid (₹)': p.cumulativePaid,
                    'Period From': p.fromDate ? formatDate(p.fromDate) : '',
                    'Period To': p.toDate ? formatDate(p.toDate) : '',
                    'Mode': p.paymentMode || '',
                    'Notes': p.remarks || '',
                  })),
                  fileName: 'Nool_My_Salary',
                  sheetName: 'Salary History',
                  columnWidths: [4, 14, 16, 18, 14, 14, 12, 24],
                })}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-sm font-semibold transition-colors"
              >
                <Download className="w-4 h-4" /> Export
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-12">
              <EmptyState message="No salary payments yet" icon="💰" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Date Paid</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-left">For Period</th>
                    <th className="px-4 py-3 text-left">Mode</th>
                    <th className="px-4 py-3 text-right">Paid So Far</th>
                    <th className="px-4 py-3 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayed.map(p => (
                    <tr key={p.salaryPaymentId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatDate(p.paymentDate)}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">{inr(p.amountPaid)}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {p.fromDate ? formatDate(p.fromDate) : '—'} → {p.toDate ? formatDate(p.toDate) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                          {p.paymentMode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{inr(p.cumulativePaid)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate" title={p.remarks || ''}>
                        {p.remarks || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default SalaryPage;
