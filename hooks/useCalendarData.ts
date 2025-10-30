import { useState, useEffect } from 'react';
// FIX: Switched to date-fns named imports to resolve module loading errors.
import { addMonths, parseISO, subDays, subMonths } from 'date-fns';
import { Chalet, Booking, SyncStatus, BookingStatus } from '../lib/types';
import { chaletImages, chaletInfo } from '../lib/chalet-data';

// Raw types from data.json
interface RawWeek {
  start: string;
  end: string;
  status: 'booked' | 'option' | 'blocked';
  price_total_eur?: number;
}

interface RawLot {
  id: string;
  label: string;
  weeks: RawWeek[];
}

interface RawData {
  lots: RawLot[];
}

const mapStatus = (status: 'booked' | 'option' | 'blocked'): BookingStatus => {
  switch (status) {
    case 'booked': return BookingStatus.CONFIRMED;
    case 'option': return BookingStatus.OPTION;
    case 'blocked': return BookingStatus.BLOCKED;
    default: return BookingStatus.CONFIRMED;
  }
};

const statusToName = (status: BookingStatus): string => {
    switch (status) {
        case BookingStatus.CONFIRMED: return "Réservé";
        case BookingStatus.OPTION: return "Option";
        case BookingStatus.BLOCKED: return "Propriétaire";
    }
}

export function useCalendarData() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncStatus.IDLE);
  const [chalets, setChalets] = useState<Chalet[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // Default to Nov 2025

  useEffect(() => {
    const fetchData = async () => {
      setSyncStatus(SyncStatus.SYNCING);
      try {
        const response = await fetch('/data/site/availability/data.json'); // Path for production server
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData: RawData[] = await response.json();
        
        const data = jsonData[0];

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
          lot.weeks.map((week, index) => {
            const status = mapStatus(week.status);
            // End date in data is the checkout day, so the last day of booking is the day before.
            const endDate = subDays(parseISO(week.end), 1);

            return {
              id: `${lot.id}-${week.start}-${index}`,
              chaletId: lot.id,
              startDate: parseISO(week.start).toISOString(),
              endDate: endDate.toISOString(),
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
    handlePrevMonth,
    handleNextMonth,
    handleDateChange,
  };
}