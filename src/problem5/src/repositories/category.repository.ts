import { prisma } from '../lib/prisma';

const createCategoryRepo = () => {
    const base = prisma.category;
    // TODO: replace with redis cache
    let categoryCache: Map<number, any> | null = null;

    return {
        ...base,

        async getAllAsMap(): Promise<Map<number, any>> {
            if (categoryCache) {
                return categoryCache;
            }

            const categories = await base.findMany({
                include: {
                    parent: true,
                },
            });

            categoryCache = new Map(categories.map((cat) => [cat.id, cat]));
            return categoryCache;
        },

        clearCache() {
            categoryCache = null;
        },
    };
};

export const categoryRepo = createCategoryRepo();