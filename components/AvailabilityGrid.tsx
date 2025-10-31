import React, { useState } from 'react';
import { Chalet, Booking, BookingStatus } from '../lib/types';
// FIX: Changed date-fns imports to use direct paths for functions and locales to resolve module resolution errors.
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import endOfMonth from 'date-fns/endOfMonth';
import format from 'date-fns/format';
import isSameDay from 'date-fns/isSameDay';
import isWithinInterval from 'date-fns/isWithinInterval';
import parseISO from 'date-fns/parseISO';
import startOfMonth from 'date-fns/startOfMonth';
import fr from 'date-fns/locale/fr';
import { cn } from '../lib/utils';
import Tooltip from './Tooltip';

interface AvailabilityGridProps {
  chalets: Chalet[];
  bookings: Booking[];
  currentDate: Date;
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
}

const getBookingForDay = (day: Date, bookings: Booking[], chaletId: string): Booking | undefined => {
  // 1. Get ALL bookings for this day
  const dayBookings = bookings.filter(booking => 
    booking.chaletId === chaletId &&
    isWithinInterval(day, { start: parseISO(booking.startDate), end: parseISO(booking.endDate) })
  );

  if (dayBookings.length === 0) return undefined;
  if (dayBookings.length === 1) return dayBookings[0];

  // 2. Per the data specification, status priority for overlapping bookings is:
  //    BLOCKED > OPTION > CONFIRMED > FREE.
  if (dayBookings.some(b => b.status === BookingStatus.BLOCKED)) {
    return dayBookings.find(b => b.status === BookingStatus.BLOCKED);
  }
  if (dayBookings.some(b => b.status === BookingStatus.OPTION)) {
    return dayBookings.find(b => b.status === BookingStatus.OPTION);
  }
  if (dayBookings.some(b => b.status === BookingStatus.CONFIRMED)) {
    return dayBookings.find(b => b.status === BookingStatus.CONFIRMED);
  }
  
  // 3. Return 'Free' as the last resort
  return dayBookings.find(b => b.status === BookingStatus.FREE);
};

const getStatusForDay = (day: Date, bookings: Booking[], chaletId: string): { text: string; color: string; price?: number } | null => {
  const booking = getBookingForDay(day, bookings, chaletId);
  if (booking) {
    switch (booking.status) {
      case BookingStatus.CONFIRMED:
        return { text: 'Réservé', color: 'text-status-confirmed' };
      case BookingStatus.OPTION:
        return { text: 'Option', color: 'text-status-option' };
      case BookingStatus.BLOCKED:
        return { text: 'Propriétaire', color: 'text-status-blocked' };
      case BookingStatus.FREE:
        return { text: 'Disponible', color: 'text-green-500', price: booking.price };
    }
  }
  return null;
};

const statusColors: Record<BookingStatus, string> = {
  [BookingStatus.CONFIRMED]: 'bg-status-confirmed',
  [BookingStatus.OPTION]: 'bg-status-option',
  [BookingStatus.BLOCKED]: 'bg-status-blocked',
  [BookingStatus.FREE]: 'bg-gray-50 dark:bg-gray-800/50', // Fallback, will be replaced by heatmap
};

const statusHexColors: Record<string, string> = {
  [BookingStatus.CONFIRMED]: '#3b82f6',
  [BookingStatus.OPTION]: '#f59e0b',
  [BookingStatus.BLOCKED]: '#6b7280',
};

const getPriceHeatmapClass = (price: number | undefined): string => {
  // If price is not a number, it's "Available" (without a price).
  // Use the base color from the legend (lightest green).
  if (typeof price !== 'number') return 'bg-green-100 dark:bg-green-900'; 
  
  // The rest of the heatmap logic
  if (price < 5000) return 'bg-green-300 dark:bg-green-700';
  if (price < 10000) return 'bg-green-200 dark:bg-green-800';
  return 'bg-green-100 dark:bg-green-900';
};

const getTransitionStyle = (booking: Booking, day: Date): React.CSSProperties => {
  if (!booking || booking.status === BookingStatus.FREE) return {};

  const isStartDate = isSameDay(day, parseISO(booking.startDate));
  const isEndDate = isSameDay(day, parseISO(booking.endDate));

  if (isStartDate && isEndDate) return {}; // Don't apply for single-day bookings

  const color = statusHexColors[booking.status];
  if (!color) return {};

  if (isStartDate) {
    return { backgroundImage: `linear-gradient(to right, transparent 30%, ${color})`};
  }
  if (isEndDate) {
    return { backgroundImage: `linear-gradient(to left, transparent 30%, ${color})`};
  }

  return {};
};

const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({ chalets, bookings, currentDate, selectedDate, onDateSelect }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: React.ReactNode;
    position: { x: number; y: number };
  }>({
    visible: false,
    content: null,
    position: { x: 0, y: 0 },
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltip.visible) {
      setTooltip(prev => ({ ...prev, position: { x: e.clientX, y: e.clientY } }));
    }
  };

  const showTooltip = (e: React.MouseEvent, booking: Booking) => {
    const priceInfo = booking.status === BookingStatus.FREE && booking.price ? (
      <div>
        <span className="font-semibold">Prix:</span> {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(booking.price)}
      </div>
    ) : null;

    const content = (
      <div className="flex flex-col gap-1 whitespace-nowrap">
        <div className="font-bold">{booking.name}</div>
        <div>
          <span className="font-semibold">Début:</span> {format(parseISO(booking.startDate), 'd MMMM yyyy', { locale: fr })}
        </div>
        <div>
          <span className="font-semibold">Fin:</span> {format(parseISO(booking.endDate), 'd MMMM yyyy', { locale: fr })}
        </div>
        {priceInfo}
      </div>
    );

    setTooltip({
      visible: true,
      content,
      position: { x: e.clientX, y: e.clientY },
    });
  };
  
  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  if (chalets.length === 0) {
    return (
        <div className="text-center py-10 bg-white dark:bg-card-dark rounded-lg shadow">
            <p>Sélectionnez un ou plusieurs chalets pour afficher les disponibilités.</p>
        </div>
    );
  }

  return (
    <>
      <Tooltip
        visible={tooltip.visible}
        content={tooltip.content}
        position={tooltip.position}
      />
      <div className="overflow-hidden bg-white dark:bg-card-dark rounded-lg shadow">
        <table className="w-full border-collapse table-fixed" onMouseMove={handleMouseMove}>
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
                        {statusInfo.price && (
                          <span className="ml-1 font-normal text-gray-600 dark:text-gray-400">
                            ({new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(statusInfo.price)})
                          </span>
                        )}
                      </div>
                    )}
                </td>
                {days.map(day => {
                  const booking = getBookingForDay(day, bookings, chalet.id);
                  const isSaturday = format(day, 'E', { locale: fr }) === 'sam.';
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  const cellBgClass = booking
                    ? booking.status === BookingStatus.FREE
                      ? getPriceHeatmapClass(booking.price)
                      : statusColors[booking.status]
                    : 'bg-gray-50 dark:bg-gray-800/50';

                  const transitionStyle = booking ? getTransitionStyle(booking, day) : {};

                  return (
                    <td 
                      key={day.toISOString()} 
                      onClick={() => onDateSelect(isSelected ? null : day)}
                      onMouseEnter={(e) => booking && showTooltip(e, booking)}
                      onMouseLeave={hideTooltip}
                      className={cn(
                          "h-12 text-center border-l border-gray-200 dark:border-border-dark cursor-pointer transition-colors relative", 
                          cellBgClass,
                          booking?.status === BookingStatus.FREE && 'hover:brightness-90',
                          isSaturday && "border-r-2 border-r-gray-300 dark:border-r-gray-600",
                          isSelected && "bg-primary/10 dark:bg-primary/20"
                      )}
                      style={transitionStyle}
                      title=""
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
    </>
  );
};

export default AvailabilityGrid;