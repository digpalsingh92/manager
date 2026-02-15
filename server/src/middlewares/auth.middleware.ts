import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { prisma } from '../config/database.config';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';

export interface AuthPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
      };
    }
  }
}

/**
 * Authentication middleware - verifies JWT token and attaches user to request.
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      throw AppError.unauthorized('Authentication required. Please provide a valid token.');
    }

    // Verify token
    let decoded: AuthPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw AppError.unauthorized('Token has expired. Please login again.');
      }
      if (err instanceof jwt.JsonWebTokenError) {
        throw AppError.unauthorized('Invalid token. Please login again.');
      }
      throw AppError.unauthorized('Authentication failed.');
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (!user) {
      throw AppError.unauthorized('User associated with this token no longer exists.');
    }

    if (!user.isActive) {
      throw AppError.forbidden('Your account has been deactivated.');
    }

    req.user = user;
    next();
  }
);
