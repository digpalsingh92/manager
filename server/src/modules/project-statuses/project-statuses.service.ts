import { AppError } from '../../utils/appError';
import { ProjectsRepository } from '../projects/projects.repository';
import { ProjectStatusesRepository } from './project-statuses.repository';
import { CreateProjectStatusInput } from './project-statuses.validation';

export class ProjectStatusesService {
  private projectsRepository: ProjectsRepository;
  private projectStatusesRepository: ProjectStatusesRepository;

  constructor() {
    this.projectsRepository = new ProjectsRepository();
    this.projectStatusesRepository = new ProjectStatusesRepository();
  }

  async listByProject(projectId: string) {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw AppError.notFound('Project not found.');
    }

    await this.projectStatusesRepository.ensureDefaultsForProject(projectId);
    return this.projectStatusesRepository.listByProject(projectId);
  }

  async createStatus(projectId: string, data: CreateProjectStatusInput) {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw AppError.notFound('Project not found.');
    }

    // Always ensure the default workflow statuses exist before
    // adding any custom ones so they never disappear.
    await this.ensureDefaultsForProject(projectId);

    const key =
      data.key ||
      data.label
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

    if (!key) {
      throw AppError.badRequest('Invalid status label.');
    }

    try {
      return await this.projectStatusesRepository.create(projectId, {
        key,
        label: data.label.trim(),
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw AppError.conflict('A status with this key already exists for this project.');
      }
      throw error;
    }
  }

  // Helper for other services (e.g. tasks)
  async ensureDefaultsForProject(projectId: string) {
    await this.projectStatusesRepository.ensureDefaultsForProject(projectId);
  }

  async getStatusForProjectByKey(projectId: string, key: string) {
    await this.ensureDefaultsForProject(projectId);
    const status = await this.projectStatusesRepository.findByKey(projectId, key);
    if (!status) {
      throw AppError.notFound(`Status ${key} not found for this project.`);
    }
    return status;
  }
}

