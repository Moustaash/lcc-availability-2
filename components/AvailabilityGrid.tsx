import React from 'react';
import { Chalet, Booking, BookingStatus } from '../lib/types';
// FIX: The `date-fns` functions were not callable because of incorrect imports. Changed to use named imports from the main 'date-fns' package to resolve module loading errors.
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  getDay,
} from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { cn } from '../lib/utils';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface AvailabilityGridProps {
  chalets: Chalet[];
  bookings: Booking[];
  currentDate: Date;
  searchedDate: Date | null;
}

const statusColors: Record<BookingStatus, string> = {
  [BookingStatus.CONFIRMED]: 'bg-status-confirmed',
  [BookingStatus.OPTION]: 'bg-status-option',
  [BookingStatus.BLOCKED]: 'bg-status-blocked',
};

const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({ chalets, bookings, currentDate, searchedDate }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getBookingForDay = (chaletId: string, day: Date): Booking | undefined => {
    return bookings.find(booking => 
      booking.chaletId === chaletId &&
      isWithinInterval(day, { start: parseISO(booking.startDate), end: parseISO(booking.endDate) })
    );
  };

  const dayHeaderFormat = isMobile ? 'EEEEE' : 'EEE';
  const dayNumberFormat = 'd';

  return (
    <div className="overflow-hidden bg-white dark:bg-card-dark shadow-md sm:rounded-lg border border-gray-200 dark:border-border-dark">
      <table className="w-full table-fixed border-collapse">
        <thead className="bg-gray-50 dark:bg-background-dark sticky top-0 z-10">
          <tr>
            <th scope="col" className="px-2 md:px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-background-dark z-20 w-[90px] sm:w-[120px] lg:w-[180px]">
              Chalet
            </th>
            {daysInMonth.map(day => {
              const dayOfWeek = getDay(day);
              const isWeekend = dayOfWeek === 6 || dayOfWeek === 0; // Saturday or Sunday
              return (
                <th key={day.toString()} scope="col" className={cn(
                  "py-2 md:py-3 text-center font-medium text-gray-500 dark:text-gray-400 uppercase",
                  isWeekend ? 'bg-gray-100 dark:bg-black/10' : ''
                )}>
                  <div className="flex flex-col items-center text-[10px] md:text-xs leading-tight">
                    <span className={isWeekend ? 'text-primary' : ''}>{format(day, dayHeaderFormat, { locale: fr })}</span>
                    <span className={cn(
                        "mt-1 text-base",
                         searchedDate && isSameDay(day, searchedDate) ? "text-primary font-bold" : "text-gray-700 dark:text-gray-300"
                    )}>{format(day, dayNumberFormat, { locale: fr })}</span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-card-dark divide-y divide-gray-200 dark:divide-border-dark">
          {chalets.map(chalet => (
            <tr key={chalet.id}>
              <td className="px-2 md:px-3 py-2 text-xs md:text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-card-dark z-10 border-r border-gray-200 dark:border-border-dark whitespace-normal break-words">
                {chalet.name}
              </td>
              {daysInMonth.map(day => {
                const booking = getBookingForDay(chalet.id, day);
                const isSearched = searchedDate && isSameDay(day, searchedDate);
                const dayOfWeek = getDay(day);
                const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;
                
                return (
                  <td key={day.toString()} className={cn(
                    "h-8 md:h-10 text-center text-sm border-l border-gray-200 dark:border-border-dark",
                    booking ? statusColors[booking.status] : (isWeekend ? 'bg-gray-50 dark:bg-black/10' : 'bg-transparent'),
                    isSearched ? 'ring-2 ring-inset ring-primary dark:ring-offset-background-dark' : '',
                    'relative'
                  )}>
                    {booking && <span className="sr-only">{booking.name}</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AvailabilityGrid;