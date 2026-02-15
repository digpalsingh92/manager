import { z } from 'zod';

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    roleNames: z
      .array(z.string().min(1, 'Role name is required'))
      .min(1, 'At least one role is required'),
  }),
});

export const getUsersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(10).optional(),
    search: z.string().optional(),
  }),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>['query'];
