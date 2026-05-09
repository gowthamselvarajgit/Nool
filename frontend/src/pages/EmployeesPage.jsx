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
import { employeeService } from '../services/api';
import { formatDate, getEmployeeStatusColor, getInitials } from '../utils/formatters';

const EmployeeCard = ({ employee, onEdit, onViewDetails }) => {
  return (
    <Card hover className="slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
            {getInitials(employee.name || 'E')}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{employee.name}</h3>
            <p className="text-sm text-gray-600">{employee.mobileNumber}</p>
          </div>
        </div>
        <Badge variant={getEmployeeStatusColor(employee.status)}>
          {employee.status}
        </Badge>
      </div>

      <div className="space-y-2 text-sm mb-4 pb-4 border-b border-gray-200">
        <div className="flex justify-between">
          <span className="text-gray-600">Employee ID:</span>
          <span className="font-medium text-gray-900">#{employee.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Joining Date:</span>
          <span className="font-medium text-gray-900">{formatDate(employee.joiningDate)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onViewDetails(employee)}
        >
          View Details
        </Button>
        <Button size="sm" className="flex-1" onClick={() => onEdit(employee)}>
          Edit
        </Button>
      </div>
    </Card>
  );
};

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
          { value: 'INACTIVE', label: 'Inactive' },
          { value: 'ON_LEAVE', label: 'On Leave' },
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
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const keyword = searchKeyword.toLowerCase();
    const filtered = employees.filter((emp) => {
      return (
        (emp.name || '').toLowerCase().includes(keyword) ||
        (emp.mobileNumber || '').includes(keyword)
      );
    });
    setFilteredEmployees(filtered);
  }, [searchKeyword, employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await employeeService.getList(0, 100);
      // backend returns PaginationResponseDto with `content` array and different field names
      const list = response?.content || [];
      // map backend fields to frontend-friendly shape
      const mapped = list.map((e) => ({
        id: e.employeeId,
        name: e.employeeName,
        joiningDate: e.joiningDate,
        polishingRate: e.polishingRate,
        status: e.status,
        mobileNumber: e.mobileNumber,
      }));
      setEmployees(mapped || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <Button onClick={() => { setSelectedEmployee(null); setShowModal(true); }}>
            ➕ Add Employee
          </Button>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <p className="text-gray-600 text-sm">Total Employees</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{employees.length}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Active</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {employees.filter((e) => e.status === 'ACTIVE').length}
            </p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">On Leave</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">
              {employees.filter((e) => e.status === 'ON_LEAVE').length}
            </p>
          </Card>
        </div>

        {/* Employee List */}
        {filteredEmployees.length === 0 ? (
          <EmptyState message="No employees found" icon="👤" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onEdit={handleEdit}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
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
                  {selectedEmployee.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <DetailRow label="Employee ID" value={`#${selectedEmployee.id}`} />
              <DetailRow label="Mobile" value={selectedEmployee.mobileNumber} />
              <DetailRow label="Email" value={selectedEmployee.email || 'N/A'} />
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
