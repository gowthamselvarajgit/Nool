import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Button, Loading, ErrorMessage, EmptyState } from '../components/Common';
import { inventoryService, ownerService } from '../services/api';
import { formatDate } from '../utils/formatters';
import { exportToExcel } from '../utils/excelExporter';
import {
  Download, Filter, RefreshCw, Package, ArrowDownCircle, ArrowUpCircle, AlertCircle,
} from 'lucide-react';

const InventoryReportPage = () => {
  const [entries, setEntries] = useState([]);
  const [ownersInventory, setOwnersInventory] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const today = new Date().toISOString().split('T')[0];
  const firstOfYear = `${new Date().getFullYear()}-01-01`;
  const [fromDate, setFromDate] = useState(firstOfYear);
  const [toDate, setToDate] = useState(today);
  const [filterOwner, setFilterOwner] = useState('');
  const [filterType, setFilterType] = useState(''); // '' | 'RECEIPT' | 'RETURN'

  useEffect(() => { init(); }, []); // eslint-disable-line

  async function init() {
    try {
      setLoading(true);
      setError('');
      const [ownerRes, invRes] = await Promise.all([
        ownerService.getList(0, 200),
        inventoryService.getAllOwnersInventory(),
      ]);
      setOwners(ownerRes?.content || []);
      setOwnersInventory(Array.isArray(invRes) ? invRes : []);
      await fetchEntries(ownerRes?.content || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEntries(ownerList = owners) {
    try {
      setLoading(true);
      setError('');

      let all = [];
      if (filterOwner) {
        const res = await inventoryService.getOwnerLedger(parseInt(filterOwner), 0, 500);
        all = res?.content || [];
      } else {
        const ownerIds = (ownerList.length ? ownerList : owners).map(o => o.ownerId);
        if (!ownerIds.length) { setEntries([]); return; }
        const results = await Promise.allSettled(
          ownerIds.map(id => inventoryService.getOwnerLedger(id, 0, 200))
        );
        all = results
          .filter(r => r.status === 'fulfilled')
          .flatMap(r => r.value?.content || []);
      }

      // Date filter
      all = all.filter(e => {
        const date = e.entryDate || '';
        return date >= fromDate && date <= toDate;
      });

      // Type filter
      if (filterType) {
        all = all.filter(e => e.entryType === filterType);
      }

      // Sort by entryDate desc, then id desc
      all.sort((a, b) => {
        const da = a.entryDate || '';
        const db = b.entryDate || '';
        const cmp = db.localeCompare(da);
        return cmp !== 0 ? cmp : (b.entryId ?? 0) - (a.entryId ?? 0);
      });

      setEntries(all);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleExportExcel() {
    if (entries.length === 0) return;
    const rows = entries.map((e, i) => ({
      '#': i + 1,
      'Owner': e.ownerName || '',
      'Date': e.entryDate ? formatDate(e.entryDate) : '—',
      'Type': e.entryType === 'RECEIPT' ? 'Received' : 'Returned',
      'Quantity': e.quantity ?? 0,
      'Remarks': e.remarks || '',
    }));
    rows.push({});
    rows.push({
      '#': '',
      'Owner': 'TOTAL',
      'Date': '',
      'Type': '',
      'Quantity': totals.received - totals.returned,
      'Remarks': `Received: ${totals.received} | Returned: ${totals.returned} | In Hand: ${totals.inHand}`,
    });
    exportToExcel({
      rows,
      fileName: `Nool_Inventory_Report_${fromDate}_to_${toDate}`,
      sheetName: 'Inventory Report',
      columnWidths: [4, 22, 15, 12, 12, 40],
    });
  }

  // Period totals (filtered)
  const periodReceived = entries.filter(e => e.entryType === 'RECEIPT').reduce((s, e) => s + (e.quantity ?? 0), 0);
  const periodReturned = entries.filter(e => e.entryType === 'RETURN').reduce((s, e) => s + (e.quantity ?? 0), 0);

  // All-time in-hand from getAllOwnersInventory
  const ownerFilterId = filterOwner ? parseInt(filterOwner) : null;
  const allTimeInHand = (ownerFilterId
    ? ownersInventory.filter(o => o.ownerId === ownerFilterId)
    : ownersInventory
  ).reduce((s, o) => s + (o.sareesInHand ?? 0), 0);

  const totals = {
    received: periodReceived,
    returned: periodReturned,
    inHand: allTimeInHand,
    entries: entries.length,
  };

  // Per-owner summary (from filtered entries)
  const ownerSummary = Object.values(
    entries.reduce((acc, e) => {
      const key = e.ownerName || `Owner#${e.ownerId}`;
      if (!acc[key]) acc[key] = { owner: key, ownerId: e.ownerId, received: 0, returned: 0, count: 0 };
      if (e.entryType === 'RECEIPT') acc[key].received += e.quantity ?? 0;
      else if (e.entryType === 'RETURN') acc[key].returned += e.quantity ?? 0;
      acc[key].count += 1;
      return acc;
    }, {})
  ).map(o => {
    const inv = ownersInventory.find(x => x.ownerId === o.ownerId);
    return { ...o, inHand: inv?.sareesInHand ?? 0 };
  }).sort((a, b) => b.received - a.received);

  return (
    <MainLayout>
      <div className="space-y-6 pb-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">📋 Inventory Report</h1>
            <p className="text-gray-500 mt-1">Full ledger — every receipt and return</p>
          </div>
          <Button
            onClick={handleExportExcel}
            disabled={entries.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4" />
            Download Excel
          </Button>
        </div>

        {error && <ErrorMessage message={error} onRetry={() => fetchEntries()} />}

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
            </div>
            <div className="flex-1 min-w-[160px]">
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
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                <option value="">All</option>
                <option value="RECEIPT">Receipts</option>
                <option value="RETURN">Returns</option>
              </select>
            </div>
            <Button onClick={() => fetchEntries()}>
              <Filter className="w-4 h-4 mr-1" /> Apply
            </Button>
            <Button variant="outline" onClick={() => {
              setFromDate(firstOfYear); setToDate(today); setFilterOwner(''); setFilterType('');
              setTimeout(() => fetchEntries(), 0);
            }}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Summary Totals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Received', value: totals.received, icon: ArrowDownCircle, color: 'indigo', sub: 'In selected period' },
            { label: 'Total Returned', value: totals.returned, icon: ArrowUpCircle, color: 'emerald', sub: 'In selected period' },
            { label: 'Sarees In Hand', value: totals.inHand, icon: Package, color: 'amber', sub: 'All-time balance' },
            { label: 'Total Entries', value: totals.entries, icon: AlertCircle, color: 'rose', sub: 'Ledger rows' },
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

        {loading ? <Loading text="Loading report..." /> : entries.length === 0 ? (
          <EmptyState message="No ledger entries found for the selected filters" icon="📋" />
        ) : (
          <>
            {/* Ledger Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Ledger Entries</h2>
                  <p className="text-sm text-gray-500">{entries.length} records · {fromDate} to {toDate}</p>
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
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-center">Quantity</th>
                      <th className="px-4 py-3 text-left">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {entries.map((e, i) => {
                      const isReceipt = e.entryType === 'RECEIPT';
                      return (
                        <tr key={e.entryId || i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">{e.ownerName}</td>
                          <td className="px-4 py-3 text-gray-700">{formatDate(e.entryDate)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isReceipt
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {isReceipt ? <ArrowDownCircle className="w-3.5 h-3.5" /> : <ArrowUpCircle className="w-3.5 h-3.5" />}
                              {isReceipt ? 'Received' : 'Returned'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-bold ${isReceipt ? 'text-indigo-600' : 'text-emerald-600'}`}>
                              {isReceipt ? '+' : '−'}{e.quantity ?? 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs max-w-[240px] truncate">{e.remarks || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold text-gray-800 border-t-2 border-gray-200">
                      <td colSpan={4} className="px-4 py-3 text-right text-sm">Period Totals</td>
                      <td className="px-4 py-3 text-center text-base">
                        <span className="text-indigo-700">+{totals.received}</span>
                        {' / '}
                        <span className="text-emerald-700">−{totals.returned}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">In hand (all-time): {totals.inHand}</td>
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
                  <p className="text-sm text-gray-500">Aggregated period totals per saree owner</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                        <th className="px-4 py-3 text-left">Owner</th>
                        <th className="px-4 py-3 text-center">Entries</th>
                        <th className="px-4 py-3 text-center">Received (period)</th>
                        <th className="px-4 py-3 text-center">Returned (period)</th>
                        <th className="px-4 py-3 text-center">In Hand (all-time)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ownerSummary.map((o, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold text-gray-900">{o.owner}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{o.count}</td>
                          <td className="px-4 py-3 text-center font-bold text-indigo-600">{o.received}</td>
                          <td className="px-4 py-3 text-center font-bold text-emerald-600">{o.returned}</td>
                          <td className="px-4 py-3 text-center font-bold text-amber-600">{o.inHand > 0 ? o.inHand : '—'}</td>
                        </tr>
                      ))}
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
