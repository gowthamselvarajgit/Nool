import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Button, Modal, Loading, ErrorMessage } from '../components/Common';
import { attendanceService, employeeService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatters';
import { Calendar, CheckCircle, XCircle, Clock, RefreshCw, Plus, User, ChevronRight } from 'lucide-react';

const AttendancePage = () => {
  const { user } = useAuth();
  const isWorker = user?.role === 'WORKER';
  const [employees, setEmployees] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Mark modal
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [markEmployee, setMarkEmployee] = useState('');
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [markStatus, setMarkStatus] = useState('PRESENT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [markError, setMarkError] = useState('');

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailEmployee, setDetailEmployee] = useState(null);

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  async function fetchAll() {
    try {
      setLoading(true); setError('');
      if (isWorker) {
        const [profileRes, attRes] = await Promise.all([
          employeeService.getMe(),
          attendanceService.getMyList(0, 1000),
        ]);
        setEmployees([{
          employeeId: profileRes.employeeId,
          employeeName: profileRes.employeeName,
          mobileNumber: profileRes.mobileNumber,
          status: profileRes.status,
          polishingRate: profileRes.polishingRate,
        }]);
        setAllRecords(attRes?.content || []);
      } else {
        const [empRes, attRes] = await Promise.all([
          employeeService.getList(0, 200),
          attendanceService.getList(0, 1000),
        ]);
        setEmployees(empRes?.content || []);
        setAllRecords(attRes?.content || []);
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  // ── Compute per-employee stats for selected month ──────────────────────────
  const monthRecords = allRecords.filter(r =>
    (r.attendanceDate || '').toString().startsWith(selectedMonth)
  );

  const empStats = employees.map(emp => {
    const empRec = monthRecords.filter(r =>
      String(r.employeeId) === String(emp.employeeId)
    ).sort((a, b) => (a.attendanceDate || '').localeCompare(b.attendanceDate || ''));

    const present = empRec.filter(r => r.status === 'PRESENT').length;
    const absent = empRec.filter(r => r.status === 'ABSENT').length;
    const leave = empRec.filter(r => r.status !== 'PRESENT' && r.status !== 'ABSENT').length;
    const total = empRec.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : null;

    return { ...emp, records: empRec, present, absent, leave, total, rate };
  });

  // Summary for current month
  const totalPresent = monthRecords.filter(r => r.status === 'PRESENT').length;
  const totalAbsent = monthRecords.filter(r => r.status === 'ABSENT').length;

  // ── Mark attendance ────────────────────────────────────────────────────────
  const handleMarkAttendance = async () => {
    if (!markEmployee) { setMarkError('Please select an employee'); return; }
    if (!markDate) { setMarkError('Date required'); return; }

    const alreadyMarked = monthRecords.some(
      r => String(r.employeeId) === String(markEmployee) &&
           (r.attendanceDate || '') === markDate
    );
    if (alreadyMarked) {
      setMarkError(`Attendance already marked for this employee on ${markDate}.`);
      return;
    }
    try {
      setIsSubmitting(true); setMarkError('');
      await attendanceService.mark({
        employeeId: parseInt(markEmployee),
        attendanceDate: markDate,
        status: markStatus,
      });
      setShowMarkModal(false);
      setMarkEmployee(''); setMarkStatus('PRESENT');
      await fetchAll();
    } catch (err) { setMarkError(err.message); }
    finally { setIsSubmitting(false); }
  };

  const openDetail = (emp) => { setDetailEmployee(emp); setShowDetailModal(true); };

  const statusColor = s => s === 'PRESENT'
    ? 'bg-emerald-100 text-emerald-700'
    : s === 'ABSENT'
    ? 'bg-rose-100 text-rose-700'
    : 'bg-amber-100 text-amber-700';

  const statusIcon = s => s === 'PRESENT'
    ? <CheckCircle className="w-3.5 h-3.5" />
    : s === 'ABSENT'
    ? <XCircle className="w-3.5 h-3.5" />
    : <Clock className="w-3.5 h-3.5" />;

  if (loading) return <MainLayout><Loading text="Loading attendance..." /></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">📍 Attendance</h1>
            <p className="text-gray-500 mt-1">
              {isWorker ? 'View your attendance history' : 'Click any employee card to view their attendance history'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            />
            <Button variant="outline" onClick={fetchAll}><RefreshCw className="w-4 h-4" /></Button>
            {!isWorker && (
              <Button onClick={() => { setMarkError(''); setShowMarkModal(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Mark Attendance
              </Button>
            )}
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchAll} />}

        {/* Month summary strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Employees', value: employees.length, color: 'indigo', bg: 'bg-indigo-50' },
            { label: 'Present Days', value: totalPresent, color: 'emerald', bg: 'bg-emerald-50' },
            { label: 'Absent Days', value: totalAbsent, color: 'rose', bg: 'bg-rose-50' },
            { label: 'Records This Month', value: monthRecords.length, color: 'gray', bg: 'bg-gray-50' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-2xl p-4 border border-${s.color}-100`}>
              <p className={`text-2xl font-bold text-${s.color}-700`}>{s.value}</p>
              <p className={`text-sm text-${s.color}-600`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {empStats.map(emp => {
            const rateColor = emp.rate === null ? 'text-gray-400'
              : emp.rate >= 80 ? 'text-emerald-600'
              : emp.rate >= 50 ? 'text-amber-600'
              : 'text-rose-600';
            const rateBg = emp.rate === null ? 'bg-gray-100'
              : emp.rate >= 80 ? 'bg-emerald-500'
              : emp.rate >= 50 ? 'bg-amber-500'
              : 'bg-rose-500';

            return (
              <div
                key={emp.employeeId}
                onClick={() => openDetail(emp)}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all group flex flex-col gap-4"
              >
                {/* Employee info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {emp.employeeName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 leading-tight">{emp.employeeName}</p>
                      <p className="text-xs text-gray-400">{emp.mobileNumber || 'No contact'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                  <div className="bg-emerald-50 rounded-lg py-2">
                    <p className="text-base font-bold text-emerald-700">{emp.present}</p>
                    <p className="text-emerald-500">Present</p>
                  </div>
                  <div className="bg-rose-50 rounded-lg py-2">
                    <p className="text-base font-bold text-rose-700">{emp.absent}</p>
                    <p className="text-rose-500">Absent</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg py-2">
                    <p className="text-base font-bold text-amber-700">{emp.leave}</p>
                    <p className="text-amber-500">Leave</p>
                  </div>
                </div>

                {/* Attendance rate */}
                {emp.rate !== null ? (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Attendance Rate</span>
                      <span className={`font-bold ${rateColor}`}>{emp.rate}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${rateBg}`} style={{ width: `${emp.rate}%` }} />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center">No records this month</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Employee Detail Modal ── */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`📅 ${detailEmployee?.employeeName || ''} — Attendance`}
        size="lg"
      >
        {detailEmployee && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { label: 'Present', value: detailEmployee.present, color: 'emerald' },
                { label: 'Absent', value: detailEmployee.absent, color: 'rose' },
                { label: 'Leave', value: detailEmployee.leave, color: 'amber' },
                { label: 'Rate', value: detailEmployee.rate !== null ? `${detailEmployee.rate}%` : '—', color: detailEmployee.rate >= 80 ? 'emerald' : detailEmployee.rate >= 50 ? 'amber' : 'rose' },
              ].map((s, i) => (
                <div key={i} className={`bg-${s.color}-50 rounded-xl p-3`}>
                  <p className={`text-xl font-bold text-${s.color}-700`}>{s.value}</p>
                  <p className={`text-xs text-${s.color}-500`}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Records list */}
            {detailEmployee.records.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No attendance records for {selectedMonth}</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
                <div className="grid grid-cols-2 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0">
                  <span>Date</span><span className="text-right">Status</span>
                </div>
                {detailEmployee.records.map((r, i) => (
                  <div key={i} className="grid grid-cols-2 px-4 py-2.5 items-center hover:bg-gray-50">
                    <span className="text-sm text-gray-700 font-medium">{formatDate(r.attendanceDate)}</span>
                    <div className="flex justify-end">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor(r.status)}`}>
                        {statusIcon(r.status)}{r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Mark Attendance Modal ── */}
      <Modal isOpen={showMarkModal} onClose={() => { setShowMarkModal(false); setMarkError(''); }} title="✅ Mark Attendance">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Employee</label>
            <select
              value={markEmployee}
              onChange={e => setMarkEmployee(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              <option value="">Select employee...</option>
              {employees.map(e => (
                <option key={e.employeeId} value={String(e.employeeId)}>{e.employeeName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
            <input
              type="date"
              value={markDate}
              onChange={e => setMarkDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {['PRESENT', 'ABSENT', 'HALF_DAY'].map(s => (
                <button
                  key={s}
                  onClick={() => setMarkStatus(s)}
                  className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                    markStatus === s
                      ? s === 'PRESENT' ? 'bg-emerald-500 text-white border-emerald-500'
                        : s === 'ABSENT' ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {s === 'HALF_DAY' ? 'Half Day' : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          {markError && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{markError}</p>}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={handleMarkAttendance} isLoading={isSubmitting}>Save</Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowMarkModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default AttendancePage;
