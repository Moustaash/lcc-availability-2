import React, { useMemo } from 'react';
// FIX: Consolidate date-fns imports to resolve module resolution errors.
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  getDate,
  subDays,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { Property, Booking, BookingStatus } from '../lib/types';
import { cn } from '../lib/utils';

interface AvailabilityGridProps {
  bookings: Map<string, Booking[]>;
  properties: Property[];
  currentDate: Date;
  searchedDate: Date | null;
}

const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({
  bookings,
  properties,
  currentDate,
  searchedDate,
}) => {
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getBookingStatusForDate = (propertySlug: string, date: Date): BookingStatus | null => {
    const propertyBookings = bookings.get(propertySlug);
    if (!propertyBookings) return null;

    for (const booking of propertyBookings) {
      // Booking end date is the checkout day, so it's not included in the stay.
      if (isWithinInterval(date, { start: booking.start, end: subDays(booking.end, 1) })) {
        return booking.status;
      }
    }
    return null;
  };

  const statusColors: Record<BookingStatus, string> = {
    [BookingStatus.CONFIRMED]: 'bg-status-confirmed',
    [BookingStatus.OPTION]: 'bg-status-option',
    [BookingStatus.BLOCKED]: 'bg-status-blocked',
  };
  
  const statusText: Record<BookingStatus, string> = {
    [BookingStatus.CONFIRMED]: 'Réservé',
    [BookingStatus.OPTION]: 'Option',
    [BookingStatus.BLOCKED]: 'Propriétaire',
  };

  if (properties.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        Aucun chalet ne correspond à votre recherche.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto relative">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
          <tr>
            <th className="p-2 border-r border-gray-200 dark:border-border-dark text-left text-sm font-semibold text-gray-600 dark:text-gray-300 w-48 min-w-[12rem] sticky left-0 bg-gray-50 dark:bg-gray-800 z-20">
              Chalet
            </th>
            {daysInMonth.map(day => (
              <th key={day.toString()} className={cn(
                "p-2 border-r border-gray-200 dark:border-border-dark text-center text-sm font-medium w-12",
                isSameDay(day, new Date()) && "text-primary dark:text-blue-400",
                searchedDate && isSameDay(day, searchedDate) && "bg-primary/20"
              )}>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{format(day, 'eee', { locale: fr })}</span>
                  <span>{getDate(day)}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property.slug} className="border-t border-gray-200 dark:border-border-dark even:bg-gray-50/50 dark:even:bg-white/5">
              <td className="p-2 border-r border-gray-200 dark:border-border-dark sticky left-0 bg-white dark:bg-card-dark even:bg-gray-50/50 dark:even:bg-white/5 flex items-center gap-3 z-10">
                <img src={property.imageUrl} alt={property.name} className="w-8 h-8 rounded-full object-cover" />
                <span className="font-medium text-gray-800 dark:text-text-dark text-sm">{property.name}</span>
              </td>
              {daysInMonth.map(day => {
                const status = getBookingStatusForDate(property.slug, day);
                return (
                  <td key={day.toString()} title={status ? statusText[status] : 'Disponible'} className={cn(
                    "p-2 border-r border-gray-200 dark:border-border-dark text-center h-14 transition-colors",
                    status ? statusColors[status] : 'hover:bg-green-100 dark:hover:bg-green-900/50 cursor-pointer',
                    searchedDate && isSameDay(day, searchedDate) && "ring-2 ring-primary ring-inset"
                  )}>
                    <div className="w-full h-full"></div>
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
