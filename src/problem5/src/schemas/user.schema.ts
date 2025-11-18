import { z } from 'zod';

export const UpdateProfileBodySchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileBodySchema>;

export const UpdateLocationBodySchema = z.object({
  address: z.string().min(1).max(500).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type UpdateLocationDto = z.infer<typeof UpdateLocationBodySchema>;

export const UserIdParamSchema = z.object({
  id: z.uuid(),
});

export type UserIdParamDto = z.infer<typeof UserIdParamSchema>;
