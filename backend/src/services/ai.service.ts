import {
  AiStructuredOutput,
  aiStructuredOutputSchema
} from '../schemas/ai.schema';

const DAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
] as const;

export function getCurrentISTDate(): {
  dateString: string;
  dayOfWeek: number;
  dayName: string;
  hours: number;
  minutes: number;
} {
  const now = new Date();
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now); // "YYYY-MM-DD"

  const timeStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(now); // "HH:MM"

  const [hours, minutes] = timeStr.split(':').map(Number);
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = d.getUTCDay();

  return {
    dateString: dateStr,
    dayOfWeek,
    dayName: DAY_NAMES[dayOfWeek],
    hours,
    minutes
  };
}

export function addDaysToDate(baseDateStr: string, daysToAdd: number): string {
  const [year, month, day] = baseDateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + daysToAdd);
  return date.toISOString().split('T')[0];
}

export function createFallbackResponse(
  clarificationQuestion = "Could you please tell me which service and when you'd like to book?"
): AiStructuredOutput {
  return {
    intent: 'other',
    service: null,
    preferredDate: null,
    preferredTime: null,
    stylistPreference: null,
    customerName: null,
    phone: null,
    language: 'unknown',
    confidence: 0,
    needsClarification: true,
    clarificationQuestion
  };
}

/**
 * Deterministic NLP rule-based parser for Hindi/Hinglish/English salon booking messages.
 * Uses runtime Asia/Kolkata date to resolve relative dates accurately.
 */
export function parseMessageDeterministic(rawMessage: string): AiStructuredOutput {
  const text = rawMessage.trim();
  const lower = text.toLowerCase();
  const istInfo = getCurrentISTDate();
  const { dateString, dayOfWeek } = istInfo;

  // 1. Language detection
  const hinglishTokens = /\b(kal|parso|shaam|sham|subah|dopahar|baje|ke\s+saath|chahiye|karwana|karwao|daadhi|dhadhi|aur|ya|baal|aaj|ko|hai|kardo|karna|hatao|radd)\b/i;
  const isHinglish = hinglishTokens.test(lower);
  const language = isHinglish
    ? 'hinglish'
    : /^[a-z0-9\s.,!?'"()\-:/]+$/i.test(lower)
      ? 'english'
      : 'unknown';

  // 2. Intent detection
  let intent: AiStructuredOutput['intent'] = 'book';
  if (/\b(cancel|radd|hatao|nahi\s+aana)\b/i.test(lower)) {
    intent = 'cancel';
  } else if (/\b(reschedule|postpone|prepone|change\s+time|time\s+change|badal(na|o)?)\b/i.test(lower)) {
    intent = 'reschedule';
  } else if (/\b(available|availability|free|slots?|khali|kab\s+(khali|free))\b/i.test(lower)) {
    intent = 'availability';
  } else if (
    /\b(hello|hi|hey|namaste|hlo)\b/i.test(lower) &&
    !/\b(haircut|facial|spa|beard|trim|cutting|baal|daadhi|hjaircut)\b/i.test(lower)
  ) {
    intent = 'other';
  }

  // 3. Service matching & multi-service check (with typo resilience)
  const detectedServices: string[] = [];
  if (/\b(h[a-z]*rcut|hair\s*cut|cutting|baal\s*kat(na|wana|wao|ye)?|haircut)\b/i.test(lower)) {
    detectedServices.push('haircut');
  }
  if (/\b(facial|face\s*treatment)\b/i.test(lower)) {
    detectedServices.push('facial');
  }
  if (/\b(hair\s*spa|spa)\b/i.test(lower)) {
    detectedServices.push('hair_spa');
  }
  if (/\b(beard(\s*trim)?|da+dhi(\s*trim)?|dha+dhi(\s*trim)?|shave)\b/i.test(lower)) {
    detectedServices.push('beard_trim');
  }

  let service: string | null = null;
  let hasMultipleServices = false;
  if (detectedServices.length === 1) {
    service = detectedServices[0];
  } else if (detectedServices.length > 1) {
    hasMultipleServices = true;
  }

  // 4. Stylist preference matching
  let stylistPreference: string | null = null;
  let unknownStylist = false;

  if (/\baman\b/i.test(lower)) {
    stylistPreference = 'Aman';
  } else if (/\brohit\b/i.test(lower)) {
    stylistPreference = 'Rohit';
  } else {
    // Check if customer asked for a stylist name that we don't support
    const stylistWithMatch =
      lower.match(/([a-z]+)\s+ke\s+saath/i) ||
      lower.match(/with\s+([a-z]+)/i);
    if (stylistWithMatch) {
      const candidateName = stylistWithMatch[1].toLowerCase();
      const ignoredTokens = ['kisi', 'anyone', 'someone', 'koi', 'aur', 'the', 'my', 'your'];
      if (!ignoredTokens.includes(candidateName)) {
        unknownStylist = true;
      }
    }
  }

  // 5. Date resolution (Asia/Kolkata runtime relative)
  let preferredDate: string | null = null;
  const isPastDateRequested = /\b(yesterday|beeta\s+hua\s+kal|last\s+week)\b/i.test(lower);

  if (/\b(parso|day after tomorrow)\b/i.test(lower)) {
    preferredDate = addDaysToDate(dateString, 2);
  } else if (/\b(kal|tomorrow|tomorow|tommorrow|tmrw)\b/i.test(lower)) {
    preferredDate = addDaysToDate(dateString, 1);
  } else if (/\b(today|aaj)\b/i.test(lower)) {
    preferredDate = dateString;
  } else {
    for (let i = 0; i < DAY_NAMES.length; i++) {
      const dayPattern = new RegExp(`\\b(next\\s+)?${DAY_NAMES[i]}\\b`, 'i');
      if (dayPattern.test(lower)) {
        let diff = i - dayOfWeek;
        if (diff <= 0) diff += 7;
        preferredDate = addDaysToDate(dateString, diff);
        break;
      }
    }
  }

  // 6. Time period / exact time interpretation (with typo resilience)
  let preferredTime: string | null = null;
  const exactTimeMatch =
    lower.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i) ||
    lower.match(/\b(\d{1,2}\s*baje)\b/i) ||
    lower.match(/\b(\d{1,2}:\d{2})\b/i);

  if (exactTimeMatch) {
    preferredTime = exactTimeMatch[1].replace(/\s+/g, ' ').trim();
  } else if (/\b(shaam|sham|evening|evning|eveing|evng|raat)\b/i.test(lower)) {
    preferredTime = 'evening';
  } else if (/\b(subah|morning)\b/i.test(lower)) {
    preferredTime = 'morning';
  } else if (/\b(dopahar|afternoon)\b/i.test(lower)) {
    preferredTime = 'afternoon';
  }

  // 7. Clarification evaluation
  let needsClarification = false;
  let clarificationQuestion: string | null = null;
  let confidence = 0.95;

  if (isPastDateRequested) {
    needsClarification = true;
    clarificationQuestion =
      'Appointments cannot be booked for past dates. Would you like to book for today or tomorrow?';
    confidence = 0.9;
  } else if (unknownStylist) {
    needsClarification = true;
    clarificationQuestion =
      'We currently have stylists Aman and Rohit available. Which stylist would you prefer?';
    confidence = 0.7;
  } else if (hasMultipleServices) {
    needsClarification = true;
    clarificationQuestion =
      'We currently book one service per slot. Would you like to book a Haircut or a Facial?';
    confidence = 0.85;
  } else if (intent === 'other') {
    needsClarification = true;
    clarificationQuestion =
      'Hello! Welcome to BookMyChair. Which service would you like to book? (Haircut, Facial, Hair Spa, Beard Trim)';
    confidence = 0.95;
  } else if (!service) {
    needsClarification = true;
    clarificationQuestion = preferredDate
      ? 'Which service would you like to book for that day?'
      : 'Which service would you like to book? We offer Haircut, Facial, Hair Spa, and Beard Trim.';
    confidence = 0.8;
  } else if (!preferredDate) {
    needsClarification = true;
    const servName = service.replace('_', ' ');
    if (preferredTime) {
      clarificationQuestion = `Which date would you like to book your ${servName} for? (e.g. today or tomorrow at ${preferredTime})`;
    } else {
      clarificationQuestion = stylistPreference
        ? `When would you like to book your ${servName} with ${stylistPreference}?`
        : `When would you like to book your ${servName}? (e.g. tomorrow at 5pm)`;
    }
    confidence = 0.85;
  }

  const result: AiStructuredOutput = {
    intent,
    service,
    preferredDate,
    preferredTime,
    stylistPreference,
    customerName: null,
    phone: null,
    language,
    confidence,
    needsClarification,
    clarificationQuestion
  };

  const validation = aiStructuredOutputSchema.safeParse(result);
  if (!validation.success) {
    return createFallbackResponse();
  }

  return validation.data;
}

