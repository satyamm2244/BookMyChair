import type {
  AvailableSlot,
  ChatResponse,
  CreateBookingPayload,
  BookingResult,
  HealthCheckResult,
} from '../types';
import {
  SERVICE_IDS,
  STYLIST_IDS,
  DEMO_CUSTOMER,
} from '../constants/services';

// Base backend URL from Vite environment with default http://localhost:5000
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Custom Error for HTTP 409 Booking Conflict (Double booking prevention)
 */
export class BookingConflictError extends Error {
  statusCode: number = 409;

  constructor(
    message: string = 'That slot was just taken. Please choose another available slot.'
  ) {
    super(message);
    this.name = 'BookingConflictError';
  }
}

/**
 * Custom Error when backend service is down or unreachable
 */
export class BackendOfflineError extends Error {
  constructor(
    message: string = 'Booking service is temporarily unavailable. Please try again.'
  ) {
    super(message);
    this.name = 'BackendOfflineError';
  }
}

export interface BookingRequestParams {
  slot: AvailableSlot;
  serviceId: string;
  serviceName?: string;
  customerName?: string;
  phone?: string;
}

export type TimePeriod = 'morning' | 'afternoon' | 'evening';

/**
 * BUG 1 FIX: DYNAMIC RELATIVE DATE IN ASIA/KOLKATA
 * Computes date (YYYY-MM-DD) dynamically in Asia/Kolkata timezone.
 * offsetDays: 0 for today, 1 for tomorrow ("kal"), 2 for day after ("parso")
 */
export function getDateInKolkata(offsetDays: number = 0): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find((p) => p.type === 'year')!.value, 10);
  const month = parseInt(parts.find((p) => p.type === 'month')!.value, 10) - 1;
  const day = parseInt(parts.find((p) => p.type === 'day')!.value, 10);

  const targetDate = new Date(Date.UTC(year, month, day + offsetDays, 12, 0, 0));
  return formatter.format(targetDate);
}

/**
 * Resolves natural language date references to dynamic YYYY-MM-DD in Asia/Kolkata
 */
export function resolveTargetDate(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('parso') || lower.includes('day after')) {
    return getDateInKolkata(2);
  }

  if (lower.includes('today') || lower.includes('aaj')) {
    return getDateInKolkata(0);
  }

  // "kal", "tomorrow", "shaam", or default: tomorrow in Asia/Kolkata
  return getDateInKolkata(1);
}

// Backwards-compatible alias
export const extractDateFromMessage = resolveTargetDate;

/**
 * BUG 2 FIX: CONVERT RAW ISO TIMESTAMP TO IST HOUR
 * Uses Intl.DateTimeFormat with Asia/Kolkata and hourCycle: h23
 * Example: '2026-10-05T10:30:00.000Z' -> 16 (4:00 PM IST)
 */
export function getISTHour(isoTimestamp: string): number {
  const d = new Date(isoTimestamp);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hourCycle: 'h23',
    hour: 'numeric',
  });
  return parseInt(formatter.format(d), 10);
}

/**
 * Filters slots by time period using machine-friendly ISO start timestamps:
 * - morning:   10 <= hour < 12
 * - afternoon: 12 <= hour < 16
 * - evening:   16 <= hour < 19
 */
export function filterSlotsByPeriod(
  slots: AvailableSlot[],
  period: TimePeriod
): AvailableSlot[] {
  return slots.filter((slot) => {
    const hour = getISTHour(slot.start);
    switch (period) {
      case 'morning':
        return hour >= 10 && hour < 12;
      case 'afternoon':
        return hour >= 12 && hour < 16;
      case 'evening':
        return hour >= 16 && hour < 19;
      default:
        return true;
    }
  });
}

/**
 * Detects time period from user natural language
 */
export function detectTimePeriod(message: string): TimePeriod | null {
  const lower = message.toLowerCase();
  if (
    lower.includes('shaam') ||
    lower.includes('evening') ||
    lower.includes('night')
  ) {
    return 'evening';
  }
  if (lower.includes('subah') || lower.includes('morning')) {
    return 'morning';
  }
  if (lower.includes('dopahar') || lower.includes('afternoon')) {
    return 'afternoon';
  }
  return null;
}

