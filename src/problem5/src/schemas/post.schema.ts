import { z } from 'zod';
import { CursorPaginationQuerySchema } from '../lib/cursor-pagination';

export const CreatePostBodySchema = z
  .object({
    title: z.string().min(1).max(255),
    description: z.string().min(1),
    body: z.string().min(1),
    tags: z.array(z.string()).default([]),
    categoryId: z.number().int().positive(),
  })
  .strict();

export const UpdatePostBodySchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().min(1).optional(),
    body: z.string().min(1).optional(),
    tags: z.array(z.string()).optional(),
    categoryId: z.number().int().positive().optional(),
  })
  .strict();

export const SearchPostsBodySchema = z
  .object({
    authorIds: z.array(z.uuid()).optional(),
    searchText: z.string().optional(),
    categoryIds: z.array(z.number().int().positive()).optional(),
  })
  .strict();

export const SearchPostsQuerySchema = CursorPaginationQuerySchema;

export type CreatePostBody = z.infer<typeof CreatePostBodySchema>;
export type UpdatePostBody = z.infer<typeof UpdatePostBodySchema>;
export type SearchPostsBody = z.infer<typeof SearchPostsBodySchema>;
export type SearchPostsQuery = z.infer<typeof SearchPostsQuerySchema>;
