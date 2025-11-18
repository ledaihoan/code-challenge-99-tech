// Auth schemas and types for request validation.

import { z } from 'zod';

export const SignInBodySchema = z
  .object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8),
  })
  .strict();

export type SignInDto = z.infer<typeof SignInBodySchema>;

export const AuthorizationHeaderSchema = z.object({
  authorization: z.string().regex(/^Bearer\s+.+/i, 'Missing or invalid Bearer token'),
});

export type AuthorizationHeaderDto = z.infer<typeof AuthorizationHeaderSchema>;
