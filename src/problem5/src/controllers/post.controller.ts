import { Request, Response } from 'express';
import { postService } from '../services/post.service';
import {
  CreatePostBodySchema,
  UpdatePostBodySchema,
  SearchPostsBodySchema,
  SearchPostsQuerySchema,
} from '../schemas/post.schema';

export const createPost = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const body = CreatePostBodySchema.parse(req.body);
  const post = await postService.createPost(userId, body);
  return res.status(201).json(post);
};

export const getPostById = async (req: Request, res: Response) => {
  const id = BigInt(req.params.id);
  const post = await postService.getPostById(id);
  return res.status(200).json(post);
};

export const updatePost = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const id = BigInt(req.params.id);
  const body = UpdatePostBodySchema.parse(req.body);
  const post = await postService.updatePost(id, userId, body);
  return res.status(200).json(post);
};

export const deletePost = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const id = BigInt(req.params.id);
  await postService.deletePost(id, userId);
  return res.status(204).send();
};

export const searchUserPosts = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const query = SearchPostsQuerySchema.parse(req.query);
  const body = SearchPostsBodySchema.parse(req.body);

  const result = await postService.searchPosts({
    ...query,
    ...body,
    authorIds: [userId],
  });

  return res.status(200).json(result);
};

export const searchPosts = async (req: Request, res: Response) => {
  const query = SearchPostsQuerySchema.parse(req.query);
  const body = SearchPostsBodySchema.parse(req.body);

  const result = await postService.searchPosts({
    ...query,
    ...body,
  });

  return res.status(200).json(result);
};
