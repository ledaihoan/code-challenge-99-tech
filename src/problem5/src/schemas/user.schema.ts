import { z } from 'zod';

export const UpdateProfileBodySchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileBodySchema>;

export const UserIdParamSchema = z.object({
  id: z.uuid(),
});

export type UserIdParamDto = z.infer<typeof UserIdParamSchema>;
