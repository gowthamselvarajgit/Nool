import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { MainLayout } from '../components/Layout';
import { Card, Button, Input, Modal, Loading, ErrorMessage, EmptyState } from '../components/Common';
import { inventoryService, ownerService } from '../services/api';
import { formatDate } from '../utils/formatters';
import { Plus, RefreshCw, Package, ArrowDownCircle, ArrowUpCircle, RotateCcw, Download, CheckCircle, ChevronRight } from 'lucide-react';

export const InventoryManagementPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [owners, setOwners] = useState([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [filterOwner, setFilterOwner] = useState('');

  // Computed summary from transactions (avoids stale backend legacy data)
  const summary = {
    received: transactions.reduce((s, t) => s + (t.receivedQuantity ?? 0), 0),
    returned: transactions.reduce((s, t) => s + (t.totalReturned ?? 0), 0),
    inHand: transactions.reduce((s, t) => s + (t.sareesInHand ?? 0), 0),
  };

  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [receiptForm, setReceiptForm] = useState({ ownerId: '', receivedDate: today, receivedQuantity: '', remarks: '' });
  const [returnForm, setReturnForm] = useState({ returnedDate: today, returnedQuantity: '', remarks: '' });

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  async function fetchAll() {
    try {
      setLoading(true); setError('');
      const ownerRes = await ownerService.getList(0, 200);
      const ownerList = ownerRes?.content || [];
      setOwners(ownerList.map(o => ({ id: o.ownerId, name: o.ownerName })));
      await loadTx(ownerList, filterOwner);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function loadTx(ownerList, ownerFilter) {
    try {
      setLoading(true);
      let all = [];
      if (ownerFilter) {
        const res = await inventoryService.getOwnerTransactions(parseInt(ownerFilter), 0, 200);
        all = res?.content || [];
      } else {
        const ids = (ownerList.length ? ownerList : owners).slice(0, 15).map(o => o.id);
        if (!ids.length) { setTransactions([]); return; }
        const results = await Promise.allSettled(ids.map(id => inventoryService.getOwnerTransactions(id, 0, 100)));
        all = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value?.content || []);
        all.sort((a, b) => (b.receivedDate || '').localeCompare(a.receivedDate || ''));
      }
      setTransactions(all);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (owners.length) loadTx(owners, filterOwner); }, [owners]); // eslint-disable-line

  // ── Receipt ───────────────────────────────────────────────────────────────
  const handleAddReceipt = async () => {
    if (!receiptForm.ownerId) { setError('Please select an owner'); return; }
    if (!receiptForm.receivedDate) { setError('Date required'); return; }
    if (!receiptForm.receivedQuantity || Number(receiptForm.receivedQuantity) <= 0) { setError('Quantity must be > 0'); return; }
    try {
      setSubmitting(true); setError('');
      await inventoryService.createTransaction({
        ownerId: parseInt(receiptForm.ownerId),
        receivedDate: receiptForm.receivedDate,
        receivedQuantity: parseInt(receiptForm.receivedQuantity),
        remarks: receiptForm.remarks || null,
      });
      setShowReceiptModal(false);
      setReceiptForm({ ownerId: '', receivedDate: today, receivedQuantity: '', remarks: '' });
      await fetchAll();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  // ── Partial return ────────────────────────────────────────────────────────
  const handleAddReturn = async () => {
    if (!returnForm.returnedDate) { setError('Date required'); return; }
    const qty = parseInt(returnForm.returnedQuantity);
    if (!qty || qty <= 0) { setError('Quantity must be > 0'); return; }
    const inHand = selectedTx?.sareesInHand ?? 0;
    if (qty > inHand) { setError(`Cannot return more than ${inHand} in hand`); return; }
    try {
      setSubmitting(true); setError('');
      await inventoryService.addPartialReturn(selectedTx.transactionId, {
        returnedDate: returnForm.returnedDate,
        returnedQuantity: qty,
        remarks: returnForm.remarks || null,
      });
      setShowReturnModal(false);
      setShowDetailModal(false);
      setSelectedTx(null);
      setReturnForm({ returnedDate: today, returnedQuantity: '', remarks: '' });
      await fetchAll();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const openReturn = (tx) => {
    setSelectedTx(tx);
    setReturnForm({ returnedDate: today, returnedQuantity: '', remarks: '' });
    setError('');
    setShowDetailModal(false);
    setShowReturnModal(true);
  };

  const openDetail = (tx) => { setSelectedTx(tx); setShowDetailModal(true); };

  // ── Excel ─────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = transactions.map((tx, i) => ({
      '#': i + 1,
      'Owner': tx.ownerName,
      'Received Date': formatDate(tx.receivedDate),
      'Qty Received': tx.receivedQuantity ?? 0,
      'Total Returned': tx.totalReturned ?? 0,
      'In Hand': tx.sareesInHand ?? 0,
      'Status': tx.fullyReturned ? 'Fully Returned' : (tx.totalReturned ?? 0) > 0 ? 'Partial' : 'Pending',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 4 }, { wch: 20 }, { wch: 15 }, { wch: 13 }, { wch: 14 }, { wch: 10 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, `Inventory_${today}.xlsx`);
  };

  // ── Status helpers ────────────────────────────────────────────────────────
  const statusBadge = (tx) => {
    if (tx.fullyReturned) return { label: '✓ Fully Returned', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    if ((tx.totalReturned ?? 0) > 0) return { label: '⟳ Partial', cls: 'bg-blue-100 text-blue-700 border-blue-200' };
    return { label: '⏳ Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
  };

  if (loading) return <MainLayout><Loading text="Loading inventory..." /></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">📦 Inventory Management</h1>
            <p className="text-gray-500 mt-1">Click any card to view details or add a return</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchAll}><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
            <Button variant="outline" onClick={handleExport} disabled={!transactions.length}><Download className="w-4 h-4 mr-1" />Excel</Button>
            <Button onClick={() => { setError(''); setShowReceiptModal(true); }}><Plus className="w-4 h-4 mr-1" />New Receipt</Button>
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchAll} />}

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: ArrowDownCircle, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Total Received', value: summary.received },
            { icon: ArrowUpCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Total Returned', value: summary.returned },
            { icon: Package, color: 'text-amber-500', bg: 'bg-amber-50', label: 'In Hand', value: summary.inHand },
          ].map((s, i) => (
            <div key={i} className={`rounded-2xl p-5 ${s.bg} flex items-center gap-4`}>
              <s.icon className={`w-8 h-8 ${s.color} flex-shrink-0`} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Owner filter */}
        <div className="flex gap-3 items-center">
          <select
            value={filterOwner}
            onChange={e => { setFilterOwner(e.target.value); loadTx(owners, e.target.value); }}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            <option value="">All Owners</option>
            {owners.map(o => <option key={o.id} value={String(o.id)}>{o.name}</option>)}
          </select>
          <span className="text-sm text-gray-500">{transactions.length} transactions</span>
        </div>

        {/* ── Transaction Cards ── */}
        {!transactions.length ? (
          <EmptyState message="No transactions found" icon="📦" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {transactions.map(tx => {
              const badge = statusBadge(tx);
              const pct = tx.receivedQuantity > 0
                ? Math.round(((tx.totalReturned ?? 0) / tx.receivedQuantity) * 100)
                : 0;
              return (
                <div
                  key={tx.transactionId}
                  onClick={() => openDetail(tx)}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group p-5 flex flex-col gap-4"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{tx.ownerName}</p>
                      <p className="text-sm text-indigo-600 font-medium">{formatDate(tx.receivedDate)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.cls}`}>{badge.label}</span>
                  </div>

                  {/* Qty stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-indigo-50 rounded-xl p-2.5">
                      <p className="text-xl font-bold text-indigo-700">{tx.receivedQuantity ?? 0}</p>
                      <p className="text-xs text-indigo-500">Received</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-2.5">
                      <p className="text-xl font-bold text-emerald-700">{tx.totalReturned ?? 0}</p>
                      <p className="text-xs text-emerald-500">Returned</p>
                    </div>
                    <div className={`rounded-xl p-2.5 ${(tx.sareesInHand ?? 0) > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
                      <p className={`text-xl font-bold ${(tx.sareesInHand ?? 0) > 0 ? 'text-amber-700' : 'text-gray-400'}`}>
                        {tx.sareesInHand ?? 0}
                      </p>
                      <p className={`text-xs ${(tx.sareesInHand ?? 0) > 0 ? 'text-amber-500' : 'text-gray-400'}`}>In Hand</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Return progress</span><span>{pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-gray-400">
                      {(tx.returns?.length ?? 0)} return{(tx.returns?.length ?? 0) !== 1 ? 's' : ''} recorded
                    </span>
                    <div className="flex items-center gap-2">
                      {!tx.fullyReturned && (
                        <button
                          onClick={e => { e.stopPropagation(); openReturn(tx); }}
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200"
                        >
                          <RotateCcw className="w-3 h-3" /> Add Return
                        </button>
                      )}
                      {tx.fullyReturned && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="📦 Transaction Detail" size="lg">
        {selectedTx && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xl font-bold text-gray-900">{selectedTx.ownerName}</p>
                <p className="text-indigo-600">Received {selectedTx.receivedQuantity} sarees on {formatDate(selectedTx.receivedDate)}</p>
              </div>
              {!selectedTx.fullyReturned && (
                <Button onClick={() => { setShowDetailModal(false); openReturn(selectedTx); }}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Add Return
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Received', value: selectedTx.receivedQuantity, color: 'indigo' },
                { label: 'Returned', value: selectedTx.totalReturned ?? 0, color: 'emerald' },
                { label: 'In Hand', value: selectedTx.sareesInHand ?? 0, color: 'amber' },
              ].map((s, i) => (
                <div key={i} className={`bg-${s.color}-50 rounded-xl p-4 text-center`}>
                  <p className={`text-2xl font-bold text-${s.color}-700`}>{s.value}</p>
                  <p className={`text-xs text-${s.color}-500 font-medium`}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Return history */}
            <div>
              <p className="font-semibold text-gray-700 mb-2">Return History</p>
              {(selectedTx.returns?.length ?? 0) === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-4">No returns recorded yet</p>
              ) : (
                <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-3 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <span>#</span><span>Date</span><span className="text-right">Qty Returned</span>
                  </div>
                  {selectedTx.returns.map((r, i) => (
                    <div key={i} className="grid grid-cols-3 px-4 py-3 text-sm items-center">
                      <span className="text-gray-400">{i + 1}</span>
                      <span className="text-emerald-700 font-medium">{formatDate(r.returnedDate)}</span>
                      <span className="text-right font-bold text-emerald-700">−{r.returnedQuantity}</span>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 px-4 py-3 bg-gray-50 font-bold text-sm border-t-2 border-gray-200">
                    <span className="col-span-2 text-gray-700">Total Returned</span>
                    <span className="text-right text-emerald-700">{selectedTx.totalReturned ?? 0}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Receipt Modal ── */}
      <Modal isOpen={showReceiptModal} onClose={() => { setShowReceiptModal(false); setError(''); }} title="📥 New Receipt">
        <div className="space-y-4">
          <select value={receiptForm.ownerId} onChange={e => setReceiptForm(f => ({ ...f, ownerId: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
            <option value="">Select owner...</option>
            {owners.map(o => <option key={o.id} value={String(o.id)}>{o.name}</option>)}
          </select>
          <Input label="Received Date" type="date" value={receiptForm.receivedDate} onChange={e => setReceiptForm(f => ({ ...f, receivedDate: e.target.value }))} required />
          <Input label="Quantity Received" type="number" min="1" value={receiptForm.receivedQuantity} onChange={e => setReceiptForm(f => ({ ...f, receivedQuantity: e.target.value }))} placeholder="e.g. 100" required />
          <Input label="Remarks (optional)" value={receiptForm.remarks} onChange={e => setReceiptForm(f => ({ ...f, remarks: e.target.value }))} />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={handleAddReceipt} isLoading={submitting}>Save</Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowReceiptModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* ── Return Modal ── */}
      <Modal isOpen={showReturnModal} onClose={() => { setShowReturnModal(false); setError(''); }} title="📤 Record Return">
        {selectedTx && (
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm">
              <p className="font-bold text-indigo-800">{selectedTx.ownerName}</p>
              <p className="text-indigo-600 mt-1">
                Received {selectedTx.receivedQuantity} · Returned {selectedTx.totalReturned ?? 0} ·
                <strong className="text-amber-700"> {selectedTx.sareesInHand} in hand</strong>
              </p>
            </div>
            <Input label="Return Date" type="date" value={returnForm.returnedDate} onChange={e => setReturnForm(f => ({ ...f, returnedDate: e.target.value }))} required />
            <Input label={`Quantity to Return (max ${selectedTx.sareesInHand})`} type="number" min="1" max={selectedTx.sareesInHand}
              value={returnForm.returnedQuantity} onChange={e => setReturnForm(f => ({ ...f, returnedQuantity: e.target.value }))} placeholder={`Up to ${selectedTx.sareesInHand}`} required />
            <Input label="Remarks (optional)" value={returnForm.remarks} onChange={e => setReturnForm(f => ({ ...f, remarks: e.target.value }))} />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleAddReturn} isLoading={submitting}>Save Return</Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowReturnModal(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
};
