export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error',
}

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  OPTION = 'OPTION',
  BLOCKED = 'BLOCKED',
  FREE = 'FREE',
}

// Application-internal types
export interface Booking {
  id: string;
  chaletId: string;
  startDate: string; // ISO string format "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
  endDate: string; // ISO string format
  status: BookingStatus;
  name: string;
  price?: number;
}

export interface Chalet {
  id: string;
  name: string;
  imageUrl?: string;
}