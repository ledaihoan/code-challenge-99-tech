// src/repositories/post.repo.ts
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  buildPaginationWhere,
  buildPaginationResponse,
  PaginationParams,
  CursorPaginatedResponseDto,
} from '../lib/cursor-pagination';

const createPostRepo = () => {
  const base = prisma.post;

  return {
    ...base,

    createPost: (userId: string, data: Prisma.PostCreateInput) =>
      base.create({
        data: {
          ...data,
          user: { connect: { id: userId } },
        },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),

    findByIdAndUser: (id: bigint, userId: string) =>
      base.findFirstOrThrow({
        where: { id, userId },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),

    updatePost: (id: bigint, userId: string, data: Prisma.PostUpdateInput) =>
      base.update({
        where: { id, userId },
        data,
        include: {
          category: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),

    deletePost: (id: bigint, userId: string) =>
      base.delete({
        where: { id, userId },
      }),
  };
};

export const postRepo = createPostRepo();
