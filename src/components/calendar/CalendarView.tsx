import React from 'react';
import { Calendar as CalendarIcon, X, Info } from 'lucide-react';
import { BankHoliday } from '../../types';

interface CalendarViewProps {
  isOpen: boolean;
  onClose: () => void;
  holidays: BankHoliday[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  isOpen,
  onClose,
  holidays
}) => {
  if (!isOpen) return null;

  // July 2026 Calendar Grid Generation (31 days)
  const daysInJuly2026 = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const dateStr = `2026-07-${day.toString().padStart(2, '0')}`;
    const d = new Date(dateStr);
    const dayOfWeek = d.getDay(); // 0 is Sunday
    const isSunday = dayOfWeek === 0;
    const holiday = holidays.find(h => h.date === dateStr);

    return {
      day,
      dateStr,
      isSunday,
      holiday
    };
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#6B3F1D] border border-[#C89A2B]/40 rounded-3xl shadow-2xl text-white overflow-hidden p-6 relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <CalendarIcon className="w-6 h-6 text-[#C89A2B]" />
          <div>
            <h3 className="font-extrabold text-xl text-white">July 2026 EPMS Working Days Calendar</h3>
            <p className="text-xs text-[#C89A2B]">Official Bunna Bank Working Days, Sundays & Bank Holidays</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-black/30 border border-white/10 text-xs mb-6">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-emerald-600/40 border border-emerald-400" />
            <span>Working Day (Submissions Open)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-rose-500/30 border border-rose-500" />
            <span>Sunday (Submissions Blocked)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-[#C89A2B] text-[#6B3F1D]" />
            <span>Bank Holiday (Submissions Blocked)</span>
          </div>
        </div>

        {/* Month Grid */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold mb-2 text-[#C89A2B]">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty offset for July 1 2026 (Wednesday) */}
          <div />
          <div />

          {daysInJuly2026.map(item => (
            <div
              key={item.day}
              className={`p-3 rounded-xl border text-center transition-all min-h-[60px] flex flex-col justify-between ${
                item.holiday
                  ? 'bg-[#C89A2B] text-[#6B3F1D] border-[#C89A2B] font-black shadow-lg'
                  : item.isSunday
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-white/5 text-white border-white/10 hover:border-[#C89A2B]'
              }`}
            >
              <span className="font-bold text-sm">{item.day}</span>
              {item.holiday && (
                <span className="text-[9px] font-extrabold truncate">{item.holiday.name}</span>
              )}
              {item.isSunday && (
                <span className="text-[9px] font-semibold">Sunday</span>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
