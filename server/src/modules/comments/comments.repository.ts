import { prisma } from '../../config/database.config';

export class CommentsRepository {
  async findByTask(options: {
    taskId: string;
    skip: number;
    take: number;
  }) {
    const where = {
      taskId: options.taskId,
      deletedAt: null,
    };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip: options.skip,
        take: options.take,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.comment.count({ where }),
    ]);

    return { comments, total };
  }

  async findById(id: string) {
    return prisma.comment.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async create(data: { content: string; taskId: string; userId: string }) {
    return prisma.comment.create({
      data,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async softDelete(id: string) {
    return prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
