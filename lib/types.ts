
export interface Property {
  name: string;
  slug: string;
  imageUrl: string;
}

export interface RawWeek {
  start: string;
  end: string;
  status: 'booked' | 'option' | 'blocked';
  price_total_eur?: number;
}

export interface RawLot {
  id: string;
  label: string;
  weeks: RawWeek[];
}

export interface RawData {
  version: string;
  generated_at: string;
  season: string;
  lots: RawLot[];
}


export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  OPTION = 'OPTION',
  BLOCKED = 'BLOCKED',
}

export interface Booking {
  propertyName: string;
  propertySlug: string;
  start: Date;
  end: Date;
  status: BookingStatus;
}

export enum SyncStatus {
  IDLE = 'IDLE',
  SYNCING = 'SYNCING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}