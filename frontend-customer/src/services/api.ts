import type { AvailableSlot, Booking, ChatResponse } from '../types';
import { getMockChatResponse, createMockBooking } from '../data/mockResponses';

// Set to true for Milestone 1 (standalone offline mock flow)
// Will easily switch to real backend endpoint when Satyam's AI chat route is live
const USE_MOCK = true;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export interface BookingRequestParams {
  slot: AvailableSlot;
  serviceId: string;
  serviceName?: string;
  customerName?: string;
  phone?: string;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  booking: Booking;
}

/**
 * Send natural-language customer message to chat assistant
 */
export async function sendChatMessage(
  message: string,
  customerId: string | null = null
): Promise<ChatResponse> {
  if (USE_MOCK) {
    // Simulate slight natural network latency
    await new Promise((resolve) => setTimeout(resolve, 600));
    return getMockChatResponse(message);
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
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
 * Confirm appointment booking for selected slot
 */
export async function confirmSlotBooking(
  params: BookingRequestParams
): Promise<BookingResponse> {
  const {
    slot,
    serviceId,
    serviceName = 'Haircut',
    customerName = 'Arghyarupa Mishra',
    phone = '9876543210',
  } = params;

  if (USE_MOCK) {
    // Simulate slight latency for booking confirmation
    await new Promise((resolve) => setTimeout(resolve, 700));
    const booking = createMockBooking(slot, serviceName, customerName);
    return {
      success: true,
      message: 'Your booking is confirmed',
      booking,
    };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName,
        phone,
        serviceId,
        stylistId: slot.stylistId,
        start: slot.start,
        end: slot.end,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'That slot is no longer available');
    }

    return {
      success: true,
      message: data.message || 'Booking confirmed',
      booking: data.booking,
    };
  } catch (err: unknown) {
    console.error('confirmSlotBooking error:', err);
    const errorMessage =
      err instanceof Error ? err.message : 'Failed to confirm booking. Please try another slot.';
    throw new Error(errorMessage);
  }
}
