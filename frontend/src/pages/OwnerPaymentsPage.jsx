import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Loading, ErrorMessage, Badge } from '../components/Common';
import { useAuth } from '../hooks/useAuth';
import { ownerPaymentService } from '../services/api';
import { exportToExcel } from '../utils/excelExporter';
import { formatDate, toLocalISODate } from '../utils/formatters';
import { CreditCard, Banknote, Clock, CheckCircle2, ChevronRight, History, Calendar, Download, RefreshCw, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/90 backdrop-blur-md p-3 rounded-xl shadow-elevated border border-border">
        <p className="text-secondary-500 text-xs mb-1 font-medium">{label}</p>
        <p className="text-sm font-bold flex items-center gap-2 text-indigo-600">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export const OwnerPaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const now = new Date();
  const monthName = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      // toLocalISODate avoids the UTC drift that .toISOString() introduces past
      // IST midnight. Backend now returns all-time figures, so the range is
      // effectively defensive only.
      const fromDate = toLocalISODate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
      const toDate = toLocalISODate(new Date());

      const [historyRes, summaryRes] = await Promise.all([
        ownerPaymentService.getMyHistory(0, 20).catch(() => ({ content: [] })),
        ownerPaymentService.getMySummary(fromDate, toDate).catch(() => null),
      ]);

      const paymentList = historyRes?.content || [];
      setPayments(paymentList);

      // OwnerPaymentSummaryDto now carries ALL-TIME totals so the owner sees
      // the real outstanding amount the moment a new return is recorded.
      const lastPayment = paymentList[0];
      setSummary({
        totalPayable: summaryRes?.totalAmountPayable ?? 0,
        totalPaid: summaryRes?.totalAmountPaid
          ?? paymentList.reduce((sum, p) => sum + (p.amountPaid || 0), 0),
        pendingAmount: summaryRes?.pendingAmount ?? 0,
        lastPaymentDate: lastPayment?.paymentDate ?? null,
      });
    } catch (err) {
      setError(err.message || 'Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) return <MainLayout><Loading text="Loading your payments..." /></MainLayout>;
  
  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <ErrorMessage message={error} />
        </div>
      </MainLayout>
    );
  }

  // Chart Data — uses correct DTO fields: amountPaid, paymentDate
  const chartData = payments.slice(0, 6).reverse().map(p => ({
    name: p.paymentDate
      ? new Date(p.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      : '—',
    amount: p.amountPaid || 0,
    mode: p.paymentMode || 'CASH'
  }));

  return (
    <MainLayout>
      <div className="space-y-6 pb-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-sm font-semibold mb-3">
              <Banknote className="w-4 h-4" />
              Financial Overview
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main tracking-tight mb-2">
              My Payments
            </h1>
            <p className="text-secondary-500 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {monthName}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-text-main border border-border rounded-xl text-sm font-semibold hover:bg-surface-hover transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button
              type="button"
              disabled={!payments.length}
              onClick={() => exportToExcel({
                rows: payments.map(p => ({
                  'Payment ID': p.paymentId,
                  'Date': p.paymentDate ? formatDate(p.paymentDate) : '',
                  'Amount (₹)': p.amountPaid ?? 0,
                  'Mode': p.paymentMode || '',
                  'Remarks': p.remarks || '',
                })),
                fileName: 'Nool_My_Payments',
                sheetName: 'Payments',
                columnWidths: [12, 14, 14, 12, 24],
              })}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-text-main border border-border rounded-xl text-sm font-semibold hover:bg-surface-hover transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Export Excel
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Total Owed Card — derived from sarees returned × rate */}
          <div className="bg-surface rounded-3xl p-6 border border-border shadow-soft relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-colors"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-secondary-500 mb-1">Total Owed</p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-2xl font-bold text-text-main mb-1">₹</span>
                  <h3 className="text-4xl font-display font-bold text-text-main">{summary?.totalPayable?.toLocaleString() || 0}</h3>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                  <TrendingUp className="w-3 h-3" /> Earned from returns
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Total Paid Card */}
          <div className="bg-surface rounded-3xl p-6 border border-border shadow-soft relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-secondary-500 mb-1">Total Paid</p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-2xl font-bold text-text-main mb-1">₹</span>
                  <h3 className="text-4xl font-display font-bold text-text-main">{summary?.totalPaid?.toLocaleString() || 0}</h3>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <CheckCircle2 className="w-3 h-3" /> Received so far
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Banknote className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Pending Amount Card */}
          <div className="bg-surface rounded-3xl p-6 border border-border shadow-soft relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-rose-500/10 blur-2xl group-hover:bg-rose-500/20 transition-colors"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-secondary-500 mb-1">Pending Amount</p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-2xl font-bold text-text-main mb-1">₹</span>
                  <h3 className="text-4xl font-display font-bold text-text-main">{summary?.pendingAmount?.toLocaleString() || 0}</h3>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                  <Clock className="w-3 h-3" /> Outstanding balance
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <History className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Last Payment Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-primary-700 rounded-3xl p-6 shadow-lg shadow-indigo-500/20 relative overflow-hidden text-white group">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-colors"></div>
            <div className="flex flex-col h-full justify-between relative z-10">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-indigo-100">Last Payment Received</p>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
              </div>

              <div>
                <p className="text-2xl font-display font-bold mb-1">
                  {summary?.lastPaymentDate
                    ? new Date(summary.lastPaymentDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })
                    : 'No payments yet'}
                </p>
                <p className="text-indigo-200 text-sm flex items-center gap-1">
                  View receipt <ChevronRight className="w-4 h-4" />
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Chart */}
          <Card className="lg:col-span-2 !p-0 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-text-main font-display">Payment Trends</h3>
                <p className="text-sm text-secondary-500">Recent payouts visualization</p>
              </div>
            </div>
            <div className="p-6 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#6366f1" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Payment List */}
          <Card className="!p-0 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-border bg-surface-hover/30 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-text-main font-display">Transaction History</h2>
                <p className="text-sm text-secondary-500">Latest records</p>
              </div>
            </div>

            {payments.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 bg-secondary-50 rounded-full flex items-center justify-center mb-4">
                  <Banknote className="w-8 h-8 text-secondary-300" />
                </div>
                <p className="text-secondary-500 font-medium">No payments recorded this month</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[300px] scrollbar-hide divide-y divide-border/50">
                {payments.map((payment) => (
                  <div key={payment.paymentId} className="flex items-center justify-between p-5 hover:bg-surface-hover transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-text-main group-hover:text-primary-600 transition-colors">
                          {payment.paymentDate
                            ? new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })
                            : '—'}
                        </p>
                        <p className="text-xs text-secondary-500 font-medium mt-0.5">
                          {payment.paymentMode || 'CASH'}{payment.remarks ? ` • ${payment.remarks}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-text-main mb-1">
                        ₹{(payment.amountPaid || 0)?.toLocaleString()}
                      </p>
                      <Badge variant="success" className="text-[10px] px-2 py-0.5">
                        PAID
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default OwnerPaymentsPage;
