import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Role name is required' })
      .min(1, 'Role name is required')
      .max(50, 'Role name must not exceed 50 characters')
      .trim(),
    description: z.string().max(255).optional(),
    permissions: z
      .array(z.string().min(1))
      .optional(),
  }),
});

export const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid role ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(50).trim().optional(),
    description: z.string().max(255).optional(),
    permissions: z.array(z.string().min(1)).optional(),
  }),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>['body'];
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
