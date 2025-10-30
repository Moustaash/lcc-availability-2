import React from 'react';
// FIX: Use sub-path imports for date-fns to resolve module errors.
import format from 'date-fns/format';
import fr from 'date-fns/locale/fr';
import { Chalet } from '../lib/types';
import ChaletSelector from './ChaletSelector';

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
  chalets,
  selectedChalets,
  onSelectedChaletsChange,
}) => {
  return (
    <div className="mb-6 p-4 bg-white dark:bg-card-dark rounded-lg shadow">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Month Navigator */}
        <div className="flex items-center gap-2">
          <button onClick={onPrevMonth} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Previous month">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span className="text-lg font-semibold w-36 text-center capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </span>
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