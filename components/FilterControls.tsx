import React, { useState, useRef, useEffect } from 'react';
// FIX: Use `import { default as ... }` syntax to correctly import date-fns functions, resolving "not callable" errors due to module interoperability issues.
import { default as format } from 'date-fns/format';
import fr from 'date-fns/locale/fr';
import { Chalet } from '../lib/types';
import ChaletSelector from './ChaletSelector';
import DatePicker from './DatePicker';

interface FilterControlsProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateChange: (date: Date) => void;
  chalets: Chalet[];
  selectedChalets: Chalet[];
  onSelectedChaletsChange: (chalets: Chalet[]) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onDateChange,
  chalets,
  selectedChalets,
  onSelectedChaletsChange,
}) => {
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [datePickerRef]);

  return (
    <div className="mb-6 p-4 bg-white dark:bg-card-dark rounded-lg shadow">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Month Navigator */}
        <div className="flex items-center gap-2" ref={datePickerRef}>
          <button onClick={onPrevMonth} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Previous month">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <div className="relative">
             <button 
              onClick={() => setDatePickerOpen(prev => !prev)}
              className="text-lg font-semibold w-36 text-center capitalize p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
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