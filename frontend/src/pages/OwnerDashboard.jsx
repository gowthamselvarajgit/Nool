import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import {
  Card,
  Button,
  Badge,
  Loading,
  ErrorMessage,
} from '../components/Common';
import Table from '../components/Table';
import StatCard from '../components/StatCard';
import { ownerService } from '../services/api';
import { formatDate } from '../utils/formatters';
import { DollarSign, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';

const OwnerDashboard = () => {
  const [ownerData, setOwnerData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const fetchOwnerData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get current owner from localStorage/context
      const ownerId = localStorage.getItem('sareeOwnerId');
      
      if (!ownerId) {
        setError('Owner ID not found');
        return;
      }

      // Fetch owner details
      const ownerResponse = await ownerService.getById(ownerId);
      setOwnerData({
        id: ownerResponse.sareeOwnerId,
        name: ownerResponse.ownerName,
        mobile: ownerResponse.mobileNumber,
        email: ownerResponse.email,
        address: ownerResponse.address,
        totalAmount: ownerResponse.totalAmount || 0,
        paidAmount: ownerResponse.paidAmount || 0,
        pendingAmount: (ownerResponse.totalAmount || 0) - (ownerResponse.paidAmount || 0),
      });

      // Fetch transactions
      const transResponse = await ownerService.getTransactions(ownerId, 0, 50);
      const transList = transResponse?.content || [];
      setTransactions(transList);

      // Calculate statistics
      setStats({
        totalTransactions: transList.length,
        completedTransactions: transList.filter(t => t.status === 'COMPLETED').length,
        pendingTransactions: transList.filter(t => t.status === 'PENDING').length,
        totalAmount: ownerResponse.totalAmount || 0,
        paidAmount: ownerResponse.paidAmount || 0,
        pendingAmount: (ownerResponse.totalAmount || 0) - (ownerResponse.paidAmount || 0),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <MainLayout><Loading text="Loading your dashboard..." /></MainLayout>;

  // Table columns
  const columns = [
    {
      key: 'transactionId',
      label: 'Transaction ID',
      render: (value) => <span className="font-medium text-gray-900">#{value}</span>,
    },
    {
      key: 'transactionDate',
      label: 'Date',
      render: (value) => <span className="text-gray-600">{formatDate(value)}</span>,
    },
    {
      key: 'sareeCount',
      label: 'Sarees',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (value) => <span className="font-bold text-blue-600">₹{value?.toLocaleString()}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={value === 'COMPLETED' ? 'success' : 'warning'}>
          {value}
        </Badge>
      ),
    },
  ];

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedData = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="slide-down">
          <h1 className="text-4xl font-bold text-gray-900">
            🧵 Welcome, {ownerData?.name}
          </h1>
          <p className="text-gray-600 mt-2">Track your saree transactions and payments</p>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchOwnerData} />}

        {/* Owner Info Card */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Owner ID</p>
              <p className="text-2xl font-bold text-gray-900">#{ownerData?.id}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Contact</p>
              <p className="text-lg font-medium text-gray-900">{ownerData?.mobile}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Email</p>
              <p className="text-lg font-medium text-gray-900">{ownerData?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Address</p>
              <p className="text-lg font-medium text-gray-900">{ownerData?.address || 'N/A'}</p>
            </div>
          </div>
        </Card>

        {/* Payment Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            color="info"
            title="Total Amount"
            value={`₹${(stats.totalAmount / 100000).toFixed(1)}L`}
            description="Total due amount"
          />
          <StatCard
            icon={<CreditCard className="w-6 h-6" />}
            color="success"
            title="Paid Amount"
            value={`₹${(stats.paidAmount / 100000).toFixed(1)}L`}
            description="Amount paid"
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            color="warning"
            title="Pending Amount"
            value={`₹${(stats.pendingAmount / 100000).toFixed(1)}L`}
            description="Remaining balance"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            color="primary"
            title="Payment %"
            value={`${stats.totalAmount > 0 ? Math.round((stats.paidAmount / stats.totalAmount * 100)) : 0}%`}
            description="Payment progress"
          />
        </div>

        {/* Payment Progress Bar */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Paid</span>
                <span className="font-medium text-green-600">₹{stats.paidAmount?.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${(stats.paidAmount / stats.totalAmount * 100) || 0}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-bold text-gray-900">₹{stats.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Transaction Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <p className="text-gray-600 text-sm">Total Transactions</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTransactions}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.completedTransactions}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pendingTransactions}</p>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="overflow-hidden">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          ) : (
            <Table
              columns={columns}
              data={paginatedData}
              pagination={{
                currentPage,
                totalPages,
                itemsPerPage,
                totalItems: transactions.length,
              }}
              onPaginationChange={(page) => setCurrentPage(page)}
            />
          )}
        </Card>

        {/* Quick Information */}
        <Card className="bg-blue-50 border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Quick Information</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>✓ Check your payment status and transaction history</p>
            <p>✓ Contact admin for payment queries or disputes</p>
            <p>✓ Download transaction reports from admin panel</p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default OwnerDashboard;
