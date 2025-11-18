// src/lib/pagination.ts
import { z } from 'zod';

export interface CursorPaginatedResponseDto<T> {
  nextCursor: string | null;
  items: T[];
}

export interface GenericCursor {
  value: string | number;
  id: string | bigint;
  sortBy: string;
}

export interface PaginationParams {
  cursor?: string;
  sortBy?: string;
  limit: number;
  sortOrder?: 'ASC' | 'DESC';
}

export const CursorPaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(1000).default(10),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export type CursorPaginationQuery = z.infer<typeof CursorPaginationQuerySchema>;

export function buildPaginationWhere<T>(
  params: PaginationParams,
  initialWhere: any = {},
): { where: any; orderBy: any[]; take: number } {
  const sortBy = params.sortBy || 'createdAt';
  const isAsc = params.sortOrder === 'ASC';
  const { limit } = params;

  const where: any = { ...initialWhere };
  const orderDirection = isAsc ? 'asc' : 'desc';

  let parsedCursor: GenericCursor | undefined;
  if (params.cursor) {
    try {
      const decoded = Buffer.from(params.cursor, 'base64').toString('utf-8');
      parsedCursor = JSON.parse(decoded);

      if (parsedCursor?.sortBy !== sortBy) {
        throw new Error('Invalid cursor: sortBy mismatch');
      }
    } catch (error) {
      throw new Error('Invalid cursor format');
    }
  }

  if (parsedCursor) {
    const { id, value } = parsedCursor;
    let actualValue: any = value;

    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      actualValue = new Date(Number(value));
    }

    const op = isAsc ? 'gt' : 'lt';

    where.OR = [
      { [sortBy]: { [op]: actualValue } },
      {
        [sortBy]: actualValue,
        id: { [op]: id },
      },
    ];
  }

  const orderBy = [{ [sortBy]: orderDirection }, { id: orderDirection }];

  return {
    where,
    orderBy,
    take: limit + 1,
  };
}

export function buildPaginationResponse<T extends { id: any; [key: string]: any }>(
  results: T[],
  limit: number,
  sortBy: string,
): CursorPaginatedResponseDto<T> {
  const hasNextPage = results.length > limit;
  const items = hasNextPage ? results.slice(0, limit) : results;

  let nextCursor: string | null = null;

  if (hasNextPage) {
    const lastItem = items[items.length - 1];
    const itemValue = lastItem[sortBy];

    let cursorValue: string | number;

    if (itemValue instanceof Date) {
      cursorValue = itemValue.getTime();
    } else if (typeof itemValue === 'bigint') {
      cursorValue = itemValue.toString();
    } else {
      cursorValue = itemValue;
    }

    const cursorObject: GenericCursor = {
      value: cursorValue,
      id: typeof lastItem.id === 'bigint' ? lastItem.id.toString() : lastItem.id,
      sortBy,
    };

    nextCursor = Buffer.from(JSON.stringify(cursorObject)).toString('base64');
  }

  return {
    nextCursor,
    items,
  };
}
