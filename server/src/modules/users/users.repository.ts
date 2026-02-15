import { prisma } from '../../config/database.config';
import { Prisma } from '@prisma/client';

export class UsersRepository {
  async findAll(options: {
    skip: number;
    take: number;
    where?: Prisma.UserWhereInput;
  }) {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { ...options.where, deletedAt: null },
        skip: options.skip,
        take: options.take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          createdAt: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: { ...options.where, deletedAt: null } }),
    ]);

    return { users, total };
  }

  async findById(id: string) {
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

  async updateUserRoles(userId: string, roleIds: string[]) {
    // Transaction: remove old roles, assign new ones
    return prisma.$transaction(async (tx) => {
      // Remove existing roles
      await tx.userRole.deleteMany({ where: { userId } });

      // Assign new roles
      await tx.userRole.createMany({
        data: roleIds.map((roleId) => ({
          userId,
          roleId,
        })),
      });

      // Return updated user
      return tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          userRoles: {
            include: { role: true },
          },
        },
      });
    });
  }

  async findRolesByNames(names: string[]) {
    return prisma.role.findMany({
      where: { name: { in: names } },
    });
  }
}
