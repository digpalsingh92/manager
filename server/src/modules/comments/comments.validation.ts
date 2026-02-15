import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.object({
    content: z
      .string({ required_error: 'Comment content is required' })
      .min(1, 'Comment content is required')
      .max(2000, 'Comment must not exceed 2000 characters')
      .trim(),
    taskId: z
      .string({ required_error: 'Task ID is required' })
      .uuid('Invalid task ID'),
  }),
});

export const commentIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid comment ID'),
  }),
});

export const commentsByTaskSchema = z.object({
  params: z.object({
    taskId: z.string().uuid('Invalid task ID'),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  }),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>['body'];
export type CommentsByTaskQuery = z.infer<typeof commentsByTaskSchema>;
