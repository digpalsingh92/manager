import { Request, Response } from 'express';
import { ProjectsService } from './projects.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/response';

export class ProjectsController {
  private projectsService: ProjectsService;

  constructor() {
    this.projectsService = new ProjectsService();
  }

  getProjects = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.projectsService.getProjects(req.query as any);
    sendResponse(res, 200, 'Projects retrieved successfully', result.projects, {
      pagination: result.pagination,
    });
  });

  getProjectById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const project = await this.projectsService.getProjectById(id);
    sendResponse(res, 200, 'Project retrieved successfully', project);
  });

  createProject = asyncHandler(async (req: Request, res: Response) => {
    const project = await this.projectsService.createProject(
      req.body,
      req.user!.id
    );
    sendResponse(res, 201, 'Project created successfully', project);
  });

  updateProject = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const project = await this.projectsService.updateProject(id, req.body);
    sendResponse(res, 200, 'Project updated successfully', project);
  });

  deleteProject = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.projectsService.deleteProject(id);
    sendResponse(res, 200, 'Project deleted successfully');
  });

  addMember = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const member = await this.projectsService.addMember(id, req.body.userId);
    sendResponse(res, 201, 'Member added successfully', member);
  });
}
