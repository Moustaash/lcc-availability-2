
import React, { useEffect, useRef, useMemo } from 'react';
import { Chalet, Booking, BookingStatus } from '../lib/types';
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfMonth,
  isToday,
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

// Helper functions
const getBookingForDay = (day: Date, bookings: Booking[], chaletId: string): Booking | undefined => {
  const dayBookings = bookings.filter(booking => 
    booking.chaletId === chaletId &&
    isWithinInterval(day, { start: parseISO(booking.startDate), end: parseISO(booking.endDate) })
  );

  if (dayBookings.length === 0) return undefined;
  
  // Priority logic
  if (dayBookings.some(b => b.status === BookingStatus.BLOCKED)) return dayBookings.find(b => b.status === BookingStatus.BLOCKED);
  if (dayBookings.some(b => b.status === BookingStatus.OPTION)) return dayBookings.find(b => b.status === BookingStatus.OPTION);
  if (dayBookings.some(b => b.status === BookingStatus.CONFIRMED)) return dayBookings.find(b => b.status === BookingStatus.CONFIRMED);
  return dayBookings.find(b => b.status === BookingStatus.FREE);
};

const getStatusColor = (status: BookingStatus, isBackground = true) => {
    switch (status) {
        case BookingStatus.CONFIRMED: return isBackground ? 'bg-status-confirmed' : 'text-status-confirmed';
        case BookingStatus.OPTION: return isBackground ? 'bg-status-option' : 'text-status-option';
        case BookingStatus.BLOCKED: return isBackground ? 'bg-status-blocked' : 'text-status-blocked';
        case BookingStatus.FREE: return isBackground ? 'bg-emerald-500' : 'text-emerald-600 dark:text-emerald-400';
        default: return '';
    }
};

