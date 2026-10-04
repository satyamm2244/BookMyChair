export interface AvailableSlot {
  stylistId: string;
  stylistName: string;
  start: string;
  end: string;
  startIST: string;
  endIST: string;
}

export interface Booking {
  id: string;
  service: string;
  date: string;
  time: string;
  stylist: string;
  customerName?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface CreateBookingPayload {
  customerName: string;
  phone: string;
  serviceId: string;
  stylistId: string;
  start: string;
  end: string;
  serviceName?: string;
  stylistName?: string;
}

export interface BookingResult {
  success: boolean;
  message: string;
  booking: Booking;
}

export interface HealthCheckResult {
  ok: boolean;
  status?: string;
  message?: string;
  db?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface AvailabilityResponse {
  success: boolean;
  slots: AvailableSlot[];
  message?: string;
}

export type ChatResponseType =
  | 'clarification'
  | 'slots'
  | 'confirmed'
  | 'approval_required'
  | 'error';

export type ChatResponse =
  | {
      type: 'clarification';
      message: string;
    }
  | {
      type: 'slots';
      message: string;
      slots: AvailableSlot[];
      serviceId: string;
      serviceName?: string;
    }
  | {
      type: 'confirmed';
      message: string;
      booking: Booking;
    }
  | {
      type: 'approval_required';
      message: string;
    }
  | {
      type: 'error';
      message: string;
    };

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text?: string;
  timestamp: string;
  responseType?: ChatResponseType | 'initial';
  slots?: AvailableSlot[];
  booking?: Booking;
  serviceId?: string;
  serviceName?: string;
  isSlotSelected?: boolean;
}
