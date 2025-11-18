import { categoryRepo } from '../repositories/category.repository';

export const categoryService = {
  getAll: async () => Array.from((await categoryRepo.getAllAsMap()).values()),
};
