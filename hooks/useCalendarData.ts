import { useState, useEffect } from 'react';
// FIX: Changed date-fns imports to use named imports from the main 'date-fns' package to resolve call signature errors.
import { addMonths, isSameDay, parseISO, subDays, subMonths } from 'date-fns';
import { Chalet, Booking, SyncStatus, BookingStatus } from '../lib/types';
import { chaletImages, chaletInfo } from '../lib/chalet-data';

// Raw types from data.json
interface RawWeek {
  start: string;
  end: string;
  status: 'booked' | 'option' | 'blocked' | 'free';
  price_total_eur?: number;
}

interface RawLot {
  id: string;
  label: string;
  weeks: RawWeek[];
}

interface RawData {
  generated_at: string;
  lots: RawLot[];
}

const mapStatus = (status: 'booked' | 'option' | 'blocked' | 'free'): BookingStatus => {
  switch (status) {
    case 'booked': return BookingStatus.CONFIRMED;
    case 'option': return BookingStatus.OPTION;
    case 'blocked': return BookingStatus.BLOCKED;
    case 'free': return BookingStatus.FREE;
    default: return BookingStatus.CONFIRMED;
  }
};

const statusToName = (status: BookingStatus): string => {
    switch (status) {
        case BookingStatus.CONFIRMED: return "Réservé";
        case BookingStatus.OPTION: return "Option";
        case BookingStatus.BLOCKED: return "Propriétaire";
        case BookingStatus.FREE: return "Disponible";
    }
}

export function useCalendarData() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncStatus.IDLE);
  const [chalets, setChalets] = useState<Chalet[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // Default to Nov 2025
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setSyncStatus(SyncStatus.SYNCING);
      try {
        const response = await fetch('/data/site/availability/data.json'); // Path for production server
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonData: RawData[] = await response.json();
        
        if (!jsonData || jsonData.length === 0) {
          console.warn("Le fichier data.json est vide ou ne contient pas de données.");
          setSyncStatus(SyncStatus.ERROR);
          return; 
        }

        const data = jsonData[0];
        setLastGeneratedAt(data.generated_at);

        const allChalets: Chalet[] = data.lots.map(lot => {
          const slug = lot.id.toLowerCase();
          const info = chaletInfo.find(c => c.slug === slug);
          
          return {
            id: lot.id,
            name: info ? info.nameFR : lot.label,
            imageUrl: chaletImages[slug],
          };
        });

        const allBookings: Booking[] = data.lots.flatMap(lot => 
          lot.weeks
            .map((week, index) => {
              const status = mapStatus(week.status);
              const parsedStart = parseISO(week.start);
              const parsedEnd = parseISO(week.end);
              
              let effectiveEndDate;
              // This logic correctly handles the data specification where 'end' dates for
              // 'booked' and 'free' statuses are exclusive (checkout day), while for
              // 'option' and 'blocked' they are inclusive (last day of stay) as-is from the source.
              if (week.status === 'option' || week.status === 'blocked') {
                effectiveEndDate = parsedEnd;
              } else { 
                // 'booked' and 'free' end dates are exclusive (checkout day).
                // Handle single-day bookings where checkout is same as check-in.
                if (isSameDay(parsedStart, parsedEnd)) {
                  effectiveEndDate = parsedStart;
                } else {
                  effectiveEndDate = subDays(parsedEnd, 1);
                }
              }

              return {
                id: `${lot.id}-${week.start}-${index}`,
                chaletId: lot.id,
                startDate: parsedStart.toISOString(),
                endDate: effectiveEndDate.toISOString(),
                status: status,
                name: statusToName(status),
                price: week.price_total_eur,
              }
            })
        );
        
        setChalets(allChalets);
        setBookings(allBookings);
        setSyncStatus(SyncStatus.SUCCESS);
      } catch (error) {
        console.error("Failed to fetch calendar data:", error);
        setSyncStatus(SyncStatus.ERROR);
      }
    };

    fetchData();
  }, []);
  
  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const handleDateChange = (date: Date) => setCurrentDate(date);

  return {
    syncStatus,
    chalets,
    bookings,
    currentDate,
    lastGeneratedAt,
    handlePrevMonth,
    handleNextMonth,
    handleDateChange,
  };
}