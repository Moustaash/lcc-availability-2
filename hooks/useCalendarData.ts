import { useState, useEffect } from 'react';
// FIX: Changed date-fns imports to use direct paths to fix module resolution errors.
import parseISO from 'date-fns/parseISO';
import isBefore from 'date-fns/isBefore';
import { RawData, Booking, BookingStatus, SyncStatus, Property } from '../lib/types';

type BookingsMap = Map<string, Booking[]>;

interface ProcessedData {
    bookingsMap: BookingsMap;
    properties: Property[];
}

const processData = (rawData: RawData[]): ProcessedData => {
  const bookingsMap: BookingsMap = new Map();
  const properties: Property[] = [];
  
  if (!rawData || !rawData[0] || !rawData[0].lots) {
    return { bookingsMap, properties };
  }

  rawData[0].lots.forEach(lot => {
    const propertySlug = lot.id;
    const propertyName = lot.label;
    
    properties.push({
      name: propertyName,
      slug: propertySlug,
      imageUrl: `https://picsum.photos/seed/${propertySlug}/40/40`
    });
    
    bookingsMap.set(propertySlug, []);

    lot.weeks.forEach(week => {
      const start = parseISO(week.start);
      const end = parseISO(week.end);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || !isBefore(start, end)) {
          console.warn(`Invalid date range for ${propertyName}: ${week.start} to ${week.end}. Skipping.`);
          return;
      }

      let status: BookingStatus;
      switch(week.status) {
        case 'booked':
          status = BookingStatus.CONFIRMED;
          break;
        case 'option':
          status = BookingStatus.OPTION;
          break;
        case 'blocked':
          status = BookingStatus.BLOCKED;
          break;
        default:
          return;
      }
      
      const booking: Booking = {
        propertyName,
        propertySlug,
        start,
        end,
        status,
      };

      const propertyBookings = bookingsMap.get(propertySlug)!;
      propertyBookings.push(booking);
    });
  });

  // Sort properties by name
  properties.sort((a, b) => a.name.localeCompare(b.name));

  // Sort bookings by start date for each property
  bookingsMap.forEach((bookings, slug) => {
    bookings.sort((a, b) => a.start.getTime() - b.start.getTime());
    bookingsMap.set(slug, bookings);
  });

  return { bookingsMap, properties };
};

export function useCalendarData() {
  const [bookings, setBookings] = useState<BookingsMap>(new Map());
  const [properties, setProperties] = useState<Property[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setSyncStatus(SyncStatus.SYNCING);
      setError(null);
      try {
        const response = await fetch('/data/site/availability/data.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const rawData: RawData[] = await response.json();
        
        const { bookingsMap, properties } = processData(rawData);
        setBookings(bookingsMap);
        setProperties(properties);
        setSyncStatus(SyncStatus.SUCCESS);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(message);
        setSyncStatus(SyncStatus.ERROR);
      }
    };

    fetchData();
  }, []);

  return { bookings, properties, syncStatus, error };
}