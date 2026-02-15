import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/response';

export class UsersController {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.usersService.getUsers(req.query as any);
    sendResponse(res, 200, 'Users retrieved successfully', result.users, {
      pagination: result.pagination,
    });
  });

  updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { roleNames } = req.body;
    const updatedUser = await this.usersService.updateUserRole(id, roleNames);
    sendResponse(res, 200, 'User roles updated successfully', updatedUser);
  });
}
