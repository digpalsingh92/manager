import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.config';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Dynamic permission-checking middleware.
 * Validates that the authenticated user has the required permission
 * through their assigned roles.
 *
 * Usage: checkPermission('create_task')
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
