import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Loading, ErrorMessage } from '../components/Common';
import { useAuth } from '../hooks/useAuth';
import { inventoryService } from '../services/api';
import { exportToExcel } from '../utils/excelExporter';
import { formatDate } from '../utils/formatters';
import { RefreshCw, ArrowDownCircle, ArrowUpCircle, Package, Search, Download } from 'lucide-react';

export const TransactionsPage = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ledgerRes, summaryRes] = await Promise.all([
          inventoryService.getMyLedger(0, 100).catch(() => ({ content: [] })),
          inventoryService.getMySummary(firstDay, lastDay).catch(() => null),
        ]);

        setEntries(ledgerRes?.content || []);
        setSummary({
          totalGiven: summaryRes?.totalSareesGiven ?? 0,
          totalReturned: summaryRes?.totalSareesReturned ?? 0,
          inHand: summaryRes?.sareesInHand ?? 0,
        });
      } catch (err) {
        setError(err.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]); // eslint-disable-line

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(e => {
      const fields = [e.entryId, e.remarks, e.entryDate, e.entryType];
      return fields.some(f => String(f ?? '').toLowerCase().includes(q));
    });
  }, [entries, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const visible = filtered.slice(startIdx, startIdx + pageSize);

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
              Ledger
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main tracking-tight mb-2">
              Stock Movements
            </h1>
            <p className="text-secondary-500 font-medium">Every saree received and returned, in order</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto items-center flex-wrap">
            <div className="relative flex-1 md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-secondary-400" />
              </div>
              <input
                type="text"
                placeholder="Search by date, type or remark..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="block w-full pl-10 pr-3 py-2.5 border border-border rounded-xl leading-5 bg-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-base"
              />
            </div>
            <button
              type="button"
              disabled={!entries.length}
              onClick={() => exportToExcel({
                rows: entries.map(e => ({
                  'Date': e.entryDate ? formatDate(e.entryDate) : '',
                  'Type': e.entryType === 'RECEIPT' ? 'Received' : 'Returned',
                  'Quantity': e.quantity ?? 0,
                  'Remarks': e.remarks || '',
                })),
                fileName: 'Nool_My_Transactions',
                sheetName: 'Ledger',
                columnWidths: [14, 12, 12, 28],
              })}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-sm font-semibold text-secondary-700 hover:bg-surface-hover transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Export Excel
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-secondary-500 font-medium">Sarees Given</p>
              <p className="text-xl font-bold text-text-main">{summary?.totalGiven ?? 0}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-secondary-500 font-medium">Sarees Returned</p>
              <p className="text-xl font-bold text-text-main">{summary?.totalReturned ?? 0}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-secondary-500 font-medium">In Hand</p>
              <p className="text-xl font-bold text-text-main">{summary?.inHand ?? 0}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
              <span className="font-bold text-lg">Σ</span>
            </div>
            <div>
              <p className="text-xs text-secondary-500 font-medium">Total Entries</p>
              <p className="text-xl font-bold text-text-main">{entries.length}</p>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-surface-hover/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border/50">
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-secondary-500">
                      No entries found.
                    </td>
                  </tr>
                )}
                {visible.map((e) => {
                  const isReceipt = e.entryType === 'RECEIPT';
                  return (
                    <tr key={e.entryId} className="hover:bg-surface-hover transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                        {e.entryDate ? new Date(e.entryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isReceipt
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isReceipt ? <ArrowDownCircle className="w-3.5 h-3.5" /> : <ArrowUpCircle className="w-3.5 h-3.5" />}
                          {isReceipt ? 'Received' : 'Returned'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-base font-bold ${isReceipt ? 'text-indigo-700' : 'text-emerald-700'}`}>
                          {isReceipt ? '+' : '−'}{e.quantity ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-500">
                        {e.remarks || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-surface-hover/30">
            <span className="text-sm text-secondary-500">
              Showing {filtered.length === 0 ? 0 : startIdx + 1} to {Math.min(startIdx + pageSize, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium text-secondary-700 bg-white hover:bg-surface-hover disabled:opacity-50"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >Previous</button>
              <button
                className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium text-secondary-700 bg-white hover:bg-surface-hover disabled:opacity-50"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >Next</button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TransactionsPage;
