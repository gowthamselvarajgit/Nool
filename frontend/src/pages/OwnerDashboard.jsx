import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Badge, Loading, ErrorMessage } from '../components/Common';
import { ownerService } from '../services/api';
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

      const ownerId = localStorage.getItem('sareeOwnerId');
      
      if (!ownerId) {
        // Fallback to mock data for demonstration
        setOwnerData({
          id: 'OWN-205',
          name: 'Rajesh Kumar',
          mobile: '+91 9876543210',
          email: 'rajesh@example.com',
          address: 'Kanchipuram, TN',
          totalAmount: 850000,
          paidAmount: 620000,
          pendingAmount: 230000,
        });
        setTransactions(Array.from({ length: 8 }).map((_, i) => ({
          transactionId: 1001 + i,
          transactionDate: new Date(Date.now() - (i * 86400000 * 3)).toISOString(),
          sareeCount: Math.floor(Math.random() * 50) + 10,
          totalAmount: Math.floor(Math.random() * 30000) + 5000,
          status: i < 2 ? 'PENDING' : 'COMPLETED'
        })));
        setStats({
          totalTransactions: 8,
          completedTransactions: 6,
          pendingTransactions: 2,
          totalAmount: 850000,
          paidAmount: 620000,
          pendingAmount: 230000,
        });
        return;
      }

      const ownerResponse = await ownerService.getById(ownerId);
      setOwnerData({
        id: ownerResponse.sareeOwnerId,
        name: ownerResponse.ownerName,
        mobile: ownerResponse.mobileNumber,
        email: ownerResponse.email,
        address: ownerResponse.address,
        totalAmount: ownerResponse.totalAmount || 0,
        paidAmount: ownerResponse.paidAmount || 0,
        pendingAmount: (ownerResponse.totalAmount || 0) - (ownerResponse.paidAmount || 0),
      });

      const transResponse = await ownerService.getTransactions(ownerId, 0, 50);
      const transList = transResponse?.content || [];
      setTransactions(transList);

      setStats({
        totalTransactions: transList.length,
        completedTransactions: transList.filter(t => t.status === 'COMPLETED').length,
        pendingTransactions: transList.filter(t => t.status === 'PENDING').length,
        totalAmount: ownerResponse.totalAmount || 0,
        paidAmount: ownerResponse.paidAmount || 0,
        pendingAmount: (ownerResponse.totalAmount || 0) - (ownerResponse.paidAmount || 0),
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

  const paymentPct = stats.totalAmount > 0 ? Math.round((stats.paidAmount / stats.totalAmount) * 100) : 0;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedData = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Mock trend chart data
  const chartData = [
    { month: 'Jan', amount: 120000 },
    { month: 'Feb', amount: 180000 },
    { month: 'Mar', amount: 140000 },
    { month: 'Apr', amount: 210000 },
    { month: 'May', amount: 160000 },
    { month: 'Jun', amount: stats.paidAmount || 150000 },
  ];

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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
              <div>
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">Owner ID</p>
                <p className="text-white font-bold font-mono">#{ownerData?.id}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">Mobile</p>
                <p className="text-white font-bold">{ownerData?.mobile}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">Email</p>
                <p className="text-white font-bold">{ownerData?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">Location</p>
                <p className="text-white font-bold">{ownerData?.address || 'N/A'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Due', value: `₹${(stats.totalAmount / 100000).toFixed(1)}L`, icon: DollarSign, bg: 'bg-indigo-50', fg: 'text-indigo-600', border: 'border-indigo-100' },
            { label: 'Paid Amount', value: `₹${(stats.paidAmount / 100000).toFixed(1)}L`, icon: CreditCard, bg: 'bg-emerald-50', fg: 'text-emerald-600', border: 'border-emerald-100' },
            { label: 'Pending', value: `₹${(stats.pendingAmount / 100000).toFixed(1)}L`, icon: AlertCircle, bg: 'bg-rose-50', fg: 'text-rose-600', border: 'border-rose-100' },
            { label: 'Payment %', value: `${paymentPct}%`, icon: TrendingUp, bg: 'bg-primary-50', fg: 'text-primary-600', border: 'border-primary-100' },
          ].map((stat, i) => (
            <div key={i} className="bg-surface rounded-3xl p-6 border border-border shadow-soft group hover:shadow-card transition-all relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'var(--color-primary-100)' }}></div>
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

        {/* Chart + Transaction Count Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Trend Chart */}
          <Card className="lg:col-span-2 !p-0 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-text-main font-display">Payment Timeline</h3>
              <p className="text-sm text-secondary-500">Monthly payout breakdown</p>
            </div>
            <div className="p-6 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ownerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#ownerGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Payment Progress Ring */}
          <Card className="flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-b from-surface to-purple-50/20">
            <h3 className="text-lg font-bold text-text-main font-display mb-1">Payment Progress</h3>
            <p className="text-sm text-secondary-500 mb-6">Paid vs. Total due</p>

            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-secondary-100" />
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * paymentPct) / 100}
                  strokeLinecap="round" className="text-purple-600 transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-display font-bold text-text-main">{paymentPct}%</span>
                <span className="text-xs text-secondary-500 font-medium">Paid</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 w-full text-sm">
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl border border-emerald-100">
                <p className="text-xs font-semibold mb-1">Received</p>
                <p className="font-bold">₹{(stats.paidAmount/100000).toFixed(1)}L</p>
              </div>
              <div className="bg-rose-50 text-rose-700 p-3 rounded-2xl border border-rose-100">
                <p className="text-xs font-semibold mb-1">Pending</p>
                <p className="font-bold">₹{(stats.pendingAmount/100000).toFixed(1)}L</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Transaction Summary Strip */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Transactions', value: stats.totalTransactions, icon: Package, color: 'indigo' },
            { label: 'Completed', value: stats.completedTransactions, icon: ArrowDownRight, color: 'emerald' },
            { label: 'Pending', value: stats.pendingTransactions, icon: ArrowUpRight, color: 'amber' },
          ].map((s, i) => (
            <div key={i} className={`bg-${s.color}-50 border border-${s.color}-100 rounded-2xl p-5 text-center`}>
              <p className={`text-sm font-medium text-${s.color}-600 mb-2`}>{s.label}</p>
              <p className={`text-3xl font-display font-bold text-${s.color}-700`}>{s.value || 0}</p>
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
              <p className="text-secondary-500 font-medium">No transactions yet</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="bg-surface-hover/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Transaction ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Sarees</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border/50">
                    {paginatedData.map((tx) => (
                      <tr key={tx.transactionId} className="hover:bg-surface-hover transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-secondary-500 bg-secondary-50 px-2 py-1 rounded">
                            #{tx.transactionId}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                          {formatDate(tx.transactionDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-text-main">
                          {tx.sareeCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-indigo-600">
                          ₹{tx.totalAmount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Badge variant={tx.status === 'COMPLETED' ? 'success' : 'warning'}>
                            {tx.status}
                          </Badge>
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
