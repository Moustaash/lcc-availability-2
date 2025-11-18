import React from 'react';
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

  const iconButtonClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 border border-border bg-card shadow-sm";

  return (
    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Date Navigation */}
        <div className="flex items-center gap-2 bg-card/50 p-1 rounded-lg">
          <button onClick={onPrevMonth} className={iconButtonClasses} aria-label="Previous month">
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>

          <div className="relative">
             <button 
              ref={triggerRef}
              onClick={toggleDatePicker}
              className="inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-all border border-border bg-card hover:bg-accent hover:text-accent-foreground hover:shadow-md h-9 px-4 min-w-[180px] shadow-sm capitalize"
            >
              <span className="material-symbols-outlined text-[18px] text-muted-foreground">calendar_month</span>
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
          
          <button onClick={onNextMonth} className={iconButtonClasses} aria-label="Next month">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
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
  );
};

export default FilterControls;