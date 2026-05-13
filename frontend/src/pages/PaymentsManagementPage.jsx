import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Button, Input, Select, Modal, Loading, ErrorMessage, EmptyState } from '../components/Common';
import { ownerPaymentService } from '../services/api';
import { formatDate } from '../utils/formatters';
import { exportToExcel } from '../utils/excelExporter';
import {
  CreditCard, RefreshCw, Plus, ChevronRight, CheckCircle2, AlertCircle,
  Search, Users, IndianRupee, TrendingUp, Download,
} from 'lucide-react';

const todayIso = () => new Date().toISOString().split('T')[0];
const inr = (n) => `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const PaymentsManagementPage = () => {
  const today = todayIso();

  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Pay modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payForm, setPayForm] = useState({
    ownerId: '', amountPaid: '', paymentDate: today, paymentMode: 'CASH', remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Detail drawer
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  async function fetchAll() {
    try {
      setLoading(true);
      setError('');
      const data = await ownerPaymentService.getAllOwnersSummary();
      setSummaries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(o) {
    setSelectedOwner(o);
    setShowDetailModal(true);
    setHistory([]);
    try {
      setHistoryLoading(true);
      const res = await ownerPaymentService.getOwnerHistory(o.ownerId, 0, 200);
      setHistory(res?.content || []);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  }

  function openPay(o = null) {
    setPayForm({
      ownerId: o ? String(o.ownerId) : '',
      amountPaid: o ? String(Math.round(o.pendingAmount || 0)) : '',
      paymentDate: today,
      paymentMode: 'CASH',
      remarks: '',
    });
    setModalError('');
    setShowPayModal(true);
  }

  async function submitPay() {
    const { ownerId, amountPaid, paymentDate, paymentMode, remarks } = payForm;
    if (!ownerId) { setModalError('Please select an owner'); return; }
    const amt = parseFloat(amountPaid);
    if (!amt || amt <= 0) { setModalError('Amount must be greater than 0'); return; }
    if (!paymentDate) { setModalError('Please pick the payment date'); return; }
    try {
      setSubmitting(true);
      setModalError('');
      await ownerPaymentService.create({
        ownerId: parseInt(ownerId),
        amountPaid: amt,
        paymentMode,
        paymentDate,
        remarks: remarks || null,
      });
      setShowPayModal(false);
      await fetchAll();
      if (showDetailModal && selectedOwner?.ownerId === parseInt(ownerId)) {
        await openDetail(selectedOwner);
      }
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Filtered + sorted (those owed most first)
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return summaries
      .filter(s => !q || (s.ownerName || '').toLowerCase().includes(q))
      .sort((a, b) => (b.pendingAmount || 0) - (a.pendingAmount || 0));
  }, [summaries, search]);

  const totals = summaries.reduce((acc, s) => ({
    payable: acc.payable + (s.totalAmountPayable || 0),
    paid: acc.paid + (s.totalAmountPaid || 0),
    pending: acc.pending + (s.pendingAmount || 0),
    withDues: acc.withDues + ((s.pendingAmount || 0) > 0 ? 1 : 0),
  }), { payable: 0, paid: 0, pending: 0, withDues: 0 });

  if (loading) return <MainLayout><Loading text="Loading payments..." /></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">💳 Owner Payments</h1>
            <p className="text-gray-500 mt-1">What each owner is owed, what we've paid, and what's still due</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={fetchAll}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Button onClick={() => openPay(null)}>
              <Plus className="w-4 h-4 mr-1" /> Record Payment
            </Button>
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchAll} />}

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: TrendingUp, color: 'indigo', label: 'Total Owed', value: inr(totals.payable), sub: 'Earned from returns × rate' },
            { icon: CheckCircle2, color: 'emerald', label: 'Total Paid', value: inr(totals.paid), sub: 'Across all owners' },
            { icon: AlertCircle, color: 'amber', label: 'Total To Pay', value: inr(totals.pending), sub: 'Still pending' },
            { icon: Users, color: 'purple', label: 'Owners With Dues', value: totals.withDues, sub: `out of ${summaries.length}` },
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
            placeholder="Search owner by name..."
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>

        {/* Owner cards */}
        {!visible.length ? (
          <EmptyState message="No owners found" icon="💳" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visible.map(s => {
              const pending = s.pendingAmount || 0;
              const settled = pending <= 0;
              const payable = s.totalAmountPayable || 0;
              const paid = s.totalAmountPaid || 0;
              return (
                <div
                  key={s.ownerId}
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
                        {s.ownerName}
                      </p>
                      <p className="text-sm text-gray-500">Tap to view payment history</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                  </button>

                  {/* Money rows */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 px-3 bg-indigo-50/50 rounded-lg">
                      <span className="text-sm text-indigo-700 font-medium">Total Owed</span>
                      <span className="font-bold text-indigo-700">{inr(payable)}</span>
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

      {/* ── Pay Modal ── */}
      <Modal
        isOpen={showPayModal}
        onClose={() => { setShowPayModal(false); setModalError(''); }}
        title="💳 Record Owner Payment"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Owner *</label>
            <select
              value={payForm.ownerId}
              onChange={e => {
                const id = e.target.value;
                const o = summaries.find(s => String(s.ownerId) === id);
                setPayForm(f => ({ ...f, ownerId: id, amountPaid: o ? String(Math.round(o.pendingAmount || 0)) : '' }));
              }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              <option value="">Select owner...</option>
              {summaries.map(s => (
                <option key={s.ownerId} value={String(s.ownerId)}>
                  {s.ownerName} {(s.pendingAmount || 0) > 0 ? `(${inr(s.pendingAmount)} pending)` : '(paid up)'}
                </option>
              ))}
            </select>
          </div>

          {payForm.ownerId && (() => {
            const o = summaries.find(s => String(s.ownerId) === payForm.ownerId);
            return o ? (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-indigo-50 rounded-lg p-2.5">
                  <p className="text-xs text-indigo-600 font-medium">Owed</p>
                  <p className="text-lg font-bold text-indigo-700">{inr(o.totalAmountPayable)}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-2.5">
                  <p className="text-xs text-emerald-600 font-medium">Paid</p>
                  <p className="text-lg font-bold text-emerald-700">{inr(o.totalAmountPaid)}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-2.5">
                  <p className="text-xs text-amber-600 font-medium">Pending</p>
                  <p className="text-lg font-bold text-amber-700">{inr(o.pendingAmount)}</p>
                </div>
              </div>
            ) : null;
          })()}

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
              { value: 'CASH', label: '💵 Cash' },
              { value: 'ONLINE', label: '📱 Online Transfer' },
              { value: 'CHEQUE', label: '🏦 Cheque' },
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

      {/* ── Detail / History Modal ── */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedOwner(null); setHistory([]); }}
        title={selectedOwner ? `💼 ${selectedOwner.ownerName} — Payment History` : ''}
        size="lg"
      >
        {selectedOwner && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <p className="text-xs text-indigo-600 font-medium mb-1">Total Owed</p>
                <p className="text-xl font-bold text-indigo-700">{inr(selectedOwner.totalAmountPayable)}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-xs text-emerald-600 font-medium mb-1">Already Paid</p>
                <p className="text-xl font-bold text-emerald-700">{inr(selectedOwner.totalAmountPaid)}</p>
              </div>
              <div className={`rounded-xl p-4 text-center ${
                (selectedOwner.pendingAmount || 0) > 0 ? 'bg-amber-50' : 'bg-gray-50'
              }`}>
                <p className={`text-xs font-medium mb-1 ${
                  (selectedOwner.pendingAmount || 0) > 0 ? 'text-amber-600' : 'text-gray-500'
                }`}>Need to Pay</p>
                <p className={`text-xl font-bold ${
                  (selectedOwner.pendingAmount || 0) > 0 ? 'text-amber-700' : 'text-gray-400'
                }`}>{(selectedOwner.pendingAmount || 0) > 0 ? inr(selectedOwner.pendingAmount) : '—'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={(selectedOwner.pendingAmount || 0) <= 0}
                onClick={() => { setShowDetailModal(false); openPay(selectedOwner); }}
              >
                <IndianRupee className="w-4 h-4 mr-1" /> Pay Now
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                disabled={!history.length}
                onClick={() => {
                  const sortedAsc = [...history].sort((a, b) => (a.paymentDate || '').localeCompare(b.paymentDate || ''));
                  let cum = 0;
                  const rows = sortedAsc.map((p, i) => {
                    cum += p.amountPaid || 0;
                    return {
                      '#': i + 1,
                      'Payment Date': p.paymentDate ? formatDate(p.paymentDate) : '',
                      'Amount Paid (₹)': p.amountPaid ?? 0,
                      'Cumulative Paid (₹)': cum,
                      'Mode': p.paymentMode || '',
                      'Notes': p.remarks || '',
                    };
                  });
                  exportToExcel({
                    rows,
                    fileName: `Nool_OwnerPayments_${selectedOwner.ownerName.replace(/\s+/g, '_')}`,
                    sheetName: 'Payment History',
                    columnWidths: [4, 14, 16, 18, 12, 24],
                  });
                }}
              >
                <Download className="w-4 h-4 mr-1" /> Export
              </Button>
            </div>

            <div>
              <p className="font-semibold text-gray-700 mb-2">All Payments</p>
              {historyLoading ? (
                <p className="text-sm text-gray-400 text-center py-4">Loading history...</p>
              ) : !history.length ? (
                <p className="text-sm text-gray-400 italic text-center py-6">No payments made yet</p>
              ) : (() => {
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
                            <th className="px-3 py-2 text-left">Mode</th>
                            <th className="px-3 py-2 text-right">Paid So Far</th>
                            <th className="px-3 py-2 text-left">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {displayed.map(p => (
                            <tr key={p.paymentId} className="hover:bg-gray-50">
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{formatDate(p.paymentDate)}</td>
                              <td className="px-3 py-2.5 text-right font-bold text-emerald-700">{inr(p.amountPaid)}</td>
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

export default PaymentsManagementPage;