const ChaletCard: React.FC<{
    chalet: Chalet;
    days: Date[];
    bookings: Booking[];
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
}> = ({ chalet, days, bookings, selectedDate, onDateSelect }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to selected date on mount or change
    useEffect(() => {
        if (scrollRef.current && selectedDate) {
            const selectedDayIndex = days.findIndex(d => isSameDay(d, selectedDate));
            if (selectedDayIndex !== -1) {
                const cardWidth = 48; // approximate width of a day cell
                const scrollPos = (selectedDayIndex * cardWidth) - (scrollRef.current.clientWidth / 2) + (cardWidth / 2);
                scrollRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
            }
        }
    }, [selectedDate, days]);

    // Get info for the MAIN displayed status (header)
    const displayDate = selectedDate || new Date();
    const currentBooking = getBookingForDay(displayDate, bookings, chalet.id);
    
    let statusText = "Disponible";
    let statusColorClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    let priceDisplay = null;
    let opacityClass = "opacity-100";

    if (currentBooking) {
        if (currentBooking.status === BookingStatus.FREE) {
            statusText = "Disponible";
             statusColorClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
            if (currentBooking.price) {
                priceDisplay = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(currentBooking.price);
            }
        } else {
            statusText = currentBooking.name;
            opacityClass = "opacity-80 grayscale-[0.3]"; // Slightly fade out unavailable items
            if (currentBooking.status === BookingStatus.CONFIRMED) statusColorClass = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
            if (currentBooking.status === BookingStatus.OPTION) statusColorClass = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
            if (currentBooking.status === BookingStatus.BLOCKED) statusColorClass = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
        }
    } else {
        // Fallback if date is out of range or data missing
        statusText = "-";
        statusColorClass = "bg-secondary text-muted-foreground";
        opacityClass = "opacity-60";
    }

    return (
        <div className={cn("bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col transition-all duration-500 ease-in-out", opacityClass)}>
            {/* Header Section */}
            <div className="p-4 flex gap-4 items-start">
                <div className="w-20 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden border border-border/50 shadow-inner">
                     <img src={chalet.imageUrl} alt={chalet.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-base truncate leading-tight mb-1.5">{chalet.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border", statusColorClass)}>
                            {statusText}
                        </div>
                        {priceDisplay && (
                            <div className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {priceDisplay}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Timeline Strip */}
            <div className="border-t bg-muted/10">
                <div 
                    ref={scrollRef}
                    className="flex overflow-x-auto no-scrollbar py-2 px-4 gap-[2px] snap-x snap-mandatory"
                >
                    {days.map((day) => {
                        const booking = getBookingForDay(day, bookings, chalet.id);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isTodayDate = isToday(day);
                        
                        // Visual connection logic (Gantt pills)
                        let barClass = "bg-border/30"; // Default empty
                        let roundedClass = "rounded-md"; // Default standalone
                        
                        if (booking) {
                            barClass = getStatusColor(booking.status);
                            const isStart = isSameDay(day, parseISO(booking.startDate));
                            const isEnd = isSameDay(day, parseISO(booking.endDate));
                            
                            if (isStart && isEnd) roundedClass = "rounded-md";
                            else if (isStart) roundedClass = "rounded-l-md";
                            else if (isEnd) roundedClass = "rounded-r-md";
                            else roundedClass = "rounded-none";
                        }

                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => onDateSelect(day)}
                                className={cn(
                                    "flex-shrink-0 w-[42px] flex flex-col items-center gap-1 snap-center group relative py-1 rounded-lg transition-all",
                                    isSelected ? "bg-accent shadow-sm ring-1 ring-primary/20" : "hover:bg-muted/50"
                                )}
                            >
                                <span className={cn(
                                    "text-[9px] font-medium uppercase",
                                    isTodayDate ? "text-primary font-bold" : "text-muted-foreground"
                                )}>
                                    {format(day, 'EE', { locale: fr }).slice(0, 2)}
                                </span>
                                <span className={cn(
                                    "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                                    isSelected ? "bg-foreground text-background" : "text-foreground",
                                    isTodayDate && !isSelected && "bg-primary/10 text-primary"
                                )}>
                                    {format(day, 'd')}
                                </span>
                                
                                {/* Gantt Bar Segment */}
                                <div className="w-full h-1.5 px-[1px] mt-0.5">
                                    <div className={cn("w-full h-full transition-all", barClass, roundedClass)}></div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const MobileCalendarView: React.FC<MobileCalendarViewProps> = ({ chalets, bookings, currentDate, selectedDate, onDateSelect }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Default to today or start of month if no date selected
  const activeDate = selectedDate || (isWithinInterval(new Date(), { start: monthStart, end: monthEnd }) ? new Date() : monthStart);

  // SORTING LOGIC: Available first, then by name
  const sortedChalets = useMemo(() => {
    return [...chalets].sort((a, b) => {
      const bookingA = getBookingForDay(activeDate, bookings, a.id);
      const bookingB = getBookingForDay(activeDate, bookings, b.id);

      // Priority Weights:
      // 0: Available (FREE) - Top priority
      // 1: Option
      // 2: Booked/Blocked
      // 3: Unknown/Other

      const getWeight = (booking: Booking | undefined) => {
        if (!booking) return 3; // Unknown
        if (booking.status === BookingStatus.FREE) return 0;
        if (booking.status === BookingStatus.OPTION) return 1;
        return 2;
      };

      const weightA = getWeight(bookingA);
      const weightB = getWeight(bookingB);

      if (weightA !== weightB) {
        return weightA - weightB;
      }
      return a.name.localeCompare(b.name);
    });
  }, [chalets, bookings, activeDate]);

  // Count available chalets
  const availableCount = sortedChalets.filter(c => {
      const b = getBookingForDay(activeDate, bookings, c.id);
      return b && b.status === BookingStatus.FREE;
  }).length;


  if (chalets.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center opacity-60">
            <span className="material-symbols-outlined text-4xl mb-2">filter_list_off</span>
            <p>Aucun chalet affiché.</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-12">
        {/* Sticky Info Bar */}
        <div className="sticky top-[64px] z-30 -mx-4 px-6 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/40 shadow-sm flex items-center justify-between transition-all">
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">event</span>
                <span className="text-sm font-bold capitalize text-foreground">
                    {format(activeDate, 'd MMMM', { locale: fr })}
                </span>
            </div>
            
            <div className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-colors",
                availableCount > 0 
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800" 
                    : "bg-secondary text-muted-foreground border-transparent"
            )}>
                {availableCount > 0 ? (
                    <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {availableCount} dispo{availableCount > 1 ? 's' : ''}
                    </>
                ) : (
                    <span>Complet</span>
                )}
            </div>
        </div>

        {/* Cards List */}
        <div className="flex flex-col gap-3">
            {sortedChalets.map((chalet, index) => {
                // Optional: Add a visual break if transitioning from Available to Booked
                const currentBooking = getBookingForDay(activeDate, bookings, chalet.id);
                const isAvailable = currentBooking?.status === BookingStatus.FREE;
                
                // Check previous item to see if we need a separator
                let showSeparator = false;
                if (index > 0) {
                    const prevBooking = getBookingForDay(activeDate, bookings, sortedChalets[index-1].id);
                    const prevAvailable = prevBooking?.status === BookingStatus.FREE;
                    if (prevAvailable && !isAvailable) showSeparator = true;
                }

                return (
                    <React.Fragment key={chalet.id}>
                        {showSeparator && (
                            <div className="flex items-center gap-2 py-2 opacity-50">
                                <div className="h-px flex-grow bg-border"></div>
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Autres</span>
                                <div className="h-px flex-grow bg-border"></div>
                            </div>
                        )}
                        <ChaletCard 
                            chalet={chalet} 
                            days={days} 
                            bookings={bookings} 
                            selectedDate={activeDate}
                            onDateSelect={onDateSelect}
                        />
                    </React.Fragment>
                );
            })}
        </div>
    </div>
  );
};

export default MobileCalendarView;
