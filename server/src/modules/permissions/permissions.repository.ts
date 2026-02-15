import { prisma } from '../../config/database.config';

export class PermissionsRepository {
  async findAll() {
    return prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });
  }

  async findById(id: string) {
    return prisma.permission.findUnique({ where: { id } });
  }

  async findByName(name: string) {
    return prisma.permission.findUnique({ where: { name } });
  }
}
