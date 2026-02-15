import { prisma } from '../../config/database.config';

export class RolesRepository {
  async findAll() {
    return prisma.role.findMany({
      include: {
        rolePermissions: {
          include: { permission: true },
        },
        _count: { select: { userRoles: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });
  }

  async findByName(name: string) {
    return prisma.role.findUnique({ where: { name } });
  }

  async create(data: { name: string; description?: string; permissionIds?: string[] }) {
    return prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        ...(data.permissionIds && {
          rolePermissions: {
            create: data.permissionIds.map((permissionId) => ({ permissionId })),
          },
        }),
      },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });
  }

  async update(id: string, data: { name?: string; description?: string; permissionIds?: string[] }) {
    return prisma.$transaction(async (tx) => {
      if (data.permissionIds) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        await tx.rolePermission.createMany({
          data: data.permissionIds.map((permissionId) => ({
            roleId: id,
            permissionId,
          })),
        });
      }

      return tx.role.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
        },
        include: {
          rolePermissions: {
            include: { permission: true },
          },
        },
      });
    });
  }

  async delete(id: string) {
    return prisma.role.delete({ where: { id } });
  }
}
