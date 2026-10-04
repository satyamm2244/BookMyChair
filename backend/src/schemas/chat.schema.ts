import { z } from 'zod';

export const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'message cannot be empty')
    .max(500, 'message cannot exceed 500 characters'),
  customerId: z
    .string()
    .uuid('customerId must be a valid UUID')
    .nullable()
    .optional()
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
