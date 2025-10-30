import React from 'react';
// FIX: Changed date-fns imports to use direct paths to fix module resolution errors for functions and locale.
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import format from 'date-fns/format';
import isWithinInterval from 'date-fns/isWithinInterval';
import isSameDay from 'date-fns/isSameDay';
import fr from 'date-fns/locale/fr';
import { Booking, Property, BookingStatus } from '../lib/types';
import { cn } from '../lib/utils';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface AvailabilityGridProps {
  bookings: Map<string, Booking[]>;
  properties: Property[];
  currentDate: Date;
  searchedDate: Date | null;
}

const getBookingForDay = (day: Date, propertyBookings: Booking[]): Booking | null => {
  if (!propertyBookings) return null;
  for (const booking of propertyBookings) {
    // isWithinInterval is [start, end) which is typical for bookings where end date is checkout.
    if (isWithinInterval(day, { start: booking.start, end: booking.end })) {
      return booking;
    }
  }
  return null;
};

const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({ bookings, properties, currentDate, searchedDate }) => {
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const statusColors: Record<BookingStatus, string> = {
    [BookingStatus.CONFIRMED]: 'bg-status-confirmed',
    [BookingStatus.OPTION]: 'bg-status-option',
    [BookingStatus.BLOCKED]: 'bg-status-blocked',
  };

  if (properties.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        Aucun chalet ne correspond à votre recherche.
      </div>
    );
  }
  
  const propertyColumnWidth = isSmallScreen ? '100px' : '180px';

  return (
    <div className="overflow-x-auto relative mt-4">
      <div 
        className="grid gap-px bg-gray-200 dark:bg-border-dark border border-gray-200 dark:border-border-dark" 
        style={{ gridTemplateColumns: `${propertyColumnWidth} repeat(${days.length}, minmax(0, 1fr))` }}
      >
        {/* Header Row: Property Name */}
        <div className="p-2 bg-gray-50 dark:bg-card-dark sticky left-0 z-20 font-semibold text-sm text-gray-600 dark:text-gray-300">Chalet</div>
        
        {/* Header Row: Days */}
        {days.map((day) => (
          <div key={day.toString()} className={cn(
            "p-1 text-center text-xs sm:text-sm font-medium",
            isSameDay(day, new Date()) ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-card-dark'
          )}>
            <div>{format(day, 'EEEEE', { locale: fr })}</div>
            <div>{format(day, 'd')}</div>
          </div>
        ))}

        {/* Property Rows */}
        {properties.map(property => {
          const propertyBookings = bookings.get(property.slug) || [];
          return (
            <React.Fragment key={property.slug}>
              {/* Property Name Cell */}
              <div className="p-2 bg-white dark:bg-card-dark sticky left-0 z-10 flex items-center gap-2 border-t border-gray-200 dark:border-border-dark">
                {!isSmallScreen && (
                  <img src={property.imageUrl} alt={property.name} className="w-8 h-8 rounded-full object-cover" />
                )}
                <span className="text-sm font-medium">{property.name}</span>
              </div>
              
              {/* Availability Cells */}
              {days.map(day => {
                const booking = getBookingForDay(day, propertyBookings);
                const status = booking?.status;
                const isSearched = searchedDate && isSameDay(day, searchedDate);

                return (
                  <div 
                    key={day.toString()} 
                    className={cn(
                      "h-full w-full min-h-[40px] border-t border-gray-200 dark:border-border-dark",
                      status ? statusColors[status] : 'bg-white dark:bg-background-dark',
                      isSearched && 'ring-2 ring-offset-2 ring-primary dark:ring-offset-background-dark z-10 relative',
                    )}
                    title={booking ? `Du ${format(booking.start, 'dd/MM/yyyy')} au ${format(booking.end, 'dd/MM/yyyy')}` : `${format(day, 'dd/MM/yyyy')} - Libre`}
                  >
                    <span className="sr-only">{format(day, 'PPPP', { locale: fr })} - {status || 'Libre'}</span>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default AvailabilityGrid;