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
import { Table } from '../components/Table';
import { attendanceService, employeeService } from '../services/api';
import { formatDate } from '../utils/formatters';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const AttendancePage = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState('PRESENT');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      }));
      setEmployees(mappedEmps);

      // Fetch attendance records for selected date
      await fetchAttendanceForDate(selectedDate);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceForDate = async (date) => {
    try {
      const response = await attendanceService.getByDate(date);
      const records = response?.content || response || [];
      const mapped = records.map((record) => ({
        id: record.id || record.attendanceId,
        employeeId: record.employeeId,
        employeeName: record.employeeName || 'Unknown',
        status: record.status,
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
        workingHours: record.workingHours,
        date: record.date,
      }));
      setAttendanceRecords(mapped);
    } catch (err) {
      console.log('No records found for date:', err.message);
      setAttendanceRecords([]);
    }
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setCurrentPage(1);
    await fetchAttendanceForDate(date);
  };

  const handleMarkAttendance = async () => {
    if (!selectedEmployee) {
      setError('Please select an employee');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await attendanceService.markAttendance({
        employeeId: parseInt(selectedEmployee),
        status: attendanceStatus,
        date: selectedDate,
      });

      setShowModal(false);
      setSelectedEmployee('');
      setAttendanceStatus('PRESENT');
      await fetchAttendanceForDate(selectedDate);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'success';
      case 'ABSENT':
        return 'danger';
      case 'LEAVE':
        return 'warning';
      case 'HALF_DAY':
        return 'info';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="w-4 h-4" />;
      case 'ABSENT':
        return <XCircle className="w-4 h-4" />;
      case 'LEAVE':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Statistics
  const stats = {
    total: attendanceRecords.length,
    present: attendanceRecords.filter(r => r.status === 'PRESENT').length,
    absent: attendanceRecords.filter(r => r.status === 'ABSENT').length,
    leave: attendanceRecords.filter(r => r.status === 'LEAVE').length,
  };

  if (loading) return <MainLayout><Loading text="Loading attendance..." /></MainLayout>;

  // Table columns
  const columns = [
    {
      key: 'employeeName',
      label: 'Employee',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <Badge variant={getStatusColor(value)}>{value}</Badge>
        </div>
      ),
    },
    {
      key: 'checkInTime',
      label: 'Check In',
      render: (value) => <span className="text-gray-600">{value || 'N/A'}</span>,
    },
    {
      key: 'checkOutTime',
      label: 'Check Out',
      render: (value) => <span className="text-gray-600">{value || 'N/A'}</span>,
    },
    {
      key: 'workingHours',
      label: 'Working Hours',
      render: (value) => <span className="font-medium text-gray-900">{value || '-'}</span>,
    },
  ];

  // Pagination
  const totalPages = Math.ceil(attendanceRecords.length / itemsPerPage);
  const paginatedData = attendanceRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate attendance percentage
  const attendancePercentage = stats.total > 0 
    ? Math.round((stats.present / stats.total) * 100) 
    : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="slide-down">
          <h1 className="text-4xl font-bold text-gray-900">📍 Attendance Management</h1>
          <p className="text-gray-600 mt-2">Track and manage employee attendance</p>
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} onRetry={() => fetchAttendanceForDate(selectedDate)} />}

        {/* Date Selection and Actions */}
        <Card className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex-1 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="flex-1"
            />
          </div>
          <Button onClick={() => setShowModal(true)}>
            ➕ Mark Attendance
          </Button>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <p className="text-gray-600 text-sm">Total Marked</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Present</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.present}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Absent</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{stats.absent}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">On Leave</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.leave}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Attendance %</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{attendancePercentage}%</p>
          </Card>
        </div>

        {/* Attendance Table */}
        {attendanceRecords.length === 0 ? (
          <EmptyState message="No attendance records for this date" icon="📍" />
        ) : (
          <Card className="overflow-hidden">
            <Table
              columns={columns}
              data={paginatedData}
              pagination={{
                currentPage,
                totalPages,
                itemsPerPage,
                totalItems: attendanceRecords.length,
              }}
              onPaginationChange={(page) => setCurrentPage(page)}
            />
          </Card>
        )}
      </div>

      {/* Mark Attendance Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedEmployee('');
          setAttendanceStatus('PRESENT');
          setError('');
        }}
        title="Mark Attendance"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 font-medium">
              📅 {selectedDate ? formatDate(selectedDate) : 'Select date'}
            </p>
          </div>

          <Select
            label="Select Employee"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            options={employees.map(emp => ({
              value: emp.id.toString(),
              label: `${emp.name} (${emp.mobileNumber})`,
            }))}
            required
          />

          <Select
            label="Attendance Status"
            value={attendanceStatus}
            onChange={(e) => setAttendanceStatus(e.target.value)}
            options={[
              { value: 'PRESENT', label: '✓ Present' },
              { value: 'ABSENT', label: '✗ Absent' },
              { value: 'LEAVE', label: '⏱ On Leave' },
              { value: 'HALF_DAY', label: '◐ Half Day' },
            ]}
          />

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowModal(false);
                setSelectedEmployee('');
                setAttendanceStatus('PRESENT');
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={isSubmitting}
              onClick={handleMarkAttendance}
            >
              Mark Attendance
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default AttendancePage;
