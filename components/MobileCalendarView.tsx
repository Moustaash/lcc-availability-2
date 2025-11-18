import React from 'react';
import { Chalet, Booking, BookingStatus } from '../lib/types';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../lib/utils';

interface MobileCalendarViewProps {
  chalets: Chalet[];
  bookings: Booking[];
  currentDate: Date;
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
}

const getBookingForDay = (day: Date, bookings: Booking[], chaletId: string): Booking | undefined => {
  const dayBookings = bookings.filter(booking => 
    booking.chaletId === chaletId &&
    isWithinInterval(day, { start: parseISO(booking.startDate), end: parseISO(booking.endDate) })
  );

  if (dayBookings.length === 0) return undefined;
  if (dayBookings.length === 1) return dayBookings[0];

  if (dayBookings.some(b => b.status === BookingStatus.BLOCKED)) {
    return dayBookings.find(b => b.status === BookingStatus.BLOCKED);
  }
  if (dayBookings.some(b => b.status === BookingStatus.OPTION)) {
    return dayBookings.find(b => b.status === BookingStatus.OPTION);
  }
  if (dayBookings.some(b => b.status === BookingStatus.CONFIRMED)) {
    return dayBookings.find(b => b.status === BookingStatus.CONFIRMED);
  }
  
  return dayBookings.find(b => b.status === BookingStatus.FREE);
};

const statusColors: Record<BookingStatus, string> = {
  [BookingStatus.CONFIRMED]: 'bg-status-confirmed',
  [BookingStatus.OPTION]: 'bg-status-option',
  [BookingStatus.BLOCKED]: 'bg-status-blocked',
  [BookingStatus.FREE]: 'bg-green-500',
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
          return { text: 'Disponible', color: 'text-green-600 dark:text-green-400', price: booking.price };
      }
    }
    return null;
  };

const MobileCalendarView: React.FC<MobileCalendarViewProps> = ({ chalets, bookings, currentDate, selectedDate, onDateSelect }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const daysOfWeek = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];
  const MAX_DOTS_DISPLAY = 5;
  
  if (chalets.length === 0) {
    return (
        <div className="text-center py-10 bg-card rounded-xl border border-dashed">
            <p className="text-muted-foreground">Aucun chalet sélectionné.</p>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-2">
        <div className="grid grid-cols-7 text-center text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
          {daysOfWeek.map(day => <div key={day} className="py-2">{day}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-px bg-border/30 rounded-lg overflow-hidden">
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTodaysDate = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            const dayBookings = chalets.map(chalet => {
              return getBookingForDay(day, bookings, chalet.id);
            }).filter((b): b is Booking => !!b && b.status !== BookingStatus.FREE);

            const dotsToShow = dayBookings.slice(0, MAX_DOTS_DISPLAY);
            const remainingCount = dayBookings.length - MAX_DOTS_DISPLAY;

            return (
              <div
                key={day.toISOString()}
                onClick={() => onDateSelect(isSelected ? null : day)}
                className={cn(
                  "bg-card relative flex flex-col items-center justify-start h-16 cursor-pointer transition-all active:scale-95",
                  !isCurrentMonth && "bg-muted/30 text-muted-foreground/50",
                  isSelected && "bg-primary/5 z-10"
                )}
              >
                <span className={cn(
                  "mt-1 w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium transition-all",
                  isTodaysDate && !isSelected && "bg-accent text-accent-foreground",
                  isSelected && "bg-primary text-primary-foreground shadow-md scale-110"
                )}>
                  {format(day, 'd')}
                </span>
                <div className="flex-grow w-full mt-1 px-1 overflow-hidden">
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {dotsToShow.map((booking) => (
                      <div 
                        key={booking.id} 
                        className={cn("w-1.5 h-1.5 rounded-full", statusColors[booking.status])}
                      ></div>
                    ))}
                    {remainingCount > 0 && (
                      <div className="text-[9px] leading-none text-muted-foreground">
                        +
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
        <div className="bg-card text-card-foreground rounded-xl border shadow-lg p-4 animate-slide-up">
          <h3 className="font-bold text-lg mb-4 pb-2 border-b flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">event</span>
            {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
          </h3>
          <ul className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {chalets.map(chalet => {
              const status = getStatusForDay(selectedDate, bookings, chalet.id);
              if (!status) return null;
              return (
                <li key={chalet.id} className="flex justify-between items-center text-sm group p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-8 rounded overflow-hidden bg-muted">
                        <img src={chalet.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-semibold">{chalet.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={cn("font-bold text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent", status.color)}>
                        {status.text}
                    </span>
                    {status.price && (
                        <span className="text-xs font-mono text-muted-foreground mt-0.5">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(status.price)}
                        </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default MobileCalendarView;