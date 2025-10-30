import React, { useState } from 'react';
import Header from './components/Header';
import FilterControls from './components/FilterControls';
import AvailabilityGrid from './components/AvailabilityGrid';
import MobileCalendarView from './components/MobileCalendarView';
import Legend from './components/Legend';
import { useCalendarData } from './hooks/useCalendarData';
import { useMediaQuery } from './hooks/useMediaQuery';
import { Chalet } from './lib/types';

function App() {
  const {
    syncStatus,
    chalets,
    bookings,
    currentDate,
    handlePrevMonth,
    handleNextMonth,
    handleDateChange,
  } = useCalendarData();

  const [selectedChalets, setSelectedChalets] = useState<Chalet[]>([]);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Initially, if no chalets are selected, display all of them.
  const chaletsToDisplay = selectedChalets.length > 0 ? selectedChalets : chalets;

  return (
    <div className="bg-gray-50 dark:bg-background-dark min-h-screen font-sans text-gray-900 dark:text-text-dark">
      <Header syncStatus={syncStatus} />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <FilterControls
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onDateChange={handleDateChange}
          chalets={chalets}
          selectedChalets={selectedChalets}
          onSelectedChaletsChange={setSelectedChalets}
        />
        {isMobile ? (
          <MobileCalendarView
            chalets={chaletsToDisplay}
            bookings={bookings}
            currentDate={currentDate}
          />
        ) : (
          <AvailabilityGrid
            chalets={chaletsToDisplay}
            bookings={bookings}
            currentDate={currentDate}
          />
        )}
        <Legend />
      </main>
    </div>
  );
}

export default App;
