import { supabase } from '../db/supabase';
import { getAvailableSlots, AvailableSlot } from './availability.service';
import { parseCustomerMessage, getCurrentISTDate, addDaysToDate } from './ai.service';
import { ChatRequestInput } from '../schemas/chat.schema';

export type ChatResponse =
  | {
      type: 'clarification';
      message: string;
    }
  | {
      type: 'slots';
      message: string;
      serviceId: string;
      service: string;
      date: string;
      slots: AvailableSlot[];
    }
  | {
      type: 'approval_required';
      message: string;
    }
  | {
      type: 'no_availability';
      message: string;
    }
  | {
      type: 'error';
      message: string;
    };

/**
 * Log activities in the activity_log table.
 */
async function logActivity(params: {
  actor: 'agent' | 'system';
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await supabase.from('activity_log').insert({
      actor: params.actor,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      metadata: params.metadata ?? {}
    });
  } catch (err) {
    console.error('Failed to write activity log:', err);
  }
}

/**
 * Resolve database service ID & display name from normalized service token.
 */
async function resolveServiceFromDb(normalizedService: string): Promise<{ id: string; name: string } | null> {
  const serviceNameMap: Record<string, string> = {
    haircut: 'Haircut',
    facial: 'Facial',
    hair_spa: 'Hair Spa',
    beard_trim: 'Beard Trim'
  };

  const lookupName = serviceNameMap[normalizedService] || normalizedService;

  const { data, error } = await supabase
    .from('services')
    .select('id, name')
    .ilike('name', lookupName)
    .eq('active', true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return { id: data.id, name: data.name };
}

/**
 * Resolve database stylist ID & name from stylist preference.
 */
async function resolveStylistFromDb(stylistName: string): Promise<{ id: string; name: string } | null> {
  const { data, error } = await supabase
    .from('stylists')
    .select('id, name')
    .ilike('name', stylistName.trim())
    .eq('active', true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return { id: data.id, name: data.name };
}

/**
 * Extract IST hour and minute from UTC ISO timestamp.
 */
function getISTTimeComponents(isoString: string): { hour: number; minute: number } {
  const d = new Date(isoString);
  const timeStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d);
  const [hour, minute] = timeStr.split(':').map(Number);
  return { hour, minute };
}

/**
 * Parse exact time string (e.g. 5pm, 4 baje, 17:30) to minutes from midnight in IST.
 */
function parseExactTimeToMinutes(timeStr: string): number | null {
  const norm = timeStr.trim().toLowerCase();

  const ampmMatch = norm.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    if (ampmMatch[3] === 'pm' && h < 12) h += 12;
    if (ampmMatch[3] === 'am' && h === 12) h = 0;
    return h * 60 + m;
  }

  const bajeMatch = norm.match(/^(\d{1,2})\s*baje$/);
  if (bajeMatch) {
    let h = parseInt(bajeMatch[1], 10);
    if (h <= 8) h += 12; // salon context: 4 baje = 16:00
    return h * 60;
  }

  const time24Match = norm.match(/^(\d{1,2}):(\d{2})$/);
  if (time24Match) {
    const h = parseInt(time24Match[1], 10);
    const m = parseInt(time24Match[2], 10);
    return h * 60 + m;
  }

  return null;
}

/**
 * Filter and sort available slots based on preferred time or canonical period.
 * Maximum 3 slots returned.
 */
function filterSlotsByPreference(
  slots: AvailableSlot[],
  preferredTime: string | null | undefined
): AvailableSlot[] {
  if (slots.length === 0) return [];
  if (!preferredTime) return slots.slice(0, 3);

  const norm = preferredTime.trim().toLowerCase();

  if (norm === 'morning') {
    return slots
      .filter((s) => {
        const { hour } = getISTTimeComponents(s.start);
        return hour >= 10 && hour < 12;
      })
      .slice(0, 3);
  }

  if (norm === 'afternoon') {
    return slots
      .filter((s) => {
        const { hour } = getISTTimeComponents(s.start);
        return hour >= 12 && hour < 16;
      })
      .slice(0, 3);
  }

  if (norm === 'evening') {
    return slots
      .filter((s) => {
        const { hour } = getISTTimeComponents(s.start);
        return hour >= 16 && hour < 19;
      })
      .slice(0, 3);
  }

  // Exact time handling: find closest valid slots
  const targetMinutes = parseExactTimeToMinutes(norm);
  if (targetMinutes !== null) {
    const slotsWithMinutes = slots.map((s) => {
      const { hour, minute } = getISTTimeComponents(s.start);
      return { slot: s, minutes: hour * 60 + minute };
    });

    slotsWithMinutes.sort((a, b) => {
      const diffA = Math.abs(a.minutes - targetMinutes);
      const diffB = Math.abs(b.minutes - targetMinutes);
      if (diffA !== diffB) return diffA - diffB;
      return a.minutes - b.minutes;
    });

    const topSlots = slotsWithMinutes.slice(0, 3).map((item) => item.slot);
    // Sort selected slots chronologically
    return topSlots.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );
  }

  return slots.slice(0, 3);
}

/**
 * Generate human-friendly message describing available slots.
 */
function buildSlotMessage(params: {
  serviceName: string;
  stylistName?: string;
  date: string;
  preferredTime?: string | null;
  baseDateStr: string;
  tomorrowDateStr: string;
}): string {
  const {
    serviceName,
    stylistName,
    date,
    preferredTime,
    baseDateStr,
    tomorrowDateStr
  } = params;

  let dayText = `on ${date}`;
  if (date === baseDateStr) {
    dayText = 'today';
  } else if (date === tomorrowDateStr) {
    dayText = 'tomorrow';
  }

  const stylistText = stylistName ? ` with ${stylistName}` : '';
  const timeText = preferredTime ? ` ${preferredTime}` : '';

  return `I found these available slots for your ${serviceName.toLowerCase()}${stylistText} ${dayText}${timeText}:`;
}

/**
 * Main chat orchestration function.
 */
export async function handleChatMessage(
  input: ChatRequestInput
): Promise<ChatResponse> {
  const { message, customerId } = input;

  // 1. Parse customer message with AI/NLP engine
  const parsedIntent = await parseCustomerMessage(message);

  await logActivity({
    actor: 'agent',
    action: 'message interpreted',
    entityType: 'chat',
    metadata: {
      message,
      customerId,
      intent: parsedIntent.intent,
      service: parsedIntent.service,
      preferredDate: parsedIntent.preferredDate,
      preferredTime: parsedIntent.preferredTime,
      stylistPreference: parsedIntent.stylistPreference,
      confidence: parsedIntent.confidence
    }
  });

  // 2. Handle cancel or reschedule approval flows
  if (parsedIntent.intent === 'cancel' || parsedIntent.intent === 'reschedule') {
    await supabase.from('approvals').insert({
      type: parsedIntent.intent,
      customer_id: customerId ?? null,
      status: 'pending',
      payload: {
        message,
        parsedIntent
      }
    });

    await logActivity({
      actor: 'system',
      action: 'approval required',
      entityType: 'approval',
      metadata: {
        intent: parsedIntent.intent,
        customerId,
        message
      }
    });

    return {
      type: 'approval_required',
      message: 'This request needs salon owner approval.'
    };
  }

  // 3. Handle clarifications or greetings
  if (parsedIntent.needsClarification || parsedIntent.intent === 'other') {
    const question =
      parsedIntent.clarificationQuestion ||
      'Which service would you like to book? We offer Haircut, Facial, Hair Spa, and Beard Trim.';

    await logActivity({
      actor: 'agent',
      action: 'clarification requested',
      entityType: 'chat',
      metadata: {
        message,
        question
      }
    });

    return {
      type: 'clarification',
      message: question
    };
  }

  // 4. Resolve service
  if (!parsedIntent.service) {
    const question = 'Which service would you like to book? We offer Haircut, Facial, Hair Spa, and Beard Trim.';
    await logActivity({
      actor: 'agent',
      action: 'clarification requested',
      entityType: 'chat',
      metadata: { message, question }
    });
    return {
      type: 'clarification',
      message: question
    };
  }

  const service = await resolveServiceFromDb(parsedIntent.service);
  if (!service) {
    const question = 'I could not find that service in our salon. We offer Haircut, Facial, Hair Spa, and Beard Trim.';
    await logActivity({
      actor: 'agent',
      action: 'clarification requested',
      entityType: 'chat',
      metadata: { message, question }
    });
    return {
      type: 'clarification',
      message: question
    };
  }

  // 5. Resolve date
  if (!parsedIntent.preferredDate) {
    const question = `When would you like to book your ${service.name.toLowerCase()}? (e.g. tomorrow at 5pm)`;
    await logActivity({
      actor: 'agent',
      action: 'clarification requested',
      entityType: 'chat',
      metadata: { message, question }
    });
    return {
      type: 'clarification',
      message: question
    };
  }

  // 6. Resolve optional stylist
  let stylist: { id: string; name: string } | null = null;
  if (parsedIntent.stylistPreference) {
    stylist = await resolveStylistFromDb(parsedIntent.stylistPreference);
    if (!stylist) {
      const question = 'We currently have stylists Aman and Rohit available. Which stylist would you prefer?';
      await logActivity({
        actor: 'agent',
        action: 'clarification requested',
        entityType: 'chat',
        metadata: { message, question }
      });
      return {
        type: 'clarification',
        message: question
      };
    }
  }

  // 7. Calculate deterministic availability
  const allSlots = await getAvailableSlots({
    serviceId: service.id,
    date: parsedIntent.preferredDate,
    stylistId: stylist?.id
  });

  // 8. Filter slots by time preference (max 3)
  const usefulSlots = filterSlotsByPreference(allSlots, parsedIntent.preferredTime);

  // 9. If no slots found
  if (usefulSlots.length === 0) {
    await logActivity({
      actor: 'system',
      action: 'no availability found',
      entityType: 'service',
      entityId: service.id,
      metadata: {
        date: parsedIntent.preferredDate,
        preferredTime: parsedIntent.preferredTime,
        stylistId: stylist?.id
      }
    });

    return {
      type: 'no_availability',
      message: "I couldn't find an available slot for that time. Would you like to try another time?"
    };
  }

  // 10. Return available slots
  const istInfo = getCurrentISTDate();
  const tomorrowStr = addDaysToDate(istInfo.dateString, 1);

  const slotMessage = buildSlotMessage({
    serviceName: service.name,
    stylistName: stylist?.name,
    date: parsedIntent.preferredDate,
    preferredTime: parsedIntent.preferredTime,
    baseDateStr: istInfo.dateString,
    tomorrowDateStr: tomorrowStr
  });

  await logActivity({
    actor: 'system',
    action: 'availability generated',
    entityType: 'service',
    entityId: service.id,
    metadata: {
      date: parsedIntent.preferredDate,
      slotCount: usefulSlots.length,
      serviceName: service.name,
      stylistName: stylist?.name
    }
  });

  return {
    type: 'slots',
    message: slotMessage,
    serviceId: service.id,
    service: service.name,
    date: parsedIntent.preferredDate,
    slots: usefulSlots
  };
}
