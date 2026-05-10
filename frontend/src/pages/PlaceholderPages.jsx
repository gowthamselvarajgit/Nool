import React from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Button } from '../components/Common';
import { useAuth } from '../hooks/useAuth';
import { employeeService } from '../services/api';    
import { dailyWorkService } from '../services/api';
import { attendanceService } from '../services/api';
import { ownerService } from '../services/api';
import { inventoryService } from '../services/api';
import { ownerPaymentService } from '../services/api';


// Owner Pages
export const OwnerDashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="slide-down">
          <h1 className="text-4xl font-bold text-gray-900">🧵 Owner Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your saree business</p>
        </div>
        <Card className="text-center py-12">
          <p className="text-gray-600 text-lg">📊 Comprehensive inventory and transaction tracking</p>
          <Button className="mt-6" onClick={() => window.location.href = '/owner/inventory'}>
            View Inventory
          </Button>
        </Card>
      </div>
    </MainLayout>
  );
};

export const OwnerProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await ownerService.getMe();
        setProfile(data);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading your profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8">
            <p className="text-red-600 font-medium">⚠️ {error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="slide-down">
          <h1 className="text-3xl font-bold text-gray-900">👤 My Profile</h1>
          <p className="text-gray-500 mt-1">Your business and contact details</p>
        </div>

        {/* Avatar Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white slide-up">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl font-bold">
              {profile?.ownerName?.charAt(0) || 'O'}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile?.ownerName}</h2>
              <p className="text-purple-100 mt-1">Owner ID: #{profile?.sareeOwnerId}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                profile?.status === 'ACTIVE'
                  ? 'bg-green-400 bg-opacity-30 text-green-100'
                  : 'bg-red-400 bg-opacity-30 text-red-100'
              }`}>
                {profile?.status}
              </span>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 slide-up">
          <div className="flex items-center gap-3 px-6 py-4">
            <span className="text-xl">📱</span>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Mobile Number</p>
              <p className="text-gray-900 font-semibold mt-0.5">{profile?.mobileNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-4">
            <span className="text-xl">📅</span>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Joined On</p>
              <p className="text-gray-900 font-semibold mt-0.5">
                {profile?.joiningDate
                  ? new Date(profile.joiningDate).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-4">
            <span className="text-xl">🧵</span>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Business Type</p>
              <p className="text-gray-900 font-semibold mt-0.5">Saree Owner</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-4">
            <span className="text-xl">🎭</span>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Role</p>
              <p className="text-gray-900 font-semibold mt-0.5">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};


export const InventoryPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = React.useState(null);
  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const ownerId = user?.sareeOwnerId;
        if (!ownerId) throw new Error('Owner ID not found');

        const [summaryData, txData] = await Promise.all([
          inventoryService.getOwnerSummary(ownerId, firstDay, lastDay),
          inventoryService.getTransactions({
            ownerId,
            startDate: firstDay,
            endDate: lastDay,
            pageNo: 0,
            pageSize: 10,
          }),
        ]);

        setSummary(summaryData);
        setTransactions(txData?.content || []);
      } catch (err) {
        setError(err.message || 'Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading inventory...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8">
            <p className="text-red-600 font-medium">⚠️ {error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const returnRate = summary?.totalGiven
    ? Math.round((summary.totalReturned / summary.totalGiven) * 100)
    : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="slide-down">
          <h1 className="text-3xl font-bold text-gray-900">📦 My Inventory</h1>
          <p className="text-gray-500 mt-1">
            {now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })} — saree stock overview
          </p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 gap-4 slide-up">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-5 text-white">
            <p className="text-purple-100 text-sm font-medium">Given Out</p>
            <p className="text-3xl font-bold mt-1">{summary?.totalGiven ?? '—'}</p>
            <p className="text-purple-200 text-xs mt-1">sarees this month</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-5 text-white">
            <p className="text-green-100 text-sm font-medium">Returned</p>
            <p className="text-3xl font-bold mt-1">{summary?.totalReturned ?? '—'}</p>
            <p className="text-green-200 text-xs mt-1">sarees this month</p>
          </div>
        </div>

        {/* Pending Alert */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-center justify-between slide-up">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-semibold text-orange-900">Still with Workers</p>
              <p className="text-sm text-orange-600 mt-0.5">Pending return</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-700">
            {summary?.pendingCount ?? '—'}
          </p>
        </div>

        {/* Return Rate Progress */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 slide-up">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Return Rate</h2>
            <span className="font-bold text-gray-900">{returnRate}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700"
              style={{ width: `${returnRate}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">
            {summary?.totalReturned ?? 0} of {summary?.totalGiven ?? 0} sarees returned
          </p>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm slide-up">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Movements</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500">No inventory movements this month</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      tx.transactionType === 'GIVEN' ? 'bg-purple-50' : 'bg-green-50'
                    }`}>
                      {tx.transactionType === 'GIVEN' ? '📤' : '📥'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(tx.transactionDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {tx.employeeName || 'Worker'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{tx.sareeCount} sarees</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      tx.transactionType === 'GIVEN'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {tx.transactionType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};


export const TransactionsPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = React.useState([]);
  const [summary, setSummary] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const ownerId = user?.sareeOwnerId;
        if (!ownerId) throw new Error('Owner ID not found');

        const [txData, summaryData] = await Promise.all([
          inventoryService.getTransactions({
            ownerId,
            startDate: firstDay,
            endDate: lastDay,
            pageNo: 0,
            pageSize: 20,
          }),
          inventoryService.getOwnerSummary(ownerId, firstDay, lastDay),
        ]);

        setTransactions(txData?.content || []);
        setSummary(summaryData);
      } catch (err) {
        setError(err.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading transactions...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8">
            <p className="text-red-600 font-medium">⚠️ {error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="slide-down">
          <h1 className="text-3xl font-bold text-gray-900">📊 My Transactions</h1>
          <p className="text-gray-500 mt-1">
            {now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })} — inventory movement
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 slide-up">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-5 text-white">
            <p className="text-purple-100 text-sm font-medium">Sarees Given</p>
            <p className="text-3xl font-bold mt-1">{summary?.totalGiven ?? '—'}</p>
            <p className="text-purple-200 text-xs mt-1">this month</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-5 text-white">
            <p className="text-indigo-100 text-sm font-medium">Sarees Returned</p>
            <p className="text-3xl font-bold mt-1">{summary?.totalReturned ?? '—'}</p>
            <p className="text-indigo-200 text-xs mt-1">this month</p>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-center justify-between slide-up">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-semibold text-orange-900">Pending with Workers</p>
              <p className="text-sm text-orange-600 mt-0.5">Sarees not yet returned</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-700">{summary?.pendingCount ?? '—'}</p>
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm slide-up">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Transaction History</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500">No transactions this month</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      tx.transactionType === 'GIVEN'
                        ? 'bg-purple-50'
                        : 'bg-green-50'
                    }`}>
                      {tx.transactionType === 'GIVEN' ? '📤' : '📥'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(tx.transactionDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-500">{tx.employeeName || 'Worker'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      tx.transactionType === 'GIVEN'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {tx.transactionType}
                    </span>
                    <p className="font-bold text-gray-900 mt-1">{tx.sareeCount} sarees</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};


export const OwnerPaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = React.useState([]);
  const [summary, setSummary] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const ownerId = user?.sareeOwnerId;
        if (!ownerId) throw new Error('Owner ID not found');

        const [historyData, summaryData] = await Promise.all([
          ownerPaymentService.getHistory(ownerId, firstDay, lastDay),
          ownerPaymentService.getOwnerSummary(ownerId, firstDay, lastDay),
        ]);

        setPayments(historyData || []);
        setSummary(summaryData);
      } catch (err) {
        setError(err.message || 'Failed to load payment data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading payments...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8">
            <p className="text-red-600 font-medium">⚠️ {error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="slide-down">
          <h1 className="text-3xl font-bold text-gray-900">💳 My Payments</h1>
          <p className="text-gray-500 mt-1">
            {now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })} — payment history
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 slide-up">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-5 text-white">
            <p className="text-purple-100 text-sm font-medium">Total Paid</p>
            <p className="text-3xl font-bold mt-1">
              ₹{summary?.totalPaid?.toFixed(0) ?? '—'}
            </p>
            <p className="text-purple-200 text-xs mt-1">this month</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white">
            <p className="text-orange-100 text-sm font-medium">Pending Amount</p>
            <p className="text-3xl font-bold mt-1">
              ₹{summary?.pendingAmount?.toFixed(0) ?? '—'}
            </p>
            <p className="text-orange-200 text-xs mt-1">outstanding</p>
          </div>
        </div>

        {/* Last Payment Banner */}
        {summary?.lastPaymentDate && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 slide-up">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-900">Last payment received</p>
              <p className="text-sm text-green-600 mt-0.5">
                {new Date(summary.lastPaymentDate).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}

        {/* Payment List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm slide-up">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Payment History</h2>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500">No payments recorded this month</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {payments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-lg">
                      💳
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {payment.paymentMode || 'Cash'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ₹{payment.amount?.toFixed(2)}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      payment.status === 'PAID'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};


// Employee Pages
export const EmployeeProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await employeeService.getMe();
        setProfile(data);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading your profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8">
            <p className="text-red-600 font-medium">⚠️ {error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="slide-down">
          <h1 className="text-3xl font-bold text-gray-900">👤 My Profile</h1>
          <p className="text-gray-500 mt-1">Your personal and work details</p>
        </div>

        {/* Avatar Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white slide-up">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl font-bold">
              {profile?.employeeName?.charAt(0) || 'E'}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile?.employeeName}</h2>
              <p className="text-indigo-100 mt-1">Employee ID: #{profile?.employeeId}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                profile?.status === 'ACTIVE'
                  ? 'bg-green-400 bg-opacity-30 text-green-100'
                  : 'bg-red-400 bg-opacity-30 text-red-100'
              }`}>
                {profile?.status}
              </span>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 slide-up">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">📱</span>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Mobile Number</p>
                <p className="text-gray-900 font-semibold mt-0.5">{profile?.mobileNumber}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">📅</span>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Joining Date</p>
                <p className="text-gray-900 font-semibold mt-0.5">
                  {profile?.joiningDate
                    ? new Date(profile.joiningDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">💎</span>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Polishing Rate</p>
                <p className="text-gray-900 font-semibold mt-0.5">
                  ₹{profile?.polishingRate?.toFixed(2)} per unit
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">🎭</span>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Role</p>
                <p className="text-gray-900 font-semibold mt-0.5">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};


export const SalaryPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">💰 Salary Information</h1>
        <Card className="text-center py-12">
          <p className="text-gray-600">Salary management coming soon...</p>
        </Card>
      </div>
    </MainLayout>
  );
};

export const DailyWorkPage = () => {
  const { user } = useAuth();
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [summary, setSummary] = React.useState(null);

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const employeeId = user?.employeeId;
        if (!employeeId) throw new Error('Employee ID not found');

        const [listData, summaryData] = await Promise.all([
          dailyWorkService.getList({
            employeeId,
            startDate: firstDay,
            endDate: lastDay,
            pageNo: 0,
            pageSize: 20,
          }),
          dailyWorkService.getEmployeeSummary(employeeId, firstDay, lastDay),
        ]);

        setRecords(listData?.content || []);
        setSummary(summaryData);
      } catch (err) {
        setError(err.message || 'Failed to load daily work data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading your work records...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8">
            <p className="text-red-600 font-medium">⚠️ {error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="slide-down">
          <h1 className="text-3xl font-bold text-gray-900">📝 My Daily Work</h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })} — work log
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 slide-up">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
            <p className="text-indigo-100 text-sm font-medium">Total Sarees</p>
            <p className="text-3xl font-bold mt-1">{summary?.totalSarees ?? '—'}</p>
            <p className="text-indigo-200 text-xs mt-1">this month</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-5 text-white">
            <p className="text-green-100 text-sm font-medium">Total Earnings</p>
            <p className="text-3xl font-bold mt-1">
              ₹{summary?.totalEarnings?.toFixed(0) ?? '—'}
            </p>
            <p className="text-green-200 text-xs mt-1">this month</p>
          </div>
        </div>

        {/* Records List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm slide-up">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Work Records</h2>
          </div>

          {records.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500">No work records for this month</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {records.map((record, index) => (
                <div key={index} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-lg">
                      🧵
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(record.workDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-500">{record.sareeCount} sarees polished</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{record.earnings?.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">@ ₹{record.polishingRate}/unit</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};


export const PerformancePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [workSummary, setWorkSummary] = React.useState(null);
  const [attendanceSummary, setAttendanceSummary] = React.useState(null);
  const [salarySummary, setSalarySummary] = React.useState(null);

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const employeeId = user?.employeeId;
        if (!employeeId) throw new Error('Employee ID not found');

        const [work, attendance, salary] = await Promise.all([
          dailyWorkService.getEmployeeSummary(employeeId, firstDay, lastDay),
          attendanceService.getEmployeeSummary(employeeId, firstDay, lastDay),
          salaryService.getEmployeeSummary(employeeId, firstDay, lastDay),
        ]);

        setWorkSummary(work);
        setAttendanceSummary(attendance);
        setSalarySummary(salary);
      } catch (err) {
        setError(err.message || 'Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading your performance...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8">
            <p className="text-red-600 font-medium">⚠️ {error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const attendanceRate = attendanceSummary?.totalDays
    ? Math.round((attendanceSummary.presentDays / attendanceSummary.totalDays) * 100)
    : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="slide-down">
          <h1 className="text-3xl font-bold text-gray-900">📈 My Performance</h1>
          <p className="text-gray-500 mt-1">
            {now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })} — overview
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 gap-4 slide-up">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
            <p className="text-indigo-100 text-sm font-medium">Sarees Polished</p>
            <p className="text-3xl font-bold mt-1">{workSummary?.totalSarees ?? '—'}</p>
            <p className="text-indigo-200 text-xs mt-1">this month</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-5 text-white">
            <p className="text-green-100 text-sm font-medium">Total Earned</p>
            <p className="text-3xl font-bold mt-1">
              ₹{workSummary?.totalEarnings?.toFixed(0) ?? '—'}
            </p>
            <p className="text-green-200 text-xs mt-1">this month</p>
          </div>
        </div>

        {/* Attendance Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 slide-up">
          <h2 className="font-semibold text-gray-900 mb-4">📍 Attendance</h2>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Attendance Rate</span>
            <span className="font-bold text-gray-900">{attendanceRate}%</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xl font-bold text-gray-900">{attendanceSummary?.totalDays ?? '—'}</p>
              <p className="text-xs text-gray-500 mt-1">Total Days</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xl font-bold text-green-700">{attendanceSummary?.presentDays ?? '—'}</p>
              <p className="text-xs text-gray-500 mt-1">Present</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-xl font-bold text-red-600">{attendanceSummary?.absentDays ?? '—'}</p>
              <p className="text-xs text-gray-500 mt-1">Absent</p>
            </div>
          </div>
        </div>

        {/* Salary Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 slide-up">
          <div className="px-6 py-4">
            <h2 className="font-semibold text-gray-900">💰 Salary Summary</h2>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-gray-600">Total Paid</p>
            <p className="font-bold text-gray-900">₹{salarySummary?.totalPaid?.toFixed(2) ?? '—'}</p>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-gray-600">Pending Amount</p>
            <p className="font-bold text-orange-600">₹{salarySummary?.pendingAmount?.toFixed(2) ?? '—'}</p>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-gray-600">Last Payment</p>
            <p className="font-bold text-gray-900">
              {salarySummary?.lastPaymentDate
                ? new Date(salarySummary.lastPaymentDate).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })
                : '—'}
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};


// Admin Additional Pages
export const OwnersManagementPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">🧵 Owners Management</h1>
        <Card className="text-center py-12">
          <p className="text-gray-600">Owner management coming soon...</p>
        </Card>
      </div>
    </MainLayout>
  );
};

export const InventoryManagementPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">📦 Inventory Management</h1>
        <Card className="text-center py-12">
          <p className="text-gray-600">Inventory management coming soon...</p>
        </Card>
      </div>
    </MainLayout>
  );
};

export const SalaryManagementPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">💰 Salary Management</h1>
        <Card className="text-center py-12">
          <p className="text-gray-600">Salary management coming soon...</p>
        </Card>
      </div>
    </MainLayout>
  );
};

export const PaymentsManagementPage = () => {
  const [payments, setPayments] = React.useState([]);
  const [summary, setSummary] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, historyData] = await Promise.all([
          ownerPaymentService.getSummary(firstDay, lastDay),
          ownerPaymentService.getHistory(null, firstDay, lastDay),
        ]);

        setSummary(summaryData);
        setPayments(historyData || []);
      } catch (err) {
        setError(err.message || 'Failed to load payment data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading payments...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8">
            <p className="text-red-600 font-medium">⚠️ {error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="slide-down">
          <h1 className="text-3xl font-bold text-gray-900">💳 Payments Management</h1>
          <p className="text-gray-500 mt-1">
            {now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })} — all owner payments
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 slide-up">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
            <p className="text-indigo-100 text-sm font-medium">Total Collected</p>
            <p className="text-2xl font-bold mt-1">
              ₹{summary?.totalPaid?.toFixed(0) ?? '—'}
            </p>
            <p className="text-indigo-200 text-xs mt-1">this month</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white">
            <p className="text-orange-100 text-sm font-medium">Total Pending</p>
            <p className="text-2xl font-bold mt-1">
              ₹{summary?.pendingAmount?.toFixed(0) ?? '—'}
            </p>
            <p className="text-orange-200 text-xs mt-1">outstanding</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-5 text-white">
            <p className="text-green-100 text-sm font-medium">Transactions</p>
            <p className="text-2xl font-bold mt-1">{payments.length}</p>
            <p className="text-green-200 text-xs mt-1">this month</p>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm slide-up">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">All Owner Payments</h2>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500">No payments recorded this month</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <span>Owner</span>
                <span>Date</span>
                <span>Mode</span>
                <span className="text-right">Amount</span>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-gray-100">
                {payments.map((payment, index) => (
                  <div key={index} className="grid grid-cols-4 items-center px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600">
                        {payment.ownerName?.charAt(0) || 'O'}
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {payment.ownerName || '—'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                    <span className="text-sm text-gray-600">
                      {payment.paymentMode || 'Cash'}
                    </span>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ₹{payment.amount?.toFixed(2)}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        payment.status === 'PAID'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};


export const DailyWorkManagementPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">📝 Daily Work Management</h1>
        <Card className="text-center py-12">
          <p className="text-gray-600">Daily work management coming soon...</p>
        </Card>
      </div>
    </MainLayout>
  );
};

export const AnalyticsPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">📊 Analytics</h1>
        <Card className="text-center py-12">
          <p className="text-gray-600">Advanced analytics coming soon...</p>
        </Card>
      </div>
    </MainLayout>
  );
};
