import { supabase } from '../db/supabase';

type CreateBookingInput = {
  customerName: string;
  phone: string;
  serviceId: string;
  stylistId: string;
  start: string;
  end: string;
};

export async function createBooking(input: CreateBookingInput) {
  const {
    customerName,
    phone,
    serviceId,
    stylistId,
    start,
    end
  } = input;

  // 1. Find or create customer
  let customerId: string;

  const { data: existingCustomer, error: customerLookupError } =
    await supabase
      .from('customers')
      .select('id, name, phone')
      .eq('phone', phone)
      .maybeSingle();

  if (customerLookupError) {
    throw customerLookupError;
  }

  if (existingCustomer) {
    customerId = existingCustomer.id;

    if (customerName && existingCustomer.name !== customerName) {
      await supabase
        .from('customers')
        .update({ name: customerName })
        .eq('id', customerId);
    }
  } else {
    const { data: newCustomer, error: customerInsertError } =
      await supabase
        .from('customers')
        .insert({
          name: customerName,
          phone
        })
        .select('id')
        .single();

    if (customerInsertError || !newCustomer) {
      throw customerInsertError ?? new Error('Failed to create customer');
    }

    customerId = newCustomer.id;
  }

  // 2. Insert booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      customer_id: customerId,
      service_id: serviceId,
      stylist_id: stylistId,
      start_at: start,
      end_at: end,
      status: 'confirmed',
      source: 'chat'
    })
    .select(`
      id,
      start_at,
      end_at,
      status,
      customer_id,
      service_id,
      stylist_id
    `)
    .single();

  if (bookingError) {
    const message = bookingError.message.toLowerCase();

    if (
      message.includes('prevent_stylist_double_booking') ||
      message.includes('conflicting key value violates exclusion constraint')
    ) {
      throw new Error('SLOT_UNAVAILABLE');
    }

    throw bookingError;
  }

  // 3. Log activity
  await supabase.from('activity_log').insert({
    actor: 'system',
    action: 'Booking confirmed',
    entity_type: 'booking',
    entity_id: booking.id,
    metadata: {
      customerId,
      serviceId,
      stylistId,
      start,
      end
    }
  });

  return booking;
}