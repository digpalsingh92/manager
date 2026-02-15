import { AppError } from '../../utils/appError';
import { ProjectsRepository } from './projects.repository';
import { CreateProjectInput, GetProjectsQuery } from './projects.validation';

export class ProjectsService {
  private projectsRepository: ProjectsRepository;

  constructor() {
    this.projectsRepository = new ProjectsRepository();
  }

  async getProjects(query: GetProjectsQuery) {
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

    const { projects, total } = await this.projectsRepository.findAll({
      skip,
      take: limit,
      where,
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
    return this.projectsRepository.create({
      name: data.name,
      description: data.description,
      createdById: userId,
    });
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

    // Check if already a member
    const isMember = await this.projectsRepository.isMember(projectId, userId);
    if (isMember) {
      throw AppError.conflict('User is already a member of this project.');
    }

    return this.projectsRepository.addMember(projectId, userId);
  }
}
