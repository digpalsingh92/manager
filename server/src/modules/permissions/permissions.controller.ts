import { Request, Response } from 'express';
import { PermissionsService } from './permissions.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/response';

export class PermissionsController {
  private permissionsService: PermissionsService;

  constructor() {
    this.permissionsService = new PermissionsService();
  }

  getAllPermissions = asyncHandler(async (_req: Request, res: Response) => {
    const permissions = await this.permissionsService.getAllPermissions();
    sendResponse(res, 200, 'Permissions retrieved successfully', permissions);
  });
}
