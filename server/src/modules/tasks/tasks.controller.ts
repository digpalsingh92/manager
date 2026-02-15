import { Request, Response } from 'express';
import { TasksService } from './tasks.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/response';

export class TasksController {
  private tasksService: TasksService;

  constructor() {
    this.tasksService = new TasksService();
  }

  getTasksByProject = asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.projectId as string;
    const result = await this.tasksService.getTasksByProject(
      projectId,
      req.query as any
    );
    sendResponse(res, 200, 'Tasks retrieved successfully', result.tasks, {
      pagination: result.pagination,
    });
  });

  createTask = asyncHandler(async (req: Request, res: Response) => {
    const task = await this.tasksService.createTask(req.body, req.user!.id);
    sendResponse(res, 201, 'Task created successfully', task);
  });

  updateTask = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const task = await this.tasksService.updateTask(id, req.body);
    sendResponse(res, 200, 'Task updated successfully', task);
  });

  deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.tasksService.deleteTask(id);
    sendResponse(res, 200, 'Task deleted successfully');
  });

  moveTask = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const task = await this.tasksService.moveTask(id, req.body.status);
    sendResponse(res, 200, 'Task status updated successfully', task);
  });

  assignTask = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const task = await this.tasksService.assignTask(id, req.body.assigneeId);
    sendResponse(res, 200, 'Task assigned successfully', task);
  });
}
