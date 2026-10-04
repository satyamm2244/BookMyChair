import { supabase } from '../db/supabase';
import { getCurrentISTDate, addDaysToDate } from './ai.service';
import { getAvailableSlots, formatIST } from './availability.service';

export type DashboardBooking = {
  id: string;
  customerName: string;
  customerPhone: string;
  service: string;
  stylist: string;
  start: string;
  end: string;
  startIST: string;
  endIST: string;
  status: string;
};

export type DashboardSummary = {
  todayAppointments: number;
  tomorrowAppointments: number;
  pendingApprovals: number;
  openSlots: number;
};

/**
 * Fetch bookings for a specific date in Asia/Kolkata timezone with joined details.
 */
export async function getBookingsByDate(dateStr: string): Promise<DashboardBooking[]> {
  const nextDateStr = addDaysToDate(dateStr, 1);

  const startGte = `${dateStr}T00:00:00+05:30`;
  const startLt = `${nextDateStr}T00:00:00+05:30`;

  const query = 'id, start_at, end_at, status, customers(id, name, phone), services(id, name), stylists(id, name)';

  const { data, error } = await supabase
    .from('bookings')
    .select(query)
    .gte('start_at', startGte)
    .lt('start_at', startLt)
    .order('start_at', { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data || []) as any[];

  return rows.map((b) => {
    const customer = Array.isArray(b.customers) ? b.customers[0] : b.customers;
    const service = Array.isArray(b.services) ? b.services[0] : b.services;
    const stylist = Array.isArray(b.stylists) ? b.stylists[0] : b.stylists;

    const startDate = new Date(b.start_at);
    const endDate = new Date(b.end_at);

    return {
      id: b.id,
      customerName: customer?.name || 'Walk-in',
      customerPhone: customer?.phone || '',
      service: service?.name || 'Service',
      stylist: stylist?.name || 'Any Stylist',
      start: b.start_at,
      end: b.end_at,
      startIST: formatIST(startDate),
      endIST: formatIST(endDate),
      status: b.status
    };
  });
}

/**
 * Calculate dashboard summary metrics for today/tomorrow in Asia/Kolkata.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { dateString: todayStr, hours, dayOfWeek } = getCurrentISTDate();
  const tomorrowStr = addDaysToDate(todayStr, 1);
  const dayAfterTomorrowStr = addDaysToDate(todayStr, 2);

  // 1. Count today's bookings
  const { count: todayCount, error: todayError } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .gte('start_at', `${todayStr}T00:00:00+05:30`)
    .lt('start_at', `${tomorrowStr}T00:00:00+05:30`);

  if (todayError) {
    console.error('Error fetching today count:', todayError);
  }

  // 2. Count tomorrow's bookings
  const { count: tomorrowCount, error: tomorrowError } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .gte('start_at', `${tomorrowStr}T00:00:00+05:30`)
    .lt('start_at', `${dayAfterTomorrowStr}T00:00:00+05:30`);

  if (tomorrowError) {
    console.error('Error fetching tomorrow count:', tomorrowError);
  }

  // 3. Count pending approvals
  const { count: pendingCount, error: pendingError } = await supabase
    .from('approvals')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (pendingError) {
    console.error('Error fetching pending approvals count:', pendingError);
  }

  // 4. Calculate openSlots deterministically
  let openSlotsCount = 0;
  try {
    const { data: defaultService } = await supabase
      .from('services')
      .select('id')
      .ilike('name', 'Haircut')
      .single();

    if (defaultService) {
      // If today is mostly over (past 19:00 IST) or salon closed (Sunday), look at tomorrow
      const slotDate = hours >= 19 || dayOfWeek === 0 ? tomorrowStr : todayStr;
      const slots = await getAvailableSlots({
        serviceId: defaultService.id,
        date: slotDate
      });
      openSlotsCount = slots.length;
    }
  } catch (err) {
    console.warn('Could not calculate open slots for summary:', err);
  }

  return {
    todayAppointments: todayCount || 0,
    tomorrowAppointments: tomorrowCount || 0,
    pendingApprovals: pendingCount || 0,
    openSlots: openSlotsCount
  };
}

/**
 * Fetch latest activity logs newest first.
 */
export async function getActivityLogs(limit = 20) {
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const { data, error } = await supabase
    .from('activity_log')
    .select('id, actor, action, entity_type, entity_id, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw error;
  }

  return data ?? [];
}
