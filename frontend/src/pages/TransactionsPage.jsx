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
        setLoading(true);

        // ✅ Real API calls — no localStorage fallback needed (uses JWT token)
        const [txRes, summaryRes] = await Promise.all([
          inventoryService.getMyTransactions(0, 50).catch(() => ({ content: [] })),
          inventoryService.getMySummary(firstDay, lastDay).catch(() => null),
        ]);

        setTransactions(txRes?.content || []);

        // ✅ Map OwnerInventorySummaryDto fields
        setSummary({
          totalGiven: summaryRes?.totalSareesReceived ?? 0,
          totalReturned: summaryRes?.totalSareesReturned ?? 0,
          pendingCount: summaryRes?.sareesInHand ?? 0,
        });
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
                  {/* ✅ SareeTransactionResponseDto fields */}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Received Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Received Qty</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Returned Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Returned Qty</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border/50">
                {transactions.map((tx) => (
                  <tr key={tx.transactionId} className="hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-secondary-500 bg-secondary-50 px-2 py-1 rounded">#{tx.transactionId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                      {tx.receivedDate ? new Date(tx.receivedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-bold text-indigo-700">{tx.receivedQuantity ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                      {tx.returnedDate ? new Date(tx.returnedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.returnedQuantity != null ? (
                        <div className="flex items-center gap-2">
                          <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-bold text-emerald-700">{tx.returnedQuantity}</span>
                        </div>
                      ) : <span className="text-secondary-400 text-sm">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-500">
                      {tx.remarks || '—'}
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
