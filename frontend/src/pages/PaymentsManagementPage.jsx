import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Loading, ErrorMessage, Badge, Button, Select, Input, Modal } from '../components/Common';
import { ownerPaymentService, ownerService } from '../services/api';
import { formatDate } from '../utils/formatters';
import { CreditCard, Banknote, RefreshCw, Plus, ArrowUpRight } from 'lucide-react';

const today = new Date().toISOString().split('T')[0];
const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

export const PaymentsManagementPage = () => {
  const [payments, setPayments] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [payForm, setPayForm] = useState({
    ownerId: '',
    amountPaid: '',
    paymentMode: 'CASH',
    paymentDate: today,
    remarks: '',
  });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      setError('');
      const ownerRes = await ownerService.getList(0, 200);
      // ✅ ownerId, ownerName, ownerStatus
      setOwners((ownerRes?.content || []).map(o => ({ id: o.ownerId, name: o.ownerName })));
      await fetchPayments('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPayments(ownerId) {
    try {
      setLoading(true);
      if (ownerId) {
        // ✅ Fetch per-owner history using correct PaginationRequestDto
        const res = await ownerPaymentService.getOwnerHistory(ownerId, 0, 100);
        setPayments(res?.content || []);
      } else {
        // Show my payment history for admin context — or try each owner
        // For admin: fetch from first available owner or show empty
        setPayments([]);
      }
    } catch (err) {
      setError(err.message);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleOwnerChange(ownerId) {
    setSelectedOwner(ownerId);
    setCurrentPage(1);
    await fetchPayments(ownerId);
  }

  async function handleRecordPayment() {
    const { ownerId, amountPaid, paymentMode, paymentDate } = payForm;
    if (!ownerId || !amountPaid || !paymentDate) {
      setError('Please fill all required fields');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      // ✅ Correct DTO: ownerId, amountPaid, paymentMode, paymentDate, remarks
      await ownerPaymentService.create({
        ownerId: parseInt(ownerId),
        amountPaid: parseFloat(amountPaid),
        paymentMode,
        paymentDate,
        remarks: payForm.remarks,
      });
      setShowModal(false);
      setPayForm({ ownerId: '', amountPaid: '', paymentMode: 'CASH', paymentDate: today, remarks: '' });
      if (selectedOwner) await fetchPayments(selectedOwner);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Stats
  const totalPaid = payments.reduce((s, p) => s + (p.amountPaid || 0), 0);
  const totalPayments = payments.length;

  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const paginatedPayments = payments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading && owners.length === 0) return <MainLayout><Loading text="Loading payments..." /></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-2">
              <CreditCard className="w-4 h-4" /> Owner Payments
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Payments Management</h1>
            <p className="text-gray-500 mt-1">Record and track all owner payments</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchAll}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-1" /> Record Payment
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
            ⚠️ {error}
            <button onClick={() => setError('')} className="ml-auto font-bold text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-emerald-400/10 blur-xl" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Total Payments Loaded</p>
                <h3 className="text-3xl font-bold text-gray-900">{totalPayments}</h3>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-2">
                  <ArrowUpRight className="w-3 h-3" /> Records
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Banknote className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-blue-400/10 blur-xl" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Total Paid (Selected)</p>
                <h3 className="text-2xl font-bold text-gray-900">₹{totalPaid.toLocaleString('en-IN')}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-purple-400/10 blur-xl" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Total Owners</p>
                <h3 className="text-3xl font-bold text-gray-900">{owners.length}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 font-bold text-lg">
                O
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800">Payment Records</h2>
              <p className="text-xs text-gray-500">Select an owner to view their payment history</p>
            </div>
            <div className="w-full md:w-64">
              <Select
                value={selectedOwner}
                onChange={(e) => handleOwnerChange(e.target.value)}
                options={[
                  { value: '', label: '— Select Owner —' },
                  ...owners.map(o => ({ value: o.id.toString(), label: o.name })),
                ]}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading...</div>
            ) : paginatedPayments.length === 0 ? (
              <div className="text-center py-14">
                <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {selectedOwner ? 'No payment records found for this owner' : 'Select an owner to view payment history'}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Payment ID', 'Owner', 'Amount Paid', 'Payment Mode', 'Payment Date', 'Remarks'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {/* ✅ OwnerPaymentHistoryDto: paymentId, ownerId, ownerName, amountPaid, paymentMode, paymentDate, remarks */}
                  {paginatedPayments.map((p) => (
                    <tr key={p.paymentId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-xs font-mono text-gray-500">#{p.paymentId}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {(p.ownerName || '?').charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800 text-sm">{p.ownerName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-bold text-emerald-600">
                        ₹{(p.amountPaid || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="info">{p.paymentMode}</Badge>
                      </td>
                      <td className="px-5 py-3 text-gray-600 text-sm">
                        {p.paymentDate ? formatDate(p.paymentDate) : '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-sm">{p.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-xs text-gray-500">
                Page {currentPage} of {totalPages} — {payments.length} total
              </span>
              <div className="flex gap-2">
                <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setError(''); setPayForm({ ownerId: '', amountPaid: '', paymentMode: 'CASH', paymentDate: today, remarks: '' }); }}
        title="Record Owner Payment"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Owner *"
            value={payForm.ownerId}
            onChange={(e) => setPayForm(p => ({ ...p, ownerId: e.target.value }))}
            options={[{ value: '', label: '— Select Owner —' }, ...owners.map(o => ({ value: o.id.toString(), label: o.name }))]}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount Paid (₹) *"
              type="number"
              value={payForm.amountPaid}
              onChange={(e) => setPayForm(p => ({ ...p, amountPaid: e.target.value }))}
              placeholder="0.00"
              required
            />
            <Input
              label="Payment Date *"
              type="date"
              value={payForm.paymentDate}
              onChange={(e) => setPayForm(p => ({ ...p, paymentDate: e.target.value }))}
              required
            />
          </div>
          <Select
            label="Payment Mode *"
            value={payForm.paymentMode}
            onChange={(e) => setPayForm(p => ({ ...p, paymentMode: e.target.value }))}
            options={[
              { value: 'CASH', label: '💵 Cash' },
              { value: 'ONLINE', label: '📱 Online' },
              { value: 'CHEQUE', label: '🏦 Cheque' },
            ]}
          />
          <Input
            label="Remarks"
            value={payForm.remarks}
            onChange={(e) => setPayForm(p => ({ ...p, remarks: e.target.value }))}
            placeholder="Optional notes"
          />

          {payForm.amountPaid && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
              <span className="text-emerald-700 text-sm font-medium">Recording Payment</span>
              <span className="text-emerald-800 font-bold text-lg">₹{parseFloat(payForm.amountPaid || 0).toLocaleString('en-IN')}</span>
            </div>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={submitting} onClick={handleRecordPayment}>Record Payment</Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default PaymentsManagementPage;
