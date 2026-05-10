import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Loading, ErrorMessage, Badge } from '../components/Common';
import { useAuth } from '../hooks/useAuth';
import { ownerPaymentService } from '../services/api';
import { CreditCard, Banknote, Clock, CheckCircle2, ChevronRight, Download, History, Calendar } from 'lucide-react';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ownerId = user?.sareeOwnerId || 'OWN-205';

        // Mock delay for UI
        await new Promise(resolve => setTimeout(resolve, 800));

        setSummary({
          totalPaid: 450000,
          pendingAmount: 125000,
          lastPaymentDate: new Date(Date.now() - 259200000).toISOString()
        });

        // Mock payment history
        const mockData = Array.from({ length: 8 }).map((_, i) => ({
          paymentId: i + 1,
          paymentDate: new Date(Date.now() - (i * 86400000 * 4)).toISOString(),
          paymentMode: ['Bank Transfer', 'UPI', 'Cash', 'Cheque'][i % 4],
          amount: Math.floor(Math.random() * 50000) + 10000,
          status: i === 0 ? 'PENDING' : 'PAID',
          referenceNo: `REF${10000 + i}`
        }));

        setPayments(mockData);
      } catch (err) {
        setError(err.message || 'Failed to load payment data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  // Chart Data from mock payments
  const chartData = payments.slice(0, 6).reverse().map(p => ({
    name: new Date(p.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    amount: p.amount,
    status: p.status
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
          
          <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-text-main border border-border rounded-xl text-sm font-semibold hover:bg-surface-hover transition-colors shadow-sm w-full md:w-auto">
            <Download className="w-4 h-4" />
            Download Statement
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <CheckCircle2 className="w-3 h-3" /> Received this month
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
                      <Cell key={`cell-${index}`} fill={entry.status === 'PAID' ? '#6366f1' : '#f43f5e'} />
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
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                        payment.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-text-main group-hover:text-primary-600 transition-colors">
                          {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-secondary-500 font-medium font-mono mt-0.5">
                          {payment.referenceNo}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-text-main mb-1">
                        ₹{payment.amount?.toLocaleString()}
                      </p>
                      <Badge variant={payment.status === 'PAID' ? 'success' : 'danger'} className="text-[10px] px-2 py-0.5">
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="p-4 border-t border-border">
              <button className="w-full py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                View All Payments
              </button>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default OwnerPaymentsPage;
