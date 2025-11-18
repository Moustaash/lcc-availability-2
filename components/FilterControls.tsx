
import React from 'react';
// FIX: Changed date-fns imports to use named imports from 'date-fns' and 'date-fns/locale' to resolve call signature errors.
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Chalet } from '../lib/types';
import ChaletSelector from './ChaletSelector';
import QuickDatePicker from './QuickDatePicker';
import { cn } from '../lib/utils';
import { usePopper } from '../hooks/usePopper';

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
  const { 
    isOpen: isDatePickerOpen, 
    toggle: toggleDatePicker, 
    close: closeDatePicker, 
    triggerRef, 
    popperRef 
  } = usePopper<HTMLButtonElement, HTMLDivElement>();
  

  const handleDateSelect = (date: Date) => {
    onDateChange(date); // Switch view to the new month
    onDateSelect(date); // Select the specific day
    closeDatePicker();
  };

  const buttonClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 w-10";

  return (
    <div className="mb-6 p-4 bg-card text-card-foreground rounded-lg border">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Month Navigator & Unified Date Picker */}
        <div className="flex items-center gap-1">
          <button onClick={onPrevMonth} className={buttonClasses} aria-label="Previous month">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <div className="relative">
             <button 
              ref={triggerRef}
              onClick={toggleDatePicker}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-44 capitalize"
            >
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </button>
            {isDatePickerOpen && (
              <div ref={popperRef}>
                <QuickDatePicker
                  currentDate={currentDate}
                  selectedDate={selectedDate}
                  onSelect={handleDateSelect}
                />
              </div>
            )}
          </div>
          
          <button onClick={onNextMonth} className={buttonClasses} aria-label="Next month">
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
