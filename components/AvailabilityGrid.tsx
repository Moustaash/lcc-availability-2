import React, { useState } from 'react';
import { Chalet, Booking, BookingStatus } from '../lib/types';
import { eachDayOfInterval, endOfMonth, format, isSameDay, isWithinInterval, parseISO, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
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

const statusColors: Record<BookingStatus, string> = {
  [BookingStatus.CONFIRMED]: 'bg-status-confirmed shadow-sm border-status-confirmed/50',
  [BookingStatus.OPTION]: 'bg-status-option shadow-sm border-status-option/50',
  [BookingStatus.BLOCKED]: 'bg-status-blocked shadow-sm border-status-blocked/50',
  [BookingStatus.FREE]: 'bg-transparent', // Free is handled separately as heatmap
};

const getPriceHeatmapClass = (price: number | undefined): string => {
  if (typeof price !== 'number') return 'bg-emerald-50/50 dark:bg-emerald-900/10'; 
  if (price < 5000) return 'bg-emerald-100/60 dark:bg-emerald-800/20';
  if (price < 10000) return 'bg-emerald-200/60 dark:bg-emerald-700/30';
  return 'bg-emerald-50/50 dark:bg-emerald-900/10';
};

const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({ chalets, bookings, currentDate, selectedDate, onDateSelect }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [hoveredChaletId, setHoveredChaletId] = useState<string | null>(null);

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
      <div className="flex items-center justify-between gap-4 pt-2 mt-2 border-t border-border/50">
        <span className="text-muted-foreground text-xs">Prix</span> 
        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(booking.price)}
        </span>
      </div>
    ) : null;

    const content = (
      <div className="min-w-[180px]">
        <div className="flex items-center gap-2 mb-2">
            <span className={cn("w-2 h-2 rounded-full", 
                booking.status === BookingStatus.CONFIRMED ? "bg-status-confirmed" :
                booking.status === BookingStatus.OPTION ? "bg-status-option" :
                booking.status === BookingStatus.BLOCKED ? "bg-status-blocked" : "bg-emerald-500"
            )}></span>
            <span className="font-bold text-sm">{booking.name}</span>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
             <span>Du</span> 
             <span className="text-foreground font-medium">{format(parseISO(booking.startDate), 'd MMM', { locale: fr })}</span>
          </div>
          <div className="flex justify-between">
             <span>Au</span> 
             <span className="text-foreground font-medium">{format(parseISO(booking.endDate), 'd MMM', { locale: fr })}</span>
          </div>
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
        <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-dashed">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-muted-foreground">cottage</span>
            </div>
            <p className="text-muted-foreground font-medium">Aucun chalet sélectionné</p>
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
      <div key={currentDate.toISOString()} className="rounded-xl border bg-card shadow-sm overflow-hidden animate-slide-in">
        <div className="overflow-x-auto">
            <table 
            className="w-full table-fixed border-collapse" 
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
                setHoveredDate(null);
                setHoveredChaletId(null);
            }}
            >
            <thead>
                <tr>
                <th className="sticky left-0 top-0 bg-card z-30 w-48 p-3 text-left border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_12px_-4px_rgba(0,0,0,0.3)]">
                    Chalet
                </th>
                {days.map(day => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isHovered = hoveredDate && isSameDay(day, hoveredDate);
                    const isToday = isSameDay(day, new Date());
                    const isWeekend = [0, 6].includes(day.getDay());

                    return (
                    <th key={day.toISOString()} className={cn(
                        "p-1 text-center border-b min-w-[40px] transition-colors relative group",
                        isHovered && !isSelected && "bg-muted/30",
                        isSelected && "bg-primary/5"
                    )}>
                        <div className="flex flex-col items-center justify-center py-2 gap-1">
                            <span className={cn(
                                "text-[10px] font-medium uppercase",
                                isWeekend ? "text-red-400" : "text-muted-foreground"
                            )}>
                                {format(day, 'EEEEE', { locale: fr })}
                            </span>
                            <span className={cn(
                                "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-all",
                                isSelected ? "bg-primary text-primary-foreground shadow-md scale-110" : 
                                isToday ? "bg-accent text-accent-foreground" : "text-foreground group-hover:bg-accent/50"
                            )}>
                                {format(day, 'd')}
                            </span>
                        </div>
                        {/* Subtle indicator for today */}
                        {isToday && !isSelected && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary mb-1"></div>
                        )}
                    </th>
                    );
                })}
                </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
                {chalets.map(chalet => {
                const statusInfo = selectedDate ? getStatusForDay(selectedDate, bookings, chalet.id) : null;
                const isRowHovered = hoveredChaletId === chalet.id;

                return (
                    <tr 
                        key={chalet.id} 
                        className={cn("group transition-colors", isRowHovered ? "bg-muted/30" : "bg-transparent")}
                        onMouseEnter={() => setHoveredChaletId(chalet.id)}
                    >
                    <td className="sticky left-0 bg-card p-3 z-20 align-middle shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_12px_-4px_rgba(0,0,0,0.3)] group-hover:bg-muted/30 transition-colors">
                        <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight text-foreground">{chalet.name}</span>
                            {statusInfo && (
                            <div className={cn("text-[10px] font-medium mt-1 flex items-center gap-1 animate-fade-in", statusInfo.color)}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {statusInfo.text}
                                {statusInfo.price && (
                                <span className="text-muted-foreground ml-1">
                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(statusInfo.price)}
                                </span>
                                )}
                            </div>
                            )}
                        </div>
                    </td>
                    {days.map(day => {
                    const booking = getBookingForDay(day, bookings, chalet.id);
                    const isSaturday = day.getDay() === 6;
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isHovered = hoveredDate && isSameDay(day, hoveredDate);

                    const isOccupied = booking && booking.status !== BookingStatus.FREE;
                    const isFree = booking && booking.status === BookingStatus.FREE;

                    let cellBgClass = "";
                    if (isFree) {
                        cellBgClass = getPriceHeatmapClass(booking.price);
                        if (isHovered) cellBgClass = cn(cellBgClass, "brightness-95 dark:brightness-110");
                    } else {
                        if (isHovered) cellBgClass = "bg-muted/50";
                    }
                    
                    if (isSelected) cellBgClass = "bg-primary/5";

                    return (
                        <td 
                        key={day.toISOString()} 
                        onClick={() => onDateSelect(isSelected ? null : day)}
                        onMouseEnter={(e) => {
                            setHoveredDate(day);
                            if (booking) showTooltip(e, booking);
                        }}
                        onMouseLeave={hideTooltip}
                        className={cn(
                            "relative h-14 p-0 cursor-pointer transition-colors",
                            isSaturday && "border-r border-dashed border-border/60", // Only vertical border is for weeks
                            cellBgClass
                        )}
                        >
                            {/* Gantt Bar Rendering */}
                            {isOccupied && (
                                <div className="px-0.5 w-full h-full flex items-center justify-center">
                                    <div className={cn(
                                        "h-7 shadow-sm transition-all relative w-full",
                                        statusColors[booking.status],
                                        isSameDay(day, parseISO(booking.startDate)) ? "rounded-l-full ml-1" : "", 
                                        isSameDay(day, parseISO(booking.endDate)) ? "rounded-r-full mr-1" : "",
                                        // If it's a middle day, we ensure it looks connected by removing margin/radius
                                        !isSameDay(day, parseISO(booking.startDate)) && !isSameDay(day, parseISO(booking.endDate)) ? "rounded-none mx-[-1px] w-[calc(100%+2px)]" : "" 
                                    )}>
                                        {/* Shine effect for bookings */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-[inherit]"></div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Selection Indicator Ring */}
                            {isSelected && (
                                <div className="absolute inset-0 ring-2 ring-primary ring-inset pointer-events-none z-10"></div>
                            )}
                        </td>
                    );
                    })}
                </tr>
                );
                })}
            </tbody>
            </table>
        </div>
      </div>
    </>
  );
};

export default AvailabilityGrid;