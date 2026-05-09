import React from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Button } from '../components/Common';

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
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">👤 My Profile</h1>
        <Card className="text-center py-12">
          <p className="text-gray-600">Profile management coming soon...</p>
        </Card>
      </div>
    </MainLayout>
  );
};

export const InventoryPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">📦 Saree Inventory</h1>
        <Card className="text-center py-12">
          <p className="text-gray-600">Inventory management coming soon...</p>
        </Card>
      </div>
    </MainLayout>
  );
};

export const TransactionsPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">📊 Transactions</h1>
        <Card className="text-center py-12">
          <p className="text-gray-600">Transaction tracking coming soon...</p>
        </Card>
      </div>
    </MainLayout>
  );
};

export const OwnerPaymentsPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">💳 Payments</h1>
        <Card className="text-center py-12">
          <p className="text-gray-600">Payment tracking coming soon...</p>
        </Card>
      </div>
    </MainLayout>
  );
};

// Employee Pages
export const EmployeeProfile = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">👤 My Profile</h1>
        <Card className="text-center py-12">
          <p className="text-gray-600">Profile management coming soon...</p>
        </Card>
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
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">📝 Daily Work Log</h1>
        <Card className="text-center py-12">
          <p className="text-gray-600">Daily work tracking coming soon...</p>
        </Card>
      </div>
    </MainLayout>
  );
};

export const PerformancePage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">📈 Performance Metrics</h1>
        <Card className="text-center py-12">
          <p className="text-gray-600">Performance tracking coming soon...</p>
        </Card>
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
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">💳 Payments Management</h1>
        <Card className="text-center py-12">
          <p className="text-gray-600">Payments management coming soon...</p>
        </Card>
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
