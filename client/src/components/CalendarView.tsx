import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';

interface CalendarViewProps {
  type: 'history' | 'streaks';
  markedDates?: string[];
  exceededDates?: string[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  type,
  markedDates = [],
  exceededDates = [],
  selectedDate,
  onSelectDate,
}) => {
  const todayObj = new Date();
  const currentMonthInitial =
    selectedDate && selectedDate !== 'all' ? new Date(selectedDate) : new Date();

  const initialYear = isNaN(currentMonthInitial.getTime())
    ? todayObj.getFullYear()
    : currentMonthInitial.getFullYear();
  const initialMonth = isNaN(currentMonthInitial.getTime())
    ? todayObj.getMonth()
    : currentMonthInitial.getMonth();

  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  const pad = (n: number) => n.toString().padStart(2, '0');
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fullMonthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["S","M","T","W","T","F","S"];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const grid: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) grid.push(null);
  for (let day = 1; day <= daysInMonth; day++) grid.push(day);

  const todayStr = `${todayObj.getFullYear()}-${pad(todayObj.getMonth() + 1)}-${pad(todayObj.getDate())}`;

  return (
    <div className="w-full select-none">
      {/* Month navigation header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <p className="text-sm font-bold text-slate-800 tracking-wide">
            {fullMonthNames[currentMonth]}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold">{currentYear}</p>
        </div>

        <button
          onClick={handleNextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all active:scale-90"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day name headers */}
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((d, i) => (
          <div key={i} className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-0.5 gap-x-0.5">
        {grid.map((day, idx) => {
          if (day === null) {
            return <div key={`e-${idx}`} className="h-8" />;
          }

          const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(day)}`;
          const isToday = dateStr === todayStr;
          const isSelected = selectedDate === dateStr;
          const isMarked = markedDates.includes(dateStr);
          const isExceeded = exceededDates.includes(dateStr);

          // History mode cell
          if (type === 'history') {
            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate?.(dateStr)}
                disabled={!onSelectDate}
                title={dateStr}
                className={`
                  relative h-8 w-full flex flex-col items-center justify-center rounded-lg transition-all
                  ${!onSelectDate ? 'cursor-default' : 'hover:bg-slate-100 active:scale-90 cursor-pointer'}
                  ${isSelected ? '!bg-slate-900 shadow-sm' : ''}
                  ${isToday && !isSelected ? 'ring-1 ring-inset ring-emerald-400' : ''}
                `}
              >
                <span
                  className={`text-xs font-semibold leading-none
                    ${isSelected ? 'text-white' : isToday ? 'text-emerald-600' : 'text-slate-700'}
                  `}
                >
                  {day}
                </span>
                {isMarked && !isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          }

          // Streaks mode cell
          const bgClass = isMarked
            ? 'bg-orange-50'
            : isExceeded
            ? 'bg-rose-50'
            : '';

          return (
            <button
              key={dateStr}
              disabled
              title={dateStr}
              className={`
                relative h-8 w-full flex flex-col items-center justify-center rounded-lg transition-all cursor-default
                ${bgClass}
                ${isToday ? 'ring-1 ring-inset ring-emerald-400' : ''}
              `}
            >
              {isMarked ? (
                <Flame className="w-4 h-4 text-orange-500 fill-orange-400 drop-shadow-sm" />
              ) : isExceeded ? (
                <>
                  <span className="text-[10px] font-bold text-rose-400 leading-none">{day}</span>
                  <div className="w-1 h-1 rounded-full bg-rose-400 mt-0.5" />
                </>
              ) : (
                <span
                  className={`text-xs font-medium leading-none
                    ${isToday ? 'text-emerald-600 font-bold' : 'text-slate-400'}
                  `}
                >
                  {day}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Compact legend */}
      <div className="mt-4 flex items-center justify-center gap-5 pt-3 border-t border-slate-100">
        {type === 'history' ? (
          <>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Meals logged
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
              <div className="w-4 h-3 rounded ring-1 ring-emerald-400" />
              Today
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
              <div className="w-3 h-3 rounded bg-slate-900" />
              Selected
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400" />
              Streak day
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Exceeded
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
              <div className="w-4 h-3 rounded ring-1 ring-emerald-400" />
              Today
            </div>
          </>
        )}
      </div>
    </div>
  );
};
