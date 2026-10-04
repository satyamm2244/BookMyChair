import { supabase } from '../db/supabase';
import { getCurrentISTDate, addDaysToDate } from './ai.service';
import { formatIST, getAvailableSlots } from './availability.service';
import { getBookingsByDate, DashboardBooking } from './dashboard.service';
import { getApprovals } from './approval.service';
import { ReminderWindow } from '../schemas/automation.schema';

export type ReminderCandidate = {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  service: string;
  stylist: string;
  start: string;
  startIST: string;
  reminderType: ReminderWindow;
};

export type TomorrowSummaryResponse = {
  date: string;
  totalBookings: number;
  openSlots: number;
  pendingApprovals: number;
  bookings: DashboardBooking[];
};

export type RebookingCandidate = {
  customerId: string;
  name: string;
  phone: string;
  lastVisitAt: string;
  daysSinceLastVisit: number;
  draftMessage: string;
};

/**
 * Fetch upcoming confirmed bookings needing reminders.
 * window = 'day_before' -> bookings happening tomorrow in Asia/Kolkata
 * window = 'two_hours' -> bookings starting within next 2 hours
 */
export async function getReminderCandidates(
  window: ReminderWindow = 'day_before'
): Promise<ReminderCandidate[]> {
  const query = 'id, start_at, end_at, status, customers(id, name, phone), services(id, name), stylists(id, name)';

  let dbQuery = supabase
    .from('bookings')
    .select(query)
    .eq('status', 'confirmed');

  if (window === 'day_before') {
    const { dateString: todayStr } = getCurrentISTDate();
    const tomorrowStr = addDaysToDate(todayStr, 1);
    const dayAfterTomorrowStr = addDaysToDate(todayStr, 2);

    dbQuery = dbQuery
      .gte('start_at', `${tomorrowStr}T00:00:00+05:30`)
      .lt('start_at', `${dayAfterTomorrowStr}T00:00:00+05:30`)
      .order('start_at', { ascending: true });
  } else {
    // two_hours window
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    dbQuery = dbQuery
      .gte('start_at', now.toISOString())
      .lte('start_at', twoHoursLater.toISOString())
      .order('start_at', { ascending: true });
  }

  const { data, error } = await dbQuery;

  if (error) {
    throw error;
  }

  const rows = (data || []) as any[];

  return rows.map((b) => {
    const customer = Array.isArray(b.customers) ? b.customers[0] : b.customers;
    const service = Array.isArray(b.services) ? b.services[0] : b.services;
    const stylist = Array.isArray(b.stylists) ? b.stylists[0] : b.stylists;

    return {
      bookingId: b.id,
      customerName: customer?.name || 'Customer',
      customerPhone: customer?.phone || '',
      service: service?.name || 'Service',
      stylist: stylist?.name || 'Stylist',
      start: b.start_at,
      startIST: formatIST(new Date(b.start_at)),
      reminderType: window
    };
  });
}

/**
 * Generate full tomorrow summary report for the salon owner / n8n workflow.
 * Reuses existing getBookingsByDate, getAvailableSlots, and getApprovals.
 */
export async function getTomorrowSummary(): Promise<TomorrowSummaryResponse> {
  const { dateString: todayStr } = getCurrentISTDate();
  const tomorrowStr = addDaysToDate(todayStr, 1);

  // 1. Fetch tomorrow's bookings
  const bookings = await getBookingsByDate(tomorrowStr);

  // 2. Fetch pending approvals
  const pendingApprovalsList = await getApprovals('pending');

  // 3. Calculate open slots for tomorrow
  let openSlotsCount = 0;
  try {
    const { data: defaultService } = await supabase
      .from('services')
      .select('id')
      .ilike('name', 'Haircut')
      .single();

    if (defaultService) {
      const slots = await getAvailableSlots({
        serviceId: defaultService.id,
        date: tomorrowStr
      });
      openSlotsCount = slots.length;
    }
  } catch (err) {
    console.warn('Could not calculate open slots for tomorrow summary:', err);
  }

  return {
    date: tomorrowStr,
    totalBookings: bookings.length,
    openSlots: openSlotsCount,
    pendingApprovals: pendingApprovalsList.length,
    bookings
  };
}

/**
 * Identify inactive customers whose last visit was between 28 and 42 days ago (4-6 weeks),
 * and prepare a personalized draft rebooking message.
 */
export async function getRebookingCandidates(): Promise<RebookingCandidate[]> {
  const now = new Date();
  const minDaysAgo = 28;
  const maxDaysAgo = 42;

  const earliest = new Date(now.getTime() - maxDaysAgo * 24 * 60 * 60 * 1000).toISOString();
  const latest = new Date(now.getTime() - minDaysAgo * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('customers')
    .select('id, name, phone, last_visit_at')
    .not('last_visit_at', 'is', null)
    .gte('last_visit_at', earliest)
    .lte('last_visit_at', latest)
    .order('last_visit_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data || []) as any[];

  return rows.map((c) => {
    const lastVisitDate = new Date(c.last_visit_at);
    const diffTime = Math.abs(now.getTime() - lastVisitDate.getTime());
    const daysSinceLastVisit = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const firstName = c.name ? c.name.split(' ')[0] : 'there';

    return {
      customerId: c.id,
      name: c.name || 'Customer',
      phone: c.phone || '',
      lastVisitAt: c.last_visit_at,
      daysSinceLastVisit,
      draftMessage: `Hi ${firstName}! It has been a while since your last visit to BookMyChair. We have some slots available this week if you'd like to book again.`
    };
  });
}
