import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { MainLayout } from '../components/Layout';
import { Card, Button, Input, Select, Loading, ErrorMessage, EmptyState } from '../components/Common';
import { inventoryService, ownerService } from '../services/api';
import { formatDate } from '../utils/formatters';
import { Download, Filter, RefreshCw, Package, ArrowDownCircle, ArrowUpCircle, AlertCircle } from 'lucide-react';

const InventoryReportPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const today = new Date().toISOString().split('T')[0];
  const firstOfYear = `${new Date().getFullYear()}-01-01`;
  const [fromDate, setFromDate] = useState(firstOfYear);
  const [toDate, setToDate] = useState(today);
  const [filterOwner, setFilterOwner] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); // '' | 'pending' | 'returned'

  useEffect(() => { fetchOwners(); }, []);
  useEffect(() => { if (owners.length > 0 || filterOwner) fetchReport(); }, [owners]); // eslint-disable-line

  async function fetchOwners() {
    try {
      const res = await ownerService.getList(0, 200);
      setOwners(res?.content || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function fetchReport() {
    try {
      setLoading(true);
      setError('');

      let all = [];
      if (filterOwner) {
        // Fetch for specific owner
        const res = await inventoryService.getOwnerTransactions(parseInt(filterOwner), 0, 500);
        all = res?.content || [];
      } else {
        // Fetch for all owners in parallel (max 20 owners)
        const ownerIds = owners.slice(0, 20).map(o => o.ownerId);
        if (ownerIds.length === 0) { setTransactions([]); setLoading(false); return; }
        const results = await Promise.allSettled(
          ownerIds.map(id => inventoryService.getOwnerTransactions(id, 0, 200))
        );
        all = results
          .filter(r => r.status === 'fulfilled')
          .flatMap(r => r.value?.content || []);
      }

      // Client-side date filter
      all = all.filter(tx => {
        const date = tx.receivedDate || tx.returnedDate || '';
        return date >= fromDate && date <= toDate;
      });

      // Status filter — use fullyReturned flag from backend
      if (filterStatus === 'pending') {
        all = all.filter(tx => !tx.fullyReturned);
      } else if (filterStatus === 'returned') {
        all = all.filter(tx => !!tx.fullyReturned);
      }

      // Sort by receivedDate desc
      all.sort((a, b) => {
        const da = a.receivedDate || '';
        const db = b.receivedDate || '';
        return db.localeCompare(da);
      });

      setTransactions(all);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleExportExcel() {
    if (transactions.length === 0) return;

    // Flatten: one row per transaction, plus sub-rows for each partial return
    const rows = [];
    transactions.forEach((tx, i) => {
      rows.push({
        '#': i + 1,
        'Owner Name': tx.ownerName || '',
        'Type': 'Receipt',
        'Date': tx.receivedDate ? formatDate(tx.receivedDate) : '—',
        'Qty Received': tx.receivedQuantity ?? 0,
        'Qty Returned (this row)': '',
        'Total Returned': tx.totalReturned ?? 0,
        'In Hand': tx.sareesInHand ?? 0,
        'Remarks': tx.remarks || '',
        'Status': tx.fullyReturned ? 'Fully Returned' : (tx.totalReturned ?? 0) > 0 ? 'Partial' : 'Pending',
      });
      (tx.returns || []).forEach((r, ri) => {
        rows.push({
          '#': `${i + 1}.${ri + 1}`,
          'Owner Name': tx.ownerName || '',
          'Type': 'Return',
          'Date': r.returnedDate ? formatDate(r.returnedDate) : '—',
          'Qty Received': '',
          'Qty Returned (this row)': r.returnedQuantity ?? 0,
          'Total Returned': '',
          'In Hand': '',
          'Remarks': r.remarks || '',
          'Status': '',
        });
      });
    });

    // Summary row
    rows.push({});
    rows.push({
      '#': '',
      'Owner Name': 'TOTAL',
      'Received Date': '',
      'Qty Received': totals.received,
      'Returned Date': '',
      'Qty Returned': totals.returned,
      'In Hand': totals.inHand,
      'Remarks': '',
      'Status': '',
    });

    const ws = XLSX.utils.json_to_sheet(rows);

    // Column widths
    ws['!cols'] = [
      { wch: 4 },   // #
      { wch: 22 },  // Owner
      { wch: 15 },  // Received Date
      { wch: 13 },  // Qty Received
      { wch: 15 },  // Returned Date
      { wch: 13 },  // Qty Returned
      { wch: 14 },  // In Hand
      { wch: 25 },  // Remarks
      { wch: 16 },  // Status
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory Report');
    XLSX.writeFile(wb, `Nool_Inventory_Report_${fromDate}_to_${toDate}.xlsx`);
  }

  // Computed totals — use backend fields (totalReturned / sareesInHand)
  const totals = {
    received: transactions.reduce((s, t) => s + (t.receivedQuantity ?? 0), 0),
    returned: transactions.reduce((s, t) => s + (t.totalReturned ?? 0), 0),
    inHand: transactions.reduce((s, t) => s + (t.sareesInHand ?? 0), 0),
    pending: transactions.filter(t => !t.fullyReturned).length,
  };

  // Per-owner summary — use backend-computed totalReturned / sareesInHand
  const ownerSummary = Object.values(
    transactions.reduce((acc, tx) => {
      const key = tx.ownerName || `Owner#${tx.ownerId}`;
      if (!acc[key]) acc[key] = { owner: key, received: 0, returned: 0, inHand: 0, txCount: 0 };
      acc[key].received += tx.receivedQuantity ?? 0;
      acc[key].returned += tx.totalReturned ?? 0;
      acc[key].inHand += tx.sareesInHand ?? 0;
      acc[key].txCount += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.received - a.received);

  return (
    <MainLayout>
      <div className="space-y-6 pb-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">📋 Inventory Report</h1>
            <p className="text-gray-500 mt-1">Full saree transaction history — received, returned, in hand</p>
          </div>
          <Button
            onClick={handleExportExcel}
            disabled={transactions.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4" />
            Download Excel
          </Button>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchReport} />}

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Owner</label>
              <select
                value={filterOwner}
                onChange={e => setFilterOwner(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                <option value="">All Owners</option>
                {owners.map(o => (
                  <option key={o.ownerId} value={String(o.ownerId)}>{o.ownerName}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                <option value="">All</option>
                <option value="pending">Pending Return</option>
                <option value="returned">Returned</option>
              </select>
            </div>
            <Button onClick={fetchReport}>
              <Filter className="w-4 h-4 mr-1" /> Apply
            </Button>
            <Button variant="outline" onClick={() => { setFromDate(firstOfYear); setToDate(today); setFilterOwner(''); setFilterStatus(''); }}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Summary Totals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Received', value: totals.received, icon: ArrowDownCircle, color: 'indigo', sub: `${transactions.length} transactions` },
            { label: 'Total Returned', value: totals.returned, icon: ArrowUpCircle, color: 'emerald', sub: `${transactions.filter(t => (t.totalReturned ?? 0) > 0).length} with returns` },
            { label: 'Sarees In Hand', value: totals.inHand, icon: Package, color: 'amber', sub: 'Net outstanding' },
            { label: 'Pending Return', value: totals.pending, icon: AlertCircle, color: 'rose', sub: 'Not fully returned' },
          ].map((s, i) => {
            const clr = {
              indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
              emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
              amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
              rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
            }[s.color];
            return (
              <div key={i} className={`rounded-2xl p-5 border ${clr.bg} ${clr.border}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${clr.bg} border ${clr.border} mb-3`}>
                  <s.icon className={`w-5 h-5 ${clr.text}`} />
                </div>
                <p className={`text-3xl font-bold ${clr.text}`}>{s.value}</p>
                <p className="text-sm font-semibold text-gray-700 mt-1">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            );
          })}
        </div>

        {loading ? <Loading text="Loading report..." /> : transactions.length === 0 ? (
          <EmptyState message="No transactions found for the selected filters" icon="📋" />
        ) : (
          <>
            {/* Main Transaction Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Transaction Details</h2>
                  <p className="text-sm text-gray-500">{transactions.length} records — {fromDate} to {toDate}</p>
                </div>
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl text-sm font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" /> Export Excel
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Owner</th>
                      <th className="px-4 py-3 text-left">Received Date</th>
                      <th className="px-4 py-3 text-center">Qty Received</th>
                      <th className="px-4 py-3 text-left">Returned Date</th>
                      <th className="px-4 py-3 text-center">Qty Returned</th>
                      <th className="px-4 py-3 text-center">In Hand</th>
                      <th className="px-4 py-3 text-left">Remarks</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx, i) => (
                      <tr key={tx.transactionId || i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{tx.ownerName}</td>
                        <td className="px-4 py-3">
                          <span className="text-indigo-700 font-medium">{formatDate(tx.receivedDate)}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-indigo-600">
                          <span className="inline-flex items-center gap-1">
                            <ArrowDownCircle className="w-3.5 h-3.5" />{tx.receivedQuantity ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-emerald-600">
                          {(tx.totalReturned ?? 0) > 0
                            ? <span className="inline-flex items-center gap-1"><ArrowUpCircle className="w-3.5 h-3.5" />{tx.totalReturned}</span>
                            : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold ${(tx.sareesInHand ?? 0) > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                            {(tx.sareesInHand ?? 0) > 0 ? tx.sareesInHand : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs max-w-[140px] truncate">{tx.remarks || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          {tx.fullyReturned
                            ? <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">✓ Fully Returned</span>
                            : (tx.totalReturned ?? 0) > 0
                              ? <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">⟳ Partial</span>
                              : <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">⏳ Pending</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Totals Footer */}
                  <tfoot>
                    <tr className="bg-gray-50 font-bold text-gray-800 border-t-2 border-gray-200">
                      <td colSpan={3} className="px-4 py-3 text-right text-sm">Totals</td>
                      <td className="px-4 py-3 text-center text-indigo-700 text-base">{totals.received}</td>
                      <td className="px-4 py-3 text-center text-emerald-700 text-base">{totals.returned}</td>
                      <td className="px-4 py-3 text-center text-amber-700 text-base">{totals.inHand}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Per-Owner Summary */}
            {ownerSummary.length > 1 && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 text-lg">Per-Owner Summary</h2>
                  <p className="text-sm text-gray-500">Aggregated totals per saree owner</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                        <th className="px-4 py-3 text-left">Owner</th>
                        <th className="px-4 py-3 text-center">Transactions</th>
                        <th className="px-4 py-3 text-center">Total Received</th>
                        <th className="px-4 py-3 text-center">Total Returned</th>
                        <th className="px-4 py-3 text-center">In Hand</th>
                        <th className="px-4 py-3 text-center">Return Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ownerSummary.map((o, i) => {
                        const rate = o.received > 0 ? Math.round((o.returned / o.received) * 100) : 0;
                        return (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-semibold text-gray-900">{o.owner}</td>
                            <td className="px-4 py-3 text-center text-gray-600">{o.txCount}</td>
                            <td className="px-4 py-3 text-center font-bold text-indigo-600">{o.received}</td>
                            <td className="px-4 py-3 text-center font-bold text-emerald-600">{o.returned}</td>
                            <td className="px-4 py-3 text-center font-bold text-amber-600">{o.inHand > 0 ? o.inHand : '—'}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rate}%` }} />
                                </div>
                                <span className="text-xs font-semibold text-gray-600 w-10 text-right">{rate}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default InventoryReportPage;
