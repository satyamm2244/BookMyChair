import { z } from 'zod';

export const patchApprovalSchema = z.object({
  action: z.enum(['approve', 'reject'])
});

export type PatchApprovalInput = z.infer<typeof patchApprovalSchema>;
