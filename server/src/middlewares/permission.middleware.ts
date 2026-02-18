import { Request, Response, NextFunction } from 'express';
import { WorkspaceRole } from '@prisma/client';
import { prisma } from '../config/database.config';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';

// ─── Workspace Role → Permission Mapping ─────
const WORKSPACE_ROLE_PERMISSIONS: Record<WorkspaceRole, string[]> = {
  OWNER: [
    'create_project', 'update_project', 'delete_project', 'manage_members',
    'create_task', 'update_task', 'move_task', 'delete_task', 'assign_task',
    'comment_task', 'manage_users',
  ],
  ADMIN: [
    'create_project', 'update_project', 'delete_project', 'manage_members',
    'create_task', 'update_task', 'move_task', 'delete_task', 'assign_task',
    'comment_task', 'manage_users',
  ],
  PROJECT_MANAGER: [
    'create_project', 'update_project', 'manage_members',
    'create_task', 'update_task', 'move_task', 'delete_task', 'assign_task',
    'comment_task',
  ],
  DEVELOPER: [
    'create_task', 'update_task', 'move_task', 'assign_task', 'comment_task',
  ],
  VIEWER: [
    'comment_task',
  ],
};

/**
 * Resolve workspace ID from various sources in the request.
 * Priority: req.params.workspaceId → req.body.workspaceId → req.query.workspaceId
 * Falls back to resolving from projectId (via project → workspace relation).
 */
async function resolveWorkspaceId(req: Request): Promise<string | null> {
  // Direct workspace ID from params, body, or query
  const workspaceId =
    req.params.workspaceId ||
    req.body?.workspaceId ||
    req.query?.workspaceId;

  if (workspaceId) return workspaceId as string;

  // Try to resolve from project context
  const projectId = req.params.projectId || req.body?.projectId;
  if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId as string },
      select: { workspaceId: true },
    });
    return project?.workspaceId ?? null;
  }

  // Try to resolve from task context (task → project → workspace)
  const taskId = req.params.id;
  if (taskId) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { project: { select: { workspaceId: true } } },
    });
    return task?.project?.workspaceId ?? null;
  }

  return null;
}

/**
 * Workspace-aware permission middleware.
 * Resolves the workspaceId from request context, fetches the user's
 * workspace role, and checks if the role grants the required permission.
 *
 * Usage: checkWorkspacePermission('create_project')
 */
export const checkWorkspacePermission = (requiredPermission: string) => {
  return asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
      if (!req.user) {
        throw AppError.unauthorized('Authentication required.');
      }

      // Resolve workspace context
      const workspaceId = await resolveWorkspaceId(req);
      if (!workspaceId) {
        throw AppError.badRequest(
          'Unable to determine workspace context. Provide workspaceId, projectId, or relevant resource ID.'
        );
      }

      // Fetch user's workspace membership
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: req.user.id,
            workspaceId,
          },
        },
        select: { role: true },
      });

      if (!membership) {
        throw AppError.forbidden('You are not a member of this workspace.');
      }

      // Check if the role grants the required permission
      const rolePermissions = WORKSPACE_ROLE_PERMISSIONS[membership.role] || [];
      if (!rolePermissions.includes(requiredPermission)) {
        throw AppError.forbidden(
          `You do not have the required permission: ${requiredPermission}`
        );
      }

      next();
    }
  );
};

/**
 * Check if user has a specific workspace role.
 *
 * Usage: checkWorkspaceRole('OWNER', 'ADMIN')
 */
export const checkWorkspaceRole = (...requiredRoles: WorkspaceRole[]) => {
  return asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
      if (!req.user) {
        throw AppError.unauthorized('Authentication required.');
      }

      const workspaceId = await resolveWorkspaceId(req);
      if (!workspaceId) {
        throw AppError.badRequest('Unable to determine workspace context.');
      }

      const membership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: req.user.id,
            workspaceId,
          },
        },
        select: { role: true },
      });

      if (!membership) {
        throw AppError.forbidden('You are not a member of this workspace.');
      }

      if (!requiredRoles.includes(membership.role)) {
        throw AppError.forbidden(
          `Required role: ${requiredRoles.join(' or ')}. Your role: ${membership.role}`
        );
      }

      next();
    }
  );
};

// ─── Legacy Global Permission Checks (backward compat) ───

/**
 * @deprecated Use checkWorkspacePermission instead
 * Dynamic permission-checking middleware using global roles.
 */
export const checkPermission = (requiredPermission: string) => {
  return asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
      if (!req.user) {
        throw AppError.unauthorized('Authentication required.');
      }

      // Fetch user's roles and their associated permissions
      const userPermissions = await prisma.userRole.findMany({
        where: { userId: req.user.id },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      // Flatten permissions from all roles
      const permissions = userPermissions.flatMap((ur) =>
        ur.role.rolePermissions.map((rp) => rp.permission.name)
      );

      // Check if user has the required permission
      if (!permissions.includes(requiredPermission)) {
        throw AppError.forbidden(
          `You do not have the required permission: ${requiredPermission}`
        );
      }

      next();
    }
  );
};

/**
 * @deprecated Use checkWorkspacePermission instead
 * Check if user has any of the specified permissions.
 */
export const checkAnyPermission = (...requiredPermissions: string[]) => {
  return asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
      if (!req.user) {
        throw AppError.unauthorized('Authentication required.');
      }

      const userPermissions = await prisma.userRole.findMany({
        where: { userId: req.user.id },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      const permissions = userPermissions.flatMap((ur) =>
        ur.role.rolePermissions.map((rp) => rp.permission.name)
      );

      const hasPermission = requiredPermissions.some((rp) =>
        permissions.includes(rp)
      );

      if (!hasPermission) {
        throw AppError.forbidden(
          `You need one of the following permissions: ${requiredPermissions.join(', ')}`
        );
      }

      next();
    }
  );
};
