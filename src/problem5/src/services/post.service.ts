// src/services/post.service.ts
import { Prisma } from '@prisma/client';
import {
    buildPaginationResponse,
    buildPaginationWhere,
    CursorPaginatedResponseDto,
    PaginationParams,
} from '../lib/cursor-pagination';
import { postRepo } from '../repositories/post.repository';

export const postService = {
    createPost: async (
        userId: string,
        data: {
            title: string;
            description: string;
            body: string;
            tags: string[];
            categoryId: number;
        },
    ) => {
        return postRepo.create({
            data: {
                ...data,
                userId,
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
        });
    },

    getPostById: async (id: bigint) => {
        return postRepo.findUniqueOrThrow({
            where: { id },
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
        });
    },

    updatePost: async (
        id: bigint,
        userId: string,
        data: {
            title?: string;
            description?: string;
            body?: string;
            tags?: string[];
            categoryId?: number;
        },
    ) => {
        return postRepo.update({
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
        });
    },

    deletePost: async (id: bigint, userId: string) => {
        return postRepo.delete({
            where: { id, userId },
        });
    },

    searchPosts: async (
        params: PaginationParams & {
            authorIds?: string[];
            searchText?: string;
            categoryIds?: number[];
        },
    ): Promise<CursorPaginatedResponseDto<any>> => {
        const { authorIds, searchText, categoryIds, ...paginationParams } = params;

        const initialWhere: any = {};

        if (authorIds && authorIds.length > 0) {
            initialWhere.userId = { in: authorIds };
        }

        if (categoryIds && categoryIds.length > 0) {
            initialWhere.categoryId = { in: categoryIds };
        }

        if (searchText && searchText.trim()) {
            initialWhere.searchVector = {
                search: searchText.trim(),
            };
        }

        const { where, orderBy, take } = buildPaginationWhere(paginationParams, initialWhere);

        const results = await postRepo.findMany({
            where,
            orderBy,
            take,
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
        });

        return buildPaginationResponse(
            results,
            paginationParams.limit,
            paginationParams.sortBy || 'createdAt',
        );
    },
};