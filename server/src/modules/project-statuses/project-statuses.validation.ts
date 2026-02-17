import { z } from 'zod';

export const projectIdParamSchema = z.object({
  params: z.object({
    projectId: z.string().uuid('Invalid project ID'),
  }),
});

export const listProjectStatusesSchema = z.object({
  params: z.object({
    projectId: z.string().uuid('Invalid project ID'),
  }),
});

export const createProjectStatusSchema = z.object({
  params: z.object({
    projectId: z.string().uuid('Invalid project ID'),
  }),
  body: z.object({
    label: z
      .string({ required_error: 'Status label is required' })
      .min(1, 'Status label is required')
      .max(50, 'Status label must not exceed 50 characters')
      .trim(),
    key: z
      .string()
      .max(50, 'Status key must not exceed 50 characters')
      .regex(/^[A-Z0-9_]+$/, 'Status key must be UPPER_SNAKE_CASE')
      .optional(),
  }),
});

export type CreateProjectStatusInput = z.infer<typeof createProjectStatusSchema>['body'];

