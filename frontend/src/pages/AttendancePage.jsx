import React, { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '../components/Layout';
import { Button, Modal, Loading, ErrorMessage } from '../components/Common';
import { attendanceService, employeeService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatDate, friendlyStatus, toLocalISODate } from '../utils/formatters';
import { exportToExcel } from '../utils/excelExporter';
import { Calendar, CheckCircle, XCircle, Clock, RefreshCw, Plus, ChevronRight, ChevronLeft, Download } from 'lucide-react';

const AttendancePage = () => {
  const { user } = useAuth();
  const isWorker = user?.role === 'WORKER';
  const [employees, setEmployees] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(toLocalISODate(new Date()).slice(0, 7));

  // Mark modal
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [markEmployee, setMarkEmployee] = useState('');
  const [markDate, setMarkDate] = useState(toLocalISODate(new Date()));
  const [markStatus, setMarkStatus] = useState('PRESENT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [markError, setMarkError] = useState('');

  // Detail modal — independent month so users can browse past months freely
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailEmployee, setDetailEmployee] = useState(null);
  const [detailMonth, setDetailMonth] = useState(toLocalISODate(new Date()).slice(0, 7));

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  async function fetchAll() {
    try {
      setLoading(true); setError('');
      if (isWorker) {
        const [profileRes, attRes] = await Promise.all([
          employeeService.getMe(),
          attendanceService.getMyList(0, 5000),
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
          attendanceService.getList(0, 5000),
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

  const openDetail = (emp) => {
    setDetailEmployee(emp);
    setDetailMonth(selectedMonth);
    setShowDetailModal(true);
  };

  // ── Calendar data for the detail modal ──────────────────────────────────────
  // Recomputed for whichever month the user is currently viewing in the modal.
  const detailMonthData = useMemo(() => {
    if (!detailEmployee) return null;
    const [yStr, mStr] = detailMonth.split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10) - 1; // 0-indexed
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun … 6=Sat

    const records = allRecords.filter(r =>
      String(r.employeeId) === String(detailEmployee.employeeId) &&
      (r.attendanceDate || '').toString().startsWith(detailMonth)
    );
    const byDate = {};
    for (const r of records) byDate[r.attendanceDate] = r.status;

    let present = 0, absent = 0, leave = 0;
    for (const r of records) {
      if (r.status === 'PRESENT') present++;
      else if (r.status === 'ABSENT') absent++;
      else leave++;
    }
    const total = records.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : null;

    return { year, month, daysInMonth, firstWeekday, byDate, records, present, absent, leave, total, rate };
  }, [detailEmployee, detailMonth, allRecords]);

  const monthLabel = (ym) => {
    const [y, m] = ym.split('-');
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1)
      .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  const shiftDetailMonth = (delta) => {
    const [y, m] = detailMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setDetailMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const currentMonthIso = toLocalISODate(new Date()).slice(0, 7);

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
            <Button
              variant="outline"
              onClick={() => exportToExcel({
                rows: monthRecords.map(r => ({
                  'Employee': r.employeeName || '',
                  'Date': r.attendanceDate ? formatDate(r.attendanceDate) : '',
                  'Status': friendlyStatus(r.status),
                })),
                fileName: `Nool_Attendance_${selectedMonth}`,
                sheetName: 'Attendance',
                columnWidths: [22, 14, 14],
              })}
            >
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
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
          <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
            <p className="text-2xl font-bold text-indigo-700">{employees.length}</p>
            <p className="text-sm text-indigo-600">Total Employees</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
            <p className="text-2xl font-bold text-emerald-700">{totalPresent}</p>
            <p className="text-sm text-emerald-600">Present Days</p>
          </div>
          <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
            <p className="text-2xl font-bold text-rose-700">{totalAbsent}</p>
            <p className="text-sm text-rose-600">Absent Days</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-gray-700">{monthRecords.length}</p>
            <p className="text-sm text-gray-600">Records This Month</p>
          </div>
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

      {/* ── Employee Detail Modal — Beautiful Calendar ── */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`📅 ${detailEmployee?.employeeName || ''} — Attendance`}
        size="lg"
      >
        {detailEmployee && detailMonthData && (
          <div className="space-y-5">
            {/* Month navigator */}
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl px-2 sm:px-4 py-2 sm:py-3 border border-indigo-100">
              <button
                onClick={() => shiftDetailMonth(-1)}
                className="p-1.5 sm:p-2 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </button>
              <div className="text-center px-1">
                <p className="text-base sm:text-xl font-bold text-gray-900">{monthLabel(detailMonth)}</p>
                {detailMonth !== currentMonthIso && (
                  <button
                    onClick={() => setDetailMonth(currentMonthIso)}
                    className="text-[10px] sm:text-xs text-indigo-600 hover:text-indigo-800 font-semibold mt-0.5"
                  >
                    Jump to this month
                  </button>
                )}
              </div>
              <button
                onClick={() => shiftDetailMonth(1)}
                disabled={detailMonth >= currentMonthIso}
                className="p-1.5 sm:p-2 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </button>
            </div>

            {/* Summary for this month */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                <p className="text-2xl font-bold text-emerald-700">{detailMonthData.present}</p>
                <p className="text-xs text-emerald-600 font-medium">Present</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                <p className="text-2xl font-bold text-rose-700">{detailMonthData.absent}</p>
                <p className="text-xs text-rose-600 font-medium">Absent</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <p className="text-2xl font-bold text-amber-700">{detailMonthData.leave}</p>
                <p className="text-xs text-amber-600 font-medium">Leave</p>
              </div>
              {(() => {
                const r = detailMonthData.rate;
                const bg = r === null ? 'bg-gray-50 border-gray-200'
                  : r >= 80 ? 'bg-emerald-50 border-emerald-100'
                  : r >= 50 ? 'bg-amber-50 border-amber-100'
                  : 'bg-rose-50 border-rose-100';
                const fg = r === null ? 'text-gray-600'
                  : r >= 80 ? 'text-emerald-700'
                  : r >= 50 ? 'text-amber-700'
                  : 'text-rose-700';
                return (
                  <div className={`rounded-xl p-3 border ${bg}`}>
                    <p className={`text-2xl font-bold ${fg}`}>{r !== null ? `${r}%` : '—'}</p>
                    <p className="text-xs text-gray-600 font-medium">Rate</p>
                  </div>
                );
              })()}
            </div>

            {/* Calendar grid */}
            <div className="bg-white rounded-2xl border border-gray-200 p-2 sm:p-4">
              {/* Weekday header */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1.5 sm:mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                  <div
                    key={d}
                    className={`text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider py-1 ${
                      i === 0 ? 'text-rose-400' : 'text-gray-500'
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* Leading blanks */}
                {Array.from({ length: detailMonthData.firstWeekday }).map((_, i) => (
                  <div key={`blank-${i}`} />
                ))}
                {/* Days */}
                {Array.from({ length: detailMonthData.daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const dateIso = `${detailMonthData.year}-${String(detailMonthData.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const status = detailMonthData.byDate[dateIso];
                  const isToday = dateIso === toLocalISODate(new Date());
                  const isFuture = dateIso > toLocalISODate(new Date());

                  let cellClasses = 'bg-gray-50 text-gray-400 border-gray-200';
                  let label = null;
                  if (status === 'PRESENT') {
                    cellClasses = 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
                    label = <CheckCircle className="w-3.5 h-3.5" />;
                  } else if (status === 'ABSENT') {
                    cellClasses = 'bg-rose-500 text-white border-rose-600 shadow-sm';
                    label = <XCircle className="w-3.5 h-3.5" />;
                  } else if (status === 'HALF_DAY' || status === 'LEAVE') {
                    cellClasses = 'bg-amber-400 text-white border-amber-500 shadow-sm';
                    label = <Clock className="w-3.5 h-3.5" />;
                  } else if (isFuture) {
                    cellClasses = 'bg-white text-gray-300 border-gray-100';
                  }

                  return (
                    <div
                      key={day}
                      title={status ? `${formatDate(dateIso)} — ${friendlyStatus(status)}` : formatDate(dateIso)}
                      className={`aspect-square rounded-lg sm:rounded-xl border sm:border-2 flex flex-col items-center justify-center transition-transform hover:scale-105 ${cellClasses} ${
                        isToday ? 'ring-2 ring-indigo-500 ring-offset-1 sm:ring-offset-2' : ''
                      }`}
                    >
                      <span className="text-sm sm:text-lg font-bold leading-none">{day}</span>
                      {label && <span className="mt-0.5 sm:mt-1 [&>svg]:w-2.5 [&>svg]:h-2.5 sm:[&>svg]:w-3.5 sm:[&>svg]:h-3.5">{label}</span>}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-emerald-500 border-2 border-emerald-600" />
                  <span className="text-gray-700 font-medium">Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-rose-500 border-2 border-rose-600" />
                  <span className="text-gray-700 font-medium">Absent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-amber-400 border-2 border-amber-500" />
                  <span className="text-gray-700 font-medium">Half Day / Leave</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-gray-50 border-2 border-gray-200" />
                  <span className="text-gray-700 font-medium">Not Marked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-white border-2 border-indigo-500" />
                  <span className="text-gray-700 font-medium">Today</span>
                </div>
              </div>
            </div>

            {detailMonthData.total === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                <Calendar className="w-8 h-8 mx-auto mb-1 opacity-40" />
                No attendance marked for {monthLabel(detailMonth)} yet.
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
