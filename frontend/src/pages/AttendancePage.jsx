import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import {
  Card, Button, Input, Select, Badge, Modal, Loading, ErrorMessage, EmptyState,
} from '../components/Common';
import { Table } from '../components/Table';
import { attendanceService, employeeService } from '../services/api';
import { formatDate } from '../utils/formatters';
import { Calendar, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

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
      const empResponse = await employeeService.getList(0, 200);
      const empList = empResponse?.content || [];
      setEmployees(empList.map((e) => ({
        id: e.employeeId,
        name: e.employeeName,
        mobileNumber: e.mobileNumber,
      })));
      await fetchAttendanceRecords();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      // Backend list returns all records (no date filter param) — we filter client-side
      const response = await attendanceService.getList(0, 200);
      const all = response?.content || [];
      setAttendanceRecords(all);
    } catch (err) {
      console.error('Attendance fetch error:', err.message);
      setAttendanceRecords([]);
    }
  };

  // Filter records for selected date client-side
  const recordsForDate = attendanceRecords.filter(
    (r) => r.attendanceDate === selectedDate
  );

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setCurrentPage(1);
  };

  const handleMarkAttendance = async () => {
    if (!selectedEmployee) {
      setError('Please select an employee');
      return;
    }
    try {
      setIsSubmitting(true);
      setError('');
      // ✅ Correct field: attendanceDate (not date)
      await attendanceService.mark({
        employeeId: parseInt(selectedEmployee),
        attendanceDate: selectedDate,
        status: attendanceStatus,
      });
      setShowModal(false);
      setSelectedEmployee('');
      setAttendanceStatus('PRESENT');
      await fetchAttendanceRecords();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'success';
      case 'ABSENT': return 'danger';
      case 'LEAVE': return 'warning';
      case 'HALF_DAY': return 'info';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT': return <CheckCircle className="w-4 h-4" />;
      case 'ABSENT': return <XCircle className="w-4 h-4" />;
      case 'LEAVE': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  const stats = {
    total: recordsForDate.length,
    present: recordsForDate.filter(r => r.status === 'PRESENT').length,
    absent: recordsForDate.filter(r => r.status === 'ABSENT').length,
    leave: recordsForDate.filter(r => r.status === 'LEAVE').length,
  };

  const attendancePercentage = stats.total > 0
    ? Math.round((stats.present / stats.total) * 100)
    : 0;

  if (loading) return <MainLayout><Loading text="Loading attendance..." /></MainLayout>;

  // ✅ Columns match AttendanceListResponseDto: attendanceId, employeeId, employeeName, attendanceDate, status
  const columns = [
    {
      key: 'employeeName',
      label: 'Employee',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'attendanceDate',
      label: 'Date',
      render: (value) => <span className="text-gray-600">{value ? formatDate(value) : '—'}</span>,
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
  ];

  const totalPages = Math.ceil(recordsForDate.length / itemsPerPage);
  const paginatedData = recordsForDate.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="slide-down">
          <h1 className="text-4xl font-bold text-gray-900">📍 Attendance Management</h1>
          <p className="text-gray-600 mt-2">Track and manage employee attendance</p>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchInitialData} />}

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
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchAttendanceRecords}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Button onClick={() => setShowModal(true)}>
              ➕ Mark Attendance
            </Button>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
        {recordsForDate.length === 0 ? (
          <EmptyState message={`No attendance records for ${formatDate(selectedDate)}`} icon="📍" />
        ) : (
          <Card className="overflow-hidden">
            <Table
              columns={columns}
              data={paginatedData}
              pagination={{ currentPage, totalPages, itemsPerPage, totalItems: recordsForDate.length }}
              onPaginationChange={(page) => setCurrentPage(page)}
            />
          </Card>
        )}
      </div>

      {/* Mark Attendance Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedEmployee(''); setAttendanceStatus('PRESENT'); setError(''); }}
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

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => { setShowModal(false); setSelectedEmployee(''); setAttendanceStatus('PRESENT'); }}>
              Cancel
            </Button>
            <Button className="flex-1" loading={isSubmitting} onClick={handleMarkAttendance}>
              Mark Attendance
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default AttendancePage;
