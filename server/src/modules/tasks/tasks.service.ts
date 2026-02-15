import { TaskStatus, TaskPriority } from '@prisma/client';
import { AppError } from '../../utils/appError';
import { TasksRepository } from './tasks.repository';
import { CreateTaskInput } from './tasks.validation';

export class TasksService {
  private tasksRepository: TasksRepository;

  constructor() {
    this.tasksRepository = new TasksRepository();
  }

  async getTasksByProject(
    projectId: string,
    query: {
      page?: number;
      limit?: number;
      status?: TaskStatus;
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
    return this.tasksRepository.create({
      title: data.title,
      description: data.description,
      status: data.status as TaskStatus,
      priority: data.priority as TaskPriority,
      projectId: data.projectId,
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
      priority?: TaskPriority;
      dueDate?: Date | null;
    }
  ) {
    const task = await this.tasksRepository.findById(id);
    if (!task) {
      throw AppError.notFound('Task not found.');
    }

    return this.tasksRepository.update(id, data);
  }

  async deleteTask(id: string) {
    const task = await this.tasksRepository.findById(id);
    if (!task) {
      throw AppError.notFound('Task not found.');
    }

    return this.tasksRepository.softDelete(id);
  }

  async moveTask(id: string, status: TaskStatus) {
    const task = await this.tasksRepository.findById(id);
    if (!task) {
      throw AppError.notFound('Task not found.');
    }

    return this.tasksRepository.update(id, { status });
  }

  async assignTask(id: string, assigneeId: string | null) {
    const task = await this.tasksRepository.findById(id);
    if (!task) {
      throw AppError.notFound('Task not found.');
    }

    const updateData = assigneeId
      ? { assignee: { connect: { id: assigneeId } } }
      : { assignee: { disconnect: true } };

    return this.tasksRepository.update(id, updateData);
  }
}
