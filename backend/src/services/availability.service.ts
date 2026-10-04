import { supabase } from '../db/supabase';

export type AvailabilityInput = {
  serviceId: string;
  date: string; // YYYY-MM-DD
  stylistId?: string;
};

export type AvailableSlot = {
  stylistId: string;
  stylistName: string;

  start: string;
  end: string;

  startIST: string;
  endIST: string;
};

export function formatIST(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

export async function getAvailableSlots(
  input: AvailabilityInput
): Promise<AvailableSlot[]> {
  const { serviceId, date, stylistId } = input;

  // 1. Get service duration
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('id, name, duration_minutes')
    .eq('id', serviceId)
    .eq('active', true)
    .single();

  if (serviceError || !service) {
    throw new Error('Service not found');
  }

  const durationMinutes = service.duration_minutes;

  // 2. Parse requested date in IST
  const requestedDate = new Date(`${date}T00:00:00+05:30`);

  if (Number.isNaN(requestedDate.getTime())) {
    throw new Error('Invalid date');
  }

  const dayOfWeek = requestedDate.getDay();

  // Sunday closed for current seed setup
  if (dayOfWeek === 0) {
    return [];
  }

  // 3. Get eligible stylists
  let stylistQuery = supabase
    .from('stylists')
    .select('id, name')
    .eq('active', true);

  if (stylistId) {
    stylistQuery = stylistQuery.eq('id', stylistId);
  }

  const { data: stylists, error: stylistError } = await stylistQuery;

  if (stylistError) {
    throw stylistError;
  }

  if (!stylists || stylists.length === 0) {
    return [];
  }

  const availableSlots: AvailableSlot[] = [];

  // 4. Check each stylist
  for (const stylist of stylists) {
    const { data: workingHours, error: workingHoursError } = await supabase
      .from('stylist_working_hours')
      .select('start_time, end_time')
      .eq('stylist_id', stylist.id)
      .eq('day_of_week', dayOfWeek)
      .maybeSingle();

    if (workingHoursError) {
      throw workingHoursError;
    }

    if (!workingHours) {
      continue;
    }

    // Check day off
    const { data: dayOff, error: dayOffError } = await supabase
      .from('stylist_days_off')
      .select('id')
      .eq('stylist_id', stylist.id)
      .eq('date', date)
      .maybeSingle();

    if (dayOffError) {
      throw dayOffError;
    }

    if (dayOff) {
      continue;
    }

    const workStart = new Date(
      `${date}T${workingHours.start_time}+05:30`
    );

    const workEnd = new Date(
      `${date}T${workingHours.end_time}+05:30`
    );

    const nextDay = new Date(`${date}T00:00:00+05:30`);
    nextDay.setDate(nextDay.getDate() + 1);

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('start_at, end_at')
      .eq('stylist_id', stylist.id)
      .in('status', ['pending', 'confirmed'])
      .gte('start_at', `${date}T00:00:00+05:30`)
      .lt('start_at', nextDay.toISOString());

    if (bookingsError) {
      throw bookingsError;
    }

    let cursor = new Date(workStart);

    while (
      cursor.getTime() + durationMinutes * 60_000 <= workEnd.getTime()
    ) {
      const slotStart = new Date(cursor);

      const slotEnd = new Date(
        slotStart.getTime() + durationMinutes * 60_000
      );

      const overlaps = (bookings ?? []).some((booking) => {
        const bookingStart = new Date(booking.start_at);
        const bookingEnd = new Date(booking.end_at);

        return (
          slotStart.getTime() < bookingEnd.getTime() &&
          slotEnd.getTime() > bookingStart.getTime()
        );
      });

      const now = new Date();
      const isPast = slotStart.getTime() <= now.getTime();

      if (!overlaps && !isPast) {
        availableSlots.push({
          stylistId: stylist.id,
          stylistName: stylist.name,

          // Machine-friendly UTC ISO timestamps
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),

          // Human-friendly IST timestamps
          startIST: formatIST(slotStart),
          endIST: formatIST(slotEnd)
        });
      }

      cursor = new Date(cursor.getTime() + 30 * 60_000);
    }
  }

  availableSlots.sort(
    (a, b) =>
      new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  return availableSlots;
}