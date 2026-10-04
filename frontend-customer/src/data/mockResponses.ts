import type { AvailableSlot, Booking } from '../types';
import { SERVICE_IDS, STYLIST_IDS, SERVICE_NAMES } from '../constants/services';

export const MOCK_HAIRCUT_SLOTS: AvailableSlot[] = [
  {
    stylistId: STYLIST_IDS.aman,
    stylistName: 'Aman',
    start: '2026-10-06T11:30:00.000Z',
    end: '2026-10-06T12:00:00.000Z',
    startIST: '06 Oct 2026, 05:00 pm',
    endIST: '06 Oct 2026, 05:30 pm',
  },
  {
    stylistId: STYLIST_IDS.rohit,
    stylistName: 'Rohit',
    start: '2026-10-06T12:00:00.000Z',
    end: '2026-10-06T12:30:00.000Z',
    startIST: '06 Oct 2026, 05:30 pm',
    endIST: '06 Oct 2026, 06:00 pm',
  },
  {
    stylistId: STYLIST_IDS.aman,
    stylistName: 'Aman',
    start: '2026-10-06T12:30:00.000Z',
    end: '2026-10-06T13:00:00.000Z',
    startIST: '06 Oct 2026, 06:00 pm',
    endIST: '06 Oct 2026, 06:30 pm',
  },
];

export const MOCK_FACIAL_SLOTS: AvailableSlot[] = [
  {
    stylistId: STYLIST_IDS.aman,
    stylistName: 'Aman',
    start: '2026-10-06T10:30:00.000Z',
    end: '2026-10-06T11:15:00.000Z',
    startIST: '06 Oct 2026, 04:00 pm',
    endIST: '06 Oct 2026, 04:45 pm',
  },
  {
    stylistId: STYLIST_IDS.rohit,
    stylistName: 'Rohit',
    start: '2026-10-06T11:30:00.000Z',
    end: '2026-10-06T12:15:00.000Z',
    startIST: '06 Oct 2026, 05:00 pm',
    endIST: '06 Oct 2026, 05:45 pm',
  },
];

export function createMockBooking(
  slot: AvailableSlot,
  serviceName: string = 'Haircut',
  customerName: string = 'Arghyarupa Mishra'
): Booking {
  return {
    id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
    service: serviceName,
    date: '6 October 2026',
    time: slot.startIST,
    stylist: slot.stylistName,
    customerName,
    status: 'confirmed',
  };
}

export { SERVICE_IDS, STYLIST_IDS, SERVICE_NAMES };
