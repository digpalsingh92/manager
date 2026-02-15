import { prisma } from '../../config/database.config';
import { Prisma } from '@prisma/client';

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
}
