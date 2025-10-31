import React, { useState } from 'react';
// FIX: Consolidate date-fns imports to resolve module resolution errors.
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../lib/utils';

interface QuickDatePickerProps {
  currentDate: Date;
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

const QuickDatePicker: React.FC<QuickDatePickerProps> = ({ currentDate, selectedDate, onSelect }) => {
  const [displayDate, setDisplayDate] = useState(selectedDate || currentDate);

  const monthStart = startOfMonth(displayDate);
  const monthEnd = endOfMonth(displayDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const daysOfWeek = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

  return (
    <div className="absolute z-30 top-full right-0 mt-2 w-72 bg-white dark:bg-card-dark border border-gray-300 dark:border-border-dark rounded-md shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setDisplayDate(d => subMonths(d, 1))} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Previous month">
          <span className="material-symbols-outlined text-base">chevron_left</span>
        </button>
        <span className="font-semibold capitalize text-sm">
          {format(displayDate, 'MMMM yyyy', { locale: fr })}
        </span>
        <button onClick={() => setDisplayDate(d => addMonths(d, 1))} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Next month">
          <span className="material-symbols-outlined text-base">chevron_right</span>
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
        {daysOfWeek.map(day => <div key={day}>{day}</div>)}
      </div>
      
      <div className="grid grid-cols-7">
        {days.map(day => {
          const isCurrentMonth = isSameMonth(day, displayDate);
          const isTodaysDate = isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelect(day)}
              disabled={!isCurrentMonth}
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-full text-sm",
                "transition-colors",
                isCurrentMonth 
                  ? "hover:bg-gray-100 dark:hover:bg-gray-700" 
                  : "text-gray-400 dark:text-gray-600 cursor-not-allowed",
                isTodaysDate && !isSelected && "font-bold text-primary border border-primary/50",
                isSelected && "bg-primary text-white font-bold hover:bg-primary/90"
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickDatePicker;