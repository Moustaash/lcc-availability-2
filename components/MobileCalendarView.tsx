import React from 'react';
import { Chalet, Booking, BookingStatus } from '../lib/types';
// FIX: Use sub-path imports for date-fns to resolve module errors.
import format from 'date-fns/format';
import endOfMonth from 'date-fns/endOfMonth';
import startOfMonth from 'date-fns/startOfMonth';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import isWithinInterval from 'date-fns/isWithinInterval';
import parseISO from 'date-fns/parseISO';
import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import isSameMonth from 'date-fns/isSameMonth';
import isToday from 'date-fns/isToday';
import fr from 'date-fns/locale/fr';
import { cn } from '../lib/utils';

interface MobileCalendarViewProps {
  chalets: Chalet[];
  bookings: Booking[];
  currentDate: Date;
}

const getBookingForDay = (day: Date, bookings: Booking[], chaletId: string): Booking | undefined => {
  // Find the highest priority booking for a given day.
  // Priority: CONFIRMED > OPTION > BLOCKED
  const dayBookings = bookings.filter(booking => 
    booking.chaletId === chaletId &&
    isWithinInterval(day, { start: parseISO(booking.startDate), end: parseISO(booking.endDate) })
  );

  if (dayBookings.length === 0) return undefined;
  if (dayBookings.length === 1) return dayBookings[0];

  if (dayBookings.some(b => b.status === BookingStatus.CONFIRMED)) {
    return dayBookings.find(b => b.status === BookingStatus.CONFIRMED);
  }
  if (dayBookings.some(b => b.status === BookingStatus.OPTION)) {
    return dayBookings.find(b => b.status === BookingStatus.OPTION);
  }
  return dayBookings.find(b => b.status === BookingStatus.BLOCKED);
};

const statusColors: Record<BookingStatus, string> = {
  [BookingStatus.CONFIRMED]: 'bg-status-confirmed',
  [BookingStatus.OPTION]: 'bg-status-option',
  [BookingStatus.BLOCKED]: 'bg-status-blocked',
};

const MobileCalendarView: React.FC<MobileCalendarViewProps> = ({ chalets, bookings, currentDate }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start to match image
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const daysOfWeek = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];
  const MAX_DOTS_DISPLAY = 5;
  
  if (chalets.length === 0) {
    return (
        <div className="text-center py-10 bg-white dark:bg-card-dark rounded-lg shadow">
            <p>Sélectionnez un ou plusieurs chalets pour afficher les disponibilités.</p>
        </div>
    );
  }

  return (
    <div className="bg-white dark:bg-card-dark rounded-lg shadow p-2 sm:p-4">
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
        {daysOfWeek.map(day => <div key={day} className="py-2">{day}</div>)}
      </div>

      <div className="grid grid-cols-7 border-t border-l border-gray-200 dark:border-border-dark">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodaysDate = isToday(day);

          const dayBookings = chalets.map(chalet => {
             return getBookingForDay(day, bookings, chalet.id);
          }).filter((b): b is Booking => !!b);

          const dotsToShow = dayBookings.slice(0, MAX_DOTS_DISPLAY);
          const remainingCount = dayBookings.length - MAX_DOTS_DISPLAY;

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "py-1 text-center border-r border-b border-gray-200 dark:border-border-dark flex flex-col items-center justify-start h-20",
                !isCurrentMonth && "text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-card-dark/50",
              )}
            >
              <span className={cn(
                "w-6 h-6 flex items-center justify-center rounded-full text-sm",
                isTodaysDate && "bg-primary text-white font-bold"
              )}>
                {format(day, 'd')}
              </span>
              <div className="flex-grow w-full mt-1 px-1 overflow-hidden">
                <div className="flex flex-wrap gap-1 justify-center">
                   {dotsToShow.map((booking) => (
                    <div 
                      key={booking.id} 
                      className={cn("w-2 h-2 rounded-full", statusColors[booking.status])}
                      title={booking.name}
                    ></div>
                  ))}
                  {remainingCount > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{remainingCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileCalendarView;