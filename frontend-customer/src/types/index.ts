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
  startIST?: string;
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

// Structured Backend Chat Response Types (POST /api/chat)
export interface SlotsResponse {
  type: 'slots';
  message: string;
  serviceId: string;
  service: string;
  date: string;
  slots: AvailableSlot[];
}

export interface ClarificationResponse {
  type: 'clarification';
  message: string;
}

export interface NoAvailabilityResponse {
  type: 'no_availability';
  message: string;
}

export interface ApprovalRequiredResponse {
  type: 'approval_required';
  message: string;
}

export interface ErrorResponse {
  type: 'error';
  message: string;
}

export type ChatResponse =
  | SlotsResponse
  | ClarificationResponse
  | NoAvailabilityResponse
  | ApprovalRequiredResponse
  | ErrorResponse;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text?: string;
  timestamp: string;
  responseType?: ChatResponse['type'] | 'initial' | 'confirmed';
  slots?: AvailableSlot[];
  booking?: Booking;
  serviceId?: string;
  service?: string;
  date?: string;
  isSlotSelected?: boolean;
}
