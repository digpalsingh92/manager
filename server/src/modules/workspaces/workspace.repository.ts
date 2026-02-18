import { prisma } from '../../config/database.config';
import { WorkspaceRole } from '@prisma/client';

export class WorkspaceRepository {
  /**
   * Create a workspace and assign the creator as OWNER in a single transaction.
   */
  async create(data: { name: string; createdById: string }) {
    return prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: data.name,
          createdById: data.createdById,
        },
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      await tx.workspaceMember.create({
        data: {
          userId: data.createdById,
          workspaceId: workspace.id,
          role: WorkspaceRole.OWNER,
        },
      });

      return workspace;
    });
  }

  /**
   * Find a workspace by ID with member count and project count.
   */
  async findById(id: string) {
    return prisma.workspace.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: {
          select: { members: true, projects: true },
        },
      },
    });
  }

  /**
   * Find all workspaces a user is a member of.
   */
  async findByUserId(userId: string) {
    return prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            createdBy: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            _count: {
              select: { members: true, projects: true },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  /**
   * Find all members of a workspace.
   */
  async findMembers(workspaceId: string) {
    return prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            isActive: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  /**
   * Find a specific workspace member by ID.
   */
  async findMemberById(memberId: string) {
    return prisma.workspaceMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  /**
   * Get a user's membership record for a given workspace.
   */
  async getMemberByUserAndWorkspace(userId: string, workspaceId: string) {
    return prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });
  }

  /**
   * Get the role of a user within a workspace.
   */
  async getMemberRole(userId: string, workspaceId: string): Promise<WorkspaceRole | null> {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
      select: { role: true },
    });
    return member?.role ?? null;
  }

  /**
   * Add a member to a workspace.
   */
  async addMember(data: { userId: string; workspaceId: string; role: WorkspaceRole }) {
    return prisma.workspaceMember.create({
      data: {
        userId: data.userId,
        workspaceId: data.workspaceId,
        role: data.role,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  /**
   * Update a workspace member's role.
   */
  async updateMemberRole(memberId: string, role: WorkspaceRole) {
    return prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  /**
   * Remove a member from a workspace.
   */
  async removeMember(memberId: string) {
    return prisma.workspaceMember.delete({
      where: { id: memberId },
    });
  }

  /**
   * Count the number of OWNER members in a workspace.
   */
  async countOwners(workspaceId: string): Promise<number> {
    return prisma.workspaceMember.count({
      where: {
        workspaceId,
        role: WorkspaceRole.OWNER,
      },
    });
  }

  /**
   * Find a user by email.
   */
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, lastName: true, isActive: true },
    });
  }
}
