import { prisma } from '../../config/database.config';
import { Prisma } from '@prisma/client';

export class ProjectsRepository {
  async findAll(options: {
    skip: number;
    take: number;
    where?: Prisma.ProjectWhereInput;
    workspaceId?: string;
  }) {
    const where: Prisma.ProjectWhereInput = {
      ...options.where,
      deletedAt: null,
      ...(options.workspaceId && { workspaceId: options.workspaceId }),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: options.skip,
        take: options.take,
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          workspace: {
            select: { id: true, name: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
          },
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    return { projects, total };
  }

  async findById(id: string) {
    return prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        workspace: {
          select: { id: true, name: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        tasks: {
          where: { deletedAt: null },
          include: {
            assignee: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { tasks: true, members: true } },
      },
    });
  }

  async create(data: { name: string; description?: string; workspaceId: string; createdById: string }) {
    return prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: data.name,
          description: data.description,
          workspaceId: data.workspaceId,
          createdById: data.createdById,
        },
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          workspace: {
            select: { id: true, name: true },
          },
        },
      });

      // Auto-add creator as member
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: data.createdById,
        },
      });

      return project;
    });
  }

  async update(id: string, data: { name?: string; description?: string }) {
    return prisma.project.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        workspace: {
          select: { id: true, name: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });
  }

  async softDelete(id: string) {
    return prisma.project.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async addMember(projectId: string, userId: string) {
    return prisma.projectMember.create({
      data: { projectId, userId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async isMember(projectId: string, userId: string) {
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });
    return !!member;
  }
}
