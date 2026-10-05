import type {
  AvailableSlot,
  ChatResponse,
  CreateBookingPayload,
  BookingResult,
  HealthCheckResult,
} from '../types';
import { DEMO_CUSTOMER } from '../constants/services';

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
 * Generic display formatting helper: formats ISO/raw timestamp to clean IST time display
 */
export function formatToTimeIST(timeStr?: string): string {
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

/**
 * Generic display formatting helper: formats date string to clean readable format
 */
export function formatToDateString(dateStr?: string): string {
  if (!dateStr) return '';
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
 * Send natural-language customer message directly to real backend
 * POST /api/chat
 */
export async function sendChatMessage(
  message: string,
  customerId: string | null = null
): Promise<ChatResponse> {
  const url = `${API_BASE_URL}/api/chat`;

  const requestBody: { message: string; customerId?: string | null } = {
    message: message.trim(),
  };
  if (customerId) {
    requestBody.customerId = customerId;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  } catch (netErr) {
    console.error('Backend offline during sendChatMessage:', netErr);
    throw new BackendOfflineError(
      'Booking service is temporarily unavailable. Please try again.'
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (data && data.type === 'error' && data.message) {
      return data as ChatResponse;
    }
    return {
      type: 'error',
      message: data.message || 'Failed to process chat message',
    };
  }

  return data as ChatResponse;
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
        'Stylist',
      customerName: booking.customerName || payload.customerName || DEMO_CUSTOMER.name,
      status: 'confirmed',
    },
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
