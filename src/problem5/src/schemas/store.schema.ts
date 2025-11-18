import { z } from 'zod';
import { SERVICE_TYPES } from '../constants/store-types';

export const SearchStoresQuerySchema = z.object({
  countryIds: z.array(z.int().positive()).min(1).optional(),
  name: z.string().optional(),
  serviceTypes: z.array(z.enum(SERVICE_TYPES)).min(1).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().max(100).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
});
