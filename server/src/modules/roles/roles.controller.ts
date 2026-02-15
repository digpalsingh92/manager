import { Request, Response } from 'express';
import { RolesService } from './roles.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/response';

export class RolesController {
  private rolesService: RolesService;

  constructor() {
    this.rolesService = new RolesService();
  }

  getAllRoles = asyncHandler(async (_req: Request, res: Response) => {
    const roles = await this.rolesService.getAllRoles();
    sendResponse(res, 200, 'Roles retrieved successfully', roles);
  });

  getRoleById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const role = await this.rolesService.getRoleById(id);
    sendResponse(res, 200, 'Role retrieved successfully', role);
  });

  createRole = asyncHandler(async (req: Request, res: Response) => {
    const role = await this.rolesService.createRole(req.body);
    sendResponse(res, 201, 'Role created successfully', role);
  });

  updateRole = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const role = await this.rolesService.updateRole(id, req.body);
    sendResponse(res, 200, 'Role updated successfully', role);
  });

  deleteRole = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.rolesService.deleteRole(id);
    sendResponse(res, 200, 'Role deleted successfully');
  });
}
