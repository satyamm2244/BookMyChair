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
