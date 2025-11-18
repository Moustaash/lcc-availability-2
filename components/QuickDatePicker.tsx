import React, { useState } from 'react';
// FIX: Changed date-fns imports to use named imports from 'date-fns' and 'date-fns/locale' to resolve call signature errors.
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
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
  const buttonClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0";


  return (
    <div className="absolute z-30 top-full right-0 mt-2 w-72 bg-popover text-popover-foreground border rounded-md shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setDisplayDate(d => subMonths(d, 1))} className={buttonClasses} aria-label="Previous month">
          <span className="material-symbols-outlined text-base">chevron_left</span>
        </button>
        <span className="font-semibold capitalize text-sm">
          {format(displayDate, 'MMMM yyyy', { locale: fr })}
        </span>
        <button onClick={() => setDisplayDate(d => addMonths(d, 1))} className={buttonClasses} aria-label="Next month">
          <span className="material-symbols-outlined text-base">chevron_right</span>
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground mb-2">
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
                "h-9 w-9 flex items-center justify-center rounded-full text-sm p-0 font-normal",
                "transition-colors",
                isCurrentMonth 
                  ? "hover:bg-accent hover:text-accent-foreground" 
                  : "text-muted-foreground opacity-50 cursor-not-allowed",
                isTodaysDate && !isSelected && "bg-accent text-accent-foreground",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
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
