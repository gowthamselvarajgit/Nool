import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import {
  Card, Button, Input, Select, Badge, Modal, Loading, ErrorMessage, EmptyState,
} from '../components/Common';
import { Table } from '../components/Table';
import { useAuth } from '../hooks/useAuth';
import { salaryService, employeeService } from '../services/api';
import { formatDate } from '../utils/formatters';
import { DollarSign, TrendingUp, RefreshCw } from 'lucide-react';

const SalaryPage = () => {
  const { user } = useAuth();
  const isWorker = user?.role === 'WORKER';
  const [employees, setEmployees] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const itemsPerPage = 10;

  const [salaryForm, setSalaryForm] = useState({
    employeeId: '',
    fromDate: '',
    toDate: '',
    amountPaid: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'CASH',
    remarks: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchInitialData() {
    try {
      setLoading(true);
      setError('');

      if (isWorker) {
        const profile = await employeeService.getMe();
        const workerEmployee = {
          id: profile.employeeId,
          name: profile.employeeName,
          mobileNumber: profile.mobileNumber,
          polishingRate: profile.polishingRate,
        };

        setEmployees([workerEmployee]);
        setSelectedEmployee(String(workerEmployee.id));
        setSalaryForm(prev => ({ ...prev, employeeId: String(workerEmployee.id) }));

        const history = await salaryService.getMyHistory(0, 50);
        setSalaryRecords(history?.content || []);
      } else {
        const empResponse = await employeeService.getList(0, 200);
        const empList = empResponse?.content || [];
        setEmployees(empList.map(e => ({
          id: e.employeeId,
          name: e.employeeName,
          mobileNumber: e.mobileNumber,
          polishingRate: e.polishingRate,
        })));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSalaryHistory(empId) {
    if (!empId) return;
    try {
      setLoading(true);
      const response = isWorker
        ? await salaryService.getMyHistory(0, 50)
        : await salaryService.getEmployeeHistory(empId, 0, 50);
      setSalaryRecords(response?.content || []);
    } catch (err) {
      setError(err.message);
      setSalaryRecords([]);
    } finally {
      setLoading(false);
    }
  }

  const handleEmployeeChange = (empId) => {
    if (isWorker) return;
    setSelectedEmployee(empId);
    setSalaryForm(prev => ({ ...prev, employeeId: empId }));
    setCurrentPage(1);
    if (empId) fetchSalaryHistory(empId);
    else setSalaryRecords([]);
  };

  const handlePaySalary = async () => {
    const { employeeId, fromDate, toDate, amountPaid, paymentDate } = salaryForm;
    if (!employeeId || !fromDate || !toDate || !amountPaid || !paymentDate) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      setIsSubmitting(true);
      setError('');
      await salaryService.create({
        employeeId: parseInt(employeeId, 10),
        fromDate,
        toDate,
        amountPaid: parseFloat(amountPaid),
        paymentDate,
        paymentMode: salaryForm.paymentMode,
        remarks: salaryForm.remarks,
      });
      setShowModal(false);
      setSalaryForm({
        employeeId: selectedEmployee,
        fromDate: '',
        toDate: '',
        amountPaid: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMode: 'CASH',
        remarks: '',
      });
      await fetchSalaryHistory(selectedEmployee);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    total: salaryRecords.length,
    totalPaid: salaryRecords.reduce((sum, record) => sum + (record.amountPaid || 0), 0),
  };

  if (loading && employees.length === 0) {
    return <MainLayout><Loading text="Loading salary data..." /></MainLayout>;
  }

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'fromDate',
      label: 'Period',
      render: (value, row) => (
        <span className="text-gray-600 text-sm">
          {value ? formatDate(value) : '-'} to {row.toDate ? formatDate(row.toDate) : '-'}
        </span>
      ),
    },
    {
      key: 'amountPaid',
      label: 'Amount Paid',
      render: (value) => <span className="font-bold text-green-600">Rs {(value || 0).toLocaleString('en-IN')}</span>,
    },
    {
      key: 'paymentMode',
      label: 'Mode',
      render: (value) => <Badge variant="info">{value}</Badge>,
    },
    {
      key: 'paymentDate',
      label: 'Payment Date',
      render: (value) => <span className="text-gray-600">{value ? formatDate(value) : '-'}</span>,
    },
    {
      key: 'remarks',
      label: 'Remarks',
      render: (value) => <span className="text-gray-500 text-sm">{value || '-'}</span>,
    },
  ];

  const totalPages = Math.ceil(salaryRecords.length / itemsPerPage);
  const paginatedData = salaryRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="slide-down">
          <h1 className="text-4xl font-bold text-gray-900">{isWorker ? 'My Salary' : 'Salary Management'}</h1>
          <p className="text-gray-600 mt-2">{isWorker ? 'View your salary payment history' : 'Process and view employee salary payments'}</p>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchInitialData} />}

        <Card className="flex flex-col md:flex-row gap-4 items-stretch md:items-end justify-between">
          <div className="flex-1">
            {isWorker ? (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Employee</p>
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900">
                  {employees[0] ? `${employees[0].name} (Rs ${employees[0].polishingRate}/unit)` : '-'}
                </div>
              </div>
            ) : (
              <Select
                label="Select Employee to View History"
                value={selectedEmployee}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                options={[
                  { value: '', label: '- Select Employee -' },
                  ...employees.map(emp => ({
                    value: emp.id.toString(),
                    label: `${emp.name} (Rs ${emp.polishingRate}/unit)`,
                  })),
                ]}
              />
            )}
          </div>
          <div className="flex gap-2">
            {selectedEmployee && (
              <Button variant="outline" onClick={() => fetchSalaryHistory(selectedEmployee)}>
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
            )}
            {!isWorker && (
              <Button onClick={() => { setSalaryForm(prev => ({ ...prev, employeeId: selectedEmployee })); setShowModal(true); }}>
                Add Payment
              </Button>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <p className="text-gray-600 text-sm">Total Payments</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Paid</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  Rs {stats.totalPaid.toLocaleString('en-IN')}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Avg per Payment</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              Rs {stats.total > 0 ? Math.round(stats.totalPaid / stats.total).toLocaleString('en-IN') : '0'}
            </p>
          </Card>
        </div>

        {!selectedEmployee ? (
          <EmptyState message="Select an employee to view salary history" icon="Rs" />
        ) : loading ? (
          <Loading text="Loading salary history..." />
        ) : salaryRecords.length === 0 ? (
          <EmptyState message="No salary payments found" icon="Rs" />
        ) : (
          <Card className="overflow-hidden">
            <Table
              columns={columns}
              data={paginatedData}
              pagination={{ currentPage, totalPages, itemsPerPage, totalItems: salaryRecords.length }}
              onPaginationChange={(page) => setCurrentPage(page)}
            />
          </Card>
        )}
      </div>

      <Modal
        isOpen={showModal && !isWorker}
        onClose={() => {
          setShowModal(false);
          setSalaryForm(prev => ({ ...prev, fromDate: '', toDate: '', amountPaid: '', remarks: '' }));
          setError('');
        }}
        title="Pay Salary"
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Employee *"
            value={salaryForm.employeeId}
            onChange={(e) => setSalaryForm(prev => ({ ...prev, employeeId: e.target.value }))}
            options={[
              { value: '', label: '- Select Employee -' },
              ...employees.map(emp => ({ value: emp.id.toString(), label: `${emp.name} (${emp.mobileNumber})` })),
            ]}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="From Date *"
              type="date"
              value={salaryForm.fromDate}
              onChange={(e) => setSalaryForm(prev => ({ ...prev, fromDate: e.target.value }))}
              required
            />
            <Input
              label="To Date *"
              type="date"
              value={salaryForm.toDate}
              onChange={(e) => setSalaryForm(prev => ({ ...prev, toDate: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount Paid *"
              type="number"
              value={salaryForm.amountPaid}
              onChange={(e) => setSalaryForm(prev => ({ ...prev, amountPaid: e.target.value }))}
              placeholder="0.00"
              required
            />
            <Input
              label="Payment Date *"
              type="date"
              value={salaryForm.paymentDate}
              onChange={(e) => setSalaryForm(prev => ({ ...prev, paymentDate: e.target.value }))}
              required
            />
          </div>

          <Select
            label="Payment Mode *"
            value={salaryForm.paymentMode}
            onChange={(e) => setSalaryForm(prev => ({ ...prev, paymentMode: e.target.value }))}
            options={[
              { value: 'CASH', label: 'Cash' },
              { value: 'ONLINE', label: 'Online Transfer' },
              { value: 'CHEQUE', label: 'Cheque' },
            ]}
          />

          <Input
            label="Remarks"
            value={salaryForm.remarks}
            onChange={(e) => setSalaryForm(prev => ({ ...prev, remarks: e.target.value }))}
            placeholder="Optional notes"
          />

          {salaryForm.amountPaid && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600 font-medium">Amount to Pay</p>
                  <p className="text-3xl font-bold text-green-600">
                    Rs {parseFloat(salaryForm.amountPaid || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </Card>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={isSubmitting} onClick={handlePaySalary}>
              Process Payment
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default SalaryPage;
