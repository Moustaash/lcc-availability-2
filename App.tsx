import React, { useState, useMemo } from 'react';
// FIX: Consolidate date-fns imports to resolve module resolution errors.
import { addMonths, subMonths } from 'date-fns';
import Header from './components/Header';
import FilterControls from './components/FilterControls';
import AvailabilityGrid from './components/AvailabilityGrid';
import Legend from './components/Legend';
import { useCalendarData } from './hooks/useCalendarData';
import { SyncStatus } from './lib/types';

function App() {
  const { bookings, properties, syncStatus, error } = useCalendarData();
  const [currentDate, setCurrentDate] = useState(new Date('2025-11-01'));
  const [searchedDate, setSearchedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleDateChange = (date: Date) => setCurrentDate(date);
  const handleDateSearch = (date: Date | null) => setSearchedDate(date);

  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    if (!searchQuery) return properties;
    return properties.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, properties]);

  return (
    <div className="min-h-screen text-gray-800 dark:text-text-dark transition-colors duration-300">
      <Header syncStatus={syncStatus} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-card-dark rounded-lg shadow-md border border-gray-200 dark:border-border-dark p-4 md:p-6">
          <FilterControls
            currentDate={currentDate}
            onNextMonth={handleNextMonth}
            onPrevMonth={handlePrevMonth}
            onDateChange={handleDateChange}
            searchedDate={searchedDate}
            onDateSearch={handleDateSearch}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          
          {syncStatus === SyncStatus.ERROR && (
            <div className="my-4 text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">
              <p>Erreur de chargement des données. Veuillez réessayer plus tard.</p>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {syncStatus === SyncStatus.SYNCING || !properties ? (
             <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <AvailabilityGrid
              bookings={bookings}
              properties={filteredProperties}
              currentDate={currentDate}
              searchedDate={searchedDate}
            />
          )}

          <Legend />
        </div>
      </main>
    </div>
  );
}

export default App;
