import { z } from 'zod';

export const aiIntentSchema = z.enum([
  'book',
  'cancel',
  'reschedule',
  'availability',
  'other'
]);

export type AiIntent = z.infer<typeof aiIntentSchema>;

export const aiStructuredOutputSchema = z.object({
  intent: aiIntentSchema,
  service: z.string().nullable().optional(),
  preferredDate: z.string().nullable().optional(),
  preferredTime: z.string().nullable().optional(),
  stylistPreference: z.string().nullable().optional(),
  customerName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1),
  needsClarification: z.boolean(),
  clarificationQuestion: z.string().nullable().optional()
});

export type AiStructuredOutput = z.infer<typeof aiStructuredOutputSchema>;
