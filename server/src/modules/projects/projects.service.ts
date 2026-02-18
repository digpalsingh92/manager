import { AppError } from '../../utils/appError';
import { ProjectsRepository } from './projects.repository';
import { CreateProjectInput, GetProjectsQuery } from './projects.validation';
import { prisma } from '../../config/database.config';

export class ProjectsService {
  private projectsRepository: ProjectsRepository;

  constructor() {
    this.projectsRepository = new ProjectsRepository();
  }

  async getProjects(query: GetProjectsQuery, userId: string) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // If workspaceId provided, verify membership first
    if (query?.workspaceId) {
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: { userId, workspaceId: query.workspaceId },
        },
      });
      if (!membership) {
        throw AppError.forbidden('You are not a member of this workspace.');
      }
    }

    const { projects, total } = await this.projectsRepository.findAll({
      skip,
      take: limit,
      where,
      workspaceId: query?.workspaceId,
    });

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProjectById(id: string) {
    const project = await this.projectsRepository.findById(id);
    if (!project) {
      throw AppError.notFound('Project not found.');
    }
    return project;
  }

  async createProject(data: CreateProjectInput, userId: string) {
    // Verify workspace membership
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId: data.workspaceId },
      },
    });

    if (!membership) {
      throw AppError.forbidden('You are not a member of this workspace.');
    }

    try {
      return await this.projectsRepository.create({
        name: data.name,
        description: data.description,
        workspaceId: data.workspaceId,
        createdById: userId,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw AppError.conflict('Project with this name already exists in this workspace.');
      }
      throw error;
    }
  }

  async updateProject(id: string, data: { name?: string; description?: string }) {
    const project = await this.projectsRepository.findById(id);
    if (!project) {
      throw AppError.notFound('Project not found.');
    }

    return this.projectsRepository.update(id, data);
  }

  async deleteProject(id: string) {
    const project = await this.projectsRepository.findById(id);
    if (!project) {
      throw AppError.notFound('Project not found.');
    }

    return this.projectsRepository.softDelete(id);
  }

  async addMember(projectId: string, userId: string) {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw AppError.notFound('Project not found.');
    }

    // Verify user is a member of the workspace
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId: project.workspaceId },
      },
    });

    if (!membership) {
      throw AppError.badRequest('User must be a member of the workspace to join a project.');
    }

    // Check if already a member
    const isMember = await this.projectsRepository.isMember(projectId, userId);
    if (isMember) {
      throw AppError.conflict('User is already a member of this project.');
    }

    return this.projectsRepository.addMember(projectId, userId);
  }
}
