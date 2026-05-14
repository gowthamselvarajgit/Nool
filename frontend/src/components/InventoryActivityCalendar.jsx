import { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, toLocalISODate } from '../utils/formatters';

// Compact per-owner receipts/returns calendar. Used in OwnersPage and inventory
// owner-modal — receipts (+N indigo) on top, returns (−N emerald) below.
// `entries` items only need: { entryDate, entryType: 'RECEIPT'|'RETURN', quantity }.
export default function InventoryActivityCalendar({ entries = [] }) {
  const currentMonthIso = toLocalISODate(new Date()).slice(0, 7);
  const todayIso = toLocalISODate(new Date());
  const [month, setMonth] = useState(() => {
    // Open on the most recent month with activity so users don't see a blank
    // current month for an inactive owner.
    if (!entries.length) return currentMonthIso;
    const latest = entries.map(e => e.entryDate || '').filter(Boolean).sort().pop();
    return latest ? latest.slice(0, 7) : currentMonthIso;
  });

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
    let monthReceived = 0, monthReturned = 0, activeDays = 0;
    for (const e of entries) {
      const d = e.entryDate || '';
      if (!d.startsWith(month)) continue;
      const cur = byDate[d] || { received: 0, returned: 0 };
      if (e.entryType === 'RECEIPT') cur.received += e.quantity || 0;
      else if (e.entryType === 'RETURN') cur.returned += e.quantity || 0;
      byDate[d] = cur;
    }
    for (const d in byDate) {
      monthReceived += byDate[d].received;
      monthReturned += byDate[d].returned;
      activeDays += 1;
    }
    return { year, monthIdx, daysInMonth, firstWeekday, byDate, monthReceived, monthReturned, activeDays };
  }, [entries, month]);

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-violet-50 px-2 py-2 border-b border-indigo-100">
        <button
          onClick={() => shiftMonth(-1)}
          className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          title="Previous month"
        >
          <ChevronLeft className="w-4 h-4 text-gray-700" />
        </button>
        <div className="text-center px-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{monthLabel(month)}</p>
          <p className="text-[10px] text-gray-600 mt-0.5 truncate">
            <strong className="text-indigo-700">{cal.monthReceived}</strong> in ·
            <strong className="text-emerald-700 ml-1">{cal.monthReturned}</strong> out
          </p>
        </div>
        <button
          onClick={() => shiftMonth(1)}
          disabled={month >= currentMonthIso}
          className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Next month"
        >
          <ChevronRight className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      <div className="p-2">
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div
              key={i}
              className={`text-center text-[10px] font-bold uppercase py-1 ${
                i === 0 ? 'text-rose-400' : 'text-gray-500'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: cal.firstWeekday }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {Array.from({ length: cal.daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const dateIso = `${cal.year}-${String(cal.monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const entry = cal.byDate[dateIso];
            const isToday = dateIso === todayIso;
            const isFuture = dateIso > todayIso;
            const hasActivity = entry && (entry.received > 0 || entry.returned > 0);

            let cellClasses;
            if (hasActivity) cellClasses = 'bg-amber-50 border-amber-200';
            else if (isFuture) cellClasses = 'bg-white text-gray-300 border-gray-100';
            else cellClasses = 'bg-gray-50 text-gray-400 border-gray-200';

            const tooltip = hasActivity
              ? `${formatDate(dateIso)} — received ${entry.received}, returned ${entry.returned}`
              : formatDate(dateIso);

            return (
              <div
                key={day}
                title={tooltip}
                className={`h-12 sm:h-14 rounded-md sm:rounded-lg border flex flex-col items-center justify-center transition-transform hover:scale-105 ${cellClasses} ${
                  isToday ? 'ring-2 ring-indigo-500 ring-offset-1' : ''
                }`}
              >
                <span className="text-xs sm:text-sm font-bold leading-none text-gray-900">{day}</span>
                {hasActivity && (
                  <div className="flex flex-col items-center leading-none mt-0.5">
                    {entry.received > 0 && (
                      <span className="text-[8px] sm:text-[10px] font-extrabold text-indigo-700 leading-tight">+{entry.received}</span>
                    )}
                    {entry.returned > 0 && (
                      <span className="text-[8px] sm:text-[10px] font-extrabold text-emerald-700 leading-tight">−{entry.returned}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2 pt-2 border-t border-gray-100 text-[10px]">
          <span><strong className="text-indigo-700">+N</strong> received</span>
          <span><strong className="text-emerald-700">−N</strong> returned</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-white border-2 border-indigo-500" />today
          </span>
        </div>

        {cal.activeDays === 0 && (
          <div className="text-center py-3 text-gray-500 text-xs">
            <Calendar className="w-6 h-6 mx-auto mb-1 opacity-40" />
            No activity for {monthLabel(month)} yet.
          </div>
        )}
      </div>
    </div>
  );
}
