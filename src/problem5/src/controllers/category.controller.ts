import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';

export const getAllCategories = async (req: Request, res: Response) => {
  const categories = await categoryService.getAll();
  return res.status(200).json(categories);
};
