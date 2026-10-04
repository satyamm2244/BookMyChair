import type {
  AvailableSlot,
  Booking,
  ChatResponse,
  CreateBookingPayload,
  BookingResult,
  HealthCheckResult,
} from '../types';
import {
  getMockChatResponse,
  createMockBooking,
  MOCK_HAIRCUT_SLOTS,
  MOCK_FACIAL_SLOTS,
} from '../data/mockResponses';

// Environment variable support with default localhost:5000 fallback
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Chat endpoint /api/chat is still in progress by Satyam
// Mock chat remains active until VITE_USE_CHAT_API=true
const USE_CHAT_API = import.meta.env.VITE_USE_CHAT_API === 'true';

// Fallback to mock booking response if backend is offline during demo/development
const FALLBACK_TO_MOCK_ON_ERROR = true;

/**
 * Dedicated error class for HTTP 409 Slot Booking Conflict
 */
export class BookingConflictError extends Error {
  statusCode: number = 409;

  constructor(message: string = 'That slot is no longer available') {
    super(message);
    this.name = 'BookingConflictError';
  }
}

export interface BookingRequestParams {
  slot: AvailableSlot;
  serviceId: string;
  serviceName?: string;
  customerName?: string;
  phone?: string;
}

// Helpers for date and IST time display
function formatToTimeIST(timeStr: string): string {
  if (!timeStr) return '';
  if (
    timeStr.includes('AM') ||
    timeStr.includes('PM') ||
    timeStr.includes('am') ||
    timeStr.includes('pm')
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

function formatToDateString(dateStr: string): string {
  if (!dateStr) return '6 October 2026';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Check backend database and service health
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
        message: data.message || `Health check failed with status ${res.status}`,
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
      message: err instanceof Error ? err.message : 'Backend server unreachable',
    };
  }
}

/**
 * Fetch available slots from backend availability engine
 * GET /api/test/availability?serviceId=...&date=...&stylistId=...
 */
export async function getAvailability(
  serviceId: string,
  date: string,
  stylistId?: string
): Promise<AvailableSlot[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/test/availability`);
    url.searchParams.set('serviceId', serviceId);
    url.searchParams.set('date', date);
    if (stylistId) {
      url.searchParams.set('stylistId', stylistId);
    }

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Availability fetch error (${res.status})`);
    }

    const data = await res.json();
    if (Array.isArray(data)) {
      return data;
    }
    if (data.slots && Array.isArray(data.slots)) {
      return data.slots;
    }
    return [];
  } catch (err) {
    console.warn('Backend availability fetch failed or offline, falling back to mock:', err);
    if (serviceId.toLowerCase().includes('facial')) {
      return MOCK_FACIAL_SLOTS;
    }
    return MOCK_HAIRCUT_SLOTS;
  }
}

/**
 * Create confirmed booking with double-booking & 409 conflict handling
 * POST /api/bookings
 */
export async function createBooking(
  payload: CreateBookingPayload
): Promise<BookingResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: payload.customerName,
        phone: payload.phone,
        serviceId: payload.serviceId,
        stylistId: payload.stylistId,
        start: payload.start,
        end: payload.end,
      }),
    });

    const data = await res.json().catch(() => ({}));

    // Explicitly handle 409 Conflict (double-booking protection)
    if (res.status === 409 || data.success === false) {
      const conflictMsg =
        data.message || 'That slot is no longer available. Please choose another available slot.';
      throw new BookingConflictError(conflictMsg);
    }

    if (!res.ok) {
      throw new Error(data.message || `Booking failed with status ${res.status}`);
    }

    const bookingData = data.booking || data;
    const formattedBooking: Booking = {
      id: bookingData.id || `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      service: bookingData.service || payload.serviceName || 'Haircut',
      date: bookingData.date || formatToDateString(payload.start),
      time: bookingData.time || formatToTimeIST(payload.start),
      stylist: bookingData.stylist || payload.stylistName || 'Aman',
      customerName: bookingData.customerName || payload.customerName,
      status: bookingData.status || 'confirmed',
    };

    return {
      success: true,
      message: data.message || 'Booking confirmed',
      booking: formattedBooking,
    };
  } catch (err) {
    if (err instanceof BookingConflictError) {
      throw err;
    }

    // If backend is offline during local testing/demo, gracefully provide mock confirmation
    if (FALLBACK_TO_MOCK_ON_ERROR) {
      console.warn('Backend unavailable, using mock confirmation fallback:', err);
      const mockSlot: AvailableSlot = {
        stylistId: payload.stylistId,
        stylistName: payload.stylistName || 'Aman',
        start: payload.start,
        end: payload.end,
        startIST: formatToTimeIST(payload.start),
        endIST: formatToTimeIST(payload.end),
      };
      const booking = createMockBooking(
        mockSlot,
        payload.serviceName || 'Haircut',
        payload.customerName
      );
      return {
        success: true,
        message: 'Your booking is confirmed',
        booking,
      };
    }

    throw err;
  }
}

/**
 * Send natural-language customer message to chat assistant
 * (Mocks responses until /api/chat is deployed)
 */
export async function sendChatMessage(
  message: string,
  customerId: string | null = null
): Promise<ChatResponse> {
  if (!USE_CHAT_API) {
    // Natural typing delay simulation
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getMockChatResponse(message);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, customerId }),
    });

    if (!res.ok) {
      throw new Error(`Chat API error (${res.status})`);
    }

    const data: ChatResponse = await res.json();
    return data;
  } catch (err) {
    console.error('sendChatMessage error:', err);
    return {
      type: 'error',
      message: 'Unable to reach the booking assistant right now. Please try again in a moment.',
    };
  }
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
    customerName = 'Arghyarupa Mishra',
    phone = '9876543210',
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
  });
}
