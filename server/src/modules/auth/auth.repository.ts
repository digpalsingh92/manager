import { prisma } from '../../config/database.config';
import { Prisma, WorkspaceRole } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
        workspaceMembers: {
          include: {
            workspace: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
        workspaceMembers: {
          include: {
            workspace: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  /**
   * Create a default workspace for the user and assign them as OWNER.
   * This runs inside a transaction.
   */
  async createDefaultWorkspace(userId: string, workspaceName: string) {
    return prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          createdById: userId,
        },
      });

      await tx.workspaceMember.create({
        data: {
          userId,
          workspaceId: workspace.id,
          role: WorkspaceRole.OWNER,
        },
      });

      return workspace;
    });
  }

  /**
   * @deprecated No longer used for new registrations. Kept for backward compatibility.
   */
  async assignDefaultRole(userId: string) {
    // Find the DEVELOPER role (default for new users)
    const defaultRole = await prisma.role.findUnique({
      where: { name: 'DEVELOPER' },
    });

    if (defaultRole) {
      await prisma.userRole.create({
        data: {
          userId,
          roleId: defaultRole.id,
        },
      });
    }
  }

  async updateUserPassword(userId: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: { id: true, email: true },
    });
  }
}
