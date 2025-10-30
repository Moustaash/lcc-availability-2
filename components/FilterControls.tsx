import React, { useRef } from 'react';
// FIX: Consolidate date-fns imports to resolve module resolution errors.
import { format, getMonth, getYear, setMonth, setYear } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FilterControlsProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateChange: (date: Date) => void;
  searchedDate: Date | null;
  onDateSearch: (date: Date | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  currentDate, onPrevMonth, onNextMonth, onDateChange,
  searchedDate, onDateSearch,
  searchQuery, setSearchQuery,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  const years = Array.from({ length: 5 }, (_, i) => getYear(new Date()) - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split('-').map(Number);
      onDateSearch(new Date(year, month - 1, day));
    } else {
      onDateSearch(null);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button onClick={onPrevMonth} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><span className="material-symbols-outlined">chevron_left</span></button>
          <select value={getMonth(currentDate)} onChange={e => onDateChange(setMonth(currentDate, parseInt(e.target.value)))} className="p-2 border border-gray-300 dark:border-border-dark rounded-md bg-white dark:bg-card-dark text-gray-800 dark:text-text-dark focus:ring-2 focus:ring-primary transition-colors">
            {months.map(m => <option key={m} value={m}>{format(new Date(0, m), 'MMMM', { locale: fr })}</option>)}
          </select>
          <select value={getYear(currentDate)} onChange={e => onDateChange(setYear(currentDate, parseInt(e.target.value)))} className="p-2 border border-gray-300 dark:border-border-dark rounded-md bg-white dark:bg-card-dark text-gray-800 dark:text-text-dark focus:ring-2 focus:ring-primary transition-colors">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={onNextMonth} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><span className="material-symbols-outlined">chevron_right</span></button>
        </div>
        
        {/* Search Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative">
            <button onClick={() => dateInputRef.current?.showPicker()} className="w-full text-left p-2 pl-10 border border-gray-300 dark:border-border-dark rounded-md bg-transparent focus:ring-2 focus:ring-primary transition-colors">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">calendar_today</span>
              {searchedDate ? format(searchedDate, 'dd/MM/yyyy') : 'Rechercher par date...'}
            </button>
            <input type="date" ref={dateInputRef} value={searchedDate ? format(searchedDate, 'yyyy-MM-dd') : ''} onChange={handleDateInputChange} className="opacity-0 absolute top-0 left-0 w-full h-full" />
            {searchedDate && (
              <button onClick={() => onDateSearch(null)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
          <div className="relative">
             <input type="text" placeholder="Filtrer par nom..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="p-2 pl-10 border w-full border-gray-300 dark:border-border-dark rounded-md bg-transparent focus:ring-2 focus:ring-primary transition-colors" />
             <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
