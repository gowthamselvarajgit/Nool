import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import {
  Card, Button, Input, Badge, Modal, Loading, ErrorMessage, EmptyState,
} from '../components/Common';
import { Table } from '../components/Table';
import { ownerService, inventoryService } from '../services/api';
import { getInitials, friendlyStatus } from '../utils/formatters';
import { exportToExcel } from '../utils/excelExporter';
import { Edit2, Eye, ToggleLeft, ToggleRight, Plus, RefreshCw, Download } from 'lucide-react';
import InventoryActivityCalendar from '../components/InventoryActivityCalendar';

const OwnersPage = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerEntries, setOwnerEntries] = useState([]);
  const [ownerEntriesLoading, setOwnerEntriesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  async function fetchOwners(pageOneBased = currentPage, kw = searchKeyword) {
    try {
      setLoading(true); setError('');
      const response = await ownerService.getList(pageOneBased - 1, itemsPerPage, kw);
      const list = response?.content || [];
      const mapped = list.map((owner) => ({
        id: owner.ownerId,
        ownerName: owner.ownerName,
        mobileNumber: owner.mobileNumber,
        status: owner.ownerStatus,
        polishRatePerSaree: owner.polishRatePerSaree,
      }));
      setOwners(mapped);
      setTotalPages(response?.totalPages || 1);
      setTotalItems(response?.totalElements ?? mapped.length);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    fetchOwners(currentPage, searchKeyword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      fetchOwners(1, searchKeyword);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword]);

  const handleViewDetails = async (owner) => {
    setSelectedOwner(owner);
    setShowDetailsModal(true);
    setOwnerEntries([]);
    try {
      setOwnerEntriesLoading(true);
      const res = await inventoryService.getOwnerLedger(owner.id, 0, 500);
      setOwnerEntries(res?.content || []);
    } catch {
      // Calendar shows empty on failure — non-fatal for the rest of the modal.
    } finally {
      setOwnerEntriesLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      setIsSubmitting(true); setError('');
      const rate = parseFloat(formData.polishRatePerSaree);
      await ownerService.create({
        ownerName: formData.ownerName,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
        polishRatePerSaree: Number.isFinite(rate) && rate > 0 ? rate : undefined,
      });
      setShowModal(false); setSelectedOwner(null); fetchOwners();
    } catch (err) { setError(err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (formData) => {
    try {
      setIsSubmitting(true); setError('');
      const rate = parseFloat(formData.polishRatePerSaree);
      await ownerService.update({
        ownerId: selectedOwner.id,
        ownerName: formData.ownerName,
        mobileNumber: formData.mobileNumber,
        polishRatePerSaree: Number.isFinite(rate) && rate > 0 ? rate : undefined,
      });
      setShowModal(false); setSelectedOwner(null); fetchOwners();
    } catch (err) { setError(err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleExport = async () => {
    try {
      const res = await ownerService.getList(0, 2000, searchKeyword);
      const all = (res?.content || []).map((o) => ({
        'Owner ID': o.ownerId,
        'Owner Name': o.ownerName,
        'Mobile': o.mobileNumber,
        'Status': friendlyStatus(o.ownerStatus),
        'Polish Rate (₹/saree)': o.polishRatePerSaree ?? 70,
      }));
      exportToExcel({
        rows: all,
        fileName: 'Nool_Owners',
        sheetName: 'Owners',
        columnWidths: [10, 22, 14, 14, 18],
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // ── Toggle Active/Inactive ────────────────────────────────────────────────
  const handleToggleStatus = async (owner) => {
    try {
      setError('');
      const newStatus = owner.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      // API: PATCH /owners/status → { ownerId, ownerStatus }
      await ownerService.updateStatus(owner.id, newStatus);
      fetchOwners();
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
    }
  };

  // Per-page snapshot — fine for small shops. `total` uses server count.
  const stats = {
    total: totalItems,
    active: owners.filter(o => o.status === 'ACTIVE').length,
    inactive: owners.filter(o => o.status === 'INACTIVE').length,
  };

  const columns = [
    {
      key: 'ownerName',
      label: 'Owner Name',
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {getInitials(value)}
          </div>
          <span className="font-semibold text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'mobileNumber',
      label: 'Mobile',
      render: (v) => <span className="text-gray-600">{v}</span>,
    },
    {
      key: 'polishRatePerSaree',
      label: 'Rate (₹/saree)',
      render: (v) => (
        <span className="font-semibold text-indigo-700">₹{v ?? 70}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <Badge variant={v === 'ACTIVE' ? 'success' : 'danger'}>
          {v === 'ACTIVE' ? '● Active' : '○ Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => { setSelectedOwner(row); setShowModal(true); }}
            className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4 text-amber-600" />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            className={`p-1.5 rounded-lg transition-colors ${row.status === 'ACTIVE' ? 'hover:bg-red-50' : 'hover:bg-green-50'}`}
            title={row.status === 'ACTIVE' ? 'Deactivate owner' : 'Activate owner'}
          >
            {row.status === 'ACTIVE'
              ? <ToggleRight className="w-5 h-5 text-green-600" />
              : <ToggleLeft className="w-5 h-5 text-gray-400" />}
          </button>
        </div>
      ),
    },
  ];

  // Server-side pagination — `owners` already holds the current page.

  if (loading) return <MainLayout><Loading text="Loading owners..." /></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">🧵 Saree Owner Management</h1>
            <p className="text-gray-500 mt-1">Add, edit, and manage saree owner accounts</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={fetchOwners}><RefreshCw className="w-4 h-4" /></Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" /> Export Excel
            </Button>
            <Button onClick={() => { setSelectedOwner(null); setError(''); setShowModal(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Owner
            </Button>
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchOwners} />}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
            <p className="text-3xl font-bold text-indigo-700">{stats.total}</p>
            <p className="text-sm text-indigo-600 mt-1">Total Owners</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
            <p className="text-3xl font-bold text-emerald-700">{stats.active}</p>
            <p className="text-sm text-emerald-600 mt-1">Active</p>
          </div>
          <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100">
            <p className="text-3xl font-bold text-rose-700">{stats.inactive}</p>
            <p className="text-sm text-rose-600 mt-1">Inactive</p>
          </div>
        </div>

        {/* Search */}
        <Card>
          <Input
            placeholder="Search by name or mobile..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </Card>

        {owners.length === 0 ? (
          <EmptyState message="No owners found" icon="🧵" />
        ) : (
          <Card className="overflow-hidden">
            <Table
              columns={columns}
              data={owners}
              pagination={{ currentPage, totalPages, itemsPerPage, totalItems }}
              onPaginationChange={(page) => setCurrentPage(page)}
            />
          </Card>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedOwner(null); setError(''); }}
        title={selectedOwner ? '✏️ Edit Owner' : '➕ Add New Owner'}
        size="md"
      >
        <OwnerForm
          initialData={selectedOwner}
          isEdit={!!selectedOwner}
          onSubmit={selectedOwner ? handleUpdate : handleCreate}
          isLoading={isSubmitting}
          error={error}
        />
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setSelectedOwner(null); setOwnerEntries([]); }}
        title="Owner Details"
        size="lg"
      >
        {selectedOwner && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 sm:gap-4 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-2xl flex-shrink-0">
                {getInitials(selectedOwner.ownerName)}
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-bold text-gray-900">{selectedOwner.ownerName}</h3>
                <Badge variant={selectedOwner.status === 'ACTIVE' ? 'success' : 'danger'}>
                  {selectedOwner.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-2 py-1">
              {[
                { label: 'Owner ID', value: `#${selectedOwner.id}` },
                { label: 'Mobile', value: selectedOwner.mobileNumber },
                { label: 'Status', value: selectedOwner.status },
                { label: 'Rate per saree', value: `₹${selectedOwner.polishRatePerSaree ?? 70}` },
              ].map((r, i) => (
                <div key={i} className="flex justify-between py-1.5">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="font-semibold text-gray-900">{r.value}</span>
                </div>
              ))}
            </div>

            {/* Activity calendar */}
            <div className="pt-3 border-t border-gray-100">
              <p className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">📅 Saree Activity Calendar</p>
              {ownerEntriesLoading ? (
                <p className="text-sm text-gray-400 text-center py-3">Loading activity...</p>
              ) : (
                <InventoryActivityCalendar entries={ownerEntries} />
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex gap-2">
              <Button className="flex-1" onClick={() => { setShowDetailsModal(false); setShowModal(true); }}>Edit</Button>
              <Button
                variant="outline"
                className={`flex-1 ${selectedOwner.status === 'ACTIVE' ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
                onClick={() => { handleToggleStatus(selectedOwner); setShowDetailsModal(false); }}
              >
                {selectedOwner.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
              </Button>
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
};

const OwnerForm = ({ initialData, isEdit, onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({
    ownerName: initialData?.ownerName || '',
    mobileNumber: initialData?.mobileNumber || '',
    password: '',
    polishRatePerSaree: initialData?.polishRatePerSaree != null ? String(initialData.polishRatePerSaree) : '70',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Owner Name *" name="ownerName" value={formData.ownerName} onChange={handleChange} required />
      <Input label="Mobile Number *" type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="10-digit mobile" required />
      {!isEdit && (
        <Input label="Password *" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Set login password" required />
      )}
      <div>
        <Input
          label="Rate per Polished Saree (₹) *"
          type="number"
          name="polishRatePerSaree"
          min="1"
          step="0.5"
          value={formData.polishRatePerSaree}
          onChange={handleChange}
          placeholder="e.g. 70"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          What this owner pays the workshop per saree returned. You can change it later.
        </p>
      </div>
      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex gap-2 pt-2">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {isEdit ? 'Update Owner' : 'Add Owner'}
        </Button>
      </div>
    </form>
  );
};

export default OwnersPage;
