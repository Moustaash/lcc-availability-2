import React from 'react';
import { Chalet, Booking, BookingStatus } from '../lib/types';
// FIX: Import date-fns functions as named exports from the main 'date-fns' package to resolve call signature errors.
import {
  format,
  endOfMonth,
  startOfMonth,
  eachDayOfInterval,
  isWithinInterval,
  parseISO,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns';
import fr from 'date-fns/locale/fr';
import { cn } from '../lib/utils';

interface MobileCalendarViewProps {
  chalets: Chalet[];
  bookings: Booking[];
  currentDate: Date;
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
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

const MobileCalendarView: React.FC<MobileCalendarViewProps> = ({ chalets, bookings, currentDate, selectedDate, onDateSelect }) => {
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
    <>
      <div className="bg-white dark:bg-card-dark rounded-lg shadow p-2 sm:p-4">
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
          {daysOfWeek.map(day => <div key={day} className="py-2">{day}</div>)}
        </div>

        <div className="grid grid-cols-7 border-t border-l border-gray-200 dark:border-border-dark">
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTodaysDate = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            const dayBookings = chalets.map(chalet => {
              return getBookingForDay(day, bookings, chalet.id);
            }).filter((b): b is Booking => !!b);

            const dotsToShow = dayBookings.slice(0, MAX_DOTS_DISPLAY);
            const remainingCount = dayBookings.length - MAX_DOTS_DISPLAY;

            return (
              <div
                key={day.toISOString()}
                onClick={() => onDateSelect(isSelected ? null : day)}
                className={cn(
                  "py-1 text-center border-r border-b border-gray-200 dark:border-border-dark flex flex-col items-center justify-start h-20 cursor-pointer transition-all",
                  !isCurrentMonth && "text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-card-dark/50",
                  isSelected && "bg-primary/20 ring-2 ring-primary z-10 scale-105"
                )}
              >
                <span className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full text-sm transition-colors",
                  isTodaysDate && !isSelected && "bg-primary text-white font-bold",
                  isSelected && "bg-primary text-white font-bold"
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
      
      {selectedDate && (
        <div className="mt-4 bg-white dark:bg-card-dark rounded-lg shadow p-4 animate-fade-in-slow">
          <h3 className="font-bold text-lg mb-3">
            Statut du {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
          </h3>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {chalets.map(chalet => {
              const status = getStatusForDay(selectedDate, bookings, chalet.id);
              return (
                <li key={chalet.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium">{chalet.name}</span>
                  <span className={cn("font-semibold", status.color)}>{status.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <style>{`
        @keyframes fade-in-slow { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-slow { animation: fade-in-slow 0.4s ease-out; }
      `}</style>
    </>
  );
};

export default MobileCalendarView;