/**
 * Optional LLM API integration. If an API key is present in environment,
 * attempts to query Gemini for structured intent.
 */
async function callLLMProvider(
  message: string,
  istDateStr: string,
  istDayName: string
): Promise<AiStructuredOutput | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = process.env.LLM_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemInstruction = `You are the AI assistant for BookMyChair, a salon booking assistant.
Current date in Asia/Kolkata is ${istDateStr} (${istDayName}).
Available services: "haircut", "facial", "hair_spa", "beard_trim".
Available stylists: "Aman", "Rohit".
Resolve relative dates (kal = tomorrow, parso = day after tomorrow) relative to ${istDateStr}.
Canonical times: "morning" (subah), "afternoon" (dopahar), "evening" (shaam). Or exact time like "5pm", "4 baje".
Return JSON conforming exactly to this structure:
{
  "intent": "book" | "cancel" | "reschedule" | "availability" | "other",
  "service": string or null,
  "preferredDate": "YYYY-MM-DD" or null,
  "preferredTime": string or null,
  "stylistPreference": string or null,
  "customerName": string or null,
  "phone": string or null,
  "language": "hinglish" | "english" | "hindi" | "unknown",
  "confidence": number between 0 and 1,
  "needsClarification": boolean,
  "clarificationQuestion": string or null
}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\nCustomer message: "${message}"` }]
          }
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      console.warn(`LLM API returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsedJson = JSON.parse(rawText);
    const parsed = aiStructuredOutputSchema.safeParse(parsedJson);
    if (parsed.success) {
      return parsed.data;
    }

    return null;
  } catch (err) {
    console.warn('LLM API call failed, falling back to deterministic parser:', err);
    return null;
  }
}

/**
 * Main AI service function.
 * Accepts raw customer message and returns validated structured intent.
 */
export async function parseCustomerMessage(
  rawMessage: string
): Promise<AiStructuredOutput> {
  if (!rawMessage || typeof rawMessage !== 'string' || !rawMessage.trim()) {
    return createFallbackResponse();
  }

  const { dateString, dayName } = getCurrentISTDate();

  // Try LLM provider if configured
  try {
    const llmResult = await callLLMProvider(rawMessage, dateString, dayName);
    if (llmResult && llmResult.confidence >= 0.6) {
      return llmResult;
    }
  } catch (err) {
    console.error('LLM provider error:', err);
  }

  // Fallback to deterministic NLP parser
  try {
    return parseMessageDeterministic(rawMessage);
  } catch (err) {
    console.error('Deterministic parser error:', err);
    return createFallbackResponse();
  }
}
