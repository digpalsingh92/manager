import { z } from 'zod';

// ─── Workspace Schemas ────────────────────────

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Workspace name is required' })
      .min(1, 'Workspace name is required')
      .max(100, 'Workspace name must not exceed 100 characters')
      .trim(),
  }),
});

export const workspaceIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workspace ID'),
  }),
});

export const inviteMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workspace ID'),
  }),
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format')
      .trim()
      .toLowerCase(),
    role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'VIEWER'], {
      required_error: 'Role is required',
      invalid_type_error: 'Invalid role. Must be ADMIN, PROJECT_MANAGER, DEVELOPER, or VIEWER',
    }),
  }),
});

export const updateMemberRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workspace ID'),
    memberId: z.string().uuid('Invalid member ID'),
  }),
  body: z.object({
    role: z.enum(['OWNER', 'ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'VIEWER'], {
      required_error: 'Role is required',
      invalid_type_error: 'Invalid role',
    }),
  }),
});

export const removeMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workspace ID'),
    memberId: z.string().uuid('Invalid member ID'),
  }),
});

// ─── Types ───────────────────────────────────

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>['body'];
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
