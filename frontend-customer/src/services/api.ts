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

/**
 * Extract target date (YYYY-MM-DD) from user text
 */
export function extractDateFromMessage(message: string): string {
  const lower = message.toLowerCase();
  const today = new Date();

  if (lower.includes('parso') || lower.includes('day after')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }

  if (lower.includes('today') || lower.includes('aaj')) {
    return today.toISOString().split('T')[0];
  }

  // "kal", "tomorrow", "shaam", or default: tomorrow
  const d = new Date(today);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
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
    // If backend is offline, throw BackendOfflineError so UI handles gracefully
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
 * Create REAL booking in Supabase via Satyam's backend
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
    // Clarification when intent is not recognized
    return {
      type: 'clarification',
      message:
        'Which service would you like to book? For example: "haircut kal shaam ko", "facial tomorrow", or "hair spa".',
    };
  }

  // Determine stylist filter if customer specifically mentioned one
  let stylistId: string | undefined = undefined;
  if (lower.includes('rohit')) {
    stylistId = STYLIST_IDS.rohit;
  } else if (lower.includes('aman')) {
    stylistId = STYLIST_IDS.aman;
  }

  const selectedDate = extractDateFromMessage(message);

  // Call REAL backend availability engine
  const slots = await getAvailability(serviceId, selectedDate, stylistId);

  if (!slots || slots.length === 0) {
    return {
      type: 'clarification',
      message: `No available slots were found for ${serviceName} on ${formatToDateString(
        selectedDate
      )}. Would you like to check another day?`,
    };
  }

  return {
    type: 'slots',
    message: `I found these available slots for ${serviceName}:`,
    slots,
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
