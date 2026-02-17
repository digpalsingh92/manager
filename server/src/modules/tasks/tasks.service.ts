import { TaskStatus, TaskPriority } from '@prisma/client';
import { AppError } from '../../utils/appError';
import { TasksRepository } from './tasks.repository';
import { CreateTaskInput } from './tasks.validation';
import { ProjectsRepository } from '../projects/projects.repository';
import { ProjectStatusesService } from '../project-statuses/project-statuses.service';

export class TasksService {
  private tasksRepository: TasksRepository;
  private projectsRepository: ProjectsRepository;
  private projectStatusesService: ProjectStatusesService;

  constructor() {
    this.tasksRepository = new TasksRepository();
    this.projectsRepository = new ProjectsRepository();
    this.projectStatusesService = new ProjectStatusesService();
  }

  async getTasksByProject(
    projectId: string,
    query: {
      page?: number;
      limit?: number;
      status?: TaskStatus;
      statusId?: string;
      priority?: TaskPriority;
      assigneeId?: string;
    }
  ) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const { tasks, total } = await this.tasksRepository.findByProject({
      projectId,
      skip,
      take: limit,
      status: query?.status,
      statusId: query?.statusId,
      priority: query?.priority,
      assigneeId: query?.assigneeId,
    });

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTaskById(id: string) {
    const task = await this.tasksRepository.findById(id);
    if (!task) {
      throw AppError.notFound('Task not found.');
    }
    return task;
  }

  async createTask(data: CreateTaskInput, userId: string) {
    if (data.assigneeId) {
      const isMember = await this.projectsRepository.isMember(data.projectId, data.assigneeId);
      if (!isMember) {
        throw AppError.badRequest('Assignee must be a member of the project.');
      }
    }

    // Resolve project status definition
    await this.projectStatusesService.ensureDefaultsForProject(data.projectId);
    let statusKey: TaskStatus = (data.status as TaskStatus) || 'TODO';
    let statusId = data.statusId || null;

    if (!statusId) {
      const statusDef = await this.projectStatusesService.getStatusForProjectByKey(
        data.projectId,
        statusKey
      );
      statusId = statusDef.id;
    }

    return this.tasksRepository.create({
      title: data.title,
      description: data.description,
      status: statusKey,
      priority: (data.priority as TaskPriority) || 'MEDIUM',
      projectId: data.projectId,
      statusId,
      assigneeId: data.assigneeId,
      createdById: userId,
      dueDate: data.dueDate,
    });
  }

  async updateTask(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      statusId?: string;
      priority?: TaskPriority;
      dueDate?: Date | null;
    }
  ) {
    const task = await this.tasksRepository.findById(id);
    if (!task) {
      throw AppError.notFound('Task not found.');
    }

    const updateData: any = { ...data };

    if (data.statusId) {
      // Ensure status belongs to same project
      const status = await this.projectStatusesService.getStatusForProjectByKey(
        task.projectId,
        (data.status as TaskStatus) || task.status
      );
      updateData.statusId = data.statusId;
      updateData.status = status.key;
    } else if (data.status) {
      const status = await this.projectStatusesService.getStatusForProjectByKey(
        task.projectId,
        data.status
      );
      updateData.statusId = status.id;
      updateData.status = status.key;
    }

    return this.tasksRepository.update(id, updateData);
  }

  async deleteTask(id: string) {
    const task = await this.tasksRepository.findById(id);
    if (!task) {
      throw AppError.notFound('Task not found.');
    }

    return this.tasksRepository.softDelete(id);
  }

  async moveTask(
    id: string,
    payload: {
      status?: TaskStatus;
      statusId?: string;
    }
  ) {
    const task = await this.tasksRepository.findById(id);
    if (!task) {
      throw AppError.notFound('Task not found.');
    }

    if (!payload.status && !payload.statusId) {
      throw AppError.badRequest('Either status or statusId must be provided.');
    }

    // Prefer statusId if provided
    let statusId = payload.statusId || null;
    let statusKey: TaskStatus;

    if (statusId) {
      // We still want to keep enum status in sync; derive by key from statusDef or fallback
      const statusDef = await this.projectStatusesService.getStatusForProjectByKey(
        task.projectId,
        (payload.status as TaskStatus) || task.status
      );
      statusKey = statusDef.key as TaskStatus;
    } else {
      statusKey = (payload.status as TaskStatus)!;
      const statusDef = await this.projectStatusesService.getStatusForProjectByKey(
        task.projectId,
        statusKey
      );
      statusId = statusDef.id;
    }

    return this.tasksRepository.update(id, {
      status: statusKey,
      statusId,
    });
  }

  async assignTask(id: string, assigneeId: string | null) {
    const task = await this.tasksRepository.findById(id);
    if (!task) {
      throw AppError.notFound('Task not found.');
    }

    if (assigneeId) {
      const isMember = await this.projectsRepository.isMember(task.projectId, assigneeId);
      if (!isMember) {
        throw AppError.badRequest('Assignee must be a member of the project.');
      }
    }

    const updateData = assigneeId
      ? { assignee: { connect: { id: assigneeId } } }
      : { assignee: { disconnect: true } };

    return this.tasksRepository.update(id, updateData);
  }
}
