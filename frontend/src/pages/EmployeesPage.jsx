import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Button, Card, Input, Modal, Badge, Select, Loading, ErrorMessage, EmptyState } from '../components/Common';
import { Table } from '../components/Table';
import { employeeService } from '../services/api';
import { formatDate, getEmployeeStatusColor, getInitials, friendlyStatus } from '../utils/formatters';
import { exportToExcel } from '../utils/excelExporter';
import { Edit2, Eye, ToggleLeft, ToggleRight, Download } from 'lucide-react';

const EmployeeForm = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      mobileNumber: '',
      joiningDate: '',
      polishingRate: '',
      status: 'ACTIVE',
      password: '',
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
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      {/* Email removed - backend does not accept email for employee */}
      <Input
        label="Mobile Number"
        type="tel"
        name="mobileNumber"
        value={formData.mobileNumber}
        onChange={handleChange}
        required
      />
      <Input
        label="Joining Date"
        type="date"
        name="joiningDate"
        value={formData.joiningDate}
        onChange={handleChange}
        required
      />
      <Input
        label="Polishing Rate"
        type="number"
        name="polishingRate"
        value={formData.polishingRate}
        onChange={handleChange}
        placeholder="Rate per unit"
      />
      {/* Password only required when creating a new employee */}
      {!initialData && (
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      )}
      <Select
        label="Status"
        name="status"
        value={formData.status}
        onChange={handleChange}
        options={[
          { value: 'ACTIVE', label: 'Active' },
          { value: 'LEFT', label: 'Inactive' },
        ]}
      />

      <div className="flex gap-2 pt-4">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {initialData ? 'Update Employee' : 'Create Employee'}
        </Button>
      </div>
    </form>
  );
};

