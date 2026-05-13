import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Button, Input, Modal, Loading, ErrorMessage, EmptyState } from '../components/Common';
import { inventoryService, ownerService } from '../services/api';
import { formatDate } from '../utils/formatters';
import { exportToExcel } from '../utils/excelExporter';
import {
  Plus, RefreshCw, Package, ArrowDownCircle, ArrowUpCircle, RotateCcw,
  Download, ChevronRight, Search, AlertTriangle, Trash2, Filter, Users, Calendar,
} from 'lucide-react';

const todayIso = () => new Date().toISOString().split('T')[0];

export const InventoryManagementPage = () => {
  const today = todayIso();
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const firstOfYear = `${new Date().getFullYear()}-01-01`;

  // ── Data state ─────────────────────────────────────────────────────────────
  const [ownersInventory, setOwnersInventory] = useState([]);
  const [owners, setOwners] = useState([]);
  const [allEntries, setAllEntries] = useState([]); // all entries (used for weekly + ledger)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Modal state ────────────────────────────────────────────────────────────
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerLedger, setOwnerLedger] = useState([]);
  const [ownerLedgerLoading, setOwnerLedgerLoading] = useState(false);

  // ── Form state ─────────────────────────────────────────────────────────────
  const blankForm = { ownerId: '', entryDate: today, quantity: '', remarks: '' };
  const [receiptForm, setReceiptForm] = useState(blankForm);
  const [returnForm, setReturnForm] = useState(blankForm);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // ── Filter state for ledger section ────────────────────────────────────────
  const [fromDate, setFromDate] = useState(firstOfYear);
  const [toDate, setToDate] = useState(today);
  const [filterOwner, setFilterOwner] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  // ── Loaders ────────────────────────────────────────────────────────────────
  async function fetchAll() {
    try {
      setLoading(true);
      setError('');
      const [invRes, ownerRes] = await Promise.all([
        inventoryService.getAllOwnersInventory(),
        ownerService.getList(0, 200),
      ]);
      const ownerList = (ownerRes?.content || []).map(o => ({ id: o.ownerId, name: o.ownerName }));
      setOwnersInventory(Array.isArray(invRes) ? invRes : []);
      setOwners(ownerList);

      // Fetch all entries across all owners (for weekly breakdown + ledger table)
      const ownerIds = (invRes || []).map(o => o.ownerId);
      if (ownerIds.length === 0) {
        setAllEntries([]);
      } else {
        const results = await Promise.allSettled(
          ownerIds.map(id => inventoryService.getOwnerLedger(id, 0, 500))
        );
        const merged = results
          .filter(r => r.status === 'fulfilled')
          .flatMap(r => r.value?.content || []);
        setAllEntries(merged);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function openLedger(owner) {
    setSelectedOwner(owner);
    setShowLedgerModal(true);
    setOwnerLedger([]);
    try {
      setOwnerLedgerLoading(true);
      const res = await inventoryService.getOwnerLedger(owner.ownerId, 0, 200);
      setOwnerLedger(res?.content || []);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setOwnerLedgerLoading(false);
    }
  }

  // ── Receipt / Return ───────────────────────────────────────────────────────
  const openReceipt = (preselectOwner = null) => {
    setReceiptForm({ ...blankForm, ownerId: preselectOwner ? String(preselectOwner.ownerId) : '' });
    setModalError('');
    setShowReceiptModal(true);
  };

  const openReturn = (preselectOwner = null) => {
    setReturnForm({ ...blankForm, ownerId: preselectOwner ? String(preselectOwner.ownerId) : '' });
    setModalError('');
    setShowReturnModal(true);
  };

  const submitReceipt = async () => {
    if (!receiptForm.ownerId) { setModalError('Please select an owner'); return; }
    if (!receiptForm.entryDate) { setModalError('Date is required'); return; }
    const qty = parseInt(receiptForm.quantity);
    if (!qty || qty <= 0) { setModalError('Quantity must be greater than 0'); return; }
    try {
      setSubmitting(true);
      setModalError('');
      await inventoryService.addReceipt({
        ownerId: parseInt(receiptForm.ownerId),
        entryDate: receiptForm.entryDate,
        quantity: qty,
        remarks: receiptForm.remarks || null,
      });
      setShowReceiptModal(false);
      setReceiptForm(blankForm);
      await fetchAll();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitReturn = async () => {
    if (!returnForm.ownerId) { setModalError('Please select an owner'); return; }
    if (!returnForm.entryDate) { setModalError('Date is required'); return; }
    const qty = parseInt(returnForm.quantity);
    if (!qty || qty <= 0) { setModalError('Quantity must be greater than 0'); return; }
    const owner = ownersInventory.find(o => o.ownerId === parseInt(returnForm.ownerId));
    const inHand = owner?.sareesInHand ?? 0;
    if (qty > inHand) { setModalError(`Cannot return more than ${inHand} in hand`); return; }
    try {
      setSubmitting(true);
      setModalError('');
      await inventoryService.addReturn({
        ownerId: parseInt(returnForm.ownerId),
        entryDate: returnForm.entryDate,
        quantity: qty,
        remarks: returnForm.remarks || null,
      });
      setShowReturnModal(false);
      setReturnForm(blankForm);
      if (showLedgerModal && selectedOwner?.ownerId === parseInt(returnForm.ownerId)) {
        await openLedger(selectedOwner);
      }
      await fetchAll();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete entry ───────────────────────────────────────────────────────────
  const deleteEntry = async (entry) => {
    if (!window.confirm(
      `Delete this ${entry.entryType === 'RECEIPT' ? 'receipt' : 'return'} of ${entry.quantity} sarees for ${entry.ownerName}?`
    )) return;
    try {
      await inventoryService.deleteEntry(entry.entryId);
      await fetchAll();
      if (showLedgerModal && selectedOwner) {
        await openLedger(selectedOwner);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Totals (all-time) ──────────────────────────────────────────────────────
  const totals = ownersInventory.reduce(
    (acc, o) => ({
      received: acc.received + (o.totalSareesGiven ?? 0),
      returned: acc.returned + (o.totalSareesReturned ?? 0),
      inHand: acc.inHand + (o.sareesInHand ?? 0),
    }),
    { received: 0, returned: 0, inHand: 0 }
  );
  const ownersWithNegative = ownersInventory.filter(o => (o.sareesInHand ?? 0) < 0);

  // ── Weekly breakdown (current month) ───────────────────────────────────────
  const weekly = useMemo(() => {
    const monthStart = new Date(firstOfMonth);
    const monthEnd = new Date(today);
    const weeks = [];
    // Build 4-5 week windows for the current month
    let weekStart = new Date(monthStart);
    let i = 1;
    while (weekStart <= monthEnd) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const realEnd = weekEnd > monthEnd ? new Date(monthEnd) : weekEnd;
      weeks.push({
        label: `W${i}`,
        dateLabel: `${weekStart.getDate()}–${realEnd.getDate()}`,
        start: new Date(weekStart),
        end: new Date(realEnd),
        received: 0,
        returned: 0,
      });
      i += 1;
      weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() + 1);
    }

    // Sum entries into weeks
    allEntries.forEach(e => {
      if (!e.entryDate) return;
      const d = new Date(e.entryDate);
      const wk = weeks.find(w => d >= w.start && d <= w.end);
      if (!wk) return;
      if (e.entryType === 'RECEIPT') wk.received += e.quantity || 0;
      else if (e.entryType === 'RETURN') wk.returned += e.quantity || 0;
    });

    // Running balance: start of month balance = current all-time in-hand
    // minus (received in current month) plus (returned in current month)
    const periodReceived = weeks.reduce((s, w) => s + w.received, 0);
    const periodReturned = weeks.reduce((s, w) => s + w.returned, 0);
    const startOfMonthBalance = totals.inHand - periodReceived + periodReturned;
    let running = startOfMonthBalance;
    weeks.forEach(w => {
      running = running + w.received - w.returned;
      w.endBalance = running;
    });
    return weeks;
  }, [allEntries, totals.inHand, firstOfMonth, today]);

  // ── Filtered ledger entries ────────────────────────────────────────────────
  const filteredEntries = useMemo(() => {
    let list = allEntries.slice();
    list = list.filter(e => {
      const d = e.entryDate || '';
      return d >= fromDate && d <= toDate;
    });
    if (filterOwner) {
      list = list.filter(e => e.ownerId === parseInt(filterOwner));
    }
    if (filterType) {
      list = list.filter(e => e.entryType === filterType);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(e =>
        (e.ownerName || '').toLowerCase().includes(q) ||
        (e.remarks || '').toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const cmp = (b.entryDate || '').localeCompare(a.entryDate || '');
      return cmp !== 0 ? cmp : (b.entryId ?? 0) - (a.entryId ?? 0);
    });
    return list;
  }, [allEntries, fromDate, toDate, filterOwner, filterType, search]);

  const periodReceived = filteredEntries.filter(e => e.entryType === 'RECEIPT').reduce((s, e) => s + (e.quantity ?? 0), 0);
  const periodReturned = filteredEntries.filter(e => e.entryType === 'RETURN').reduce((s, e) => s + (e.quantity ?? 0), 0);

  // ── Excel export (full ledger view) ────────────────────────────────────────
  const handleExportLedger = () => {
    if (!filteredEntries.length) return;
    const rows = filteredEntries.map((e, i) => ({
      '#': i + 1,
      'Owner': e.ownerName || '',
      'Date': e.entryDate ? formatDate(e.entryDate) : '',
      'Type': e.entryType === 'RECEIPT' ? 'Received' : 'Returned',
      'Quantity': e.quantity ?? 0,
      'Remarks': e.remarks || '',
    }));
    exportToExcel({
      rows,
      fileName: `Nool_Inventory_${fromDate}_to_${toDate}`,
      sheetName: 'Ledger',
      columnWidths: [4, 22, 15, 12, 12, 40],
    });
  };

  // ── Search filter for owner cards ──────────────────────────────────────────
  const [ownerCardSearch, setOwnerCardSearch] = useState('');
  const visibleOwners = ownersInventory.filter(o =>
    !ownerCardSearch.trim() ||
    (o.ownerName || '').toLowerCase().includes(ownerCardSearch.trim().toLowerCase())
  );

  if (loading) return <MainLayout><Loading text="Loading inventory..." /></MainLayout>;

  const monthName = new Date(firstOfMonth).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">📦 Inventory</h1>
            <p className="text-gray-500 mt-1">Track every saree received and returned, per owner</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={fetchAll}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Button variant="outline" onClick={() => openReturn(null)}>
              <RotateCcw className="w-4 h-4 mr-1" /> Add Return
            </Button>
            <Button onClick={() => openReceipt(null)}>
              <Plus className="w-4 h-4 mr-1" /> Add Receipt
            </Button>
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchAll} />}

        {/* ── Data integrity warning ── */}
        {ownersWithNegative.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-rose-900">Data inconsistency detected</p>
              <p className="text-sm text-rose-700 mt-1">
                {ownersWithNegative.length} owner{ownersWithNegative.length > 1 ? 's have' : ' has'} more returns recorded than receipts.
                Check entries for: <strong>{ownersWithNegative.map(o => o.ownerName).join(', ')}</strong>.
                Use the delete button in the ledger table below to remove incorrect entries.
              </p>
            </div>
          </div>
        )}

        {/* ── All-time KPI Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: ArrowDownCircle, color: 'indigo', label: 'Total Received', value: totals.received, sub: 'All-time' },
            { icon: ArrowUpCircle, color: 'emerald', label: 'Total Returned', value: totals.returned, sub: 'All-time' },
            { icon: Package, color: 'amber', label: 'Sarees In Hand', value: totals.inHand, sub: 'Current balance' },
            { icon: Users, color: 'purple', label: 'Active Owners', value: ownersInventory.length, sub: 'In system' },
          ].map((s, i) => {
            const clr = {
              indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-600', border: 'border-indigo-100' },
              emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-600', border: 'border-emerald-100' },
              amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-600', border: 'border-amber-100' },
              purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-600', border: 'border-purple-100' },
            }[s.color];
            return (
              <div key={i} className={`rounded-2xl p-5 border ${clr.bg} ${clr.border}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white border ${clr.border} mb-3`}>
                  <s.icon className={`w-5 h-5 ${clr.icon}`} />
                </div>
                <p className={`text-3xl font-bold ${clr.text}`}>{s.value}</p>
                <p className="text-sm font-semibold text-gray-700 mt-1">{s.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ── Weekly Breakdown for Current Month ── */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Week-by-week summary</h2>
              <p className="text-sm text-gray-500">{monthName} — how many sarees came in, went back, and are still with us</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">Week</th>
                  <th className="px-6 py-3 text-center">Sarees Received</th>
                  <th className="px-6 py-3 text-center">Sarees Returned</th>
                  <th className="px-6 py-3 text-center">Sarees Still With Us</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {weekly.map((w, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">Week {i + 1}</div>
                      <div className="text-xs text-gray-500">{w.dateLabel} {monthName.split(' ')[0]}</div>
                    </td>
                    <td className="px-6 py-4 text-center text-xl font-bold text-indigo-600">
                      {w.received > 0 ? w.received : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center text-xl font-bold text-emerald-600">
                      {w.returned > 0 ? w.returned : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xl font-bold ${
                        w.endBalance < 0 ? 'text-rose-600' : 'text-amber-700'
                      }`}>
                        {w.endBalance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                  <td className="px-6 py-3 text-sm text-gray-700">Month total</td>
                  <td className="px-6 py-3 text-center text-indigo-700 text-lg">
                    {weekly.reduce((s, w) => s + w.received, 0)}
                  </td>
                  <td className="px-6 py-3 text-center text-emerald-700 text-lg">
                    {weekly.reduce((s, w) => s + w.returned, 0)}
                  </td>
                  <td className="px-6 py-3 text-center text-amber-700 text-lg">
                    {weekly.length ? weekly[weekly.length - 1].endBalance : totals.inHand}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="px-6 py-3 bg-amber-50/50 border-t border-amber-100 text-xs text-gray-600 space-y-1">
            <p>
              <strong className="text-amber-700">Sarees Still With Us</strong> is the running count of sarees that haven't been returned yet.
            </p>
            <p>
              It carries forward across weeks <strong>and across months</strong> — whatever's pending at month-end becomes the starting count for next month. Nothing is ever lost.
            </p>
          </div>
        </Card>

        {/* ── Per-Owner Cards ── */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-3">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Owners</h2>
              <p className="text-sm text-gray-500">Tap a card to view its full ledger</p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={ownerCardSearch}
                onChange={e => setOwnerCardSearch(e.target.value)}
                placeholder="Search owner..."
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
            </div>
          </div>

          {!visibleOwners.length ? (
            <EmptyState message="No owners found" icon="📦" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visibleOwners.map(o => {
                const inHand = o.sareesInHand ?? 0;
                const hasStock = inHand > 0;
                const isNegative = inHand < 0;
                return (
                  <div
                    key={o.ownerId}
                    className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-4 ${
                      isNegative ? 'border-rose-200' : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => openLedger(o)}
                      className="flex items-start justify-between text-left w-full group"
                    >
                      <div>
                        <p className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                          {o.ownerName}
                        </p>
                        <p className="text-sm text-gray-500">Tap to view ledger</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                    </button>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-indigo-50 rounded-xl p-2.5">
                        <p className="text-xl font-bold text-indigo-700">{o.totalSareesGiven ?? 0}</p>
                        <p className="text-xs text-indigo-500 font-medium">Received</p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-2.5">
                        <p className="text-xl font-bold text-emerald-700">{o.totalSareesReturned ?? 0}</p>
                        <p className="text-xs text-emerald-500 font-medium">Returned</p>
                      </div>
                      <div className={`rounded-xl p-2.5 ${
                        isNegative ? 'bg-rose-50' : hasStock ? 'bg-amber-50' : 'bg-gray-50'
                      }`}>
                        <p className={`text-xl font-bold ${
                          isNegative ? 'text-rose-700' : hasStock ? 'text-amber-700' : 'text-gray-400'
                        }`}>
                          {inHand}
                        </p>
                        <p className={`text-xs font-medium ${
                          isNegative ? 'text-rose-500' : hasStock ? 'text-amber-500' : 'text-gray-400'
                        }`}>In Hand</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => openReceipt(o)}
                        className="flex-1 flex items-center justify-center gap-1 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors border border-indigo-200"
                      >
                        <Plus className="w-4 h-4" /> Receipt
                      </button>
                      <button
                        onClick={() => openReturn(o)}
                        disabled={!hasStock}
                        className="flex-1 flex items-center justify-center gap-1 text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-colors border border-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <RotateCcw className="w-4 h-4" /> Return
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Ledger Report Section ── */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">All Saree Movements</h2>
              <p className="text-sm text-gray-500">Every receipt and return — search, filter or download</p>
            </div>
            <button
              onClick={handleExportLedger}
              disabled={!filteredEntries.length}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
            >
              <Download className="w-4 h-4" /> Download Excel
            </button>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row gap-3">
            <div className="flex-1 min-w-[130px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1">From</label>
              <input
                type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
            </div>
            <div className="flex-1 min-w-[130px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1">To</label>
              <input
                type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Owner</label>
              <select
                value={filterOwner} onChange={e => setFilterOwner(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                <option value="">All</option>
                {owners.map(o => <option key={o.id} value={String(o.id)}>{o.name}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[130px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
              <select
                value={filterType} onChange={e => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                <option value="">All</option>
                <option value="RECEIPT">Receipts</option>
                <option value="RETURN">Returns</option>
              </select>
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Owner or remarks"
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setFromDate(firstOfYear); setToDate(today); setFilterOwner(''); setFilterType(''); setSearch(''); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-white"
                title="Reset filters"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Period summary */}
          <div className="px-6 py-3 bg-white border-b border-gray-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="text-gray-700">
              Showing <strong className="text-gray-900">{filteredEntries.length}</strong> {filteredEntries.length === 1 ? 'entry' : 'entries'}
            </span>
            <span className="text-indigo-700">
              <strong>{periodReceived}</strong> sarees received
            </span>
            <span className="text-emerald-700">
              <strong>{periodReturned}</strong> sarees returned
            </span>
          </div>

          {/* Table */}
          {!filteredEntries.length ? (
            <div className="py-12">
              <EmptyState message="No ledger entries match the filters" icon="📋" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white text-gray-600 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                    <th className="px-4 py-3 text-left w-12">#</th>
                    <th className="px-4 py-3 text-left">Owner</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">What Happened</th>
                    <th className="px-4 py-3 text-center">Sarees</th>
                    <th className="px-4 py-3 text-left">Notes</th>
                    <th className="px-4 py-3 text-center w-16"><span className="sr-only">Delete</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEntries.map((e, i) => {
                    const isReceipt = e.entryType === 'RECEIPT';
                    return (
                      <tr key={e.entryId || i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
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
                          <span className={`text-lg font-bold ${isReceipt ? 'text-indigo-700' : 'text-emerald-700'}`}>
                            {e.quantity ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs max-w-[240px] truncate" title={e.remarks || ''}>
                          {e.remarks || '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => deleteEntry(e)}
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                            title="Delete this entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ── Ledger Drawer ── */}
      <Modal
        isOpen={showLedgerModal}
        onClose={() => { setShowLedgerModal(false); setSelectedOwner(null); setOwnerLedger([]); }}
        title={`📚 ${selectedOwner?.ownerName ?? ''} — Ledger`}
        size="lg"
      >
        {selectedOwner && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-indigo-700">{selectedOwner.totalSareesGiven ?? 0}</p>
                <p className="text-xs text-indigo-500 font-medium">Total Received</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-700">{selectedOwner.totalSareesReturned ?? 0}</p>
                <p className="text-xs text-emerald-500 font-medium">Total Returned</p>
              </div>
              <div className={`rounded-xl p-4 text-center ${
                (selectedOwner.sareesInHand ?? 0) < 0 ? 'bg-rose-50' : 'bg-amber-50'
              }`}>
                <p className={`text-2xl font-bold ${
                  (selectedOwner.sareesInHand ?? 0) < 0 ? 'text-rose-700' : 'text-amber-700'
                }`}>
                  {selectedOwner.sareesInHand ?? 0}
                </p>
                <p className={`text-xs font-medium ${
                  (selectedOwner.sareesInHand ?? 0) < 0 ? 'text-rose-500' : 'text-amber-500'
                }`}>In Hand</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => { setShowLedgerModal(false); openReceipt(selectedOwner); }}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Receipt
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                disabled={(selectedOwner.sareesInHand ?? 0) <= 0}
                onClick={() => { setShowLedgerModal(false); openReturn(selectedOwner); }}
              >
                <RotateCcw className="w-4 h-4 mr-1" /> Add Return
              </Button>
            </div>

            <div>
              <p className="font-semibold text-gray-700 mb-2">All Entries</p>
              {ownerLedgerLoading ? (
                <p className="text-sm text-gray-400 text-center py-4">Loading entries...</p>
              ) : !ownerLedger.length ? (
                <p className="text-sm text-gray-400 italic text-center py-6">No entries recorded yet</p>
              ) : (
                <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-12 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0">
                    <span className="col-span-2">Type</span>
                    <span className="col-span-3">Date</span>
                    <span className="col-span-2 text-right">Qty</span>
                    <span className="col-span-4">Remarks</span>
                    <span className="col-span-1 text-right">·</span>
                  </div>
                  {ownerLedger.map(e => {
                    const isReceipt = e.entryType === 'RECEIPT';
                    return (
                      <div key={e.entryId} className="grid grid-cols-12 px-4 py-3 text-sm items-center hover:bg-gray-50">
                        <span className="col-span-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            isReceipt ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {isReceipt ? '📥' : '📤'}
                          </span>
                        </span>
                        <span className="col-span-3 text-gray-700 font-medium">{formatDate(e.entryDate)}</span>
                        <span className={`col-span-2 text-right font-bold ${
                          isReceipt ? 'text-indigo-700' : 'text-emerald-700'
                        }`}>
                          {isReceipt ? '+' : '−'}{e.quantity}
                        </span>
                        <span className="col-span-4 text-gray-500 text-xs truncate" title={e.remarks || ''}>
                          {e.remarks || '—'}
                        </span>
                        <span className="col-span-1 text-right">
                          <button
                            onClick={() => deleteEntry(e)}
                            className="text-rose-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Receipt Modal ── */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => { setShowReceiptModal(false); setModalError(''); }}
        title="📥 New Receipt"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Owner *</label>
            <select
              value={receiptForm.ownerId}
              onChange={e => setReceiptForm(f => ({ ...f, ownerId: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              <option value="">Select owner...</option>
              {owners.map(o => <option key={o.id} value={String(o.id)}>{o.name}</option>)}
            </select>
          </div>
          <Input
            label="Received Date" type="date" value={receiptForm.entryDate}
            onChange={e => setReceiptForm(f => ({ ...f, entryDate: e.target.value }))} required
          />
          <Input
            label="Quantity Received" type="number" min="1" value={receiptForm.quantity}
            onChange={e => setReceiptForm(f => ({ ...f, quantity: e.target.value }))} placeholder="e.g. 100" required
          />
          <Input
            label="Remarks (optional)" value={receiptForm.remarks}
            onChange={e => setReceiptForm(f => ({ ...f, remarks: e.target.value }))}
          />
          {modalError && <p className="text-red-600 text-sm">{modalError}</p>}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={submitReceipt} isLoading={submitting}>Save Receipt</Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowReceiptModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* ── Return Modal ── */}
      <Modal
        isOpen={showReturnModal}
        onClose={() => { setShowReturnModal(false); setModalError(''); }}
        title="📤 New Return"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Owner *</label>
            <select
              value={returnForm.ownerId}
              onChange={e => setReturnForm(f => ({ ...f, ownerId: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              <option value="">Select owner...</option>
              {ownersInventory
                .filter(o => (o.sareesInHand ?? 0) > 0)
                .map(o => (
                  <option key={o.ownerId} value={String(o.ownerId)}>
                    {o.ownerName} ({o.sareesInHand} in hand)
                  </option>
                ))}
            </select>
          </div>
          {returnForm.ownerId && (() => {
            const o = ownersInventory.find(x => x.ownerId === parseInt(returnForm.ownerId));
            return o ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
                <p className="text-amber-800">
                  <strong>{o.sareesInHand}</strong> sarees currently in hand with {o.ownerName}
                </p>
              </div>
            ) : null;
          })()}
          <Input
            label="Return Date" type="date" value={returnForm.entryDate}
            onChange={e => setReturnForm(f => ({ ...f, entryDate: e.target.value }))} required
          />
          <Input
            label="Quantity to Return" type="number" min="1" value={returnForm.quantity}
            onChange={e => setReturnForm(f => ({ ...f, quantity: e.target.value }))} placeholder="e.g. 50" required
          />
          <Input
            label="Remarks (optional)" value={returnForm.remarks}
            onChange={e => setReturnForm(f => ({ ...f, remarks: e.target.value }))}
          />
          {modalError && <p className="text-red-600 text-sm">{modalError}</p>}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={submitReturn} isLoading={submitting}>Save Return</Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowReturnModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default InventoryManagementPage;
