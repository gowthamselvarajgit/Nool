import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Modal,
  Loading,
  ErrorMessage,
  EmptyState,
} from '../components/Common';
import Table from '../components/Table';
import { ownerService } from '../services/api';
import { formatDate, getInitials } from '../utils/formatters';
import { Edit2, Trash2, Eye, DollarSign } from 'lucide-react';

const OwnerManagementPage = () => {
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [paymentAmount, setPaymentAmount] = useState('');

  async function fetchOwners() {
    try {
      setLoading(true);
      setError('');
      const response = await ownerService.getList(0, 100);
      const list = response?.content || [];
      const mapped = list.map((owner) => ({
        id: owner.sareeOwnerId,
        ownerName: owner.ownerName,
        mobileNumber: owner.mobileNumber,
        email: owner.email,
        address: owner.address,
        totalAmount: owner.totalAmount || 0,
        paidAmount: owner.paidAmount || 0,
        pendingAmount: (owner.totalAmount || 0) - (owner.paidAmount || 0),
        status: owner.status || 'ACTIVE',
        createdDate: owner.createdDate,
      }));
      setOwners(mapped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  useEffect(() => {
    const keyword = searchKeyword.toLowerCase();
    const filtered = owners.filter((owner) => {
      return (
        (owner.ownerName || '').toLowerCase().includes(keyword) ||
        (owner.mobileNumber || '').includes(keyword)
      );
    });
    setFilteredOwners(filtered);
    setCurrentPage(1);
  }, [searchKeyword, owners]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      setIsSubmitting(true);
      if (selectedOwner) {
        // Update
        await ownerService.update({
          sareeOwnerId: selectedOwner.id,
          ownerName: formData.ownerName,
          mobileNumber: formData.mobileNumber,
          email: formData.email,
          address: formData.address,
        });
      } else {
        // Create
        await ownerService.create({
          ownerName: formData.ownerName,
          mobileNumber: formData.mobileNumber,
          email: formData.email,
          address: formData.address,
        });
      }
      setShowModal(false);
      setSelectedOwner(null);
      fetchOwners();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedOwner) return;
    try {
      setIsSubmitting(true);
      await ownerService.delete(selectedOwner.id);
      setShowDeleteModal(false);
      setSelectedOwner(null);
      fetchOwners();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMakePayment = async () => {
    if (!paymentAmount || !selectedOwner) {
      setError('Please enter a payment amount');
      return;
    }

    try {
      setIsSubmitting(true);
      // In real app, would call ownerPaymentService.processPayment()
      const updatedOwner = {
        ...selectedOwner,
        paidAmount: selectedOwner.paidAmount + parseFloat(paymentAmount),
        pendingAmount: selectedOwner.pendingAmount - parseFloat(paymentAmount),
      };
      
      setOwners(owners.map(o => o.id === selectedOwner.id ? updatedOwner : o));
      
      setShowPaymentModal(false);
      setPaymentAmount('');
      setSelectedOwner(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Statistics
  const stats = {
    total: owners.length,
    active: owners.filter(o => o.status === 'ACTIVE').length,
    totalAmount: owners.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    pendingAmount: owners.reduce((sum, o) => sum + (o.pendingAmount || 0), 0),
  };

  if (loading) return <MainLayout><Loading text="Loading owner data..." /></MainLayout>;

  // Table columns
  const columns = [
    {
      key: 'ownerName',
      label: 'Owner Name',
      render: (value, row) => (
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
      key: 'totalAmount',
      label: 'Total Amount',
      render: (value) => <span className="font-medium text-gray-900">₹{value?.toLocaleString()}</span>,
    },
    {
      key: 'paidAmount',
      label: 'Paid',
      render: (value) => <span className="text-green-600 font-medium">₹{value?.toLocaleString()}</span>,
    },
    {
      key: 'pendingAmount',
      label: 'Pending',
      render: (value) => <span className="text-orange-600 font-medium">₹{value?.toLocaleString()}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <Badge variant={value === 'ACTIVE' ? 'success' : 'danger'}>{value}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedOwner(row);
              setShowDetailsModal(true);
            }}
            className="p-1.5 hover:bg-blue-50 rounded transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => {
              setSelectedOwner(row);
              setShowPaymentModal(true);
            }}
            className="p-1.5 hover:bg-green-50 rounded transition-colors"
            title="Make payment"
          >
            <DollarSign className="w-4 h-4 text-green-600" />
          </button>
          <button
            onClick={() => {
              setSelectedOwner(row);
              setShowModal(true);
            }}
            className="p-1.5 hover:bg-amber-50 rounded transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4 text-amber-600" />
          </button>
          <button
            onClick={() => {
              setSelectedOwner(row);
              setShowDeleteModal(true);
            }}
            className="p-1.5 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  // Pagination
  const totalPages = Math.ceil(filteredOwners.length / itemsPerPage);
  const paginatedData = filteredOwners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="slide-down">
          <h1 className="text-4xl font-bold text-gray-900">🧵 Saree Owner Management</h1>
          <p className="text-gray-600 mt-2">Manage saree owners and track payments</p>
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} onRetry={fetchOwners} />}

        {/* Search and Actions */}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-gray-600 text-sm">Total Owners</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Active</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Total Amount</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              ₹{(stats.totalAmount / 100000).toFixed(1)}L
            </p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Pending Payment</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              ₹{(stats.pendingAmount / 100000).toFixed(1)}L
            </p>
          </Card>
        </div>

        {/* Owners Table */}
        {filteredOwners.length === 0 ? (
          <EmptyState message="No owners found" icon="🧵" />
        ) : (
          <Card className="overflow-hidden">
            <Table
              columns={columns}
              data={paginatedData}
              pagination={{
                currentPage,
                totalPages,
                itemsPerPage,
                totalItems: filteredOwners.length,
              }}
              onPaginationChange={(page) => setCurrentPage(page)}
            />
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedOwner(null); }}
        title={selectedOwner ? 'Edit Owner' : 'Add New Owner'}
        size="lg"
      >
        <OwnerForm
          initialData={selectedOwner}
          onSubmit={handleCreateOrUpdate}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setSelectedOwner(null); }}
        title={`Owner Details - ${selectedOwner?.ownerName}`}
        size="md"
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

            <div className="space-y-3 py-4 border-b border-gray-200">
              <DetailRow label="Mobile" value={selectedOwner.mobileNumber} />
              <DetailRow label="Email" value={selectedOwner.email || 'N/A'} />
              <DetailRow label="Address" value={selectedOwner.address || 'N/A'} />
              <DetailRow label="Member Since" value={formatDate(selectedOwner.createdDate)} />
            </div>

            <div className="space-y-3 py-4">
              <h4 className="font-bold text-gray-900">Payment Summary</h4>
              <DetailRow label="Total Amount" value={`₹${selectedOwner.totalAmount?.toLocaleString()}`} />
              <DetailRow label="Paid Amount" value={`₹${selectedOwner.paidAmount?.toLocaleString()}`} />
              <DetailRow label="Pending Amount" value={`₹${selectedOwner.pendingAmount?.toLocaleString()}`} />
              <div className="pt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${(selectedOwner.paidAmount / selectedOwner.totalAmount * 100) || 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {Math.round((selectedOwner.paidAmount / selectedOwner.totalAmount * 100) || 0)}% paid
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex gap-2">
              <Button 
                className="flex-1" 
                onClick={() => { 
                  setShowDetailsModal(false); 
                  setShowPaymentModal(true); 
                }}
              >
                Make Payment
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentAmount('');
          setSelectedOwner(null);
        }}
        title={`Make Payment - ${selectedOwner?.ownerName}`}
        size="sm"
      >
        <div className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <p className="text-blue-900 text-sm">Pending Amount</p>
            <p className="text-3xl font-bold text-blue-600">₹{selectedOwner?.pendingAmount?.toLocaleString()}</p>
          </Card>

          <Input
            label="Payment Amount *"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="Enter payment amount"
            required
          />

          <Card className="bg-green-50 border-green-200">
            <p className="text-green-900 text-sm">Amount After Payment</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{((selectedOwner?.pendingAmount || 0) - parseFloat(paymentAmount || 0)).toLocaleString()}
            </p>
          </Card>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowPaymentModal(false);
                setPaymentAmount('');
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={isSubmitting}
              onClick={handleMakePayment}
            >
              Process Payment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedOwner(null); }}
        title="Delete Owner"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">
              ⚠️ Are you sure you want to delete <strong>{selectedOwner?.ownerName}</strong>?
            </p>
            <p className="text-red-700 text-sm mt-2">
              This action cannot be undone. All owner records will be permanently deleted.
            </p>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { setShowDeleteModal(false); setSelectedOwner(null); }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={isSubmitting}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);

const OwnerForm = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState(
    initialData || {
      ownerName: '',
      mobileNumber: '',
      email: '',
      address: '',
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Owner Name"
        name="ownerName"
        value={formData.ownerName}
        onChange={handleChange}
        required
      />
      <Input
        label="Mobile Number"
        type="tel"
        name="mobileNumber"
        value={formData.mobileNumber}
        onChange={handleChange}
        required
      />
      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
      />
      <Input
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Street address"
      />

      <div className="flex gap-2 pt-4">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {initialData ? 'Update Owner' : 'Add Owner'}
        </Button>
      </div>
    </form>
  );
};

export default OwnerManagementPage;
