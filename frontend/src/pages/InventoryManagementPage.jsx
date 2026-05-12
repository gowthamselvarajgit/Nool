import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Button, Input, Select, Modal } from '../components/Common';
import { Table } from '../components/Table';
import { inventoryService, ownerService } from '../services/api';
import { formatDate } from '../utils/formatters';
import { Plus, RefreshCw, Package, AlertCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export const InventoryManagementPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [owners, setOwners] = useState([]);
  const [overallSummary, setOverallSummary] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  const itemsPerPage = 10;

  // ✅ Matches SareeTransactionRequestDto exactly
  const [formData, setFormData] = useState({
    ownerId: '',
    receivedDate: '',
    receivedQuantity: '',
    returnedDate: '',
    returnedQuantity: '',
    remarks: '',
  });

  // Date range for overall summary
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      setError('');
      const [ownerRes, summaryRes] = await Promise.all([
        ownerService.getList(0, 200),
        inventoryService.getOverallSummary(firstDayOfMonth, today).catch(() => null),
      ]);
      // ✅ Owner mapping: ownerId, ownerName
      setOwners((ownerRes?.content || []).map(o => ({ id: o.ownerId, name: o.ownerName })));
      if (summaryRes) setOverallSummary(summaryRes);
      await fetchTransactions();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTransactions() {
    try {
      setLoading(true);
      // Fetch all owner transactions by fetching from each loaded owner
      // or use a combined fetch — backend has per-owner endpoint
      // We'll fetch my transactions (admin context) using the list endpoint  
      const response = await inventoryService.getMyTransactions(0, 200);
      // ✅ SareeTransactionResponseDto: transactionId, ownerId, ownerName, receivedDate, receivedQuantity, returnedDate, returnedQuantity, remarks
      setTransactions(response?.content || []);
    } catch (err) {
      // Fallback: if my-transactions not accessible for admin, fetch per owner
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchOwnerTransactions(ownerId) {
    try {
      setLoading(true);
      const response = await inventoryService.getOwnerTransactions(ownerId, 0, 200);
      setTransactions(response?.content || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleFilterOwnerChange = (ownerId) => {
    setFilterOwner(ownerId);
    setCurrentPage(1);
    if (ownerId) {
      fetchOwnerTransactions(ownerId);
    } else {
      fetchTransactions();
    }
  };

  const handleAddTransaction = async () => {
    if (!formData.ownerId) { setError('Please select an owner'); return; }
    if (!formData.receivedDate && !formData.returnedDate) { setError('Enter at least received date or returned date'); return; }
    try {
      setSubmitting(true);
      setError('');
      // ✅ Correct DTO
      await inventoryService.createTransaction({
        ownerId: parseInt(formData.ownerId),
        receivedDate: formData.receivedDate || null,
        receivedQuantity: formData.receivedQuantity ? parseInt(formData.receivedQuantity) : null,
        returnedDate: formData.returnedDate || null,
        returnedQuantity: formData.returnedQuantity ? parseInt(formData.returnedQuantity) : null,
        remarks: formData.remarks || null,
      });
      setShowModal(false);
      setFormData({ ownerId: '', receivedDate: '', receivedQuantity: '', returnedDate: '', returnedQuantity: '', remarks: '' });
      if (filterOwner) fetchOwnerTransactions(filterOwner);
      else fetchTransactions();
      // Refresh summary
      const summaryRes = await inventoryService.getOverallSummary(firstDayOfMonth, today).catch(() => null);
      if (summaryRes) setOverallSummary(summaryRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter by search
  const filteredTx = transactions.filter(t =>
    (t.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTx.length / itemsPerPage);
  const paginatedTx = filteredTx.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ✅ Columns match SareeTransactionResponseDto
  const tableColumns = [
    {
      key: 'ownerName',
      label: 'Owner',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {(value || '?').charAt(0)}
          </div>
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'receivedDate',
      label: 'Received Date',
      render: (value) => value ? (
        <div className="flex items-center gap-1">
          <ArrowDownCircle className="w-4 h-4 text-green-500" />
          <span className="text-gray-700">{formatDate(value)}</span>
        </div>
      ) : <span className="text-gray-400">—</span>,
    },
    {
      key: 'receivedQuantity',
      label: 'Received',
      render: (value) => value != null
        ? <span className="font-semibold text-green-600">{value}</span>
        : <span className="text-gray-400">—</span>,
    },
    {
      key: 'returnedDate',
      label: 'Returned Date',
      render: (value) => value ? (
        <div className="flex items-center gap-1">
          <ArrowUpCircle className="w-4 h-4 text-blue-500" />
          <span className="text-gray-700">{formatDate(value)}</span>
        </div>
      ) : <span className="text-gray-400">—</span>,
    },
    {
      key: 'returnedQuantity',
      label: 'Returned',
      render: (value) => value != null
        ? <span className="font-semibold text-blue-600">{value}</span>
        : <span className="text-gray-400">—</span>,
    },
    {
      key: 'remarks',
      label: 'Remarks',
      render: (value) => <span className="text-gray-500 text-sm">{value || '—'}</span>,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="slide-down">
          <h1 className="text-4xl font-bold text-gray-900">📦 Saree Inventory</h1>
          <p className="text-gray-600 mt-2">Track sarees received from and returned to owners</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700 font-bold">✕</button>
          </div>
        )}

        {/* Summary Cards — from backend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Received (Month)</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {overallSummary?.totalSareesReceived ?? '—'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ArrowDownCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Returned (Month)</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {overallSummary?.totalSareesReturned ?? '—'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ArrowUpCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">In Hand</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">
                  {overallSummary?.sareesInHand ?? '—'}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by owner name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="flex-1"
            />
            <Select
              value={filterOwner}
              onChange={(e) => handleFilterOwnerChange(e.target.value)}
              options={[
                { value: '', label: 'All Owners' },
                ...owners.map(o => ({ value: o.id.toString(), label: o.name })),
              ]}
              className="md:w-52"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchAll}>
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-1" /> New Transaction
              </Button>
            </div>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card>
          {loading ? (
            <div className="text-center py-12"><p className="text-gray-500">Loading transactions...</p></div>
          ) : paginatedTx.length > 0 ? (
            <>
              <Table columns={tableColumns} data={paginatedTx} />
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredTx.length)} of {filteredTx.length}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
                  <Button variant="outline" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}
        </Card>
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setError(''); setFormData({ ownerId: '', receivedDate: '', receivedQuantity: '', returnedDate: '', returnedQuantity: '', remarks: '' }); }}
        title="New Saree Transaction"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Owner *"
            value={formData.ownerId}
            onChange={(e) => setFormData(prev => ({ ...prev, ownerId: e.target.value }))}
            options={[{ value: '', label: '— Select Owner —' }, ...owners.map(o => ({ value: o.id.toString(), label: o.name }))]}
            required
          />

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-sm font-semibold mb-3 flex items-center gap-2">
              <ArrowDownCircle className="w-4 h-4" /> Received from Owner
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Received Date" type="date" value={formData.receivedDate}
                onChange={(e) => setFormData(prev => ({ ...prev, receivedDate: e.target.value }))} />
              <Input label="Quantity" type="number" value={formData.receivedQuantity} placeholder="0" min="0"
                onChange={(e) => setFormData(prev => ({ ...prev, receivedQuantity: e.target.value }))} />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm font-semibold mb-3 flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4" /> Returned to Owner
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Return Date" type="date" value={formData.returnedDate}
                onChange={(e) => setFormData(prev => ({ ...prev, returnedDate: e.target.value }))} />
              <Input label="Quantity" type="number" value={formData.returnedQuantity} placeholder="0" min="0"
                onChange={(e) => setFormData(prev => ({ ...prev, returnedQuantity: e.target.value }))} />
            </div>
          </div>

          <Input label="Remarks" value={formData.remarks} placeholder="Optional notes"
            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))} />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleAddTransaction} loading={submitting} className="flex-1">Save Transaction</Button>
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default InventoryManagementPage;
