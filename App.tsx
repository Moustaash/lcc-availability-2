import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import FilterControls from './components/FilterControls';
import AvailabilityGrid from './components/AvailabilityGrid';
import Legend from './components/Legend';
import { useCalendarData } from './hooks/useCalendarData';

function App() {
  const { 
    syncStatus, 
    chalets, 
    bookings, 
    currentDate, 
    handlePrevMonth, 
    handleNextMonth, 
    handleDateChange 
  } = useCalendarData();

  const [searchedDate, setSearchedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChalets = useMemo(() => {
    if (!searchQuery) return chalets;
    return chalets.filter(chalet => 
      chalet.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chalets, searchQuery]);

  const handleDateSearch = (date: Date | null) => {
    setSearchedDate(date);
    if (date) {
      handleDateChange(date);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark text-gray-800 dark:text-text-dark font-sans transition-colors">
      <Header syncStatus={syncStatus} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FilterControls 
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onDateChange={handleDateChange}
          searchedDate={searchedDate}
          onDateSearch={handleDateSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        {
          syncStatus === 'syncing' || syncStatus === 'idle' ? (
            <div className="flex justify-center items-center h-96">
              <p>Chargement des données...</p>
            </div>
          ) : (
            <AvailabilityGrid 
              chalets={filteredChalets}
              bookings={bookings}
              currentDate={currentDate}
              searchedDate={searchedDate}
            />
          )
        }
        <Legend />
      </main>
    </div>
  );
}

export default App;