/**
 * Formats a raw timestamp/string to clean IST time display
 */
function formatToTimeIST(timeStr?: string): string {
  if (!timeStr) return '';
  if (
    timeStr.includes('am') ||
    timeStr.includes('pm') ||
    timeStr.includes('AM') ||
    timeStr.includes('PM')
  ) {
    return timeStr;
  }
  try {
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return timeStr;
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return timeStr;
  }
}

function formatToDateString(dateStr?: string): string {
  if (!dateStr) return '06 Oct 2026';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Check backend database health
 * GET /api/health/db
 */
export async function checkHealth(): Promise<HealthCheckResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health/db`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        status: 'error',
        message: data.message || `Health check failed (${res.status})`,
      };
    }

    return {
      ok: true,
      status: 'healthy',
      ...data,
    };
  } catch (err) {
    return {
      ok: false,
      status: 'unreachable',
      message: 'Booking service is temporarily unavailable. Please try again.',
    };
  }
}

/**
 * Fetch REAL slots from backend availability engine
 * GET /api/test/availability?serviceId=...&date=...&stylistId=...
 */
export async function getAvailability(
  serviceId: string,
  date: string,
  stylistId?: string
): Promise<AvailableSlot[]> {
  const url = new URL(`${API_BASE_URL}/api/test/availability`);
  url.searchParams.set('serviceId', serviceId);
  url.searchParams.set('date', date);
  if (stylistId) {
    url.searchParams.set('stylistId', stylistId);
  }

  let res: Response;
  try {
    res = await fetch(url.toString());
  } catch (netErr) {
    console.warn('Backend unavailable during getAvailability:', netErr);
    throw new BackendOfflineError(
      'Booking service is temporarily unavailable. Please try again.'
    );
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch availability (${res.status})`
    );
  }

  const data = await res.json();
  const rawSlots: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data.slots)
    ? data.slots
    : [];

  return rawSlots.map((slot) => ({
    stylistId: slot.stylistId,
    stylistName: slot.stylistName || (slot.stylistId === STYLIST_IDS.aman ? 'Aman' : 'Rohit'),
    start: slot.start,
    end: slot.end,
    startIST: slot.startIST || formatToTimeIST(slot.start),
    endIST: slot.endIST || formatToTimeIST(slot.end),
  }));
}

/**
 * Create REAL booking in Supabase via backend
 * POST /api/bookings
 */
export async function createBooking(
  payload: CreateBookingPayload
): Promise<BookingResult> {
  const url = `${API_BASE_URL}/api/bookings`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: payload.customerName || DEMO_CUSTOMER.name,
        phone: payload.phone || DEMO_CUSTOMER.phone,
        serviceId: payload.serviceId,
        stylistId: payload.stylistId,
        start: payload.start,
        end: payload.end,
      }),
    });
  } catch (netErr) {
    console.error('Backend offline during createBooking:', netErr);
    throw new BackendOfflineError(
      'Booking service is temporarily unavailable. Please try again.'
    );
  }

  // Handle 409 Conflict (slot already booked / double-booking protection)
  if (res.status === 409) {
    const data = await res.json().catch(() => ({}));
    throw new BookingConflictError(
      data.message || 'That slot was just taken. Please choose another available slot.'
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Booking failed with status ${res.status}`);
  }

  const booking = data.booking || data;

  return {
    success: true,
    message: data.message || 'Booking Confirmed',
    booking: {
      id: booking.id || `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      service: booking.service || payload.serviceName || 'Haircut',
      date: booking.date || formatToDateString(payload.start),
      time: booking.time || formatToTimeIST(payload.startIST || payload.start),
      stylist:
        booking.stylist ||
        payload.stylistName ||
        (payload.stylistId === STYLIST_IDS.aman ? 'Aman' : 'Rohit'),
      customerName: booking.customerName || payload.customerName || DEMO_CUSTOMER.name,
      status: 'confirmed',
    },
  };
}

/**
 * Natural language chat handler that connects intent to REAL availability slots
 * - Resolves dynamic date in Asia/Kolkata
 * - Filters slots by machine-friendly start ISO timestamp
 * - Selects 2-3 valid evening slots
 */
