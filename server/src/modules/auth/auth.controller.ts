import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/response';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body);
    sendResponse(res, 201, 'User registered successfully', result);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body);
    sendResponse(res, 200, 'Login successful', result);
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const profile = await this.authService.getProfile(userId);
    sendResponse(res, 200, 'Profile retrieved successfully', profile);
  });
}