export const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const fetchEmployees = async (pageOneBased = currentPage, kw = searchKeyword) => {
    try {
      setLoading(true);
      setError('');
      const response = await employeeService.getList(pageOneBased - 1, itemsPerPage, kw);
      const list = response?.content || [];
      const mapped = list.map((e) => ({
        id: e.employeeId,
        name: e.employeeName,
        joiningDate: e.joiningDate,
        polishingRate: e.polishingRate,
        status: e.status,
        mobileNumber: e.mobileNumber,
      }));
      setEmployees(mapped);
      setTotalPages(response?.totalPages || 1);
      setTotalItems(response?.totalElements ?? mapped.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(currentPage, searchKeyword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Debounce search → reset to first page and refetch.
  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      fetchEmployees(1, searchKeyword);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      setIsSubmitting(true);
      if (selectedEmployee) {
        // Update expects: employeeId, employeeName, polishingRate, mobileNumber
        await employeeService.update({
          employeeId: selectedEmployee.id,
          employeeName: formData.name,
          polishingRate: Number(formData.polishingRate),
          mobileNumber: formData.mobileNumber,
        });
        // Status is updated via a separate endpoint
        if (formData.status && formData.status !== selectedEmployee.status) {
          await employeeService.updateStatus(selectedEmployee.id, formData.status);
        }
      } else {
        // Create expects: employeeName, joiningDate, polishingRate, mobileNumber, password
        await employeeService.create({
          employeeName: formData.name,
          joiningDate: formData.joiningDate,
          polishingRate: Number(formData.polishingRate),
          mobileNumber: formData.mobileNumber,
          password: formData.password,
        });
      }
      setShowModal(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async () => {
    try {
      // Fetch the full set (large page size) for export, regardless of current pagination.
      const res = await employeeService.getList(0, 2000, searchKeyword);
      const all = (res?.content || []).map((e) => ({
        'Employee ID': e.employeeId,
        'Name': e.employeeName,
        'Mobile': e.mobileNumber,
        'Joining Date': e.joiningDate ? formatDate(e.joiningDate) : '',
        'Polishing Rate (₹)': e.polishingRate ?? 0,
        'Status': friendlyStatus(e.status),
      }));
      exportToExcel({
        rows: all,
        fileName: 'Nool_Employees',
        sheetName: 'Employees',
        columnWidths: [12, 22, 14, 14, 18, 14],
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle employee ACTIVE <-> LEFT
  const handleToggleStatus = async (employee) => {
    try {
      setError('');
      const newStatus = employee.status === 'ACTIVE' ? 'LEFT' : 'ACTIVE';
      await employeeService.updateStatus(employee.id, newStatus);
      fetchEmployees();
    } catch (err) { setError(`Status update failed: ${err.message}`); }
  };

  const handleEdit = (employee) => {
    // map employee to form initialData shape (no password)
    setSelectedEmployee({
      id: employee.id,
      name: employee.name,
      mobileNumber: employee.mobileNumber,
      joiningDate: employee.joiningDate,
      polishingRate: employee.polishingRate,
      status: employee.status,
    });
    setShowModal(true);
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  if (loading) return <MainLayout><Loading text="Loading employees..." /></MainLayout>;

  // Server-side pagination: `employees` already holds the current page.

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
            {getInitials(row.name)}
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
      key: 'joiningDate',
      label: 'Joining Date',
      render: (value) => <span className="text-gray-600">{formatDate(value)}</span>,
    },
    {
      key: 'polishingRate',
      label: 'Rate',
      render: (value) => <span className="font-medium text-gray-900">₹{value}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <Badge variant={getEmployeeStatusColor(value)}>{friendlyStatus(value)}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleViewDetails(row)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" title="View details">
            <Eye className="w-4 h-4 text-blue-600" />
          </button>
          <button onClick={() => handleEdit(row)} className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
            <Edit2 className="w-4 h-4 text-amber-600" />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            className={`p-1.5 rounded-lg transition-colors ${row.status === 'ACTIVE' ? 'hover:bg-red-50' : 'hover:bg-green-50'}`}
            title={row.status === 'ACTIVE' ? 'Mark as Left' : 'Mark as Active'}
          >
            {row.status === 'ACTIVE'
              ? <ToggleRight className="w-5 h-5 text-green-600" />
              : <ToggleLeft className="w-5 h-5 text-gray-400" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="slide-down">
          <h1 className="text-4xl font-bold text-gray-900">👥 Employee Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all employees</p>
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} onRetry={fetchEmployees} />}

        {/* Search and Actions */}
        <Card className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <Input
            placeholder="Search by name or mobile..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" /> Export Excel
            </Button>
            <Button onClick={() => { setSelectedEmployee(null); setShowModal(true); }}>
              ➕ Add Employee
            </Button>
          </div>
        </Card>

        {/* Stats — totals across all pages */}
        <Card>
          <p className="text-gray-600 text-sm">Total Employees</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalItems}</p>
        </Card>

        {/* Employee Table */}
        {employees.length === 0 ? (
          <EmptyState message="No employees found" icon="👤" />
        ) : (
          <Card className="overflow-hidden">
            <Table
              columns={columns}
              data={employees}
              pagination={{
                currentPage,
                totalPages,
                itemsPerPage,
                totalItems,
              }}
              onPaginationChange={(page) => setCurrentPage(page)}
            />
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedEmployee(null); }}
        title={selectedEmployee ? 'Edit Employee' : 'Create New Employee'}
        size="lg"
      >
        <EmployeeForm
          initialData={selectedEmployee}
          onSubmit={handleCreateOrUpdate}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setSelectedEmployee(null); }}
        title={`Employee Details - ${selectedEmployee?.name}`}
        size="md"
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                {getInitials(selectedEmployee.name)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedEmployee.name}</h3>
                <Badge variant={getEmployeeStatusColor(selectedEmployee.status)}>
                  {friendlyStatus(selectedEmployee.status)}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <DetailRow label="Employee ID" value={`#${selectedEmployee.id}`} />
              <DetailRow label="Mobile" value={selectedEmployee.mobileNumber} />
              <DetailRow label="Joining Date" value={formatDate(selectedEmployee.joiningDate)} />
              <DetailRow label="Polishing Rate" value={`₹${selectedEmployee.polishingRate || 0} per unit`} />
            </div>

            <div className="pt-4 border-t border-gray-200 flex gap-2">
              <Button className="flex-1" onClick={() => { setShowDetailsModal(false); handleEdit(selectedEmployee); }}>
                Edit
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
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
