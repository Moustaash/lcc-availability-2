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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Custom handlers to reset selected date on month or year change
  const handlePrevMonthWithReset = () => {
    handlePrevMonth();
    setSelectedDate(null);
  };

  const handleNextMonthWithReset = () => {
    handleNextMonth();
    setSelectedDate(null);
  };

  const handleDateChangeWithReset = (date: Date) => {
    handleDateChange(date);
    setSelectedDate(null);
  };


  // Initially, if no chalets are selected, display all of them.
  const chaletsToDisplay = selectedChalets.length > 0 ? selectedChalets : chalets;

  return (
    <div className="bg-gray-50 dark:bg-background-dark min-h-screen font-sans">
      <Header syncStatus={syncStatus} />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <FilterControls
          currentDate={currentDate}
          onPrevMonth={handlePrevMonthWithReset}
          onNextMonth={handleNextMonthWithReset}
          onDateChange={handleDateChangeWithReset}
          chalets={chalets}
          selectedChalets={selectedChalets}
          onSelectedChaletsChange={setSelectedChalets}
        />
        {isMobile ? (
          <MobileCalendarView
            chalets={chaletsToDisplay}
            bookings={bookings}
            currentDate={currentDate}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        ) : (
          <AvailabilityGrid
            chalets={chaletsToDisplay}
            bookings={bookings}
            currentDate={currentDate}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        )}
        <Legend />
      </main>
    </div>
  );
}

export default App;