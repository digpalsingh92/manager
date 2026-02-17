import { prisma } from '../../config/database.config';
import { Prisma, TaskStatus, TaskPriority } from '@prisma/client';

export class TasksRepository {
  async findByProject(options: {
    projectId: string;
    skip: number;
    take: number;
    status?: TaskStatus; // legacy enum filter
    statusId?: string;
    priority?: TaskPriority;
    assigneeId?: string;
  }) {
    const where: Prisma.TaskWhereInput = {
      projectId: options.projectId,
      deletedAt: null,
      ...(options.status && { status: options.status }),
      ...(options.statusId && { statusId: options.statusId }),
      ...(options.priority && { priority: options.priority }),
      ...(options.assigneeId && { assigneeId: options.assigneeId }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip: options.skip,
        take: options.take,
        include: {
          statusDef: true,
          assignee: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          createdBy: {
            select: { id: true, firstName: true, lastName: true },
          },
          _count: { select: { comments: true } },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, total };
  }

  async findById(id: string) {
    return prisma.task.findFirst({
      where: { id, deletedAt: null },
      include: {
        statusDef: true,
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        project: {
          select: { id: true, name: true },
        },
        comments: {
          where: { deletedAt: null },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { comments: true } },
      },
    });
  }

  async create(data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    projectId: string;
    statusId?: string | null;
    assigneeId?: string | null;
    createdById: string;
    dueDate?: Date | null;
  }) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
        projectId: data.projectId,
        statusId: data.statusId ?? null,
        assigneeId: data.assigneeId,
        createdById: data.createdById,
        dueDate: data.dueDate,
      },
      include: {
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.TaskUpdateInput) {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async softDelete(id: string) {
    return prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
