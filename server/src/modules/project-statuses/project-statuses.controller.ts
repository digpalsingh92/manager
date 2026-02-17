import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/response';
import { ProjectStatusesService } from './project-statuses.service';

export class ProjectStatusesController {
  private projectStatusesService: ProjectStatusesService;

  constructor() {
    this.projectStatusesService = new ProjectStatusesService();
  }

  listByProject = asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.projectId as string;
    const statuses = await this.projectStatusesService.listByProject(projectId);
    sendResponse(res, 200, 'Project statuses retrieved successfully', statuses);
  });

  createStatus = asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.projectId as string;
    const status = await this.projectStatusesService.createStatus(
      projectId,
      req.body
    );
    sendResponse(res, 201, 'Project status created successfully', status);
  });
}

