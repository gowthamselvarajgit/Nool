import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Button, Input, Select, Modal, Badge } from '../components/Common';
import { Table } from '../components/Table';
import { dailyWorkService, employeeService } from '../services/api';
import { formatDate } from '../utils/formatters';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';

export default function DailyWorkManagementPage() {
  const [workRecords, setWorkRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  // ✅ Matches EmployeeDailyWorkRequestDto exactly
  const [formData, setFormData] = useState({
    employeeId: '',
    workDate: new Date().toISOString().split('T')[0],
    freshCount: '',
    rePolishCount: '',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      setError('');
      const [empRes, workRes] = await Promise.all([
        employeeService.getList(0, 200),
        dailyWorkService.getList(0, 100),
      ]);
      // ✅ Employee list: employeeId, employeeName, mobileNumber, polishingRate
      setEmployees((empRes?.content || []).map(e => ({
        id: e.employeeId,
        name: e.employeeName,
        polishingRate: e.polishingRate,
      })));
      // ✅ Daily work list: workId, employeeId, employeeName, workDate, freshCount, rePolishCount, todayEarning
      setWorkRecords(workRes?.content || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchWorkRecords() {
    try {
      setLoading(true);
      const response = await dailyWorkService.getList(0, 200);
      setWorkRecords(response?.content || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAddWork = async () => {
    const { employeeId, workDate, freshCount, rePolishCount } = formData;
    if (!employeeId || !workDate) {
      setError('Please select an employee and work date');
      return;
    }
    if (freshCount === '' && rePolishCount === '') {
      setError('Please enter at least one count (fresh or re-polish)');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      // ✅ Correct DTO: employeeId, workDate, freshCount, rePolishCount
      await dailyWorkService.create({
        employeeId: parseInt(employeeId),
        workDate,
        freshCount: parseInt(freshCount) || 0,
        rePolishCount: parseInt(rePolishCount) || 0,
      });
      setShowModal(false);
      setFormData({ employeeId: '', workDate: new Date().toISOString().split('T')[0], freshCount: '', rePolishCount: '' });
      await fetchWorkRecords();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter by employee name search
  const filteredRecords = workRecords.filter(r =>
    (r.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats from real data
  const stats = {
    totalEntries: workRecords.length,
    totalFresh: workRecords.reduce((s, r) => s + (r.freshCount || 0), 0),
    totalRePolish: workRecords.reduce((s, r) => s + (r.rePolishCount || 0), 0),
    totalRevenue: workRecords.reduce((s, r) => s + (r.todayEarning || 0), 0),
  };

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  // ✅ Columns match EmployeeDailyWorkListDto
  const tableColumns = [
    {
      key: 'employeeName',
      label: 'Employee',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {(value || '?').charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">ID: {row.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'workDate',
      label: 'Work Date',
      render: (value) => <span className="text-gray-700">{value ? formatDate(value) : '—'}</span>,
    },
    {
      key: 'freshCount',
      label: 'Fresh Sarees',
      render: (value) => (
        <Badge variant="success">{value ?? 0}</Badge>
      ),
    },
    {
      key: 'rePolishCount',
      label: 'Re-Polish',
      render: (value) => (
        <Badge variant="warning">{value ?? 0}</Badge>
      ),
    },
    {
      key: 'todayEarning',
      label: "Day's Earning",
      render: (value) => (
        <span className="font-semibold text-green-600">
          ₹{(value || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="slide-down">
          <h1 className="text-4xl font-bold text-gray-900">📅 Daily Work Management</h1>
          <p className="text-gray-600 mt-2">Track fresh and re-polish saree counts per employee</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Controls */}
        <Card className="flex flex-col md:flex-row gap-4 items-end">
          <Input
            label="Search Employee"
            placeholder="Search by employee name..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchWorkRecords}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Work Record
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Total Entries</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalEntries}</p>
          </Card>
          <Card className="border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Fresh Sarees</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.totalFresh}</p>
          </Card>
          <Card className="border-l-4 border-amber-500">
            <p className="text-gray-600 text-sm">Re-Polish</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{stats.totalRePolish}</p>
          </Card>
          <Card className="border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              ₹{stats.totalRevenue.toLocaleString('en-IN')}
            </p>
          </Card>
        </div>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading work records...</p>
            </div>
          ) : paginatedRecords.length > 0 ? (
            <>
              <Table columns={tableColumns} data={paginatedRecords} />
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredRecords.length)} of {filteredRecords.length}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
                  <Button variant="outline" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No work records found</p>
            </div>
          )}
        </Card>
      </div>

      {/* Add Work Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setError(''); setFormData({ employeeId: '', workDate: new Date().toISOString().split('T')[0], freshCount: '', rePolishCount: '' }); }}
        title="Add Daily Work Record"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Employee *"
            value={formData.employeeId}
            onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
            options={[
              { value: '', label: '— Select Employee —' },
              ...employees.map(e => ({
                value: e.id.toString(),
                label: `${e.name} (₹${e.polishingRate}/unit)`,
              })),
            ]}
            required
          />

          <Input
            label="Work Date *"
            type="date"
            value={formData.workDate}
            onChange={(e) => setFormData(prev => ({ ...prev, workDate: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fresh Sarees Count"
              type="number"
              value={formData.freshCount}
              onChange={(e) => setFormData(prev => ({ ...prev, freshCount: e.target.value }))}
              placeholder="0"
              min="0"
            />
            <Input
              label="Re-Polish Count"
              type="number"
              value={formData.rePolishCount}
              onChange={(e) => setFormData(prev => ({ ...prev, rePolishCount: e.target.value }))}
              placeholder="0"
              min="0"
            />
          </div>

          {/* Revenue Preview */}
          {formData.employeeId && (formData.freshCount || formData.rePolishCount) && (() => {
            const emp = employees.find(e => e.id.toString() === formData.employeeId);
            if (!emp) return null;
            const est = ((parseInt(formData.freshCount) || 0) + (parseInt(formData.rePolishCount) || 0)) * emp.polishingRate;
            return (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 text-sm font-medium">
                  Estimated Revenue: <span className="font-bold text-green-800">₹{est.toLocaleString('en-IN')}</span>
                  <span className="text-green-600 text-xs ml-2">@ ₹{emp.polishingRate}/unit</span>
                </p>
              </div>
            );
          })()}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleAddWork} loading={submitting} className="flex-1">
              Add Record
            </Button>
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
