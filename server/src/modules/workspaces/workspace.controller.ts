import { Request, Response } from 'express';
import { WorkspaceService } from './workspace.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/response';

export class WorkspaceController {
  private workspaceService: WorkspaceService;

  constructor() {
    this.workspaceService = new WorkspaceService();
  }

  /**
   * POST /api/v1/workspaces
   */
  createWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const workspace = await this.workspaceService.createWorkspace(
      req.body,
      req.user!.id
    );
    sendResponse(res, 201, 'Workspace created successfully', workspace);
  });

  /**
   * GET /api/v1/workspaces
   */
  getUserWorkspaces = asyncHandler(async (req: Request, res: Response) => {
    const workspaces = await this.workspaceService.getUserWorkspaces(req.user!.id);
    sendResponse(res, 200, 'Workspaces retrieved successfully', workspaces);
  });

  /**
   * GET /api/v1/workspaces/:id
   */
  getWorkspaceById = asyncHandler(async (req: Request, res: Response) => {
    const workspace = await this.workspaceService.getWorkspaceById(
      req.params.id,
      req.user!.id
    );
    sendResponse(res, 200, 'Workspace retrieved successfully', workspace);
  });

  /**
   * GET /api/v1/workspaces/:id/members
   */
  getWorkspaceMembers = asyncHandler(async (req: Request, res: Response) => {
    const members = await this.workspaceService.getWorkspaceMembers(
      req.params.id,
      req.user!.id
    );
    sendResponse(res, 200, 'Workspace members retrieved successfully', members);
  });

  /**
   * POST /api/v1/workspaces/:id/invite
   */
  inviteMember = asyncHandler(async (req: Request, res: Response) => {
    const member = await this.workspaceService.inviteMember(
      req.params.id,
      req.user!.id,
      req.body.email,
      req.body.role
    );
    sendResponse(res, 201, 'Member invited successfully', member);
  });

  /**
   * PATCH /api/v1/workspaces/:id/members/:memberId
   */
  updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
    const member = await this.workspaceService.updateMemberRole(
      req.params.id,
      req.params.memberId,
      req.body.role,
      req.user!.id
    );
    sendResponse(res, 200, 'Member role updated successfully', member);
  });

  /**
   * DELETE /api/v1/workspaces/:id/members/:memberId
   */
  removeMember = asyncHandler(async (req: Request, res: Response) => {
    await this.workspaceService.removeMember(
      req.params.id,
      req.params.memberId,
      req.user!.id
    );
    sendResponse(res, 200, 'Member removed successfully');
  });
}
