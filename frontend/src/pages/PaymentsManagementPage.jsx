import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Loading, ErrorMessage, Badge, Button } from '../components/Common';
import { useAuth } from '../hooks/useAuth';
import { ownerPaymentService } from '../services/api';
import { CreditCard, Banknote, Search, Filter, Plus, ArrowUpRight, ArrowDownRight, MoreVertical } from 'lucide-react';

export const PaymentsManagementPage = () => {
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
        // Mock delay for UI
        await new Promise(resolve => setTimeout(resolve, 800));

        setSummary({
          totalPaidThisMonth: 1250000,
          pendingAmount: 340000,
          totalOwners: 12
        });

        // Mock payment history across multiple owners
        const mockData = Array.from({ length: 10 }).map((_, i) => ({
          paymentId: 1000 + i,
          ownerName: ['Rajesh Kumar', 'Meena Textiles', 'Velu Handlooms', 'Suresh Silks', 'Anand Sarees'][i % 5],
          paymentDate: new Date(Date.now() - (i * 86400000 * 2)).toISOString(),
          paymentMode: ['Bank Transfer', 'UPI', 'Cash', 'Cheque'][i % 4],
          amount: Math.floor(Math.random() * 80000) + 20000,
          status: i < 3 ? 'PENDING' : 'COMPLETED',
          referenceNo: `TRX-${10000 + i}`
        }));

        setPayments(mockData);
      } catch (err) {
        setError(err.message || 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <MainLayout><Loading text="Loading payments data..." /></MainLayout>;
  
  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <ErrorMessage message={error} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 pb-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-3">
              <CreditCard className="w-4 h-4" />
              Admin Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main tracking-tight mb-2">
              Payments Management
            </h1>
            <p className="text-secondary-500 font-medium">Manage payouts to all Saree Owners</p>
          </div>
          
          <Button className="flex items-center gap-2 shadow-lg shadow-primary-500/20 w-full md:w-auto">
            <Plus className="w-5 h-5" />
            Record New Payment
          </Button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Disbursed Card */}
          <div className="bg-surface rounded-3xl p-6 border border-border shadow-soft relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-secondary-500 mb-1">Total Disbursed ({monthName})</p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-2xl font-bold text-text-main mb-1">₹</span>
                  <h3 className="text-4xl font-display font-bold text-text-main">{summary?.totalPaidThisMonth?.toLocaleString()}</h3>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <ArrowUpRight className="w-3 h-3" /> Paid Out
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Banknote className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Pending Card */}
          <div className="bg-surface rounded-3xl p-6 border border-border shadow-soft relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-rose-500/10 blur-2xl group-hover:bg-rose-500/20 transition-colors"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-secondary-500 mb-1">Total Pending</p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-2xl font-bold text-text-main mb-1">₹</span>
                  <h3 className="text-4xl font-display font-bold text-text-main">{summary?.pendingAmount?.toLocaleString()}</h3>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                  <ArrowDownRight className="w-3 h-3" /> To be paid
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Owners Card */}
          <div className="bg-surface rounded-3xl p-6 border border-border shadow-soft relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-colors"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-secondary-500 mb-1">Active Payees</p>
                <h3 className="text-4xl font-display font-bold text-text-main mb-2 mt-2">{summary?.totalOwners}</h3>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md mt-1">
                  Saree Owners
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <span className="font-bold text-xl">O</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Data Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-surface-hover/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-text-main font-display">Payment Records</h2>
              <p className="text-sm text-secondary-500">All disbursements to owners</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-secondary-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search owner or reference..."
                  className="block w-full pl-10 pr-3 py-2 border border-border rounded-xl leading-5 bg-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
                />
              </div>
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-xl text-sm font-semibold text-secondary-700 hover:bg-surface-hover transition-colors shadow-sm">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-surface-hover/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Date & Ref</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Owner Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Payment Mode</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border/50">
                {payments.map((payment) => (
                  <tr key={payment.paymentId} className="hover:bg-surface-hover transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text-main">
                        {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-secondary-500 font-mono mt-0.5">
                        {payment.referenceNo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                          {payment.ownerName.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-text-main">{payment.ownerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-secondary-600 bg-secondary-50 px-2.5 py-1 rounded-md border border-secondary-200">
                        {payment.paymentMode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-text-main">₹{payment.amount?.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Badge variant={payment.status === 'COMPLETED' ? 'success' : 'warning'} className="px-2.5 py-1">
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-secondary-400 hover:text-primary-600 transition-colors p-1 rounded-md hover:bg-primary-50">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-surface-hover/30">
            <span className="text-sm text-secondary-500">Showing 1 to {payments.length} entries</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-border rounded-lg text-sm font-medium text-secondary-500 bg-white hover:bg-surface-hover disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border border-border rounded-lg text-sm font-medium text-secondary-500 bg-white hover:bg-surface-hover hover:text-text-main transition-colors">Next</button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PaymentsManagementPage;
