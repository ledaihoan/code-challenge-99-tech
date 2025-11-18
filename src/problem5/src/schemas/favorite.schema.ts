import { z } from 'zod';

export const AddFavoriteBodySchema = z.object({
  storeId: z.uuid(),
});

export type AddFavoriteDto = z.infer<typeof AddFavoriteBodySchema>;

export const RemoveFavoriteParamSchema = z.object({
  storeId: z.uuid(),
});

export type RemoveFavoriteParamDto = z.infer<typeof RemoveFavoriteParamSchema>;
