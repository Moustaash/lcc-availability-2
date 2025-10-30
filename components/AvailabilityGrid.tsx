import React from 'react';
import { Chalet, Booking, BookingStatus } from '../lib/types';
// FIX: The barrel imports from 'date-fns' and 'date-fns/locale' were causing resolution errors. Switched to direct sub-path imports for functions and locales to resolve the issue.
import format from 'date-fns/format';
import endOfMonth from 'date-fns/endOfMonth';
import startOfMonth from 'date-fns/startOfMonth';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import isWithinInterval from 'date-fns/isWithinInterval';
import parseISO from 'date-fns/parseISO';
import fr from 'date-fns/locale/fr';
import { cn } from '../lib/utils';

interface AvailabilityGridProps {
  chalets: Chalet[];
  bookings: Booking[];
  currentDate: Date;
}

const getBookingForDay = (day: Date, bookings: Booking[], chaletId: string): Booking | undefined => {
  return bookings.find(booking => 
    booking.chaletId === chaletId &&
    isWithinInterval(day, { start: parseISO(booking.startDate), end: parseISO(booking.endDate) })
  );
};

const statusColors: Record<BookingStatus, string> = {
  [BookingStatus.CONFIRMED]: 'bg-status-confirmed',
  [BookingStatus.OPTION]: 'bg-status-option',
  [BookingStatus.BLOCKED]: 'bg-status-blocked',
};

const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({ chalets, bookings, currentDate }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  if (chalets.length === 0) {
    return (
        <div className="text-center py-10 bg-white dark:bg-card-dark rounded-lg shadow">
            <p>Sélectionnez un ou plusieurs chalets pour afficher les disponibilités.</p>
        </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-card-dark rounded-lg shadow">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-border-dark">
            <th className="sticky left-0 bg-white dark:bg-card-dark p-2 text-left text-sm font-semibold w-40 z-10">Chalet</th>
            {days.map(day => (
              <th key={day.toISOString()} className="p-2 text-center text-xs font-normal min-w-[40px]">
                <div className="flex flex-col items-center">
                    <span>{format(day, 'E', { locale: fr })}</span>
                    <span className="text-lg font-semibold">{format(day, 'd')}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chalets.map(chalet => (
            <tr key={chalet.id} className="border-b border-gray-200 dark:border-border-dark last:border-b-0">
              <td className="sticky left-0 bg-white dark:bg-card-dark p-2 text-sm font-semibold w-40 z-10">{chalet.name}</td>
              {days.map(day => {
                const booking = getBookingForDay(day, bookings, chalet.id);
                const isSaturday = format(day, 'E', { locale: fr }) === 'sam.';

                return (
                  <td 
                    key={day.toISOString()} 
                    className={cn(
                        "h-12 text-center border-l border-gray-200 dark:border-border-dark", 
                        booking ? statusColors[booking.status] : 'bg-green-100 dark:bg-green-900/20',
                        isSaturday && "border-r-2 border-r-gray-300 dark:border-r-gray-600"
                    )}
                    title={booking?.name || 'Disponible'}
                  >
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