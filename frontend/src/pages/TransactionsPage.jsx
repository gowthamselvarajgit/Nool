import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Loading, ErrorMessage, Badge } from '../components/Common';
import { useAuth } from '../hooks/useAuth';
import { inventoryService } from '../services/api';
import { RefreshCw, ArrowUpRight, ArrowDownRight, Search, Filter } from 'lucide-react';

export const TransactionsPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ownerId = user?.sareeOwnerId || 'OWN-205';

        // Mock delay for UI
        await new Promise(resolve => setTimeout(resolve, 800));

        setSummary({
          totalGiven: 1250,
          totalReturned: 980,
          pendingCount: 270
        });

        // Mock data
        const mockData = Array.from({ length: 15 }).map((_, i) => ({
          transactionId: i + 1,
          transactionDate: new Date(Date.now() - (i * 86400000)).toISOString(),
          employeeName: ['Ramesh Kumar', 'Suresh Das', 'Kalaivani M', 'Anitha S', 'Vikram V'][i % 5],
          sareeCount: Math.floor(Math.random() * 50) + 10,
          transactionType: i % 2 === 0 ? 'GIVEN' : 'RETURNED',
          status: 'COMPLETED'
        }));

        setTransactions(mockData);
      } catch (err) {
        setError(err.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <MainLayout><Loading text="Loading your transactions..." /></MainLayout>;
  
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
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-end animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-3">
              <RefreshCw className="w-4 h-4" />
              Transaction History
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main tracking-tight mb-2">
              Stock Movements
            </h1>
            <p className="text-secondary-500 font-medium">Detailed log of all sarees given and returned</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-secondary-400" />
              </div>
              <input
                type="text"
                placeholder="Search worker..."
                className="block w-full pl-10 pr-3 py-2.5 border border-border rounded-xl leading-5 bg-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-sm font-semibold text-secondary-700 hover:bg-surface-hover transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-secondary-500 font-medium">Sarees Given</p>
              <p className="text-xl font-bold text-text-main">{summary?.totalGiven}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-secondary-500 font-medium">Sarees Returned</p>
              <p className="text-xl font-bold text-text-main">{summary?.totalReturned}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-secondary-500 font-medium">Pending Stock</p>
              <p className="text-xl font-bold text-text-main">{summary?.pendingCount}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
              <span className="font-bold text-lg">Σ</span>
            </div>
            <div>
              <p className="text-xs text-secondary-500 font-medium">Total Entries</p>
              <p className="text-xl font-bold text-text-main">{transactions.length}</p>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-surface-hover/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Worker Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border/50">
                {transactions.map((tx) => (
                  <tr key={tx.transactionId} className="hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text-main">
                        {new Date(tx.transactionDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-secondary-500">
                        {new Date(tx.transactionDate).toLocaleTimeString('en-IN', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-500 font-mono bg-secondary-50 px-2 py-1 rounded inline-block">
                        TXN-{tx.transactionId.toString().padStart(4, '0')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                          {tx.employeeName.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-text-main">{tx.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                        tx.transactionType === 'GIVEN'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {tx.transactionType === 'GIVEN' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-text-main">{tx.sareeCount}</div>
                      <div className="text-xs text-secondary-500">sarees</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Badge variant="success" className="px-2.5 py-1">
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-surface-hover/30">
            <span className="text-sm text-secondary-500">Showing 1 to {transactions.length} of {transactions.length} entries</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-border rounded-lg text-sm font-medium text-secondary-500 bg-white hover:bg-surface-hover disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border border-border rounded-lg text-sm font-medium text-secondary-500 bg-white hover:bg-surface-hover disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TransactionsPage;
