import { z } from 'zod';

export const reminderWindowSchema = z.enum(['day_before', 'two_hours']);

export const reminderQuerySchema = z.object({
  window: reminderWindowSchema.default('day_before')
});

export type ReminderWindow = z.infer<typeof reminderWindowSchema>;
export type ReminderQueryInput = z.infer<typeof reminderQuerySchema>;
