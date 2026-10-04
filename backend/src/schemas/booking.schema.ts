import { z } from 'zod';

export const bookingRequestSchema = z
  .object({
    customerName: z
      .string()
      .trim()
      .min(1, 'customerName cannot be empty')
      .max(100, 'customerName must be at most 100 characters'),
    phone: z
      .string()
      .trim()
      .min(7, 'Phone number must be at least 7 characters')
      .max(20, 'Phone number must be at most 20 characters')
      .regex(/^\+?[0-9\s-]{7,20}$/, 'Invalid phone number format'),
    serviceId: z
      .string()
      .uuid('serviceId must be a valid UUID'),
    stylistId: z
      .string()
      .uuid('stylistId must be a valid UUID'),
    start: z
      .string()
      .datetime({ offset: true, message: 'start must be a valid ISO 8601 timestamp' }),
    end: z
      .string()
      .datetime({ offset: true, message: 'end must be a valid ISO 8601 timestamp' })
  })
  .refine(
    (data) => new Date(data.end).getTime() > new Date(data.start).getTime(),
    {
      message: 'end timestamp must be after start timestamp',
      path: ['end']
    }
  );

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
