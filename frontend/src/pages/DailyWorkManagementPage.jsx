import React, { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Button, Input, Select, Modal, Badge } from '../components/Common';
import { dailyWorkService, employeeService } from '../services/api';
import { formatDate, getInitials, friendlyStatus } from '../utils/formatters';
import { exportToExcel } from '../utils/excelExporter';
import {
  Plus, RefreshCw, AlertCircle, ArrowLeft, Calendar, Users,
  TrendingUp, IndianRupee, Search, Download,
} from 'lucide-react';

const todayStr = () => new Date().toISOString().split('T')[0];
const firstOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

export default function DailyWorkManagementPage() {
  // Data
  const [employees, setEmployees] = useState([]);
  const [workRecords, setWorkRecords] = useState([]);
  const [summaries, setSummaries] = useState({}); // employeeId -> { totalFresh, totalRePolish, totalRevenue, totalWorkDays }

  // View state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null); // null = grid view
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add-work modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    workDate: todayStr(),
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
        dailyWorkService.getList(0, 500),
      ]);
      const empList = (empRes?.content || []).map(e => ({
        id: e.employeeId,
        name: e.employeeName,
        mobileNumber: e.mobileNumber,
        polishingRate: e.polishingRate,
        status: e.status,
      }));
      const records = workRes?.content || [];

      setEmployees(empList);
      setWorkRecords(records);
      setSummaries(buildSummaries(empList, records));
    } catch (err) {
      setError(err.message || 'Failed to load daily work data');
    } finally {
      setLoading(false);
    }
  }

  // Build per-employee aggregates from the full work list — no extra API calls.
  function buildSummaries(empList, records) {
    const acc = {};
    for (const e of empList) {
      acc[e.id] = { totalFresh: 0, totalRePolish: 0, totalRevenue: 0, totalWorkDays: 0, lastEntry: null };
    }
    const byEmpDay = new Set();
    for (const r of records) {
      if (!acc[r.employeeId]) continue;
      acc[r.employeeId].totalFresh += r.freshCount || 0;
      acc[r.employeeId].totalRePolish += r.rePolishCount || 0;
      acc[r.employeeId].totalRevenue += r.todayEarning || 0;
      const dayKey = `${r.employeeId}|${r.workDate}`;
      if (!byEmpDay.has(dayKey)) {
        byEmpDay.add(dayKey);
        acc[r.employeeId].totalWorkDays += 1;
      }
      const cur = acc[r.employeeId].lastEntry;
      if (!cur || (r.workDate && r.workDate > cur)) acc[r.employeeId].lastEntry = r.workDate;
    }
    return acc;
  }

  // ─── Add work record ───────────────────────────────────────────────────────
  const openAddModal = (empId = '') => {
    setFormData({
      employeeId: empId ? String(empId) : '',
      workDate: todayStr(),
      freshCount: '',
      rePolishCount: '',
    });
    setError('');
    setShowModal(true);
  };

  const handleAddWork = async () => {
    const { employeeId, workDate, freshCount, rePolishCount } = formData;
    if (!employeeId || !workDate) {
      setError('Please pick an employee and the work date.');
      return;
    }
    const fresh = parseInt(freshCount, 10);
    const repolish = parseInt(rePolishCount, 10);
    if ((isNaN(fresh) || fresh <= 0) && (isNaN(repolish) || repolish <= 0)) {
      setError('Enter at least one count — Fresh or Re-Polish.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await dailyWorkService.create({
        employeeId: parseInt(employeeId, 10),
        workDate,
        freshCount: isNaN(fresh) ? 0 : fresh,
        rePolishCount: isNaN(repolish) ? 0 : repolish,
      });
      setShowModal(false);
      await fetchAll();
    } catch (err) {
      setError(err.message || 'Failed to add work record');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Filtering ─────────────────────────────────────────────────────────────
  const filteredEmployees = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(e =>
      e.name?.toLowerCase().includes(q) ||
      e.mobileNumber?.includes(q)
    );
  }, [employees, searchTerm]);

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId) || null;
  const selectedRecords = useMemo(() => {
    if (!selectedEmployee) return [];
    return workRecords
      .filter(r => r.employeeId === selectedEmployee.id)
      .sort((a, b) => (b.workDate || '').localeCompare(a.workDate || ''));
  }, [workRecords, selectedEmployee]);

  // Aggregate totals across all employees
  const overallStats = useMemo(() => {
    return workRecords.reduce(
      (acc, r) => ({
        totalEntries: acc.totalEntries + 1,
        totalFresh: acc.totalFresh + (r.freshCount || 0),
        totalRePolish: acc.totalRePolish + (r.rePolishCount || 0),
        totalRevenue: acc.totalRevenue + (r.todayEarning || 0),
      }),
      { totalEntries: 0, totalFresh: 0, totalRePolish: 0, totalRevenue: 0 }
    );
  }, [workRecords]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Daily Work</h1>
          <p className="text-gray-600 mt-2 text-base">
            {selectedEmployee
              ? `Showing all work records for ${selectedEmployee.name}`
              : 'Pick an employee to see their work entries, or add a new record.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-base">{error}</p>
          </div>
        )}

        {/* Top Stats (always visible) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium">Total Entries</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{overallStats.totalEntries}</p>
          </Card>
          <Card className="border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Fresh Sarees</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{overallStats.totalFresh}</p>
          </Card>
          <Card className="border-l-4 border-amber-500">
            <p className="text-gray-600 text-sm font-medium">Re-Polish</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{overallStats.totalRePolish}</p>
          </Card>
          <Card className="border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              ₹{Math.round(overallStats.totalRevenue).toLocaleString('en-IN')}
            </p>
          </Card>
        </div>

        {/* === GRID VIEW: employee cards === */}
        {!selectedEmployee && (
          <>
            <Card className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Find an Employee</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type the employee name..."
                    className="w-full pl-11 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={fetchAll} size="lg">
                  <RefreshCw className="w-5 h-5 mr-2" /> Refresh
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => exportToExcel({
                    rows: workRecords.map(r => ({
                      'Employee': r.employeeName,
                      'Date': r.workDate ? formatDate(r.workDate) : '',
                      'Fresh Sarees': r.freshCount ?? 0,
                      'Re-Polish': r.rePolishCount ?? 0,
                      'Earnings (₹)': Math.round(r.todayEarning || 0),
                    })),
                    fileName: 'Nool_Daily_Work',
                    sheetName: 'Daily Work',
                    columnWidths: [22, 14, 14, 12, 14],
                  })}
                >
                  <Download className="w-5 h-5 mr-2" /> Export Excel
                </Button>
                <Button onClick={() => openAddModal()} size="lg">
                  <Plus className="w-5 h-5 mr-2" /> Add Work Record
                </Button>
              </div>
            </Card>

            {loading ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">Loading employees...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <Card className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'No employees match your search.' : 'No employees yet. Add one from the Employees page.'}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredEmployees.map(emp => {
                  const s = summaries[emp.id] || { totalFresh: 0, totalRePolish: 0, totalRevenue: 0, totalWorkDays: 0, lastEntry: null };
                  return (
                    <div
                      key={emp.id}
                      className="bg-white rounded-2xl border-2 border-gray-100 hover:border-primary-300 hover:shadow-lg transition-all p-5 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                            {getInitials(emp.name)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{emp.name}</h3>
                            <p className="text-sm text-gray-500">{emp.mobileNumber || '—'}</p>
                          </div>
                        </div>
                        <Badge variant={emp.status === 'ACTIVE' ? 'success' : 'default'}>
                          {friendlyStatus(emp.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                        <div className="bg-green-50 rounded-lg py-2 px-1 border border-green-100">
                          <p className="text-xs font-medium text-green-700">Fresh</p>
                          <p className="text-lg font-bold text-green-700">{s.totalFresh}</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg py-2 px-1 border border-amber-100">
                          <p className="text-xs font-medium text-amber-700">Re-Polish</p>
                          <p className="text-lg font-bold text-amber-700">{s.totalRePolish}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg py-2 px-1 border border-purple-100">
                          <p className="text-xs font-medium text-purple-700">Earned</p>
                          <p className="text-base font-bold text-purple-700">
                            ₹{Math.round(s.totalRevenue).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                        <span className="text-gray-500">
                          {s.totalWorkDays} work day{s.totalWorkDays === 1 ? '' : 's'}
                        </span>
                        <span className="text-gray-500">
                          {s.lastEntry ? `Last: ${formatDate(s.lastEntry)}` : 'No entries yet'}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          type="button"
                          onClick={() => setSelectedEmployeeId(emp.id)}
                          className="flex-1 text-center py-2 rounded-lg bg-primary-50 text-primary-700 font-semibold text-sm hover:bg-primary-100 transition-colors"
                        >
                          View Entries →
                        </button>
                        <button
                          type="button"
                          onClick={() => openAddModal(emp.id)}
                          className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* === DETAIL VIEW: per-employee work entries === */}
        {selectedEmployee && (
          <>
            <Card className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedEmployeeId(null)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium"
                >
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {getInitials(selectedEmployee.name)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedEmployee.name}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedEmployee.mobileNumber || '—'} · ₹{selectedEmployee.polishingRate}/unit
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => exportToExcel({
                    rows: selectedRecords.map(r => ({
                      'Date': r.workDate ? formatDate(r.workDate) : '',
                      'Fresh Sarees': r.freshCount ?? 0,
                      'Re-Polish': r.rePolishCount ?? 0,
                      'Earnings (₹)': Math.round(r.todayEarning || 0),
                    })),
                    fileName: `Nool_${(selectedEmployee.name || 'Employee').replace(/\s+/g, '_')}_Work`,
                    sheetName: 'Work Records',
                    columnWidths: [14, 14, 12, 14],
                  })}
                >
                  <Download className="w-5 h-5 mr-2" /> Export
                </Button>
                <Button size="lg" onClick={() => openAddModal(selectedEmployee.id)}>
                  <Plus className="w-5 h-5 mr-2" /> Add Work for {selectedEmployee.name.split(' ')[0]}
                </Button>
              </div>
            </Card>

            {/* Per-employee summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const s = summaries[selectedEmployee.id] || { totalFresh: 0, totalRePolish: 0, totalRevenue: 0, totalWorkDays: 0 };
                return (
                  <>
                    <Card className="border-l-4 border-blue-500">
                      <p className="text-gray-600 text-sm font-medium">Work Days</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{s.totalWorkDays}</p>
                    </Card>
                    <Card className="border-l-4 border-green-500">
                      <p className="text-gray-600 text-sm font-medium">Fresh Sarees</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">{s.totalFresh}</p>
                    </Card>
                    <Card className="border-l-4 border-amber-500">
                      <p className="text-gray-600 text-sm font-medium">Re-Polish</p>
                      <p className="text-3xl font-bold text-amber-600 mt-1">{s.totalRePolish}</p>
                    </Card>
                    <Card className="border-l-4 border-purple-500">
                      <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
                      <p className="text-2xl font-bold text-purple-600 mt-1">
                        ₹{Math.round(s.totalRevenue).toLocaleString('en-IN')}
                      </p>
                    </Card>
                  </>
                );
              })()}
            </div>

            {/* Entries list */}
            <Card className="!p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">All Work Entries</h3>
                <span className="text-sm text-gray-500">{selectedRecords.length} entries</span>
              </div>
              {selectedRecords.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg">No work entries yet for this employee.</p>
                  <Button onClick={() => openAddModal(selectedEmployee.id)} className="mt-4">
                    <Plus className="w-5 h-5 mr-2" /> Add First Entry
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fresh</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Re-Polish</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {selectedRecords.map(r => (
                        <tr key={r.workId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-base text-gray-900 font-medium">
                            {r.workDate ? formatDate(r.workDate) : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="success">{r.freshCount ?? 0}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="warning">{r.rePolishCount ?? 0}</Badge>
                          </td>
                          <td className="px-6 py-4 text-base font-bold text-purple-700">
                            ₹{Math.round(r.todayEarning || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </div>

      {/* Add Work Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setError(''); }}
        title="Add Daily Work Record"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Employee"
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
            label="Work Date"
            type="date"
            value={formData.workDate}
            onChange={(e) => setFormData(prev => ({ ...prev, workDate: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fresh Sarees"
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

          {formData.employeeId && (formData.freshCount || formData.rePolishCount) && (() => {
            const emp = employees.find(e => e.id.toString() === formData.employeeId);
            if (!emp) return null;
            const est = ((parseInt(formData.freshCount, 10) || 0) + (parseInt(formData.rePolishCount, 10) || 0)) * (emp.polishingRate || 0);
            return (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
                <IndianRupee className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-green-800 font-semibold text-lg">
                    Earnings this entry: ₹{est.toLocaleString('en-IN')}
                  </p>
                  <p className="text-green-700 text-sm">@ ₹{emp.polishingRate}/unit</p>
                </div>
              </div>
            );
          })()}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddWork} loading={submitting} className="flex-1">
              Save Record
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
