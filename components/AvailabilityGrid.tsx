import React from 'react';
import { Chalet, Booking, BookingStatus } from '../lib/types';
// FIX: Switched to date-fns named imports to resolve module loading errors.
import {
  format,
  endOfMonth,
  startOfMonth,
  eachDayOfInterval,
  isWithinInterval,
  parseISO,
  isSameDay,
} from 'date-fns';
import fr from 'date-fns/locale/fr';
import { cn } from '../lib/utils';

interface AvailabilityGridProps {
  chalets: Chalet[];
  bookings: Booking[];
  currentDate: Date;
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
}

const getBookingForDay = (day: Date, bookings: Booking[], chaletId: string): Booking | undefined => {
  return bookings.find(booking => 
    booking.chaletId === chaletId &&
    isWithinInterval(day, { start: parseISO(booking.startDate), end: parseISO(booking.endDate) })
  );
};

const getStatusForDay = (day: Date, bookings: Booking[], chaletId: string): { text: string; color: string } => {
  const booking = getBookingForDay(day, bookings, chaletId);
  if (booking) {
    switch (booking.status) {
      case BookingStatus.CONFIRMED:
        return { text: 'Réservé', color: 'text-status-confirmed' };
      case BookingStatus.OPTION:
        return { text: 'Option', color: 'text-status-option' };
      case BookingStatus.BLOCKED:
        return { text: 'Propriétaire', color: 'text-status-blocked' };
    }
  }
  return { text: 'Disponible', color: 'text-green-500' };
};

const statusColors: Record<BookingStatus, string> = {
  [BookingStatus.CONFIRMED]: 'bg-status-confirmed',
  [BookingStatus.OPTION]: 'bg-status-option',
  [BookingStatus.BLOCKED]: 'bg-status-blocked',
};

const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({ chalets, bookings, currentDate, selectedDate, onDateSelect }) => {
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
    <div className="overflow-hidden bg-white dark:bg-card-dark rounded-lg shadow">
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="border-b border-gray-200 dark:border-border-dark">
            <th className="sticky left-0 bg-white dark:bg-card-dark p-2 text-left text-sm font-semibold w-40 z-10">Chalet</th>
            {days.map(day => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              return (
                <th key={day.toISOString()} className={cn(
                  "p-2 text-center text-xs font-normal transition-colors",
                  isSelected && "bg-primary/10 dark:bg-primary/20"
                )}>
                  <div className="flex flex-col items-center">
                      <span>{format(day, 'E', { locale: fr })}</span>
                      <span className="text-lg font-semibold">{format(day, 'd')}</span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {chalets.map(chalet => {
            const statusInfo = selectedDate ? getStatusForDay(selectedDate, bookings, chalet.id) : null;
            return (
              <tr key={chalet.id} className="border-b border-gray-200 dark:border-border-dark last:border-b-0">
              <td className="sticky left-0 bg-white dark:bg-card-dark p-2 text-sm w-40 z-10">
                  <div className="font-semibold">{chalet.name}</div>
                  {statusInfo && (
                      <div className={cn("text-xs font-medium", statusInfo.color)}>
                          {statusInfo.text}
                      </div>
                  )}
              </td>
              {days.map(day => {
                const booking = getBookingForDay(day, bookings, chalet.id);
                const isSaturday = format(day, 'E', { locale: fr }) === 'sam.';
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <td 
                    key={day.toISOString()} 
                    onClick={() => onDateSelect(isSelected ? null : day)}
                    className={cn(
                        "h-12 text-center border-l border-gray-200 dark:border-border-dark cursor-pointer transition-colors", 
                        booking ? statusColors[booking.status] : 'bg-green-100 dark:bg-green-900/20',
                        !booking && 'hover:bg-green-200 dark:hover:bg-green-900/40',
                        isSaturday && "border-r-2 border-r-gray-300 dark:border-r-gray-600",
                        isSelected && "bg-primary/10 dark:bg-primary/20"
                    )}
                    title={booking?.name || 'Disponible'}
                  >
                  </td>
                );
              })}
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AvailabilityGrid;