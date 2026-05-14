import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, toLocalISODate } from '../utils/formatters';

const inr = (n) => `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

// Shared month calendar for salary / owner-payment history.
// Buckets payments by date and color-codes cells by total amount paid that day.
//
// Tones (matches the rest of the app's color language):
//   "emerald" — salary paid to employees (money going out for work)
//   "indigo"  — owner payments (money going out to owners)
//
// `payments` items only need `paymentDate`, `amountPaid`, `paymentMode`, `remarks`.
export default function PaymentCalendar({ payments = [], tone = 'emerald' }) {
  const currentMonthIso = toLocalISODate(new Date()).slice(0, 7);
  const todayIso = toLocalISODate(new Date());
  const [calMonth, setCalMonth] = useState(() => {
    // Default to the most recent month that has payments — or current month if none.
    if (!payments.length) return currentMonthIso;
    const latest = payments
      .map(p => p.paymentDate || '')
      .filter(Boolean)
      .sort()
      .pop();
    return latest ? latest.slice(0, 7) : currentMonthIso;
  });

  const shiftMonth = (delta) => {
    const [y, m] = calMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setCalMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const monthLabel = (ym) => {
    const [y, m] = ym.split('-');
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1)
      .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  const cal = useMemo(() => {
    const [yStr, mStr] = calMonth.split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10) - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();

    const byDate = {}; // dateIso -> { total, count, items: [] }
    let monthTotal = 0;
    let paidDays = 0;
    for (const p of payments) {
      const d = p.paymentDate || '';
      if (!d.startsWith(calMonth)) continue;
      const cur = byDate[d] || { total: 0, count: 0, items: [] };
      cur.total += p.amountPaid || 0;
      cur.count += 1;
      cur.items.push(p);
      byDate[d] = cur;
    }
    for (const d in byDate) { monthTotal += byDate[d].total; paidDays += 1; }
    return { year, month, daysInMonth, firstWeekday, byDate, monthTotal, paidDays };
  }, [calMonth, payments]);

  // Tone palette — one deep gradient per page so the two calendars look
  // visually distinct even when shown side-by-side.
  const palette = tone === 'indigo'
    ? {
        bg: 'from-indigo-50 to-violet-50',
        border: 'border-indigo-100',
        accent: 'text-indigo-700',
        hover: 'hover:border-indigo-300 hover:bg-indigo-50',
        t1: 'bg-indigo-200 text-indigo-900 border-indigo-300',
        t2: 'bg-indigo-400 text-white border-indigo-500',
        t3: 'bg-indigo-500 text-white border-indigo-600 shadow-sm',
        t4: 'bg-indigo-600 text-white border-indigo-700 shadow-md',
      }
    : {
        bg: 'from-emerald-50 to-teal-50',
        border: 'border-emerald-100',
        accent: 'text-emerald-700',
        hover: 'hover:border-emerald-300 hover:bg-emerald-50',
        t1: 'bg-emerald-200 text-emerald-900 border-emerald-300',
        t2: 'bg-emerald-400 text-white border-emerald-500',
        t3: 'bg-emerald-500 text-white border-emerald-600 shadow-sm',
        t4: 'bg-emerald-600 text-white border-emerald-700 shadow-md',
      };

  const tierFor = (amt) => {
    if (amt >= 15000) return palette.t4;
    if (amt >= 5000) return palette.t3;
    if (amt >= 1000) return palette.t2;
    if (amt > 0) return palette.t1;
    return null;
  };

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
      {/* Header / navigator */}
      <div className={`flex items-center justify-between bg-gradient-to-r ${palette.bg} px-2 sm:px-4 py-2 sm:py-3 border-b ${palette.border}`}>
        <button
          onClick={() => shiftMonth(-1)}
          className={`p-1.5 sm:p-2 rounded-xl bg-white border border-gray-200 ${palette.hover} transition-colors`}
          title="Previous month"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        </button>
        <div className="text-center px-1">
          <p className="text-sm sm:text-lg font-bold text-gray-900">{monthLabel(calMonth)}</p>
          <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
            {cal.paidDays} day{cal.paidDays === 1 ? '' : 's'} ·
            <strong className={`ml-1 ${palette.accent}`}>{inr(cal.monthTotal)}</strong>
          </p>
          {calMonth !== currentMonthIso && (
            <button
              onClick={() => setCalMonth(currentMonthIso)}
              className={`text-[10px] sm:text-xs font-semibold mt-0.5 ${palette.accent} hover:opacity-80`}
            >
              Jump to this month
            </button>
          )}
        </div>
        <button
          onClick={() => shiftMonth(1)}
          disabled={calMonth >= currentMonthIso}
          className={`p-1.5 sm:p-2 rounded-xl bg-white border border-gray-200 ${palette.hover} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
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
            const dateIso = `${cal.year}-${String(cal.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const entry = cal.byDate[dateIso];
            const isToday = dateIso === todayIso;
            const isFuture = dateIso > todayIso;

            const tier = entry ? tierFor(entry.total) : null;
            const cellClasses = tier
              ? tier
              : isFuture
              ? 'bg-white text-gray-300 border-gray-100'
              : 'bg-gray-50 text-gray-400 border-gray-200';

            const tooltip = entry
              ? `${formatDate(dateIso)} — ${inr(entry.total)} (${entry.count} payment${entry.count === 1 ? '' : 's'})`
              : formatDate(dateIso);

            return (
              <div
                key={day}
                title={tooltip}
                className={`min-h-[52px] sm:min-h-[68px] md:min-h-[76px] rounded-lg sm:rounded-xl border sm:border-2 flex flex-col items-center justify-center px-0.5 sm:px-1 py-1 sm:py-2 transition-transform hover:scale-105 ${cellClasses} ${
                  isToday ? 'ring-2 ring-indigo-500 ring-offset-1 sm:ring-offset-2' : ''
                }`}
              >
                <span className="text-[10px] sm:text-sm font-bold leading-none mb-0.5 sm:mb-1 opacity-90">{day}</span>
                {entry ? (
                  <>
                    <span className="text-[10px] sm:text-sm md:text-base font-extrabold leading-tight text-center break-all">{inr(entry.total)}</span>
                    {entry.count > 1 && (
                      <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider mt-0.5 sm:mt-1 opacity-90">
                        ×{entry.count}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 pt-3 border-t border-gray-100 text-xs">
          <span className="text-gray-700 font-semibold">Amount paid:</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-4 h-4 rounded-md border-2 ${palette.t1.split(' ').filter(c => c.startsWith('bg-') || c.startsWith('border-')).join(' ')}`} />
            <span className="text-gray-700">&lt; ₹1,000</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-4 h-4 rounded-md border-2 ${palette.t2.split(' ').filter(c => c.startsWith('bg-') || c.startsWith('border-')).join(' ')}`} />
            <span className="text-gray-700">₹1,000–4,999</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-4 h-4 rounded-md border-2 ${palette.t3.split(' ').filter(c => c.startsWith('bg-') || c.startsWith('border-')).join(' ')}`} />
            <span className="text-gray-700">₹5,000–14,999</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-4 h-4 rounded-md border-2 ${palette.t4.split(' ').filter(c => c.startsWith('bg-') || c.startsWith('border-')).join(' ')}`} />
            <span className="text-gray-700">₹15,000+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-md bg-gray-50 border-2 border-gray-200" />
            <span className="text-gray-700">No payment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-md bg-white border-2 border-indigo-500" />
            <span className="text-gray-700">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
