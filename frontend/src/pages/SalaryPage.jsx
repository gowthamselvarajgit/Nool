import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Modal,
  Table,
  Loading,
  ErrorMessage,
  EmptyState,
} from '../components/Common';
import { employeeService } from '../services/api';
import { formatDate } from '../utils/formatters';
import { DollarSign, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const SalaryPage = () => {
  const [employees, setEmployees] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [salaryForm, setSalaryForm] = useState({
    employeeId: '',
    baseSalary: '',
    bonus: '0',
    deductions: '0',
    workingDays: '25',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch employees
      const empResponse = await employeeService.getList(0, 100);
      const empList = empResponse?.content || [];
      const mappedEmps = empList.map((e) => ({
        id: e.employeeId,
        name: e.employeeName,
        mobileNumber: e.mobileNumber,
        polishingRate: e.polishingRate,
      }));
      setEmployees(mappedEmps);

      // Fetch salary records for selected month
      await fetchSalaryForMonth(selectedMonth);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryForMonth = async (month) => {
    try {
      // Simulated - in real app, would call salaryService.getByMonth(month)
      setSalaryRecords([
        // Example data structure
      ]);
    } catch (err) {
      console.log('No records found for month:', err.message);
      setSalaryRecords([]);
    }
  };

  const handleMonthChange = async (month) => {
    setSelectedMonth(month);
    setCurrentPage(1);
    await fetchSalaryForMonth(month);
  };

  const calculateNetSalary = () => {
    const base = parseFloat(salaryForm.baseSalary) || 0;
    const bonus = parseFloat(salaryForm.bonus) || 0;
    const deductions = parseFloat(salaryForm.deductions) || 0;
    return base + bonus - deductions;
  };

  const handleProcessSalary = async () => {
    if (!salaryForm.baseSalary || !salaryForm.employeeId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const employee = employees.find(e => e.id === parseInt(salaryForm.employeeId));
      
      // In real app, would call salaryService.processSalary()
      const salaryData = {
        employeeId: parseInt(salaryForm.employeeId),
        employeeName: employee?.name,
        baseSalary: parseFloat(salaryForm.baseSalary),
        bonus: parseFloat(salaryForm.bonus) || 0,
        deductions: parseFloat(salaryForm.deductions) || 0,
        workingDays: parseInt(salaryForm.workingDays),
        netSalary: calculateNetSalary(),
        month: selectedMonth,
        status: 'PROCESSED',
        processedDate: new Date().toISOString().split('T')[0],
      };

      // Add to records (simulated)
      setSalaryRecords([...salaryRecords, salaryData]);

      setShowModal(false);
      setSalaryForm({
        employeeId: '',
        baseSalary: '',
        bonus: '0',
        deductions: '0',
        workingDays: '25',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Statistics
  const stats = {
    total: salaryRecords.length,
    processed: salaryRecords.filter(r => r.status === 'PROCESSED').length,
    pending: salaryRecords.filter(r => r.status === 'PENDING').length,
    totalAmount: salaryRecords.reduce((sum, r) => sum + (r.netSalary || 0), 0),
  };

  if (loading) return <MainLayout><Loading text="Loading salary records..." /></MainLayout>;

  // Table columns
  const columns = [
    {
      key: 'employeeName',
      label: 'Employee',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'baseSalary',
      label: 'Base Salary',
      render: (value) => <span className="font-medium text-gray-900">₹{value?.toLocaleString()}</span>,
    },
    {
      key: 'bonus',
      label: 'Bonus',
      render: (value) => <span className="text-green-600">+₹{(value || 0).toLocaleString()}</span>,
    },
    {
      key: 'deductions',
      label: 'Deductions',
      render: (value) => <span className="text-red-600">-₹{(value || 0).toLocaleString()}</span>,
    },
    {
      key: 'netSalary',
      label: 'Net Salary',
      render: (value) => <span className="font-bold text-blue-600">₹{value?.toLocaleString()}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={value === 'PROCESSED' ? 'success' : 'warning'}>
          {value}
        </Badge>
      ),
    },
  ];

  // Pagination
  const totalPages = Math.ceil(salaryRecords.length / itemsPerPage);
  const paginatedData = salaryRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="slide-down">
          <h1 className="text-4xl font-bold text-gray-900">💰 Salary Management</h1>
          <p className="text-gray-600 mt-2">Process and manage employee salaries</p>
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} onRetry={() => fetchSalaryForMonth(selectedMonth)} />}

        {/* Month Selection and Actions */}
        <Card className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex-1 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="flex-1"
            />
          </div>
          <Button onClick={() => setShowModal(true)}>
            ➕ Process Salary
          </Button>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-gray-600 text-sm">Total Processed</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.processed}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Amount</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ₹{(stats.totalAmount / 100000).toFixed(1)}L
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Average Salary</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              ₹{stats.processed > 0 ? Math.round(stats.totalAmount / stats.processed).toLocaleString() : '0'}
            </p>
          </Card>
        </div>

        {/* Salary Table */}
        {salaryRecords.length === 0 ? (
          <EmptyState message="No salary records for this month" icon="💰" />
        ) : (
          <Card className="overflow-hidden">
            <Table
              columns={columns}
              data={paginatedData}
              pagination={{
                currentPage,
                totalPages,
                itemsPerPage,
                totalItems: salaryRecords.length,
              }}
              onPaginationChange={(page) => setCurrentPage(page)}
            />
          </Card>
        )}
      </div>

      {/* Process Salary Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSalaryForm({
            employeeId: '',
            baseSalary: '',
            bonus: '0',
            deductions: '0',
            workingDays: '25',
          });
          setError('');
        }}
        title="Process Salary"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 font-medium">
              📅 Month: {new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <Select
            label="Select Employee"
            value={salaryForm.employeeId}
            onChange={(e) => setSalaryForm({ ...salaryForm, employeeId: e.target.value })}
            options={employees.map(emp => ({
              value: emp.id.toString(),
              label: `${emp.name} (₹${emp.polishingRate}/unit)`,
            }))}
            required
          />

          <Input
            label="Base Salary *"
            type="number"
            value={salaryForm.baseSalary}
            onChange={(e) => setSalaryForm({ ...salaryForm, baseSalary: e.target.value })}
            placeholder="Enter base salary"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Bonus"
              type="number"
              value={salaryForm.bonus}
              onChange={(e) => setSalaryForm({ ...salaryForm, bonus: e.target.value })}
              placeholder="0"
            />

            <Input
              label="Deductions"
              type="number"
              value={salaryForm.deductions}
              onChange={(e) => setSalaryForm({ ...salaryForm, deductions: e.target.value })}
              placeholder="0"
            />
          </div>

          <Input
            label="Working Days"
            type="number"
            value={salaryForm.workingDays}
            onChange={(e) => setSalaryForm({ ...salaryForm, workingDays: e.target.value })}
            placeholder="25"
          />

          {/* Net Salary Preview */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 font-medium">Net Salary</p>
                <p className="text-3xl font-bold text-green-600">₹{calculateNetSalary().toLocaleString()}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </Card>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowModal(false);
                setSalaryForm({
                  employeeId: '',
                  baseSalary: '',
                  bonus: '0',
                  deductions: '0',
                  workingDays: '25',
                });
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={isSubmitting}
              onClick={handleProcessSalary}
            >
              Process Salary
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default SalaryPage;
