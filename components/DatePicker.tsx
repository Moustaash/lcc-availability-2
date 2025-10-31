import React, { useState } from 'react';
// FIX: Import date-fns functions from their specific paths to resolve module loading errors.
import format from 'date-fns/format';
import getYear from 'date-fns/getYear';
import setMonth from 'date-fns/setMonth';
import setYear from 'date-fns/setYear';
import fr from 'date-fns/locale/fr';
import { cn } from '../lib/utils';

interface DatePickerProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onClose: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ currentDate, onDateChange, onClose }) => {
  const [viewYear, setViewYear] = useState(getYear(currentDate));

  const months = Array.from({ length: 12 }, (_, i) => setMonth(new Date(0), i));
  const currentSelectedYear = getYear(currentDate);
  const currentSelectedMonth = currentDate.getMonth();

  const selectDate = (monthIndex: number) => {
    const newDate = setMonth(setYear(new Date(), viewYear), monthIndex);
    onDateChange(newDate);
    onClose();
  };

  return (
    <div className="absolute z-30 top-full mt-2 w-72 bg-white dark:bg-card-dark border border-gray-300 dark:border-border-dark rounded-md shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setViewYear(v => v - 1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Previous year">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <span className="font-semibold">{viewYear}</span>
        <button onClick={() => setViewYear(v => v + 1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Next year">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {months.map((month, index) => (
          <button
            key={index}
            onClick={() => selectDate(index)}
            className={cn(
              "p-2 rounded-md text-sm capitalize text-center",
              viewYear === currentSelectedYear && index === currentSelectedMonth
                ? 'bg-primary text-white font-bold'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            {format(month, 'MMM', { locale: fr })}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DatePicker;