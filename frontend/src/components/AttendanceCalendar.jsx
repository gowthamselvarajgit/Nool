import { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, toLocalISODate, friendlyStatus } from '../utils/formatters';

// Compact attendance calendar — green/red day cells. Used in the per-employee
// detail modals on AttendancePage and EmployeesPage.
// `records` items only need: { attendanceDate, status }.
export default function AttendanceCalendar({ records = [] }) {
  const currentMonthIso = toLocalISODate(new Date()).slice(0, 7);
  const todayIso = toLocalISODate(new Date());
  const [month, setMonth] = useState(currentMonthIso);

  const shiftMonth = (delta) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const monthLabel = (ym) => {
    const [y, m] = ym.split('-');
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1)
      .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  const cal = useMemo(() => {
    const [yStr, mStr] = month.split('-');
    const year = parseInt(yStr, 10);
    const monthIdx = parseInt(mStr, 10) - 1;
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const firstWeekday = new Date(year, monthIdx, 1).getDay();

    const byDate = {};
    let present = 0, absent = 0, leave = 0;
    for (const r of records) {
      const d = (r.attendanceDate || '').toString();
      if (!d.startsWith(month)) continue;
      byDate[d] = r.status;
      if (r.status === 'PRESENT') present++;
      else if (r.status === 'ABSENT') absent++;
      else leave++;
    }
    const total = present + absent + leave;
    const rate = total > 0 ? Math.round((present / total) * 100) : null;
    return { year, monthIdx, daysInMonth, firstWeekday, byDate, present, absent, leave, total, rate };
  }, [records, month]);

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      {/* Navigator */}
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-violet-50 px-2 sm:px-4 py-2 sm:py-3 border-b border-indigo-100">
        <button
          onClick={() => shiftMonth(-1)}
          className="p-1.5 sm:p-2 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          title="Previous month"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        </button>
        <div className="text-center px-1">
          <p className="text-sm sm:text-lg font-bold text-gray-900">{monthLabel(month)}</p>
          <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
            <strong className="text-emerald-700">{cal.present}</strong> P ·
            <strong className="text-rose-700 ml-1">{cal.absent}</strong> A
            {cal.leave > 0 && <> · <strong className="text-amber-700">{cal.leave}</strong> L</>}
            {cal.rate !== null && <> · <strong className="text-indigo-700 ml-1">{cal.rate}%</strong></>}
          </p>
          {month !== currentMonthIso && (
            <button
              onClick={() => setMonth(currentMonthIso)}
              className="text-[10px] sm:text-xs text-indigo-600 hover:text-indigo-800 font-semibold mt-0.5"
            >
              Jump to this month
            </button>
          )}
        </div>
        <button
          onClick={() => shiftMonth(1)}
          disabled={month >= currentMonthIso}
          className="p-1.5 sm:p-2 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Next month"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        </button>
      </div>

      <div className="p-2 sm:p-4">
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
          {Array.from({ length: cal.firstWeekday }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {Array.from({ length: cal.daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const dateIso = `${cal.year}-${String(cal.monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const status = cal.byDate[dateIso];
            const isToday = dateIso === todayIso;
            const isFuture = dateIso > todayIso;

            let cellClasses = 'bg-gray-50 text-gray-400 border-gray-200';
            let label = null;
            if (status === 'PRESENT') {
              cellClasses = 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
              label = <CheckCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />;
            } else if (status === 'ABSENT') {
              cellClasses = 'bg-rose-500 text-white border-rose-600 shadow-sm';
              label = <XCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />;
            } else if (status === 'HALF_DAY' || status === 'LEAVE') {
              cellClasses = 'bg-amber-400 text-white border-amber-500 shadow-sm';
              label = <Clock className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />;
            } else if (isFuture) {
              cellClasses = 'bg-white text-gray-300 border-gray-100';
            }

            return (
              <div
                key={day}
                title={status ? `${formatDate(dateIso)} — ${friendlyStatus(status)}` : formatDate(dateIso)}
                className={`aspect-square rounded-lg sm:rounded-xl border sm:border-2 flex flex-col items-center justify-center ${cellClasses} ${
                  isToday ? 'ring-2 ring-indigo-500 ring-offset-1 sm:ring-offset-2' : ''
                }`}
              >
                <span className="text-sm sm:text-lg font-bold leading-none">{day}</span>
                {label && <span className="mt-0.5 sm:mt-1">{label}</span>}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-3 pt-3 border-t border-gray-100 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-gray-700">Present</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-rose-500" />
            <span className="text-gray-700">Absent</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-400" />
            <span className="text-gray-700">Leave</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-white border-2 border-indigo-500" />
            <span className="text-gray-700">Today</span>
          </div>
        </div>

        {cal.total === 0 && (
          <div className="text-center py-3 text-gray-500 text-xs">
            <Calendar className="w-6 h-6 mx-auto mb-1 opacity-40" />
            No attendance for {monthLabel(month)} yet.
          </div>
        )}
      </div>
    </div>
  );
}
