import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Badge, Loading, ErrorMessage } from '../components/Common';
import { ownerService, inventoryService, ownerPaymentService } from '../services/api';
import { formatDate } from '../utils/formatters';
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Package, ArrowUpRight, ArrowDownRight, User } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/90 backdrop-blur-md p-3 rounded-xl shadow-elevated border border-border">
        <p className="text-secondary-500 text-xs mb-1 font-medium">{label}</p>
        <p className="text-sm font-bold text-indigo-600">₹{payload[0]?.value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const OwnerDashboard = () => {
  const [ownerData, setOwnerData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  async function fetchOwnerData() {
    try {
      setLoading(true);
      setError('');

      // ✅ Use getMe() — no localStorage fallback needed
      const profile = await ownerService.getMe();
      setOwnerData({
        id: profile.ownerId,
        name: profile.ownerName,
        mobile: profile.mobileNumber,
        status: profile.ownerStatus,
      });

      // ✅ Fetch my saree transactions using correct API
      const today = new Date().toISOString().split('T')[0];
      const fromDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      const [txRes, summaryRes, paymentRes] = await Promise.all([
        inventoryService.getMyTransactions(0, 50).catch(() => ({ content: [] })),
        inventoryService.getMySummary(fromDate, today).catch(() => null),
        ownerPaymentService.getMyHistory(0, 50).catch(() => ({ content: [] })),
      ]);

      const transList = txRes?.content || [];
      const payments = paymentRes?.content || [];
      const totalPaid = payments.reduce((s, p) => s + (p.amountPaid || 0), 0);

      setTransactions(transList);
      setStats({
        totalTransactions: transList.length,
        totalReceived: summaryRes?.totalSareesReceived ?? 0,
        totalReturned: summaryRes?.totalSareesReturned ?? 0,
        sareesInHand: summaryRes?.sareesInHand ?? 0,
        totalPayments: payments.length,
        totalPaid,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOwnerData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <MainLayout><Loading text="Loading your dashboard..." /></MainLayout>;

  const returnedPct = stats.totalReceived > 0
    ? Math.round((stats.totalReturned / stats.totalReceived) * 100)
    : 0;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedData = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout>
      <div className="space-y-6 pb-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-sm font-semibold mb-3">
            <User className="w-4 h-4" />
            Owner Dashboard
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main tracking-tight mb-2">
            Welcome, {ownerData?.name} 👋
          </h1>
          <p className="text-secondary-500 font-medium">Track your saree transactions and payment status</p>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchOwnerData} />}

        {/* Owner Identity Card */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-700 !border-none !p-0 overflow-hidden text-white shadow-lg shadow-indigo-500/20">
          <div className="p-8 relative">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 relative z-10">
              <div>
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">Owner ID</p>
                <p className="text-white font-bold font-mono">#{ownerData?.id}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">Mobile</p>
                <p className="text-white font-bold">{ownerData?.mobile}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">Status</p>
                <p className="text-white font-bold">{ownerData?.status || 'ACTIVE'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Top Stats — real inventory data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Sarees Received', value: stats.totalReceived ?? 0, icon: Package, bg: 'bg-indigo-50', fg: 'text-indigo-600', border: 'border-indigo-100' },
            { label: 'Sarees Returned', value: stats.totalReturned ?? 0, icon: ArrowUpRight, bg: 'bg-emerald-50', fg: 'text-emerald-600', border: 'border-emerald-100' },
            { label: 'Sarees In Hand', value: stats.sareesInHand ?? 0, icon: AlertCircle, bg: 'bg-amber-50', fg: 'text-amber-600', border: 'border-amber-100' },
            { label: 'Total Payments', value: stats.totalPayments ?? 0, icon: CreditCard, bg: 'bg-purple-50', fg: 'text-purple-600', border: 'border-purple-100' },
          ].map((stat, i) => (
            <div key={i} className="bg-surface rounded-3xl p-6 border border-border shadow-soft group hover:shadow-card transition-all relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-sm font-medium text-secondary-500 mb-2">{stat.label}</p>
                  <p className="text-3xl font-display font-bold text-text-main">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.fg} flex items-center justify-center border ${stat.border}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Inventory Progress Ring + Payments Summary */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sarees Summary */}
          <Card className="lg:col-span-2 p-6 space-y-4">
            <h3 className="text-lg font-bold text-text-main font-display">Saree Inventory (This Month)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-center">
                <p className="text-xs font-semibold text-indigo-600 mb-1">Received</p>
                <p className="text-3xl font-bold text-indigo-700">{stats.totalReceived ?? 0}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                <p className="text-xs font-semibold text-emerald-600 mb-1">Returned</p>
                <p className="text-3xl font-bold text-emerald-700">{stats.totalReturned ?? 0}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                <p className="text-xs font-semibold text-amber-600 mb-1">In Hand</p>
                <p className="text-3xl font-bold text-amber-700">{stats.sareesInHand ?? 0}</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Return Progress</span><span>{returnedPct}% returned</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${returnedPct}%` }} />
              </div>
            </div>
          </Card>

          {/* Payments Summary */}
          <Card className="flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-b from-surface to-purple-50/20">
            <h3 className="text-lg font-bold text-text-main font-display mb-1">Payments Made</h3>
            <p className="text-sm text-secondary-500 mb-4">Total amount received</p>
            <p className="text-4xl font-display font-bold text-purple-700">
              ₹{(stats.totalPaid || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-sm text-secondary-500 mt-2">{stats.totalPayments ?? 0} payment{stats.totalPayments !== 1 ? 's' : ''}</p>
          </Card>
        </div>

        {/* Transaction Summary Strip */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Transactions', value: stats.totalTransactions, color: 'indigo' },
            { label: 'Total Received', value: stats.totalReceived, color: 'emerald' },
            { label: 'In Hand', value: stats.sareesInHand, color: 'amber' },
          ].map((s, i) => (
            <div key={i} className={`bg-${s.color}-50 border border-${s.color}-100 rounded-2xl p-5 text-center`}>
              <p className={`text-sm font-medium text-${s.color}-600 mb-2`}>{s.label}</p>
              <p className={`text-3xl font-display font-bold text-${s.color}-700`}>{s.value ?? 0}</p>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-surface-hover/30 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-text-main font-display">Recent Transactions</h2>
              <p className="text-sm text-secondary-500">Your latest saree movements</p>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-secondary-50 rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-secondary-300" />
              </div>
              <p className="text-secondary-500 font-medium">No saree transactions yet</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="bg-surface-hover/50">
                      {/* ✅ SareeTransactionResponseDto: transactionId, receivedDate, receivedQuantity, returnedDate, returnedQuantity, remarks */}
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Received Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Received Qty</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Returned Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Returned Qty</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border/50">
                    {paginatedData.map((tx) => (
                      <tr key={tx.transactionId} className="hover:bg-surface-hover transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-secondary-500 bg-secondary-50 px-2 py-1 rounded">#{tx.transactionId}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                          {tx.receivedDate ? formatDate(tx.receivedDate) : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                          {tx.receivedQuantity ?? '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                          {tx.returnedDate ? formatDate(tx.returnedDate) : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">
                          {tx.returnedQuantity ?? '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                          {tx.remarks || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-surface-hover/30">
                  <span className="text-sm text-secondary-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-border rounded-lg text-sm font-medium text-secondary-500 bg-white hover:bg-surface-hover disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-border rounded-lg text-sm font-medium text-secondary-500 bg-white hover:bg-surface-hover disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default OwnerDashboard;
