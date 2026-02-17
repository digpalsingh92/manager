import { prisma } from '../../config/database.config';

const DEFAULT_STATUSES = [
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'REVIEW', label: 'In Review' },
  { key: 'DONE', label: 'Done' },
];

export class ProjectStatusesRepository {
  async listByProject(projectId: string) {
    return prisma.projectStatus.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
    });
  }

  async create(projectId: string, data: { key: string; label: string }) {
    const position = await this.getNextPosition(projectId);
    return prisma.projectStatus.create({
      data: {
        projectId,
        key: data.key,
        label: data.label,
        position,
      },
    });
  }

  private async getNextPosition(projectId: string) {
    const last = await prisma.projectStatus.findFirst({
      where: { projectId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    return (last?.position || 0) + 1;
  }

  async ensureDefaultsForProject(projectId: string) {
    const existing = await prisma.projectStatus.findMany({
      where: { projectId },
      select: { key: true, position: true },
      orderBy: { position: 'asc' },
    });

    const existingKeys = new Set(existing.map((s) => s.key));
    const allDefaultsPresent = DEFAULT_STATUSES.every((s) =>
      existingKeys.has(s.key)
    );

    if (allDefaultsPresent) {
      return;
    }

    const maxPosition =
      existing.length > 0
        ? Math.max(...existing.map((s) => s.position ?? 0))
        : 0;

    await prisma.$transaction(async (tx) => {
      let position = maxPosition + 1;

      for (const status of DEFAULT_STATUSES) {
        if (existingKeys.has(status.key)) continue;

        await tx.projectStatus.create({
          data: {
            projectId,
            key: status.key,
            label: status.label,
            position: position++,
          },
        });
      }
    });
  }

  async findById(id: string) {
    return prisma.projectStatus.findUnique({ where: { id } });
  }

  async findByKey(projectId: string, key: string) {
    return prisma.projectStatus.findUnique({
      where: {
        projectId_key: {
          projectId,
          key,
        },
      },
    });
  }
}

