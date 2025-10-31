

import React, { useState, useRef, useEffect } from 'react';
// FIX: Corrected date-fns imports to use named imports from the main package to resolve module resolution errors.
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Chalet } from '../lib/types';
import ChaletSelector from './ChaletSelector';
import DatePicker from './DatePicker';
import QuickDatePicker from './QuickDatePicker';

interface FilterControlsProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateChange: (date: Date) => void;
  chalets: Chalet[];
  selectedChalets: Chalet[];
  onSelectedChaletsChange: (chalets: Chalet[]) => void;
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onDateChange,
  chalets,
  selectedChalets,
  onSelectedChaletsChange,
  selectedDate,
  onDateSelect,
}) => {
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [isQuickDatePickerOpen, setQuickDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const quickDatePickerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent, ref: React.RefObject<HTMLDivElement>, close: () => void) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      close();
    }
  };

  useEffect(() => {
    const handleMonthPickerClickOutside = (event: MouseEvent) => handleClickOutside(event, datePickerRef, () => setDatePickerOpen(false));
    document.addEventListener("mousedown", handleMonthPickerClickOutside);
    return () => document.removeEventListener("mousedown", handleMonthPickerClickOutside);
  }, []);

  useEffect(() => {
    const handleQuickPickerClickOutside = (event: MouseEvent) => handleClickOutside(event, quickDatePickerRef, () => setQuickDatePickerOpen(false));
    document.addEventListener("mousedown", handleQuickPickerClickOutside);
    return () => document.removeEventListener("mousedown", handleQuickPickerClickOutside);
  }, []);

  const handleQuickDateSelect = (date: Date) => {
    onDateChange(date); // Switch view to the new month
    onDateSelect(date); // Select the specific day
    setQuickDatePickerOpen(false);
  };

  return (
    <div className="mb-6 p-4 bg-white dark:bg-card-dark rounded-lg shadow">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Month Navigator & Date Pickers */}
        <div className="flex items-center gap-2">
          <button onClick={onPrevMonth} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Previous month">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <div className="relative" ref={datePickerRef}>
             <button 
              onClick={() => setDatePickerOpen(prev => !prev)}
              className="text-lg font-semibold w-44 text-center capitalize p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </button>
            {isDatePickerOpen && (
              <DatePicker 
                currentDate={currentDate}
                onDateChange={onDateChange}
                onClose={() => setDatePickerOpen(false)}
              />
            )}
          </div>
          
          <button onClick={onNextMonth} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Next month">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          <div className="relative" ref={quickDatePickerRef}>
            <button onClick={() => setQuickDatePickerOpen(p => !p)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Select a date">
              <span className="material-symbols-outlined">calendar_month</span>
            </button>
            {isQuickDatePickerOpen && (
              <QuickDatePicker
                currentDate={currentDate}
                selectedDate={selectedDate}
                onSelect={handleQuickDateSelect}
              />
            )}
          </div>
        </div>
        
        {/* Chalet Selector */}
        <div className="w-full sm:w-auto">
            <ChaletSelector
                chalets={chalets}
                selectedChalets={selectedChalets}
                onSelectionChange={onSelectedChaletsChange}
            />
        </div>
      </div>
    </div>
  );
};

export default FilterControls;