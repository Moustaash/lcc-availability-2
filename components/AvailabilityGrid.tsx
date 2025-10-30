import React from 'react';
// FIX: Changed date-fns imports to use subpaths to resolve module resolution errors.
import differenceInDays from 'date-fns/differenceInDays';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import endOfMonth from 'date-fns/endOfMonth';
import format from 'date-fns/format';
import isAfter from 'date-fns/isAfter';
import isBefore from 'date-fns/isBefore';
import isSameDay from 'date-fns/isSameDay';
import isSaturday from 'date-fns/isSaturday';
import isSunday from 'date-fns/isSunday';
import startOfMonth from 'date-fns/startOfMonth';
import subDays from 'date-fns/subDays';
import fr from 'date-fns/locale/fr';
import { Booking, Property, BookingStatus } from '../lib/types';
import { cn } from '../lib/utils';

interface AvailabilityGridProps {
  bookings: Map<string, Booking[]>;
  properties: Property[];
  currentDate: Date;
  searchedDate: Date | null;
}

const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({ bookings, properties, currentDate, searchedDate }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const statusClasses: Record<BookingStatus, { background: string, text: string }> = {
    [BookingStatus.CONFIRMED]: { background: 'bg-status-confirmed', text: 'text-white' },
    [BookingStatus.OPTION]: { background: 'bg-status-option', text: 'text-white' },
    [BookingStatus.BLOCKED]: { background: 'bg-status-blocked', text: 'text-white' },
  };
  
  const statusLabels: Record<BookingStatus, string> = {
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
    <div className="relative mt-4">
      <div 
        className="grid gap-px bg-gray-200 dark:bg-border-dark border border-gray-200 dark:border-border-dark"
        style={{
          display: 'grid',
          gridTemplateColumns: `minmax(150px, 1fr) repeat(${days.length}, minmax(20px, 1fr))`,
          gridAutoRows: 'minmax(48px, auto)',
        }}
      >
        {/* ================= HEADER ================= */}
        <div style={{ gridRow: 1, gridColumn: 1 }} className="p-2 bg-gray-100 dark:bg-card-dark sticky top-0 left-0 z-30 font-semibold text-sm text-gray-600 dark:text-gray-300 flex items-center">Chalet</div>
        
        {days.map((day, index) => {
          const isWeekend = isSaturday(day) || isSunday(day);
          return (
            <div key={`header-${index}`} style={{ gridRow: 1, gridColumn: index + 2 }} className={cn(
              "p-1 text-center text-xs sm:text-sm font-medium sticky top-0 z-20",
              isSameDay(day, new Date()) 
                ? 'bg-primary text-white' 
                : isWeekend
                  ? 'bg-gray-200/60 dark:bg-white/10'
                  : 'bg-gray-100 dark:bg-card-dark'
            )}>
              <div className="text-gray-500 dark:text-gray-400">{format(day, 'EEEEE', { locale: fr })}</div>
              <div>{format(day, 'd')}</div>
            </div>
          )
        })}

        {/* ================= PROPERTY ROWS (Names and Background Cells) ================= */}
        {properties.map((property, pIndex) => (
          <React.Fragment key={property.slug}>
            {/* Property Name Cell */}
            <div style={{ gridRow: pIndex + 2, gridColumn: 1 }} className="p-2 bg-white dark:bg-card-dark sticky left-0 z-10 flex items-center gap-2">
              <img src={property.imageUrl} alt={property.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              <span className="text-sm font-medium truncate">{property.name}</span>
            </div>
            
            {/* Background Day Cells */}
            {days.map((day, dIndex) => {
              const isSearched = searchedDate && isSameDay(day, searchedDate);
              const isWeekend = isSaturday(day) || isSunday(day);
              return (
                <div 
                  key={`cell-${pIndex}-${dIndex}`}
                  style={{ gridRow: pIndex + 2, gridColumn: dIndex + 2 }}
                  className={cn(
                    "h-full w-full",
                    isWeekend ? 'bg-gray-50 dark:bg-white/5' : 'bg-white dark:bg-background-dark',
                    isSearched && 'ring-2 ring-offset-2 ring-primary dark:ring-offset-background-dark z-5 relative',
                  )}
                />
              );
            })}
          </React.Fragment>
        ))}

        {/* ================= BOOKING BARS (Overlay) ================= */}
        {properties.map((property, pIndex) => {
          const propertyBookings = bookings.get(property.slug) || [];
          const visibleBookings = propertyBookings.filter(b => 
            isBefore(b.start, monthEnd) && isAfter(b.end, monthStart)
          );

          return visibleBookings.map((booking, bIndex) => {
            const firstDay = isBefore(booking.start, monthStart) ? monthStart : booking.start;
            const lastDay = isAfter(booking.end, monthEnd) ? endOfMonth(monthEnd) : subDays(booking.end, 1);
            
            if (isAfter(firstDay, lastDay)) return null;

            const startCol = differenceInDays(firstDay, monthStart) + 2;
            const endCol = differenceInDays(lastDay, monthStart) + 3;
            
            const { background, text } = statusClasses[booking.status];
            
            const fullTitle = `[${statusLabels[booking.status]}] ${property.name}\nDu ${format(booking.start, 'dd/MM/yyyy')} au ${format(booking.end, 'dd/MM/yyyy')}`;

            return (
              <div
                key={`booking-${pIndex}-${bIndex}`}
                style={{
                  gridRow: pIndex + 2,
                  gridColumn: `${startCol} / ${endCol}`
                }}
                className={cn(
                  "h-[calc(100%-10px)] m-auto rounded-md flex items-center justify-start px-2 z-10 text-xs font-bold overflow-hidden transition-all duration-200 hover:opacity-80",
                   background, text
                )}
                title={fullTitle}
              >
                <span className="truncate">{statusLabels[booking.status]}</span>
              </div>
            )
          })
        })}
      </div>
    </div>
  );
};

export default AvailabilityGrid;