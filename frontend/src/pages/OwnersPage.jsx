import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import {
  Card, Button, Input, Select, Badge, Modal, Loading, ErrorMessage, EmptyState,
} from '../components/Common';
import { Table } from '../components/Table';
import { ownerService, ownerPaymentService } from '../services/api';
import { getInitials } from '../utils/formatters';
import { Edit2, Eye, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';

const OwnersPage = () => {
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: '',
    paymentMode: 'CASH',
    paymentDate: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  async function fetchOwners() {
    try {
      setLoading(true);
      setError('');
      const response = await ownerService.getList(0, 200);
      const list = response?.content || [];
      // ✅ Correct field mapping: ownerId, ownerName, mobileNumber, ownerStatus
      const mapped = list.map((owner) => ({
        id: owner.ownerId,
        ownerName: owner.ownerName,
        mobileNumber: owner.mobileNumber,
        status: owner.ownerStatus,
      }));
      setOwners(mapped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchOwners(); }, []);

  useEffect(() => {
    const kw = searchKeyword.toLowerCase();
    setFilteredOwners(
      owners.filter(o =>
        (o.ownerName || '').toLowerCase().includes(kw) ||
        (o.mobileNumber || '').includes(kw)
      )
    );
    setCurrentPage(1);
  }, [searchKeyword, owners]);

  const handleCreate = async (formData) => {
    try {
      setIsSubmitting(true);
      setError('');
      // ✅ Create: only ownerName, mobileNumber, password
      await ownerService.create({
        ownerName: formData.ownerName,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
      });
      setShowModal(false);
      setSelectedOwner(null);
      fetchOwners();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setIsSubmitting(true);
      setError('');
      // ✅ Update: ownerId, ownerName, mobileNumber (no email/address/password)
      await ownerService.update({
        ownerId: selectedOwner.id,
        ownerName: formData.ownerName,
        mobileNumber: formData.mobileNumber,
      });
      setShowModal(false);
      setSelectedOwner(null);
      fetchOwners();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (owner) => {
    try {
      const newStatus = owner.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await ownerService.updateStatus(owner.id, newStatus);
      fetchOwners();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentForm.amountPaid || !selectedOwner) {
      setError('Please enter a payment amount');
      return;
    }
    try {
      setIsSubmitting(true);
      setError('');
      // ✅ Real API call with correct DTO
      await ownerPaymentService.create({
        ownerId: selectedOwner.id,
        amountPaid: parseFloat(paymentForm.amountPaid),
        paymentMode: paymentForm.paymentMode,
        paymentDate: paymentForm.paymentDate,
        remarks: paymentForm.remarks,
      });
      setShowPaymentModal(false);
      setPaymentForm({ amountPaid: '', paymentMode: 'CASH', paymentDate: new Date().toISOString().split('T')[0], remarks: '' });
      setSelectedOwner(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    total: owners.length,
    active: owners.filter(o => o.status === 'ACTIVE').length,
    inactive: owners.filter(o => o.status === 'INACTIVE').length,
  };

  if (loading) return <MainLayout><Loading text="Loading owners..." /></MainLayout>;

  const columns = [
    {
      key: 'ownerName',
      label: 'Owner Name',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
            {getInitials(value)}
          </div>
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'mobileNumber',
      label: 'Mobile',
      render: (value) => <span className="text-gray-600">{value}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={value === 'ACTIVE' ? 'success' : 'danger'}>{value}</Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => { setSelectedOwner(row); setShowDetailsModal(true); }}
            className="p-1.5 hover:bg-blue-50 rounded transition-colors" title="View details">
            <Eye className="w-4 h-4 text-blue-600" />
          </button>
          <button onClick={() => { setSelectedOwner(row); setShowPaymentModal(true); }}
            className="p-1.5 hover:bg-green-50 rounded transition-colors" title="Record payment">
            <DollarSign className="w-4 h-4 text-green-600" />
          </button>
          <button onClick={() => { setSelectedOwner(row); setShowModal(true); }}
            className="p-1.5 hover:bg-amber-50 rounded transition-colors" title="Edit">
            <Edit2 className="w-4 h-4 text-amber-600" />
          </button>
          <button onClick={() => handleToggleStatus(row)}
            className="p-1.5 hover:bg-gray-50 rounded transition-colors"
            title={row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}>
            {row.status === 'ACTIVE'
              ? <ToggleRight className="w-4 h-4 text-green-600" />
              : <ToggleLeft className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(filteredOwners.length / itemsPerPage);
  const paginatedData = filteredOwners.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="slide-down">
          <h1 className="text-4xl font-bold text-gray-900">🧵 Saree Owner Management</h1>
          <p className="text-gray-600 mt-2">Manage saree owners and record payments</p>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchOwners} />}

        <Card className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <Input
            placeholder="Search by name or mobile..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="flex-1"
          />
          <Button onClick={() => { setSelectedOwner(null); setShowModal(true); }}>
            ➕ Add Owner
          </Button>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <p className="text-gray-600 text-sm">Total Owners</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Active</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Inactive</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{stats.inactive}</p>
          </Card>
        </div>

        {filteredOwners.length === 0 ? (
          <EmptyState message="No owners found" icon="🧵" />
        ) : (
          <Card className="overflow-hidden">
            <Table
              columns={columns}
              data={paginatedData}
              pagination={{ currentPage, totalPages, itemsPerPage, totalItems: filteredOwners.length }}
              onPaginationChange={(page) => setCurrentPage(page)}
            />
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedOwner(null); setError(''); }}
        title={selectedOwner ? 'Edit Owner' : 'Add New Owner'}
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
        onClose={() => { setShowDetailsModal(false); setSelectedOwner(null); }}
        title={`Owner Details — ${selectedOwner?.ownerName}`}
        size="sm"
      >
        {selectedOwner && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                {getInitials(selectedOwner.ownerName)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedOwner.ownerName}</h3>
                <Badge variant={selectedOwner.status === 'ACTIVE' ? 'success' : 'danger'}>
                  {selectedOwner.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-2 py-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Owner ID</span>
                <span className="font-medium text-gray-900">#{selectedOwner.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mobile</span>
                <span className="font-medium text-gray-900">{selectedOwner.mobileNumber}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 flex gap-2">
              <Button className="flex-1" onClick={() => { setShowDetailsModal(false); setShowPaymentModal(true); }}>
                Record Payment
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => { setShowPaymentModal(false); setPaymentForm({ amountPaid: '', paymentMode: 'CASH', paymentDate: new Date().toISOString().split('T')[0], remarks: '' }); setSelectedOwner(null); setError(''); }}
        title={`Record Payment — ${selectedOwner?.ownerName}`}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Amount Paid (₹) *"
            type="number"
            value={paymentForm.amountPaid}
            onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
            placeholder="Enter amount"
            required
          />
          <Select
            label="Payment Mode *"
            value={paymentForm.paymentMode}
            onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
            options={[
              { value: 'CASH', label: '💵 Cash' },
              { value: 'ONLINE', label: '📱 Online' },
              { value: 'CHEQUE', label: '🏦 Cheque' },
            ]}
          />
          <Input
            label="Payment Date *"
            type="date"
            value={paymentForm.paymentDate}
            onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
          />
          <Input
            label="Remarks"
            value={paymentForm.remarks}
            onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
            placeholder="Optional notes"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={isSubmitting} onClick={handleRecordPayment}>
              Record Payment
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

// ✅ OwnerForm: only name + mobile + password (create) or name + mobile (edit)
const OwnerForm = ({ initialData, isEdit, onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({
    ownerName: initialData?.ownerName || '',
    mobileNumber: initialData?.mobileNumber || '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Owner Name *" name="ownerName" value={formData.ownerName} onChange={handleChange} required />
      <Input label="Mobile Number *" type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="10-digit mobile number" required />
      {!isEdit && (
        <Input label="Password *" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Set login password" required />
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-2 pt-4">
        <Button type="submit" loading={isLoading} className="flex-1">
          {isEdit ? 'Update Owner' : 'Add Owner'}
        </Button>
      </div>
    </form>
  );
};

export default OwnersPage;
