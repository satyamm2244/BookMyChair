import type { AvailableSlot, ChatResponse, Booking } from '../types';

export const MOCK_HAIRCUT_SLOTS: AvailableSlot[] = [
  {
    stylistId: 'stylist-aman-01',
    stylistName: 'Aman',
    start: '2026-10-06T11:30:00.000Z',
    end: '2026-10-06T12:00:00.000Z',
    startIST: '5:00 PM',
    endIST: '5:30 PM',
  },
  {
    stylistId: 'stylist-rohit-02',
    stylistName: 'Rohit',
    start: '2026-10-06T12:00:00.000Z',
    end: '2026-10-06T12:30:00.000Z',
    startIST: '5:30 PM',
    endIST: '6:00 PM',
  },
  {
    stylistId: 'stylist-aman-01',
    stylistName: 'Aman',
    start: '2026-10-06T12:30:00.000Z',
    end: '2026-10-06T13:00:00.000Z',
    startIST: '6:00 PM',
    endIST: '6:30 PM',
  },
];

export const MOCK_FACIAL_SLOTS: AvailableSlot[] = [
  {
    stylistId: 'stylist-priya-03',
    stylistName: 'Priya',
    start: '2026-10-06T10:30:00.000Z',
    end: '2026-10-06T11:15:00.000Z',
    startIST: '4:00 PM',
    endIST: '4:45 PM',
  },
  {
    stylistId: 'stylist-priya-03',
    stylistName: 'Priya',
    start: '2026-10-06T11:30:00.000Z',
    end: '2026-10-06T12:15:00.000Z',
    startIST: '5:00 PM',
    endIST: '5:45 PM',
  },
];

export function getMockChatResponse(userMessage: string): ChatResponse {
  const lower = userMessage.trim().toLowerCase();

  // Special request requiring owner approval
  if (
    lower.includes('discount') ||
    lower.includes('free') ||
    lower.includes('midnight') ||
    lower.includes('home service') ||
    lower.includes('doorstep')
  ) {
    return {
      type: 'approval_required',
      message:
        'This request requires salon owner approval. We have noted your request and our team will notify you once reviewed.',
    };
  }

  // Facial requests
  if (lower.includes('facial')) {
    return {
      type: 'slots',
      message: 'I found these available slots for Facial with Priya:',
      slots: MOCK_FACIAL_SLOTS,
      serviceId: 'srv-facial-02',
      serviceName: 'Facial',
    };
  }

  // Specific stylist Rohit request
  if (lower.includes('rohit')) {
    const rohitSlot = MOCK_HAIRCUT_SLOTS.filter((s) => s.stylistName === 'Rohit');
    return {
      type: 'slots',
      message: 'I found available slots with Rohit:',
      slots: rohitSlot.length > 0 ? rohitSlot : MOCK_HAIRCUT_SLOTS,
      serviceId: 'srv-haircut-01',
      serviceName: 'Haircut',
    };
  }

  // Haircut or evening / tomorrow or general availability requests
  if (
    lower.includes('haircut') ||
    lower.includes('hair') ||
    lower.includes('kal') ||
    lower.includes('shaam') ||
    lower.includes('tomorrow') ||
    lower.includes('evening') ||
    lower.includes('parso') ||
    lower.includes('availability') ||
    lower.includes('slot') ||
    lower.includes('check') ||
    lower.includes('appointment') ||
    lower.includes('book')
  ) {
    return {
      type: 'slots',
      message: 'I found these available slots for tomorrow evening:',
      slots: MOCK_HAIRCUT_SLOTS,
      serviceId: 'srv-haircut-01',
      serviceName: 'Haircut',
    };
  }

  // Fallback clarification question
  return {
    type: 'clarification',
    message:
      'Which service would you like to book? For example: "haircut kal shaam ko", "facial tomorrow 4pm", or "check availability".',
  };
}

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
