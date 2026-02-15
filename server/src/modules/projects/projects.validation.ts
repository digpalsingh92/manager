import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Project name is required' })
      .min(1, 'Project name is required')
      .max(100, 'Project name must not exceed 100 characters')
      .trim(),
    description: z
      .string()
      .max(1000, 'Description must not exceed 1000 characters')
      .optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID'),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, 'Project name cannot be empty')
      .max(100, 'Project name must not exceed 100 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .max(1000, 'Description must not exceed 1000 characters')
      .optional(),
  }),
});

export const projectIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID'),
  }),
});

export const addMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID'),
  }),
  body: z.object({
    userId: z
      .string({ required_error: 'User ID is required' })
      .uuid('Invalid user ID'),
  }),
});

export const getProjectsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(10).optional(),
    search: z.string().optional(),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type GetProjectsQuery = z.infer<typeof getProjectsQuerySchema>['query'];