export async function sendChatMessage(
  message: string,
  _customerId: string | null = null
): Promise<ChatResponse> {
  const lower = message.trim().toLowerCase();

  // Natural delay for assistant typing response
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Owner approval requests
  if (
    lower.includes('discount') ||
    lower.includes('free') ||
    lower.includes('midnight') ||
    lower.includes('doorstep') ||
    lower.includes('home service')
  ) {
    return {
      type: 'approval_required',
      message:
        'This request requires salon owner approval. We have forwarded your request to the owner.',
    };
  }

  // Determine service ID
  let serviceId: string = SERVICE_IDS.haircut;
  let serviceName: string = 'Haircut';

  if (lower.includes('facial') || lower.includes('face')) {
    serviceId = SERVICE_IDS.facial;
    serviceName = 'Facial';
  } else if (lower.includes('spa')) {
    serviceId = SERVICE_IDS.hairSpa;
    serviceName = 'Hair Spa';
  } else if (lower.includes('beard') || lower.includes('trim')) {
    serviceId = SERVICE_IDS.beardTrim;
    serviceName = 'Beard Trim';
  } else if (
    !lower.includes('haircut') &&
    !lower.includes('hair') &&
    !lower.includes('kal') &&
    !lower.includes('shaam') &&
    !lower.includes('tomorrow') &&
    !lower.includes('evening') &&
    !lower.includes('rohit') &&
    !lower.includes('aman') &&
    !lower.includes('availability') &&
    !lower.includes('slot') &&
    !lower.includes('appointment') &&
    !lower.includes('book')
  ) {
    return {
      type: 'clarification',
      message:
        'Which service would you like to book? For example: "haircut kal shaam ko", "facial tomorrow", or "hair spa".',
    };
  }

  // Stylist filter if customer requested
  let stylistId: string | undefined = undefined;
  if (lower.includes('rohit')) {
    stylistId = STYLIST_IDS.rohit;
  } else if (lower.includes('aman')) {
    stylistId = STYLIST_IDS.aman;
  }

  // BUG 1: Dynamic relative date in Asia/Kolkata
  const selectedDate = resolveTargetDate(message);

  // Call REAL backend availability engine
  const allSlots = await getAvailability(serviceId, selectedDate, stylistId);

  if (!allSlots || allSlots.length === 0) {
    return {
      type: 'clarification',
      message: `No available slots were found for ${serviceName} on ${formatToDateString(
        selectedDate
      )}. Would you like to check another day?`,
    };
  }

  // BUG 2: Filter by time period using ISO start timestamp
  const period = detectTimePeriod(message);
  let finalSlots = allSlots;

  if (period) {
    const periodSlots = filterSlotsByPeriod(allSlots, period);
    if (periodSlots.length > 0) {
      // Show 2-3 valid evening slots returned by the REAL backend
      finalSlots = periodSlots.slice(0, 3);
    } else {
      const periodLabel = period === 'evening' ? 'evening (4:00 PM – 7:00 PM)' : period;
      return {
        type: 'clarification',
        message: `No available slots were found in the ${periodLabel} for ${serviceName} on ${formatToDateString(
          selectedDate
        )}. Would you like to check earlier slots?`,
      };
    }
  } else {
    // If no specific period requested, show up to 4 convenient slots
    finalSlots = allSlots.slice(0, 4);
  }

  const messageText = period === 'evening'
    ? `I found these available evening slots for ${serviceName}:`
    : `I found these available slots for ${serviceName}:`;

  return {
    type: 'slots',
    message: messageText,
    slots: finalSlots,
    serviceId,
    serviceName,
    selectedDate,
  };
}

/**
 * High-level slot booking confirmation wrapper used by App component
 */
export async function confirmSlotBooking(
  params: BookingRequestParams
): Promise<BookingResult> {
  const {
    slot,
    serviceId,
    serviceName = 'Haircut',
    customerName = DEMO_CUSTOMER.name,
    phone = DEMO_CUSTOMER.phone,
  } = params;

  return createBooking({
    customerName,
    phone,
    serviceId,
    stylistId: slot.stylistId,
    start: slot.start,
    end: slot.end,
    serviceName,
    stylistName: slot.stylistName,
    startIST: slot.startIST,
  });
}
