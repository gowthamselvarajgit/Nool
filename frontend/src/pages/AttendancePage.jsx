import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import {
  Card,
  Button,
  Select,
  Badge,
  Modal,
  Loading,
  ErrorMessage,
  Input,
} from '../components/Common';
import { attendanceService, employeeService } from '../services/api';
import { formatDate, getAttendanceColor } from '../utils/formatters';

const AttendanceStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card>
        <p className="text-gray-600 text-sm">Total Records</p>
        <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
      </Card>
      <Card>
        <p className="text-gray-600 text-sm">Present</p>
        <p className="text-2xl font-bold text-green-600">{stats.present || 0}</p>
      </Card>
      <Card>
        <p className="text-gray-600 text-sm">Absent</p>
        <p className="text-2xl font-bold text-red-600">{stats.absent || 0}</p>
      </Card>
      <Card>
        <p className="text-gray-600 text-sm">Leave</p>
        <p className="text-2xl font-bold text-yellow-600">{stats.leave || 0}</p>
      </Card>
      <Card>
        <p className="text-gray-600 text-sm">Holidays</p>
        <p className="text-2xl font-bold text-purple-600">{stats.holiday || 0}</p>
      </Card>
    </div>
  );
};

const AttendanceRow = ({ attendance, employees }) => {
  const employee = employees.find((e) => e.id === attendance.employeeId);
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div>
        <p className="font-medium text-gray-900">{employee?.name || 'Unknown'}</p>
        <p className="text-sm text-gray-600">{attendance.date}</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={getAttendanceColor(attendance.status)}>
          {attendance.status}
        </Badge>
        {attendance.remarks && (
          <span className="text-xs text-gray-600">{attendance.remarks}</span>
        )}
      </div>
    </div>
  );
};

export const AttendancePage = () => {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [stats, setStats] = useState({});
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [empRes, attRes] = await Promise.all([
        employeeService.getList(0, 100),
        attendanceService.getList({ pageNo: 0, pageSize: 100 }),
      ]);

      setEmployees(empRes.data || []);
      setAttendances(attRes.data || []);

      // Calculate stats
      const total = attRes.data?.length || 0;
      const present = attRes.data?.filter((a) => a.status === 'PRESENT').length || 0;
      const absent = attRes.data?.filter((a) => a.status === 'ABSENT').length || 0;
      const leave = attRes.data?.filter((a) => a.status === 'LEAVE').length || 0;
      const holiday = attRes.data?.filter((a) => a.status === 'HOLIDAY').length || 0;

      setStats({ total, present, absent, leave, holiday });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <MainLayout><Loading text="Loading attendance data..." /></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="slide-down flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">📍 Attendance Management</h1>
            <p className="text-gray-600 mt-2">Track employee attendance records</p>
          </div>
          <Button onClick={() => setShowMarkModal(true)}>
            ➕ Mark Attendance
          </Button>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchData} />}

        {/* Statistics */}
        <AttendanceStats stats={stats} />

        {/* Filter */}
        <Card className="flex gap-4 items-end">
          <div className="flex-1">
            <Input
              label="Filter by Date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <Button variant="outline">Search</Button>
        </Card>

        {/* Attendance List */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Records</h3>
          <div className="space-y-3">
            {attendances.slice(0, 10).map((att) => (
              <AttendanceRow
                key={att.id}
                attendance={att}
                employees={employees}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Mark Attendance Modal */}
      <Modal
        isOpen={showMarkModal}
        onClose={() => setShowMarkModal(false)}
        title="Mark Attendance"
        size="md"
      >
        <MarkAttendanceForm
          employees={employees}
          onClose={() => setShowMarkModal(false)}
          onSuccess={() => { setShowMarkModal(false); fetchData(); }}
        />
      </Modal>
    </MainLayout>
  );
};

const MarkAttendanceForm = ({ employees, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    remarks: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await attendanceService.mark(formData);
      onSuccess();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Employee"
        name="employeeId"
        value={formData.employeeId}
        onChange={handleChange}
        options={employees.map((e) => ({ value: e.id, label: e.name }))}
        required
      />
      <Input
        label="Date"
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        required
      />
      <Select
        label="Status"
        name="status"
        value={formData.status}
        onChange={handleChange}
        options={[
          { value: 'PRESENT', label: 'Present' },
          { value: 'ABSENT', label: 'Absent' },
          { value: 'LEAVE', label: 'Leave' },
          { value: 'WEEKEND', label: 'Weekend' },
          { value: 'HOLIDAY', label: 'Holiday' },
        ]}
      />
      <Input
        label="Remarks (Optional)"
        name="remarks"
        value={formData.remarks}
        onChange={handleChange}
        placeholder="Any additional notes..."
      />

      <div className="flex gap-2 pt-4">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          Mark Attendance
        </Button>
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
